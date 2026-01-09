import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImageUrls() {
    try {
        console.log('Checking image URLs in the database...\n');

        // Get sample of image URLs
        const blogs = await prisma.blog.findMany({
            select: {
                id: true,
                title: true,
                featuredImage: true,
            },
            take: 10,
        });

        console.log('Sample image URLs:');
        blogs.forEach(blog => {
            console.log(`\nID: ${blog.id}`);
            console.log(`Title: ${blog.title}`);
            console.log(`Image URL: ${blog.featuredImage}`);
        });

        // Count different domain patterns
        const allBlogs = await prisma.$queryRaw<Array<{ featured_image: string }>>`
      SELECT featured_image
      FROM blogs
      LIMIT 2000;
    `;

        const urlPatterns = {
            bucket1: 0, // pub-40e96c3f1a5f47fe8517d7d9948b9b7d
            bucket2: 0, // pub-9fc60e9b8d334d298b6a4a22f06229c0
            other: 0,
        };

        allBlogs.forEach(blog => {
            const url = blog.featured_image;
            if (url.includes('pub-40e96c3f1a5f47fe8517d7d9948b9b7d')) {
                urlPatterns.bucket1++;
            } else if (url.includes('pub-9fc60e9b8d334d298b6a4a22f06229c0')) {
                urlPatterns.bucket2++;
            } else {
                urlPatterns.other++;
            }
        });

        console.log('\n\nURL Distribution:');
        console.log(`Bucket 1 (pub-40e96...): ${urlPatterns.bucket1} images`);
        console.log(`Bucket 2 (pub-9fc60...): ${urlPatterns.bucket2} images`);
        console.log(`Other: ${urlPatterns.other} images`);

    } catch (error: any) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkImageUrls();
