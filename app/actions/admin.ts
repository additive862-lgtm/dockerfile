"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";

export async function checkAdmin() {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            console.error("Admin check failed: Unauthorized session or role", {
                email: session?.user?.email,
                role: session?.user?.role
            });
            redirect("/login");
        }
        return session;
    } catch (error) {
        // If it's a redirect, let it happen
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) throw error;

        console.error("Auth process failed in checkAdmin:", error);
        redirect("/login");
    }
}

export async function getAdminStats() {
    try {
        // We assume checkAdmin() was already called by the page
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const [totalUsers, todayUsers, totalPosts, todayPosts] = await Promise.all([
            prisma.user.count().catch(() => 0),
            prisma.user.count({ where: { createdAt: { gte: startOfToday } } }).catch(() => 0),
            prisma.post.count().catch(() => 0),
            prisma.post.count({ where: { createdAt: { gte: startOfToday } } }).catch(() => 0),
        ]);

        return {
            totalUsers,
            todayUsers,
            totalPosts,
            todayPosts,
        };
    } catch (error) {
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.error("Failed to get admin stats:", error);
        return {
            totalUsers: 0,
            todayUsers: 0,
            totalPosts: 0,
            todayPosts: 0,
        };
    }
}

// Helper to serialize Prisma objects for Client Components
function serializeData<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
}

export async function getRecentUsers() {
    try {
        const users = await prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                email: true,
                name: true,
                nickname: true,
                role: true,
                createdAt: true,
            },
        });

        return serializeData(users);
    } catch (error) {
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.error("Failed to get recent users:", error);
        return [];
    }
}

export async function getAllUsers() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                email: true,
                name: true,
                nickname: true,
                role: true,
                createdAt: true,
            },
        });

        return serializeData(users);
    } catch (error) {
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.error("Failed to get all users:", error);
        return [];
    }
}

export async function toggleUserRole(userId: string, currentRole: string) {
    await checkAdmin();

    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";

    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole as any },
    });

    revalidatePath("/admin/members");
    return { success: true };
}

export async function deleteUser(userId: string) {
    const session = await checkAdmin();

    if (session.user.id === userId) {
        return { error: "자기 자신을 삭제할 수 없습니다." };
    }

    await prisma.user.delete({
        where: { id: userId },
    });

    revalidatePath("/admin/members");
    return { success: true };
}

export async function getPostsStats() {
    try {
        const posts = await prisma.post.groupBy({
            by: ["category"],
            _count: {
                id: true,
            },
        });

        return serializeData(posts.map(p => ({
            category: p.category,
            count: p._count.id,
        })));
    } catch (error) {
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.error("Failed to get posts stats:", error);
        return [];
    }
}

export async function getPostsWithComments() {
    try {
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { comments: true }
                }
            }
        });

        return serializeData(posts);
    } catch (error) {
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.error("Failed to get posts with comments:", error);
        return [];
    }
}

export async function getBoardSettings() {
    try {
        const settings = await prisma.boardSettings.findMany({
            orderBy: { name: "asc" }
        });

        return serializeData(settings);
    } catch (error) {
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.error("Failed to get board settings:", error);
        return [];
    }
}

export async function updateBoardSettings(category: string, data: any) {
    try {
        await checkAdmin();

        const { id, ...updateData } = data;

        await prisma.boardSettings.upsert({
            where: { category },
            update: updateData,
            create: {
                category,
                ...updateData,
            },
        });

        revalidatePath("/admin/boards");
        return { success: true };
    } catch (error) {
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.error("Failed to update board settings:", error);
        return { success: false, error: "설정 저장 중 오류가 발생했습니다." };
    }
}

export async function initializeBoardSettings(boards: { category: string, name: string, categories?: string[] }[]) {
    try {
        await checkAdmin();

        for (const board of boards) {
            await prisma.boardSettings.upsert({
                where: { category: board.category },
                update: {},
                create: {
                    category: board.category,
                    name: board.name,
                    categories: board.categories || [],
                },
            });
        }

        revalidatePath("/admin/boards");
        return { success: true };
    } catch (error) {
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.error("Failed to initialize board settings:", error);
        return { success: false, error: "게시판 초기화 중 오류가 발생했습니다." };
    }
}

