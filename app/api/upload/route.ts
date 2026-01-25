import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { r2, R2_BUCKET, R2_PUBLIC_DOMAIN } from '@/lib/r2';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: Request) {
    try {
        const session = await auth();
        // Permission checks can be added here if needed

        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const isImage = file.type.startsWith('image/');
        const subDir = isImage ? 'images' : 'files';

        const timestamp = Date.now();
        const uniqueId = crypto.randomUUID().split('-')[0];
        const extension = file.name ? file.name.split('.').pop() : (isImage ? 'png' : 'bin');
        const filename = `${timestamp}-${uniqueId}.${extension}`;

        // Key (path) in R2
        const key = `uploads/${subDir}/${filename}`;

        // Upload to R2
        await r2.send(new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        }));

        // Construct Path
        // If R2_PUBLIC_DOMAIN is set, use it. Otherwise, fallback to a placeholder or direct public access format if configured.
        // Assuming user will set R2_PUBLIC_DOMAIN or we use the relative path if we proxy (but we want to offload).
        // If no domain is set, we might have issues viewing.
        const fileUrl = R2_PUBLIC_DOMAIN
            ? `${R2_PUBLIC_DOMAIN}/${key}`
            : `/uploads/${subDir}/${filename}`; // Fallback (or broken if no local file) - User MUST set R2_PUBLIC_DOMAIN

        // Save to DB
        const attachment = await prisma.attachment.create({
            data: {
                fileUrl,
                fileName: file.name,
                fileType: isImage ? 'IMAGE' : 'FILE',
            }
        });

        return NextResponse.json({
            id: attachment.id,
            uploaded: true,
            url: fileUrl,
            originalName: file.name,
            type: attachment.fileType
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        // Get file info from DB
        const attachment = await prisma.attachment.findUnique({
            where: { id: parseInt(id) }
        });

        if (attachment && attachment.fileUrl) {
            // Extract Key from URL
            // URL formats:
            // 1. https://domain.com/uploads/images/file.png -> uploads/images/file.png
            // 2. /uploads/images/file.png -> uploads/images/file.png

            let key = attachment.fileUrl;
            if (key.startsWith('http')) {
                const urlObj = new URL(key);
                key = urlObj.pathname.substring(1); // remove leading slash
            } else if (key.startsWith('/')) {
                key = key.substring(1);
            }

            try {
                await r2.send(new DeleteObjectCommand({
                    Bucket: R2_BUCKET,
                    Key: key,
                }));
            } catch (r2Error) {
                console.error("Failed to delete from R2:", r2Error);
                // Continue to delete from DB even if R2 fails (soft delete mostly)
            }
        }

        // Soft delete in DB
        await prisma.attachment.update({
            where: { id: parseInt(id) },
            data: { deletedAt: new Date() }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
