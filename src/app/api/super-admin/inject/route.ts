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
            post_status
        } = body;

        // Defaults for required fields not provided by AI
        const defaultAuthor = "Super Admin";
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
        // Schema has "published", "draft"
        let status: BlogStatus = BlogStatus.draft;
        if (post_status?.toLowerCase().includes('publish')) {
            status = BlogStatus.published;
        }

        // Create Blog
        const blog = await prisma.blog.create({
            data: {
                title: h1 || "Untitled AI Blog",
                seoSlug: slug,
                status: status,
                content: body_html || "<p>No content generated.</p>",
                author: defaultAuthor,
                featuredImage: defaultImage,
                tags: Array.isArray(secondary_keywords) ? secondary_keywords.join(",") : "AI, Forex",
                categoryId: categoryId,

                // Mapped fields
                metaTitle: meta_title,
                metaDescription: meta_description,
                faqSchema: faq_schema_json ? JSON.stringify(faq_schema_json) : null,
                lsiKeywords: lsi_used ? JSON.stringify(lsi_used) : null,
                primaryKeyword: primary_keyword,
                secondaryKeywords: secondary_keywords ? JSON.stringify(secondary_keywords) : null,
                targetAudience: target_audience,
                searchIntent: intent,
                contentType: content_type,
                personaType: act_as,
                customPersona: custom_persona,
                tone: tone,
                style: style,
                pov: pov,
                emojiUsage: emoji_usage,
                humanizationLevel: humanization_level,
                ctaText: cta,

                isAiGenerated: true
            }
        });

        console.log("Successfully injected blog:", blog.id);

        return NextResponse.json({ success: true, blogId: blog.id, slug: blog.seoSlug });
    } catch (error) {
        console.error("Injection Error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
