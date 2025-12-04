import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { insertBlogSchema } from "@shared/schema";
import { z } from "zod";

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
    
    // Validate input using shared Zod schema
    // Note: We might need to adapt the schema validation if fields slightly differ
    // or use a looser validation for the API route if needed.
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
        // Initialize SEO meta if provided in separate relation logic (omitted for simplicity here)
      },
    });

    // If SEO meta is included in body, we would create it here too.
    // For now, just return the blog.

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
