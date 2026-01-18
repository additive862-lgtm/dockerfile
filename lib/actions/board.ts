'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function getBoardPosts(category: string | string[], page: number = 1, pageSize: number = 10) {
    try {
        const skip = (page - 1) * pageSize;
        const whereClause = Array.isArray(category)
            ? { category: { in: category } }
            : { category };

        const [posts, totalCount] = await Promise.all([
            prisma.post.findMany({
                where: whereClause,
                skip,
                take: pageSize,
                include: {
                    attachments: true,
                    _count: {
                        select: { comments: true }
                    }
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.post.count({ where: whereClause }),
        ]);

        return { posts, totalCount };
    } catch (error) {
        console.error('Failed to fetch board posts:', error);
        return { posts: [], totalCount: 0 };
    }
}

export async function getBoardPostDetail(id: number) {
    // ... (unchanged)
    try {
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                comments: {
                    orderBy: { createdAt: 'asc' }
                },
                attachments: true,
                _count: {
                    select: { comments: true }
                }
            },
        });
        return post;
    } catch (error) {
        console.error('Failed to fetch post detail:', error);
        return null;
    }
}

export async function getAdjacentPosts(currentId: number, category: string | string[]) {
    try {
        const currentPost = await prisma.post.findUnique({
            where: { id: currentId },
            select: { createdAt: true }
        });

        if (!currentPost) return { prev: null, next: null };

        const whereCategory = Array.isArray(category)
            ? { category: { in: category } }
            : { category };

        const [prev, next] = await Promise.all([
            prisma.post.findFirst({
                where: {
                    ...whereCategory,
                    createdAt: { lt: currentPost.createdAt }
                },
                orderBy: { createdAt: 'desc' },
                select: { id: true, title: true }
            }),
            prisma.post.findFirst({
                where: {
                    ...whereCategory,
                    createdAt: { gt: currentPost.createdAt }
                },
                orderBy: { createdAt: 'asc' },
                select: { id: true, title: true }
            })
        ]);

        return { prev, next };
    } catch (error) {
        console.error('Failed to fetch adjacent posts:', error);
        return { prev: null, next: null };
    }
}

export async function createComment(postId: number, author: string, content: string, authorId?: string) {
    try {
        const comment = await prisma.comment.create({
            data: {
                postId,
                author,
                content,
                authorId, // Link to user if logged in
            },
            include: {
                post: {
                    select: { category: true }
                }
            }
        });
        revalidatePath(`/board/${comment.post.category}/${postId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to create comment:', error);
        return { success: false, error: '댓글 등록 중 오류가 발생했습니다.' };
    }
}

export async function getBoardSettingsByCategory(category: string) {
    try {
        const settings = await prisma.boardSettings.findUnique({
            where: { category }
        });
        return settings;
    } catch (error) {
        console.error('Failed to fetch board settings:', error);
        return null;
    }
}
export async function deleteBoardPost(id: number) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { success: false, error: '권한이 없습니다.' };
        }

        const post = await prisma.post.findUnique({
            where: { id },
            select: { authorId: true, category: true }
        });

        if (!post) {
            return { success: false, error: '존재하지 않는 게시글입니다.' };
        }

        // Only author or ADMIN can delete
        const isAuthor = post.authorId === session.user.id;
        const isAdmin = session.user.role === 'ADMIN';

        if (!isAuthor && !isAdmin) {
            return { success: false, error: '본인의 게시글만 삭제할 수 있습니다.' };
        }

        await prisma.post.delete({
            where: { id }
        });

        revalidatePath(`/board/${post.category}`);
        revalidatePath(`/board/${post.category}/${id}`);

        return { success: true };
    } catch (error) {
        console.error('Failed to delete post:', error);
        return { success: false, error: '삭제 중 오류가 발생했습니다.' };
    }
}
