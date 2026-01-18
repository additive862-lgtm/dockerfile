"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
    return session;
}

export async function getAdminStats() {
    await checkAdmin();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalUsers, todayUsers, totalPosts, todayPosts] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
        prisma.post.count(),
        prisma.post.count({ where: { createdAt: { gte: startOfToday } } }),
    ]);

    return {
        totalUsers,
        todayUsers,
        totalPosts,
        todayPosts,
    };
}

export async function getRecentUsers() {
    await checkAdmin();

    return await prisma.user.findMany({
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
}

export async function getAllUsers() {
    await checkAdmin();

    return await prisma.user.findMany({
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
    await checkAdmin();

    const posts = await prisma.post.groupBy({
        by: ["category"],
        _count: {
            id: true,
        },
    });

    // Also get all distinct categories from Post table to ensure we have all
    // But categories are strings, so just group is fine.

    return posts.map(p => ({
        category: p.category,
        count: p._count.id,
    }));
}

export async function getPostsWithComments() {
    await checkAdmin();

    return await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { comments: true }
            }
        }
    });
}

export async function getBoardSettings() {
    await checkAdmin();
    return await prisma.boardSettings.findMany({
        orderBy: { name: "asc" }
    });
}

export async function updateBoardSettings(category: string, data: any) {
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
}

export async function initializeBoardSettings(boards: { category: string, name: string }[]) {
    await checkAdmin();

    for (const board of boards) {
        await prisma.boardSettings.upsert({
            where: { category: board.category },
            update: {},
            create: {
                category: board.category,
                name: board.name,
            },
        });
    }

    revalidatePath("/admin/boards");
    return { success: true };
}

export async function deleteBoard(category: string) {
    await checkAdmin();

    // The Posts and Comments should be deleted by DB Cascade if configured, 
    // but Prisma also handles this if the schema is correct.
    await prisma.boardSettings.delete({
        where: { category }
    });

    // We also need to delete posts manually if not cascaded (Prisma does cascade if onDelete: Cascade is in schema)
    // BoardSettings doesn't have a direct relation to Post in schema, 
    // so we must delete posts matching this category string.
    await prisma.post.deleteMany({
        where: { category }
    });

    revalidatePath("/admin/boards");
    return { success: true };
}

// Menu Actions
export async function getMenus() {
    await checkAdmin();
    return await prisma.navigationMenu.findMany({
        orderBy: { order: "asc" },
        include: {
            subMenus: {
                orderBy: { order: "asc" }
            }
        },
        where: { parentId: null } // Get top-level menus first
    });
}

export async function updateMenu(id: number | null, data: any) {
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
}

export async function deleteMenu(id: number) {
    await checkAdmin();
    await prisma.navigationMenu.delete({
        where: { id }
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/menus");
    return { success: true };
}

export async function reorderMenus(items: { id: number, order: number }[]) {
    await checkAdmin();

    await Promise.all(items.map(item =>
        prisma.navigationMenu.update({
            where: { id: item.id },
            data: { order: item.order }
        })
    ));

    revalidatePath("/", "layout");
    return { success: true };
}

export async function seedDefaultMenus() {
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
}


