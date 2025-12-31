const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAuthor() {
    try {
        const blogs = await prisma.blog.findMany({
            take: 10,
            select: {
                id: true,
                title: true,
                author: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        console.log('Checking author field in blogs:');
        console.log('Total blogs found:', blogs.length);
        console.log('---');
        for (const blog of blogs) {
            console.log('ID:', blog.id);
            console.log('Author value:', JSON.stringify(blog.author));
            console.log('Author length:', blog.author ? blog.author.length : 'null');
            console.log('---');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAuthor();
