'use server';

import { prisma } from '@/lib/prisma';

export async function getHomeData() {
    try {
        // 1. Get the 3 boards configured for home
        const boards = await prisma.boardSettings.findMany({
            where: {
                showOnHome: true
            },
            take: 3
        });

        // 2. For each board, fetch latest 5 posts
        const boardsWithPosts = await Promise.all(
            boards.map(async (board) => {
                const posts = await prisma.post.findMany({
                    where: {
                        category: board.category
                    },
                    take: 3,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    include: {
                        _count: {
                            select: { comments: true }
                        }
                    }
                });
                return {
                    ...board,
                    posts
                };
            })
        );

        return boardsWithPosts;
    } catch (error) {
        console.error('Failed to fetch home data:', error);
        return [];
    }
}

export async function getGalleryFeed() {
    try {
        // Fetch latest 3 posts from gallery category
        const galleryPosts = await prisma.post.findMany({
            where: {
                category: 'gallery'
            },
            take: 4,
            orderBy: {
                createdAt: 'desc'
            }
        });
        return galleryPosts;
    } catch (error) {
        console.error('Failed to fetch gallery feed:', error);
        return [];
    }
}

export async function updateHomeBoardStatus(category: string, showOnHome: boolean) {
    try {
        await prisma.boardSettings.update({
            where: { category },
            data: { showOnHome }
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to update home board status:', error);
        return { success: false };
    }
}
