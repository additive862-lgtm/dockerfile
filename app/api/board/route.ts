import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

interface AttachmentInput {
    fileUrl: string;
    fileName: string;
    fileType: 'IMAGE' | 'FILE' | 'LINK';
    isEmbedded?: boolean;
}

interface CreatePostRequest {
    id?: number;
    title: string;
    content: string;
    author?: string;
    thumbnail?: string;
    attachments?: AttachmentInput[];
    category?: string;
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        const body = await request.json() as CreatePostRequest;
        const { title, content, author, thumbnail, attachments, category } = body;

        const finalAuthor = author || session?.user?.name || 'Anonymous';
        const finalAuthorId = session?.user?.id || null;

        if (!title || !finalAuthor) {
            return NextResponse.json(
                { error: 'Title and author are required' },
                { status: 400 }
            );
        }

        // Create post with attachments in a single transaction
        const post = await prisma.post.create({
            data: {
                title,
                content,
                author: finalAuthor,
                authorId: finalAuthorId,
                thumbnail: thumbnail || null,
                category: category || 'free',
                attachments: {
                    create: attachments?.map((att: AttachmentInput) => ({
                        fileUrl: att.fileUrl,
                        fileName: att.fileName,
                        fileType: att.fileType,
                        isEmbedded: att.isEmbedded || false,
                    })) || [],
                },
            },
            include: {
                attachments: true,
            },
        });

        revalidatePath('/');

        return NextResponse.json({
            message: 'Post created successfully',
            post,
        });

    } catch (error) {
        console.error('Board API error:', error);
        return NextResponse.json(
            { error: 'Failed to create post' },
            { status: 500 }
        );
    }
}
import { r2, R2_BUCKET } from '@/lib/r2';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json() as CreatePostRequest;
        const { id, title, content, thumbnail, attachments, category } = body;

        if (!id) return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });

        const existingPost = await prisma.post.findUnique({
            where: { id },
            select: {
                authorId: true,
                attachments: true
            }
        });

        if (!existingPost) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

        // Ownership check
        if (existingPost.authorId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        // --- R2 Cleanup Logic ---
        // Identify attachments being removed
        const incomingUrls = new Set(attachments?.map(a => a.fileUrl) || []);
        const toDelete = existingPost.attachments.filter(ext => !incomingUrls.has(ext.fileUrl));

        if (toDelete.length > 0) {
            for (const attachment of toDelete) {
                if (attachment.fileUrl) {
                    let key = attachment.fileUrl;
                    if (key.startsWith('http')) {
                        try {
                            const urlObj = new URL(key);
                            key = urlObj.pathname.substring(1);
                        } catch (e) { continue; }
                    } else if (key.startsWith('/')) {
                        key = key.substring(1);
                    }

                    try {
                        await r2.send(new DeleteObjectCommand({
                            Bucket: R2_BUCKET,
                            Key: key,
                        }));
                    } catch (r2Error) {
                        console.error("Cleanup failed for R2 key:", key, r2Error);
                    }
                }
            }
        }

        // Update post and sync attachments
        const post = await prisma.post.update({
            where: { id },
            data: {
                title,
                content,
                thumbnail: thumbnail || null,
                category: category || undefined,
                attachments: {
                    deleteMany: {},
                    create: attachments?.map((att: AttachmentInput) => ({
                        fileUrl: att.fileUrl,
                        fileName: att.fileName,
                        fileType: att.fileType,
                        isEmbedded: att.isEmbedded || false,
                    })) || [],
                },
            },
        });

        revalidatePath('/');

        return NextResponse.json({
            message: 'Post updated successfully',
            post,
        });

    } catch (error) {
        console.error('Board Update API error:', error);
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}
