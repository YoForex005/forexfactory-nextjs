import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { submitSingleUrl } from "@/lib/indexnow";
import { SITE_URL } from "@/lib/seo";

// Inline Zod schema for blog validation (compatible with Prisma)
const insertBlogSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  seoSlug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  content: z.string().min(1, "Content is required"),
  author: z.string().min(1, "Author is required"),
  featuredImage: z.string().min(1, "Featured image is required"),
  tags: z.string(),
  categoryId: z.number().positive(),
  downloadLink: z.string().optional(),
  status: z.enum(['published', 'draft']).optional()
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.blog.count(),
    ]);

    return NextResponse.json({
      data: blogs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input using Zod schema
    const validatedData = insertBlogSchema.parse(body);

    // Create blog post
    const blog = await prisma.blog.create({
      data: {
        title: validatedData.title,
        seoSlug: validatedData.seoSlug,
        content: validatedData.content,
        author: validatedData.author,
        featuredImage: validatedData.featuredImage,
        tags: validatedData.tags,
        categoryId: validatedData.categoryId,
        status: validatedData.status || 'draft',
        downloadLink: validatedData.downloadLink,
      },
    });

    // **FIX: Create SEO Meta automatically**
    // Extract plain text description from HTML content (first 160 chars)
    const plainTextDescription = validatedData.content
      .replace(/<[^>]*>/g, '')
      .substring(0, 160);

    await prisma.seoMeta.create({
      data: {
        postId: blog.id,
        seoTitle: validatedData.title,
        seoDescription: plainTextDescription,
        seoKeywords: validatedData.tags,
        seoSlug: validatedData.seoSlug,
        canonicalUrl: null,
        metaRobots: "index_follow",
        ogTitle: validatedData.title,
        ogDescription: plainTextDescription,
        ogImage: validatedData.featuredImage,
      }
    });

    // Trigger IndexNow if published
    if (validatedData.status === 'published') {
      const blogUrl = `${SITE_URL}/blog/${validatedData.seoSlug}`;
      try {
        const indexResult = await submitSingleUrl(blogUrl);
        await prisma.indexingLog.create({
          data: {
            url: blogUrl,
            service: 'IndexNow',
            action: 'create',
            status: indexResult.success ? 'success' : 'failed',
            response: indexResult.message,
            blogId: blog.id,
          }
        });
      } catch (indexingError: any) {
        console.error("Indexing notification failed:", indexingError);
        await prisma.indexingLog.create({
          data: {
            url: blogUrl,
            service: 'IndexNow',
            action: 'create',
            status: 'error',
            error: indexingError.message,
            blogId: blog.id,
          }
        });
      }
    }

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: (error as any).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    );
  }
}

