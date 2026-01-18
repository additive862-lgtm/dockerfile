import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
    try {
        const session = await auth();
        // If needed, check session here

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

        const uploadDir = join(process.cwd(), 'public', 'uploads', subDir);
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const filePath = join(uploadDir, filename);
        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/${subDir}/${filename}`;

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

        // Soft delete
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
