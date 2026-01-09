import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePngToWebp() {
    console.log('Starting PNG to WebP extension update...\n');

    try {
        // 1. Update Blog featured images
        console.log('Updating Blog featured images...');
        const blogsResult = await prisma.$executeRaw`
      UPDATE blogs
      SET featured_image = REPLACE(featured_image, '.png', '.webp')
      WHERE featured_image LIKE '%.png'
    `;
        console.log(`✓ Updated ${blogsResult} blog featured images\n`);

        // 2. Update Admin profile pictures
        console.log('Updating Admin profile pictures...');
        const adminsResult = await prisma.$executeRaw`
      UPDATE admins
      SET profile_pic = REPLACE(profile_pic, '.png', '.webp')
      WHERE profile_pic LIKE '%.png'
    `;
        console.log(`✓ Updated ${adminsResult} admin profile pictures\n`);

        // 3. Update SEO Meta OG Images
        console.log('Updating SEO Meta OG images...');
        const seoMetaResult = await prisma.$executeRaw`
      UPDATE seo_meta
      SET og_image = REPLACE(og_image, '.png', '.webp')
      WHERE og_image LIKE '%.png'
    `;
        console.log(`✓ Updated ${seoMetaResult} SEO meta OG images\n`);

        // 4. Update Media file paths
        console.log('Updating Media file paths...');
        const mediaResult = await prisma.$executeRaw`
      UPDATE media
      SET file_path = REPLACE(file_path, '.png', '.webp'),
          file_name = REPLACE(file_name, '.png', '.webp')
      WHERE file_path LIKE '%.png' OR file_name LIKE '%.png'
    `;
        console.log(`✓ Updated ${mediaResult} media file paths\n`);

        // 5. Update Signal file paths
        console.log('Updating Signal file paths...');
        const signalsResult = await prisma.$executeRaw`
      UPDATE signals
      SET file_path = REPLACE(file_path, '.png', '.webp')
      WHERE file_path LIKE '%.png'
    `;
        console.log(`✓ Updated ${signalsResult} signal file paths\n`);

        console.log('═══════════════════════════════════════');
        console.log('Migration Summary:');
        console.log('═══════════════════════════════════════');
        console.log(`Blogs:      ${blogsResult} records updated`);
        console.log(`Admins:     ${adminsResult} records updated`);
        console.log(`SEO Meta:   ${seoMetaResult} records updated`);
        console.log(`Media:      ${mediaResult} records updated`);
        console.log(`Signals:    ${signalsResult} records updated`);
        console.log('═══════════════════════════════════════');
        console.log('\n✅ All PNG extensions have been replaced with WebP!');

    } catch (error) {
        console.error('❌ Error during migration:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the migration
updatePngToWebp()
    .then(() => {
        console.log('\n🎉 Migration completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Migration failed:', error);
        process.exit(1);
    });
