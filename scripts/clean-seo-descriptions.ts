import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to strip HTML tags and entities
function stripHtml(html: string | null): string {
    if (!html) return "";
    return html
        .replace(/<[^>]*>/g, '')        // Remove HTML tags
        .replace(/&nbsp;/g, ' ')         // Replace &nbsp; with space
        .replace(/&amp;/g, '&')          // Replace &amp; with &
        .replace(/&lt;/g, '<')           // Replace &lt; with <
        .replace(/&gt;/g, '>')           // Replace &gt; with >
        .replace(/&quot;/g, '"')         // Replace &quot; with "
        .replace(/&#39;/g, "'")          // Replace &#39; with '
        .replace(/\s+/g, ' ')            // Replace multiple spaces with single space
        .trim();
}

async function cleanSeoDescriptions() {
    console.log('🧹 Starting SEO Description cleanup...\n');

    try {
        // Get all SEO meta entries
        const allSeoMeta = await prisma.seoMeta.findMany({
            select: {
                id: true,
                postId: true,
                seoDescription: true,
                ogDescription: true,
            }
        });

        console.log(`Found ${allSeoMeta.length} SEO meta entries\n`);

        let updatedCount = 0;
        let skippedCount = 0;

        for (const seo of allSeoMeta) {
            // Check if description contains HTML tags
            const hasHtmlInSeo = seo.seoDescription && /<[^>]*>/.test(seo.seoDescription);
            const hasHtmlInOg = seo.ogDescription && /<[^>]*>/.test(seo.ogDescription);

            if (hasHtmlInSeo || hasHtmlInOg) {
                // Clean the descriptions
                const cleanSeoDesc = stripHtml(seo.seoDescription).substring(0, 160);
                const cleanOgDesc = stripHtml(seo.ogDescription).substring(0, 160);

                // Update the database
                await prisma.seoMeta.update({
                    where: { id: seo.id },
                    data: {
                        seoDescription: cleanSeoDesc,
                        ogDescription: cleanOgDesc,
                    }
                });

                updatedCount++;
                console.log(`✅ Cleaned SEO meta for post ID ${seo.postId}`);
                console.log(`   Before: ${seo.seoDescription?.substring(0, 50)}...`);
                console.log(`   After:  ${cleanSeoDesc.substring(0, 50)}...\n`);
            } else {
                skippedCount++;
                console.log(`⏭️  Skipped SEO meta for post ID ${seo.postId} (already clean)`);
            }
        }

        console.log('\n📊 Summary:');
        console.log(`✅ Updated: ${updatedCount} SEO meta entries`);
        console.log(`⏭️  Skipped: ${skippedCount} entries (already clean)`);
        console.log('\n🎉 SEO Description cleanup complete!');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the cleanup
cleanSeoDescriptions();
