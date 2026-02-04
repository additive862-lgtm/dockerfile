'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { r2, R2_BUCKET } from '@/lib/r2';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
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
    try {
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                comments: { orderBy: { createdAt: 'asc' } },
                attachments: true,
                _count: { select: { comments: true } }
            }
        });
        return post;
    } catch (error) {
        console.error('Failed to fetch post detail:', error);
        return null;
    }
}

/**
 * Server Action to increment view count with 24h cooldown
 */
export async function incrementViewCount(id: number, routeCategory?: string) {
    try {
        const cookieStore = cookies();
        const cookieName = `viewed_post_${id}`;
        const hasViewed = cookieStore.get(cookieName);

        if (!hasViewed) {
            const updatedPost = await prisma.post.update({
                where: { id },
                data: { views: { increment: 1 } },
                select: { category: true }
            });

            cookieStore.set(cookieName, 'true', {
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/',
                httpOnly: true,
                sameSite: 'lax'
            });

            // Revalidate the specific route path to ensure fresh data on next visit/refresh
            const path = `/board/${routeCategory || updatedPost.category}/${id}`;
            revalidatePath(path);
        }
        return { success: true };
    } catch (error) {
        console.error('Failed to increment view count:', error);
        return { success: false };
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

export async function createComment(postId: number, author: string, content: string, authorId?: string, parentId?: number) {
    try {
        const comment = await prisma.comment.create({
            data: {
                postId,
                author,
                content,
                authorId,
                parentId,
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

export async function deleteComment(id: number) {
    try {
        const session = await auth();
        if (!session) return { success: false, error: '권한이 없습니다.' };

        const comment = await prisma.comment.findUnique({
            where: { id },
            include: { replies: { where: { isDeleted: false } } }
        });

        if (!comment) return { success: false, error: '댓글을 찾을 수 없습니다.' };

        // Ownership check
        if (comment.authorId !== session.user.id && session.user.role !== 'ADMIN') {
            return { success: false, error: '본인의 댓글만 삭제할 수 있습니다.' };
        }

        // Fetch post info for revalidation
        const post = await prisma.post.findUnique({
            where: { id: comment.postId },
            select: { category: true }
        });

        // If it has active replies, soft delete
        if (comment.replies.length > 0) {
            await prisma.comment.update({
                where: { id },
                data: { isDeleted: true }
            });
        } else {
            // Hard delete
            await prisma.comment.delete({
                where: { id }
            });
        }

        if (post) revalidatePath(`/board/${post.category}/${comment.postId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to delete comment:', error);
        return { success: false, error: '댓글 삭제 중 오류가 발생했습니다.' };
    }
}

export async function updateComment(id: number, content: string) {
    try {
        const session = await auth();
        if (!session) return { success: false, error: '권한이 없습니다.' };

        const comment = await prisma.comment.findUnique({
            where: { id }
        });

        if (!comment) return { success: false, error: '댓글을 찾을 수 없습니다.' };
        if (comment.authorId !== session.user.id && session.user.role !== 'ADMIN') {
            return { success: false, error: '본인의 댓글만 수정할 수 있습니다.' };
        }

        const updated = await prisma.comment.update({
            where: { id },
            data: { content },
            include: {
                post: { select: { category: true } }
            }
        });

        revalidatePath(`/board/${updated.post.category}/${updated.postId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to update comment:', error);
        return { success: false, error: '댓글 수정 중 오류가 발생했습니다.' };
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
            select: {
                authorId: true,
                category: true,
                attachments: true // Get attachments to delete from R2
            }
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

        // 1. Delete associated files from R2 first
        if (post.attachments && post.attachments.length > 0) {
            for (const attachment of post.attachments) {
                if (attachment.fileUrl) {
                    let key = attachment.fileUrl;
                    if (key.startsWith('http')) {
                        try {
                            const urlObj = new URL(key);
                            key = urlObj.pathname.substring(1); // remove leading slash
                        } catch (e) {
                            console.error("Malformed URL, skipping R2 delete:", key);
                            continue;
                        }
                    } else if (key.startsWith('/')) {
                        key = key.substring(1);
                    }

                    try {
                        await r2.send(new DeleteObjectCommand({
                            Bucket: R2_BUCKET,
                            Key: key,
                        }));
                        console.log(`Deleted from R2: ${key}`);
                    } catch (r2Error) {
                        console.error(`Failed to delete from R2 (${key}):`, r2Error);
                        // We continue to delete from DB even if R2 fails
                    }
                }
            }
        }

        // 2. Delete the post from DB (attachments and comments will be cascaded by Prisma)
        await prisma.post.delete({
            where: { id }
        });

        revalidatePath(`/board/${post.category}`);
        revalidatePath(`/board/${post.category}/${id}`);
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error('Failed to delete post:', error);
        return { success: false, error: '삭제 중 오류가 발생했습니다.' };
    }
}
