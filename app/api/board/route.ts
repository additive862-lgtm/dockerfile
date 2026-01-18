import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

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
export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json() as CreatePostRequest;
        const { id, title, content, thumbnail, attachments, category } = body;

        if (!id) return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });

        const existingPost = await prisma.post.findUnique({
            where: { id },
            select: { authorId: true }
        });

        if (!existingPost) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

        // Ownership check
        if (existingPost.authorId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        // Update post and sync attachments
        const post = await prisma.post.update({
            where: { id },
            data: {
                title,
                content,
                thumbnail: thumbnail || null,
                category: category || undefined,
                // Simple sync for attachments: delete existing and create new
                // For a more robust solution, we could diff them
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

        return NextResponse.json({
            message: 'Post updated successfully',
            post,
        });

    } catch (error) {
        console.error('Board Update API error:', error);
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}
