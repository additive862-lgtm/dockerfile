import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const post = await prisma.post.findUnique({
        where: { id: 17 },
        include: {
            comments: true,
        }
    });
    console.log(JSON.stringify(post, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
