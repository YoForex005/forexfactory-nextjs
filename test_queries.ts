import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['error', 'warn'],
});

async function testQueries() {
    try {
        console.log('Test 1: Count all blogs...');
        const count = await prisma.blog.count();
        console.log(`✅ Total blogs: ${count}`);

        console.log('\nTest 2: Get one blog without conditions...');
        const oneBlog = await prisma.blog.findFirst();
        console.log(`✅ Found blog:`, {
            id: oneBlog?.id,
            title: oneBlog?.title,
            status: oneBlog?.status,
        });

        console.log('\nTest 3: Get published blogs...');
        const publishedBlogs = await prisma.blog.findMany({
            where: { status: 'published' },
            take: 3,
        });
        console.log(`✅ Found ${publishedBlogs.length} published blogs`);

        console.log('\nTest 4: Get blogs with orderBy...');
        const orderedBlogs = await prisma.blog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 3,
        });
        console.log(`✅ Found ${orderedBlogs.length} ordered blogs`);

        console.log('\nTest 5: Get published blogs with orderBy (main page query)...');
        const mainPageBlogs = await prisma.blog.findMany({
            orderBy: { createdAt: 'desc' },
            where: { status: 'published' },
            take: 3,
        });
        console.log(`✅ Found ${mainPageBlogs.length} blogs for main page`);
        console.log('First blog:', mainPageBlogs[0]);

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testQueries();
