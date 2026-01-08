import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        let status = 'draft';
        if (post_status?.toLowerCase().includes('publish')) {
            status = 'published';
        }

        // Create Blog
        const blog = await prisma.blog.create({
            data: {
                title: h1 || "Untitled AI Blog",
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

        console.log("Successfully injected blog:", blog.id);

        return NextResponse.json({ success: true, blogId: blog.id, slug: blog.seoSlug });
    } catch (error) {
        console.error("Injection Error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
