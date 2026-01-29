import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { r2, R2_BUCKET } from '@/lib/r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';
import mime from 'mime';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) return new NextResponse('Invalid ID', { status: 400 });

        const attachment = await prisma.attachment.findUnique({
            where: { id }
        });

        if (!attachment || attachment.deletedAt) {
            return new NextResponse('File not found', { status: 404 });
        }

        const fileName = attachment.fileName;
        const fileUrl = attachment.fileUrl;
        const contentType = mime.getType(fileName) || 'application/octet-stream';

        // Determine source and fetch stream
        let body: any;

        if (fileUrl.startsWith('http')) {
            // R2 Download - Extract key from URL
            let key = '';
            try {
                const urlObj = new URL(fileUrl);
                // Strip leading slash if present
                key = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
            } catch (e) {
                // If it's a malformed URL or direct key accidentally stored
                key = fileUrl;
            }

            const result = await r2.send(new GetObjectCommand({
                Bucket: R2_BUCKET,
                Key: key,
            }));

            // In Node.js environment, Body might need conversion to Web Stream for NextResponse
            // or sometimes it works directly depending on Next.js version.
            // transformToWebStream() is safest for AWS SDK v3 in Next.js Server Actions/Routes
            body = (result.Body as any)?.transformToWebStream ? (result.Body as any).transformToWebStream() : result.Body;
        } else if (fileUrl.startsWith('/')) {
            // Local fallback
            const filePath = path.join(process.cwd(), 'public', fileUrl);
            if (fs.existsSync(filePath)) {
                body = fs.createReadStream(filePath);
            } else {
                return new NextResponse('Local file not found', { status: 404 });
            }
        } else {
            // Attempt to treat as direct key if it doesn't look like URL or path
            try {
                const result = await r2.send(new GetObjectCommand({
                    Bucket: R2_BUCKET,
                    Key: fileUrl,
                }));
                body = (result.Body as any)?.transformToWebStream ? (result.Body as any).transformToWebStream() : result.Body;
            } catch (r2Error) {
                return new NextResponse('Invalid file reference', { status: 400 });
            }
        }

        // Set Headers for Download with Original Filename
        const headers = new Headers();
        headers.set('Content-Type', contentType);
        // UTF-8 filename encoding for browsers
        headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
        headers.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

        return new NextResponse(body, {
            headers,
        });

    } catch (error) {
        console.error('Download error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
