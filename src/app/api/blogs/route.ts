import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Inline Zod schema for blog validation (compatible with Prisma)
const insertBlogSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  seoSlug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  content: z.string().min(1, "Content is required"),
  author: z.string().min(1, "Author is required"),
  featuredImages: z.array(z.string()).min(1, "At least one featured image is required"),
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
        featuredImages: validatedData.featuredImages,
        tags: validatedData.tags,
        categoryId: validatedData.categoryId,
        status: validatedData.status || 'draft',
        downloadLink: validatedData.downloadLink,
      },
    });

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

