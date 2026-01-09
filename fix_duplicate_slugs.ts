import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDuplicateSlugs() {
    try {
        console.log('Finding duplicate seo_slug values...');

        // Get all blogs
        const blogs = await prisma.$queryRaw<Array<{ id: bigint; seo_slug: string }>>`
      SELECT id, seo_slug 
      FROM blogs 
      ORDER BY id ASC
    `;

        // Find duplicates
        const slugCounts = new Map<string, number>();
        const duplicates: Array<{ id: bigint; seo_slug: string }> = [];

        for (const blog of blogs) {
            const count = slugCounts.get(blog.seo_slug) || 0;
            slugCounts.set(blog.seo_slug, count + 1);

            if (count > 0) {
                duplicates.push(blog);
            }
        }

        console.log(`Found ${duplicates.length} duplicate slugs`);

        // Fix duplicates by appending the blog ID
        for (const blog of duplicates) {
            const newSlug = `${blog.seo_slug}-${blog.id}`;
            console.log(`Updating blog ${blog.id}: ${blog.seo_slug} -> ${newSlug}`);

            await prisma.$executeRaw`
        UPDATE blogs 
        SET seo_slug = ${newSlug} 
        WHERE id = ${blog.id}
      `;
        }

        console.log('✅ All duplicate slugs have been fixed!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixDuplicateSlugs();
