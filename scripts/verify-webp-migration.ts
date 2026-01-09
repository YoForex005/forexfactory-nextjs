import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyUpdate() {
    console.log('Verifying the WebP migration...\n');

    try {
        // Get a sample of updated blogs
        const sampleBlogs = await prisma.blog.findMany({
            where: {
                featuredImage: {
                    contains: '.webp'
                }
            },
            select: {
                id: true,
                title: true,
                featuredImage: true
            },
            take: 5
        });

        console.log('✅ Sample of updated blog featured images:');
        console.log('═══════════════════════════════════════\n');
        sampleBlogs.forEach((blog, index) => {
            console.log(`${index + 1}. Blog ID: ${blog.id}`);
            console.log(`   Title: ${blog.title}`);
            console.log(`   Image: ${blog.featuredImage}`);
            console.log();
        });

        // Count all blogs with webp
        const totalWebp = await prisma.blog.count({
            where: {
                featuredImage: {
                    contains: '.webp'
                }
            }
        });

        console.log('═══════════════════════════════════════');
        console.log(`Total blogs with .webp images: ${totalWebp}`);
        console.log('═══════════════════════════════════════');

    } catch (error) {
        console.error('❌ Error verifying:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the verification
verifyUpdate()
    .then(() => {
        console.log('\n✅ Verification completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Verification failed:', error);
        process.exit(1);
    });
