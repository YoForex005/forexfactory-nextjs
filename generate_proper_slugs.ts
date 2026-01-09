import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSlug(title: string, id: bigint): string {
    // Convert title to slug format
    let slug = title
        .toLowerCase()
        .trim()
        // Remove special characters
        .replace(/[^\w\s-]/g, '')
        // Replace spaces with hyphens
        .replace(/\s+/g, '-')
        // Remove multiple consecutive hyphens
        .replace(/-+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-+|-+$/g, '');

    // If slug is empty or too short, use a default
    if (!slug || slug.length < 3) {
        slug = `blog-post-${id}`;
    }

    // Limit length to 200 characters
    if (slug.length > 200) {
        slug = slug.substring(0, 200).replace(/-[^-]*$/, '');
    }

    return slug;
}

async function fixAllSlugs() {
    try {
        console.log('Fetching all blogs...\n');

        const blogs = await prisma.blog.findMany({
            select: {
                id: true,
                title: true,
                seoSlug: true,
            },
            orderBy: { id: 'asc' }
        });

        console.log(`Found ${blogs.length} blogs\n`);

        // Track which slugs we've used to ensure uniqueness
        const usedSlugs = new Set<string>();
        const updates: Array<{ id: bigint; oldSlug: string; newSlug: string }> = [];

        for (const blog of blogs) {
            let newSlug = generateSlug(blog.title, blog.id);

            // If this slug is already used, append the ID to make it unique
            if (usedSlugs.has(newSlug)) {
                newSlug = `${newSlug}-${blog.id}`;
            }

            usedSlugs.add(newSlug);

            // Only update if slug has changed
            if (blog.seoSlug !== newSlug) {
                updates.push({
                    id: blog.id,
                    oldSlug: blog.seoSlug,
                    newSlug: newSlug
                });
            }
        }

        console.log(`Need to update ${updates.length} slugs\n`);

        if (updates.length === 0) {
            console.log('All slugs are already correct!');
            return;
        }

        // Show first 10 examples
        console.log('Examples of updates:');
        updates.slice(0, 10).forEach(update => {
            console.log(`ID ${update.id}:`);
            console.log(`  Old: ${update.oldSlug}`);
            console.log(`  New: ${update.newSlug}\n`);
        });

        console.log('\nUpdating slugs...');
        let count = 0;

        for (const update of updates) {
            await prisma.blog.update({
                where: { id: update.id },
                data: { seoSlug: update.newSlug }
            });

            count++;
            if (count % 100 === 0) {
                console.log(`Updated ${count}/${updates.length}...`);
            }
        }

        console.log(`\n✅ Successfully updated ${count} slugs!`);

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

fixAllSlugs();
