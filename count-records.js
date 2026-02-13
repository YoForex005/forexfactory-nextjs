
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function countRecords() {
    try {
        const categories = await prisma.category.count({ where: { status: 'active' } });
        const blogs = await prisma.blog.count({ where: { status: 'published' } });
        const signals = await prisma.signal.count();

        console.log('Categories:', categories);
        console.log('Blogs:', blogs);
        console.log('Signals:', signals);

        console.log('Total URLs:', categories + blogs + signals + 10); // +10 for static
    } catch (error) {
        console.error('Error counting:', error);
    } finally {
        await prisma.$disconnect();
    }
}

countRecords();
