import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Strip HTML tags and entities
function stripHtml(html: string | null): string {
    if (!html) return "";
    return html
        .replace(/<[^>]*>/g, '')        // Remove HTML tags
        .replace(/&nbsp;/g, ' ')         // Replace &nbsp;
        .replace(/&amp;/g, '&')          // Replace &amp;
        .replace(/&lt;/g, '<')           // Replace &lt;
        .replace(/&gt;/g, '>')           // Replace &gt;
        .replace(/&quot;/g, '"')         // Replace &quot;
        .replace(/&#39;/g, "'")          // Replace &#39;
        .replace(/\s+/g, ' ')            // Replace multiple spaces
        .trim();
}

async function fixSeoMeta() {
    console.log('🚀 Fixing SEO Meta for all blogs...\n');

    try {
        // Step 1: Delete all existing SEO meta (to start fresh)
        const deleted = await prisma.seoMeta.deleteMany({});
        console.log(`🗑️  Deleted ${deleted.count} existing SEO meta entries\n`);

        // Step 2: Get all blogs
        const blogs = await prisma.blog.findMany({
            select: {
                id: true,
                title: true,
                seoSlug: true,
                content: true,
                featuredImage: true,
                tags: true,
            }
        });

        console.log(`📝 Found ${blogs.length} blogs\n`);

        // Step 3: Create clean SEO meta for each blog
        let successCount = 0;

        for (const blog of blogs) {
            try {
                // Strip HTML from content and get first 160 chars
                const plainText = stripHtml(blog.content);
                const description = plainText.substring(0, 160);

                // Create SEO meta with clean text
                await prisma.seoMeta.create({
                    data: {
                        postId: blog.id,
                        seoTitle: blog.title,
                        seoDescription: description,
                        seoKeywords: blog.tags || "Forex, Trading, EA",
                        seoSlug: blog.seoSlug,
                        canonicalUrl: null,
                        metaRobots: "index_follow",
                        ogTitle: blog.title,
                        ogDescription: description,
                        ogImage: blog.featuredImage || "/images/blog/default.jpg",
                    }
                });

                successCount++;
                console.log(`✅ Created clean SEO meta for: "${blog.title}"`);
                console.log(`   Description: ${description.substring(0, 80)}...\n`);
            } catch (error) {
                console.error(`❌ Failed for blog ID ${blog.id}:`, error);
            }
        }

        console.log('\n🎉 Done!');
        console.log(`✅ Successfully created ${successCount} SEO meta entries with clean text\n`);

    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run it
fixSeoMeta();
