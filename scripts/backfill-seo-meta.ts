import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillSeoMeta() {
    console.log('🚀 Starting SEO Meta backfill for existing blogs...\n');

    try {
        // Find all blogs that don't have SEO meta
        const blogsWithoutSeo = await prisma.blog.findMany({
            where: {
                seoMeta: {
                    none: {}
                }
            },
            select: {
                id: true,
                title: true,
                seoSlug: true,
                content: true,
                featuredImage: true,
                tags: true,
            }
        });

        console.log(`Found ${blogsWithoutSeo.length} blogs without SEO meta\n`);

        if (blogsWithoutSeo.length === 0) {
            console.log('✅ All blogs already have SEO meta!');
            return;
        }

        let successCount = 0;
        let errorCount = 0;

        for (const blog of blogsWithoutSeo) {
            try {
                // Extract plain text from HTML content (first 160 chars for description)
                const plainTextContent = blog.content.replace(/<[^>]*>/g, '').trim();
                const description = plainTextContent.substring(0, 160);

                // Create SEO meta for this blog
                await prisma.seoMeta.create({
                    data: {
                        postId: blog.id,
                        seoTitle: blog.title,
                        seoDescription: description,
                        seoKeywords: blog.tags,
                        seoSlug: blog.seoSlug,
                        canonicalUrl: null,
                        metaRobots: "index_follow",
                        ogTitle: blog.title,
                        ogDescription: description,
                        ogImage: blog.featuredImage,
                    }
                });

                successCount++;
                console.log(`✅ Created SEO meta for blog: "${blog.title}" (ID: ${blog.id})`);
            } catch (error) {
                errorCount++;
                console.error(`❌ Failed to create SEO meta for blog ID ${blog.id}:`, error);
            }
        }

        console.log('\n📊 Summary:');
        console.log(`✅ Successfully created: ${successCount} SEO meta entries`);
        console.log(`❌ Failed: ${errorCount} entries`);
        console.log('\n🎉 SEO Meta backfill complete!');

    } catch (error) {
        console.error('❌ Fatal error during backfill:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the backfill
backfillSeoMeta();
