import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

interface AttachmentInput {
    fileUrl: string;
    fileName: string;
    fileType: 'IMAGE' | 'FILE' | 'LINK'; // Assuming enum values
}

interface CreatePostRequest {
    title: string;
    content: string;
    author?: string;
    attachments?: AttachmentInput[];
    category?: string;
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        const body = await request.json() as CreatePostRequest;
        const { title, content, author, attachments, category } = body;

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
                category: category || 'free',
                attachments: {
                    create: attachments?.map((att: AttachmentInput) => ({
                        fileUrl: att.fileUrl,
                        fileName: att.fileName,
                        fileType: att.fileType, // IMAGE, FILE, LINK
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
