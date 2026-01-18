"use server";

import { prisma } from "@/lib/prisma";

export async function getPublicMenus() {
    try {
        const menus = await prisma.navigationMenu.findMany({
            where: { parentId: null },
            orderBy: { order: "asc" },
            include: {
                subMenus: {
                    orderBy: { order: "asc" }
                }
            }
        });
        return menus;
    } catch (error) {
        console.error("Failed to fetch menus:", error);
        return [];
    }
}
