import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNonWebpImages() {
    console.log('Checking images that are not .webp format:\n');

    try {
        const nonWebp = await prisma.blog.findMany({
            where: {
                NOT: {
                    featuredImage: { endsWith: '.webp' }
                }
            },
            select: {
                id: true,
                title: true,
                featuredImage: true
            }
        });

        console.log(`Found ${nonWebp.length} images that are not .webp:\n`);

        nonWebp.forEach((blog, index) => {
            const extension = blog.featuredImage.split('.').pop() || 'unknown';
            console.log(`${index + 1}. ID: ${blog.id}`);
            console.log(`   Extension: .${extension}`);
            console.log(`   Full URL: ${blog.featuredImage}`);
            console.log();
        });

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

checkNonWebpImages()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Failed:', error);
        process.exit(1);
    });
