import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAndFixSeo() {
    console.log('🔍 Step 1: Testing database connection...\n');

    try {
        // Test database connection
        const blogCount = await prisma.blog.count();
        console.log(`✅ Database connected successfully!`);
        console.log(`📝 Found ${blogCount} blogs in database\n`);

        // Test if we can read blogs
        const blogs = await prisma.blog.findMany({
            take: 1,
            select: { id: true, title: true }
        });

        if (blogs.length > 0) {
            console.log(`✅ Can read blogs: "${blogs[0].title}"\n`);
        }

        console.log('🗑️  Step 2: Clearing existing SEO meta...\n');

        // Delete all existing SEO meta to start fresh
        const deleted = await prisma.seoMeta.deleteMany({});
        console.log(`✅ Deleted ${deleted.count} old SEO meta entries\n`);

        console.log('📝 Step 3: Getting all blogs...\n');

        // Get all blogs with necessary fields
        const allBlogs = await prisma.blog.findMany({
            select: {
                id: true,
                title: true,
                seoSlug: true,
                content: true,
                featuredImage: true,
                tags: true,
            }
        });

        console.log(`✅ Retrieved ${allBlogs.length} blogs\n`);

        console.log('🔧 Step 4: Creating clean SEO meta...\n');

        // Helper to strip HTML
        const stripHtml = (html: string | null): string => {
            if (!html) return "";
            return html
                .replace(/<[^>]*>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/\s+/g, ' ')
                .trim();
        };

        let created = 0;

        for (const blog of allBlogs) {
            // Strip HTML and get clean description
            const plainText = stripHtml(blog.content);
            const description = plainText.substring(0, 160);

            // Create SEO meta
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

            created++;
            console.log(`  ✅ [${created}/${allBlogs.length}] ${blog.title}`);
        }

        console.log('\n🎉 SUCCESS! All done!\n');
        console.log(`✅ Created ${created} SEO meta entries with clean text`);
        console.log(`✅ All HTML tags removed`);
        console.log(`✅ Ready to view on website!\n`);

    } catch (error: any) {
        console.error('\n❌ ERROR!\n');

        if (error.message?.includes('ECONNREFUSED') || error.message?.includes('ETIMEDOUT')) {
            console.error('🔴 Database connection failed!');
            console.error('📡 Please check:');
            console.error('   1. Is VPN connected?');
            console.error('   2. Is database server running?');
            console.error('   3. Is DATABASE_URL correct in .env?');
            console.error(`\n   Database: 100.83.194.98:5432\n`);
        } else {
            console.error('Error details:', error.message);
        }

        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the test and fix
testAndFixSeo();
