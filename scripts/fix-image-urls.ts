import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BASE_URL = 'https://pub-9fc60e9b8d334d298b6a4a22f06229c0.r2.dev/images/';

async function fixImageUrls() {
    console.log('Starting to fix image URLs...\n');

    try {
        // Update images that don't start with http
        // Add the base URL prefix to images like "img_xxx.webp"
        console.log('Adding URL prefix to images without it...');

        const result = await prisma.$executeRaw`
      UPDATE blogs
      SET featured_image = CONCAT(${BASE_URL}, featured_image)
      WHERE featured_image NOT LIKE 'http%' 
        AND featured_image != ''
        AND featured_image IS NOT NULL
    `;

        console.log(`✓ Updated ${result} image URLs with proper prefix\n`);

        // Verify the fix
        const stillMissing = await prisma.blog.count({
            where: {
                AND: [
                    { featuredImage: { not: { startsWith: 'http' } } },
                    { featuredImage: { not: { equals: '' } } }
                ]
            }
        });

        console.log('═══════════════════════════════════════');
        console.log('Verification:');
        console.log('═══════════════════════════════════════');
        console.log(`Images updated: ${result}`);
        console.log(`Images still missing prefix: ${stillMissing}`);
        console.log('═══════════════════════════════════════');

        // Show some examples of the fixed URLs
        const examples = await prisma.blog.findMany({
            where: {
                featuredImage: { startsWith: BASE_URL }
            },
            select: {
                id: true,
                title: true,
                featuredImage: true
            },
            take: 5
        });

        if (examples.length > 0) {
            console.log('\n✅ Sample of fixed URLs:');
            examples.forEach((blog, index) => {
                console.log(`${index + 1}. ${blog.featuredImage}`);
            });
        }

        if (stillMissing === 0) {
            console.log('\n🎉 All image URLs have been successfully fixed!');
        } else {
            console.log(`\n⚠️  Warning: ${stillMissing} images still need attention.`);
        }

    } catch (error) {
        console.error('❌ Error fixing URLs:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

fixImageUrls()
    .then(() => {
        console.log('\n✅ Migration completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Migration failed:', error);
        process.exit(1);
    });
