import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function convertAllToWebp() {
    console.log('Converting all image extensions to .webp...\n');

    try {
        // 1. Convert .jpg to .webp
        console.log('Converting .jpg to .webp...');
        const jpgResult = await prisma.$executeRaw`
      UPDATE blogs
      SET featured_image = REPLACE(featured_image, '.jpg', '.webp')
      WHERE featured_image LIKE '%.jpg'
    `;
        console.log(`✓ Converted ${jpgResult} .jpg images to .webp\n`);

        // 2. Convert .jpeg to .webp
        console.log('Converting .jpeg to .webp...');
        const jpegResult = await prisma.$executeRaw`
      UPDATE blogs
      SET featured_image = REPLACE(featured_image, '.jpeg', '.webp')
      WHERE featured_image LIKE '%.jpeg'
    `;
        console.log(`✓ Converted ${jpegResult} .jpeg images to .webp\n`);

        // 3. Convert .png to .webp (in case any remain)
        console.log('Converting any remaining .png to .webp...');
        const pngResult = await prisma.$executeRaw`
      UPDATE blogs
      SET featured_image = REPLACE(featured_image, '.png', '.webp')
      WHERE featured_image LIKE '%.png'
    `;
        console.log(`✓ Converted ${pngResult} .png images to .webp\n`);

        // 4. Convert .gif to .webp
        console.log('Converting .gif to .webp...');
        const gifResult = await prisma.$executeRaw`
      UPDATE blogs
      SET featured_image = REPLACE(featured_image, '.gif', '.webp')
      WHERE featured_image LIKE '%.gif'
    `;
        console.log(`✓ Converted ${gifResult} .gif images to .webp\n`);

        // Verify
        const totalConverted = Number(jpgResult) + Number(jpegResult) + Number(pngResult) + Number(gifResult);

        const remainingNonWebp = await prisma.blog.count({
            where: {
                NOT: {
                    featuredImage: { endsWith: '.webp' }
                }
            }
        });

        const totalWebp = await prisma.blog.count({
            where: {
                featuredImage: { endsWith: '.webp' }
            }
        });

        console.log('═══════════════════════════════════════');
        console.log('Conversion Summary:');
        console.log('═══════════════════════════════════════');
        console.log(`JPG converted: ${jpgResult}`);
        console.log(`JPEG converted: ${jpegResult}`);
        console.log(`PNG converted: ${pngResult}`);
        console.log(`GIF converted: ${gifResult}`);
        console.log(`Total converted: ${totalConverted}`);
        console.log('───────────────────────────────────────');
        console.log(`Total blogs with .webp: ${totalWebp}`);
        console.log(`Remaining non-webp: ${remainingNonWebp}`);
        console.log('═══════════════════════════════════════');

        if (remainingNonWebp === 0) {
            console.log('\n🎉 All images are now in .webp format!');
        } else {
            console.log(`\n⚠️  Warning: ${remainingNonWebp} images still have other formats.`);

            // Show what's remaining
            const remaining = await prisma.blog.findMany({
                where: {
                    NOT: {
                        featuredImage: { endsWith: '.webp' }
                    }
                },
                select: {
                    id: true,
                    featuredImage: true
                },
                take: 5
            });

            console.log('\nSample of remaining non-webp images:');
            remaining.forEach(blog => {
                const ext = blog.featuredImage.split('.').pop();
                console.log(`  ID ${blog.id}: .${ext}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

convertAllToWebp()
    .then(() => {
        console.log('\n✅ Conversion completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Conversion failed:', error);
        process.exit(1);
    });
