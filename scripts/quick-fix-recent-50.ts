import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function quickFixRecentBlogs() {
    console.log('🚀 Quick SEO Fix - Recent 50 Blogs\n');

    try {
        // Get recent 50 blogs only
        console.log('📝 Getting recent 50 blogs...');

        const recentBlogs = await prisma.blog.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                seoSlug: true,
                content: true,
                featuredImage: true,
                tags: true,
            }
        });

        console.log(`✅ Retrieved ${recentBlogs.length} blogs\n`);

        // Helper to strip HTML
        const stripHtml = (html: string | null): string => {
            if (!html) return "";
            return html
                .replace(/<[^>]*>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/\s+/g, ' ')
                .trim();
        };

        console.log('🔧 Creating SEO meta...\n');

        let created = 0;
        let skipped = 0;

        for (const blog of recentBlogs) {
            // Check if SEO meta already exists
            const existing = await prisma.seoMeta.findFirst({
                where: { postId: blog.id }
            });

            if (existing) {
                // Update if it has HTML tags
                if (existing.seoDescription && /<[^>]*>/.test(existing.seoDescription)) {
                    const cleanDesc = stripHtml(existing.seoDescription).substring(0, 160);

                    await prisma.seoMeta.update({
                        where: { id: existing.id },
                        data: {
                            seoDescription: cleanDesc,
                            ogDescription: cleanDesc,
                        }
                    });

                    console.log(`  🔄 Updated: ${blog.title.substring(0, 50)}...`);
                    created++;
                } else {
                    console.log(`  ⏭️  Skipped: ${blog.title.substring(0, 50)}... (already clean)`);
                    skipped++;
                }
            } else {
                // Create new
                const plainText = stripHtml(blog.content);
                const description = plainText.substring(0, 160);

                await prisma.seoMeta.create({
                    data: {
                        postId: blog.id,
                        seoTitle: blog.title,
                        seoDescription: description,
                        seoKeywords: blog.tags || "Forex, Trading",
                        seoSlug: blog.seoSlug,
                        canonicalUrl: null,
                        metaRobots: "index_follow",
                        ogTitle: blog.title,
                        ogDescription: description,
                        ogImage: blog.featuredImage || "/images/default.jpg",
                    }
                });

                console.log(`  ✅ Created: ${blog.title.substring(0, 50)}...`);
                created++;
            }
        }

        console.log('\n🎉 Done!\n');
        console.log(`✅ Processed: ${created} blogs`);
        console.log(`⏭️  Skipped: ${skipped} blogs`);
        console.log(`\n✨ Recent blogs now have clean SEO descriptions!`);

    } catch (error: any) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

quickFixRecentBlogs();
