import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showSampleImages() {
    console.log('Showing sample blog images from the database:\n');

    try {
        const samples = await prisma.blog.findMany({
            select: {
                id: true,
                title: true,
                featuredImage: true
            },
            take: 10,
            orderBy: { createdAt: 'desc' }
        });

        console.log('Recent blog images:');
        console.log('═══════════════════════════════════════\n');

        samples.forEach((blog, index) => {
            console.log(`${index + 1}. Blog ID: ${blog.id}`);
            console.log(`   Title: ${blog.title.substring(0, 60)}...`);
            console.log(`   Image URL: ${blog.featuredImage}`);

            // Verify format
            const hasUrl = blog.featuredImage.startsWith('http');
            const hasWebp = blog.featuredImage.endsWith('.webp');
            const hasPng = blog.featuredImage.endsWith('.png');

            console.log(`   ✓ Has URL: ${hasUrl}, Has .webp: ${hasWebp}, Has .png: ${hasPng}`);
            console.log();
        });

        // Summary statistics
        const totalBlogs = await prisma.blog.count();
        const withWebp = await prisma.blog.count({
            where: { featuredImage: { endsWith: '.webp' } }
        });
        const withUrl = await prisma.blog.count({
            where: { featuredImage: { startsWith: 'http' } }
        });

        console.log('═══════════════════════════════════════');
        console.log('Database Statistics:');
        console.log('═══════════════════════════════════════');
        console.log(`Total blogs: ${totalBlogs}`);
        console.log(`Blogs with full URL: ${withUrl}`);
        console.log(`Blogs with .webp: ${withWebp}`);
        console.log(`Coverage: ${((withUrl / totalBlogs) * 100).toFixed(1)}% have full URLs`);
        console.log(`WebP coverage: ${((withWebp / totalBlogs) * 100).toFixed(1)}% use WebP format`);
        console.log('═══════════════════════════════════════');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

showSampleImages()
    .then(() => {
        console.log('\n✅ Sample check completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Failed:', error);
        process.exit(1);
    });
