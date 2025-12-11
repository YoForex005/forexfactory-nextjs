import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get all blog posts (for admin)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user?.role !== "admin" && session.user?.role !== "editor")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        views: true,
        createdAt: true,
        author: true,
        seoSlug: true,
      },
    });

    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

// Create new blog post
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user?.role !== "admin" && session.user?.role !== "editor")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, excerpt, featuredImage, author, tags, status } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Create blog post
    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        seoSlug: slug,
        featuredImage: featuredImage || "",
        author: author || "Admin",
        tags: tags || "",
        status: status || "draft",
        categoryId: 1, // Default category
        downloadLink: null,
      },
    });

    return NextResponse.json({ success: true, blog }, { status: 201 });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}

// Update blog post
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user?.role !== "admin" && session.user?.role !== "editor")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id, title, content, excerpt, featuredImage, author, tags, status,
      seoSlug, metaTitle, metaDescription, canonicalUrl
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Blog ID is required" }, { status: 400 });
    }

    const blogId = parseInt(id);

    // Update blog post
    const blog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        title,
        content,
        featuredImage,
        author,
        tags,
        status,
        seoSlug: seoSlug || undefined,
      },
    });

    // Update SEO Meta
    if (metaTitle || metaDescription || canonicalUrl) {
      const existingSeo = await prisma.seoMeta.findFirst({
        where: { postId: blogId }
      });

      if (existingSeo) {
        await prisma.seoMeta.update({
          where: { id: existingSeo.id },
          data: {
            seoTitle: metaTitle,
            seoDescription: metaDescription,
            canonicalUrl: canonicalUrl,
          }
        });
      } else {
        await prisma.seoMeta.create({
          data: {
            postId: blogId,
            seoTitle: metaTitle,
            seoDescription: metaDescription,
            canonicalUrl: canonicalUrl,
          }
        });
      }
    }

    return NextResponse.json({ success: true, blog }, { status: 200 });
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

// Delete blog post
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user?.role !== "admin" && session.user?.role !== "editor")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Blog ID is required" }, { status: 400 });
    }

    await prisma.blog.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
