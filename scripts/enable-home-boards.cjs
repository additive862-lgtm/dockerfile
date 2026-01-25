const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Enabling showOnHome for existing boards...');
    const boards = await prisma.boardSettings.findMany();
    console.log('Boards found:', boards.map(b => b.category));

    if (boards.length > 0) {
        const result = await prisma.boardSettings.updateMany({
            where: {
                category: { in: boards.slice(0, 3).map(b => b.category) }
            },
            data: {
                showOnHome: true
            }
        });
        console.log('Result:', result);
    } else {
        console.log('No boards to update.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
