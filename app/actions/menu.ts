"use server";

import { prisma } from "@/lib/prisma";
import { performInitialSeed } from "@/lib/seed";

export async function getPublicMenus() {
    try {
        const count = await prisma.navigationMenu.count();
        if (count === 0) {
            await performInitialSeed();
        }

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
