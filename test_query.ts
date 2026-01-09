import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
});

async function testQuery() {
    try {
        console.log('Testing query...');
        const blogs = await prisma.blog.findMany({
            orderBy: { createdAt: 'desc' },
            where: { status: 'published' },
            take: 5,
        });
        console.log(`✅ Query successful! Found ${blogs.length} blogs`);
        console.log('First blog:', blogs[0]);
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testQuery();
