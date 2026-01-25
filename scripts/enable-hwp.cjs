const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Enabling HWP import for free-board and mamdo-commentary...');
    const result = await prisma.boardSettings.updateMany({
        where: {
            category: { in: ['free-board', 'mamdo-commentary'] }
        },
        data: {
            hwpImportEnabled: true
        }
    });
    console.log('Result:', result);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