export async function deleteBoard(category: string) {
    try {
        await checkAdmin();

        await prisma.boardSettings.delete({
            where: { category }
        });

        await prisma.post.deleteMany({
            where: { category }
        });

        revalidatePath("/admin/boards");
        return { success: true };
    } catch (error) {
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.error("Failed to delete board:", error);
        return { success: false, error: "게시판 삭제 중 오류가 발생했습니다." };
    }
}

// Menu Actions
export async function getMenus() {
    try {
        const menus = await prisma.navigationMenu.findMany({
            orderBy: { order: "asc" },
            include: {
                subMenus: {
                    orderBy: { order: "asc" }
                }
            },
            where: { parentId: null } // Get top-level menus first
        });

        return serializeData(menus);
    } catch (error) {
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.error("Failed to get menus:", error);
        return [];
    }
}

export async function updateMenu(id: number | null, data: any) {
    try {
        await checkAdmin();

        const { id: _, subMenus, ...cleanData } = data;

        if (id) {
            await prisma.navigationMenu.update({
                where: { id },
                data: cleanData
            });
        } else {
            await prisma.navigationMenu.create({
                data: cleanData
            });
        }

        revalidatePath("/", "layout");
        revalidatePath("/admin/menus");
        return { success: true };
    } catch (error) {
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.error("Failed to update menu:", error);
        return { success: false, error: "메뉴 저장 중 오류가 발생했습니다." };
    }
}

export async function deleteMenu(id: number) {
    try {
        await checkAdmin();
        await prisma.navigationMenu.delete({
            where: { id }
        });

        revalidatePath("/", "layout");
        revalidatePath("/admin/menus");
        return { success: true };
    } catch (error) {
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.error("Failed to delete menu:", error);
        return { success: false, error: "메뉴 삭제 중 오류가 발생했습니다." };
    }
}

export async function reorderMenus(items: { id: number, order: number }[]) {
    try {
        await checkAdmin();

        await Promise.all(items.map(item =>
            prisma.navigationMenu.update({
                where: { id: item.id },
                data: { order: item.order }
            })
        ));

        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.error("Failed to reorder menus:", error);
        return { success: false, error: "메뉴 순서 변경 중 오류가 발생했습니다." };
    }
}

export async function seedDefaultMenus() {
    try {
        await checkAdmin();

        // Check if menus already exist
        const count = await prisma.navigationMenu.count();
        if (count > 0) return { error: "이미 메뉴가 존재합니다." };

        const defaultStructure = [
            { name: '두돌소개', path: '/about', order: 0 },
            { name: '교회사', path: '/board/church', order: 1 },
            {
                name: '강론',
                order: 2,
                subMenus: [
                    { name: '오늘의 강론', path: '/board/daily-homily', order: 0 },
                    { name: '주일/대축일 강론', path: '/board/sunday-homily', order: 1 },
                    { name: '축일/기념일 강론', path: '/board/feast-homily', order: 2 },
                    { name: '특별강론', path: '/board/special-homily', order: 3 },
                ]
            },
            {
                name: '맘도성경여행',
                order: 3,
                subMenus: [
                    { name: '맘도 성서 해설', path: '/board/mamdo-commentary', order: 0 },
                    { name: '성경', path: '/board/bible', order: 1 },
                ]
            },
            { name: '이야기 샘', path: '/board/story-spring', order: 4 },
            {
                name: '커뮤니티',
                order: 5,
                subMenus: [
                    { name: '자유게시판', path: '/board/free-board', order: 0 },
                    { name: '갤러리', path: '/board/gallery', order: 1 },
                    { name: '질문과 답변', path: '/board/qna', order: 2 },
                ]
            },
        ];

        for (const item of defaultStructure) {
            const { subMenus, ...parentData } = item;
            const parent = await prisma.navigationMenu.create({
                data: parentData
            });

            if (subMenus) {
                for (const sub of subMenus) {
                    await prisma.navigationMenu.create({
                        data: {
                            ...sub,
                            parentId: parent.id
                        }
                    });
                }
            }
        }

        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.error("Failed to seed default menus:", error);
        return { success: false, error: "기본 메뉴 생성 중 오류가 발생했습니다." };
    }
}


