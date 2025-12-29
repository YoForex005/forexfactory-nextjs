
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Users...");
    const users = await prisma.user.findMany({
        include: {
            _count: {
                select: { savedArticles: true }
            }
        }
    });
    console.log("Users found:", users.length);
    users.forEach(u => {
        console.log(`User ID: ${u.id}, Email: ${u.email}, Saved Count: ${u._count.savedArticles}`);
    });

    console.log("\nChecking Saved Articles...");
    const saved = await prisma.savedArticle.findMany();
    console.log("Total Saved Articles:", saved.length);
    saved.forEach(s => {
        console.log(`Saved ID: ${s.id}, UserID: ${s.userId}, BlogID: ${s.blogId}`);
    });

    console.log("\nChecking Blogs...");
    const blogs = await prisma.blog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });
    const blogCount = await prisma.blog.count();
    console.log("Total Blogs:", blogCount);
    blogs.forEach(b => {
        console.log(`Blog ID: ${b.id}, Title: ${b.title}, Slug: ${b.seoSlug}, Status: ${b.status}, AI: ${b.isAiGenerated}, Connection: ${b.author}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
