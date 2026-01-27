import { prisma } from "./prisma";

export async function performInitialSeed() {
    try {
        // 1. Navigation Menus
        const menuCount = await prisma.navigationMenu.count();
        if (menuCount === 0) {
            console.log("Seeding default navigation menus...");
            const defaultStructure = [
                { name: '두돌소개', path: '/about', order: 0 },
                { name: '교회사', path: '/board/church', order: 1 },
                {
                    name: '강론',
                    order: 2,
                    path: '/board/homily', // Explicit path for parent as requested
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
        }

        // 2. Board Settings
        const settingsCount = await prisma.boardSettings.count();
        if (settingsCount === 0) {
            console.log("Seeding default board settings...");
            const defaultBoards = [
                { category: 'church', name: '교회사', categories: ['한국교회사:church-korea', '세계교회사:church-world'] },
                { category: 'daily-homily', name: '오늘의 강론' },
                { category: 'sunday-homily', name: '주일/대축일 강론' },
                { category: 'feast-homily', name: '축일/기념일 강론' },
                { category: 'special-homily', name: '특별강론' },
                { category: 'mamdo-commentary', name: '맘도 성서 해설' },
                { category: 'bible', name: '성경', categories: ['구약:bible-old', '신약:bible-new'] },
                { category: 'story-spring', name: '이야기 샘' },
                { category: 'free-board', name: '자유게시판' },
                { category: 'gallery', name: '갤러리', mediaEnabled: true },
                { category: 'qna', name: '질문과 답변' },
            ];

            for (const board of defaultBoards) {
                await prisma.boardSettings.create({
                    data: {
                        ...board,
                        categories: board.categories || [],
                    }
                });
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Initial seeding failed:", error);
        return { success: false, error };
    }
}
