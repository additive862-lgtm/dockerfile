const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Creating a test gallery post...');

    // Ensure gallery board exists
    const galleryBoard = await prisma.boardSettings.findUnique({
        where: { category: 'gallery' }
    });

    if (!galleryBoard) {
        console.log('Gallery board not found. Creating it...');
        await prisma.boardSettings.create({
            data: {
                category: 'gallery',
                name: '갤러리',
                layoutType: 'GALLERY',
                showOnHome: false // It has its own section
            }
        });
    }

    const post = await prisma.post.create({
        data: {
            title: '아름다운 성당 풍경',
            content: '테스트 갤러리 게시물입니다.',
            author: '관리자',
            category: 'gallery',
            thumbnail: 'https://images.unsplash.com/photo-1467226319480-606d338e5699?auto=format&fit=crop&q=80'
        }
    });
    console.log('Post created:', post.id);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
