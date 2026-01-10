import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BlogStatus } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log("Received injection request:", body.h1 || "No Title");

        // Extract fields from body matching the Super Admin mapping
        const {
            h1,
            meta_title,
            meta_description,
            body_html,
            faq_schema_json,
            lsi_used,
            primary_keyword,
            secondary_keywords,
            target_audience,
            intent,
            content_type,
            act_as,
            custom_persona,
            tone,
            style,
            pov,
            emoji_usage,
            humanization_level,
            cta,
            post_status,
            download_link,  // Bot/EA download link provided by super admin
            featured_image,  // Optional featured image URL
            author  // Optional author name from super admin
        } = body;


        // Random American names pool for when no author is provided
        const americanNames = [
            "James Wilson", "Michael Johnson", "Robert Smith", "David Brown",
            "William Davis", "Richard Miller", "Joseph Anderson", "Thomas Taylor",
            "Christopher Moore", "Daniel Jackson", "Matthew White", "Anthony Harris",
            "Mark Thompson", "Steven Garcia", "Paul Martinez", "Andrew Robinson",
            "Joshua Clark", "Kenneth Lewis", "Kevin Walker", "Brian Hall",
            "Sarah Mitchell", "Emily Carter", "Jessica Turner", "Ashley Phillips",
            "Amanda Evans", "Jennifer Collins", "Elizabeth Stewart", "Stephanie Morris",
            "Nicole Rogers", "Melissa Reed", "Michelle Cooper", "Laura Bailey"
        ];

        // Pick a random author name if none provided
        const getRandomAuthor = () => americanNames[Math.floor(Math.random() * americanNames.length)];
        const blogAuthor = author && author.trim() ? author.trim() : getRandomAuthor();

        const defaultImage = "/images/blog/default.jpg";

        // Fetch a default category (fallback to 1 if none found, though 1 might not exist)
        const defaultCategory = await prisma.category.findFirst();
        const categoryId = defaultCategory ? defaultCategory.categoryId : 1;

        // Generate slug from title
        let slug = h1 ? h1.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `blog-${Date.now()}`;

        // Check for existing slug and append timestamp if needed to avoid collision
        const existing = await prisma.blog.findUnique({ where: { seoSlug: slug } });
        if (existing) {
            slug = `${slug}-${Date.now()}`;
        }

        // Map status
        // AI might send "Publish", "Draft", "Schedule"
        // Schema has "published", "draft", "scheduled"
        let status: BlogStatus = BlogStatus.draft;
        if (post_status?.toLowerCase().includes('publish')) {
            status = BlogStatus.published;
        }

        // Create Blog
        const blog = await prisma.blog.create({
            data: {
                title: (h1 && h1.trim()) || "Untitled AI Blog",
                seoSlug: slug,
                status: status,
                content: body_html || "<p>No content generated.</p>",
                author: blogAuthor,
                featuredImage: featured_image || defaultImage,
                tags: Array.isArray(secondary_keywords) ? secondary_keywords.join(",") : "AI, Forex",
                categoryId: categoryId,
                downloadLink: download_link || null,  // Bot/EA download link for download button
            }
        });

        // **FIX: Create SEO Meta automatically**
        // Helper function to strip HTML and get clean text
        const stripHtml = (html: string | undefined): string => {
            if (!html) return "";
            return html
                .replace(/<[^>]*>/g, '')  // Remove HTML tags
                .replace(/&nbsp;/g, ' ')   // Replace &nbsp; with space
                .replace(/&amp;/g, '&')    // Replace &amp; with &
                .replace(/&lt;/g, '<')     // Replace &lt; with <
                .replace(/&gt;/g, '>')     // Replace &gt; with >
                .replace(/&quot;/g, '"')   // Replace &quot; with "
                .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
                .trim();
        };

        // Get clean description (always strip HTML)
        const cleanDescription = stripHtml(meta_description || body_html || "").substring(0, 160);

        await prisma.seoMeta.create({
            data: {
                postId: blog.id,
                seoTitle: (meta_title && meta_title.trim()) || (h1 && h1.trim()) || "Untitled AI Blog",
                seoDescription: cleanDescription,
                seoKeywords: Array.isArray(secondary_keywords)
                    ? secondary_keywords.join(", ")
                    : primary_keyword || "Forex, Trading",
                seoSlug: slug,
                canonicalUrl: null,  // Will be set automatically by frontend
                metaRobots: "index_follow",
                ogTitle: (meta_title && meta_title.trim()) || (h1 && h1.trim()) || "Untitled AI Blog",
                ogDescription: cleanDescription,
                ogImage: featured_image || defaultImage,
            }
        });

        console.log("Successfully injected blog with SEO meta:", blog.id);

        return NextResponse.json({ success: true, blogId: blog.id, slug: blog.seoSlug });
    } catch (error) {
        console.error("Injection Error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
