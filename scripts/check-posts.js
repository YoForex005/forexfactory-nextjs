const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllPosts() {
    try {
        // Check Post table
        const allPosts = await prisma.post.findMany({
            select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        console.log(`\n📊 Total Posts in database: ${allPosts.length}`);
        console.log('\n📝 All Posts:');
        allPosts.forEach((post, i) => {
            console.log(`   ${i + 1}. [${post.status}] ${post.title.substring(0, 50)}...`);
        });

        // Check Blog table
        const allBlogs = await prisma.blog.findMany({
            select: {
                id: true,
                title: true,
                status: true,
            },
        });
        console.log(`\n📊 Total Blogs in database: ${allBlogs.length}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAllPosts();
