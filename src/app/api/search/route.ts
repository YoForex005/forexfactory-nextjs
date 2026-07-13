import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/seo";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();
    const type = searchParams.get("type") || "all"; // all, blog, signal
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "20", 10) || 20, 1),
      50
    );

    if (!query || query.length < 2) {
      return NextResponse.json(
        { blogs: [], signals: [], total: 0 },
        { status: 200 }
      );
    }

    // Search blogs and return sanitized excerpts instead of raw HTML.
    const blogsRaw = type === "all" || type === "blog"
      ? await prisma.blog.findMany({
        where: {
          AND: [
            { status: "published" },
            {
              OR: [
                { title: { contains: query } },
                { tags: { contains: query } },
              ],
            },
          ],
        },
        select: {
          id: true,
          title: true,
          seoSlug: true,
          content: true,
          featuredImage: true,
          createdAt: true,
          views: true,
          tags: true,
          author: true,
        },
        take: type === "blog" ? limit : Math.floor(limit / 2),
        orderBy: { createdAt: "desc" },
      })
      : [];

    const blogs = blogsRaw.map((blog) => ({
      id: blog.id.toString(),
      title: blog.title,
      seoSlug: blog.seoSlug,
      content: sanitizeText(blog.content, 220),
      excerpt: sanitizeText(blog.content, 220),
      featuredImage: blog.featuredImage,
      createdAt: blog.createdAt.toISOString(),
      views: blog.views === null ? 0 : Number(blog.views),
      tags: blog.tags,
      author: blog.author,
    }));

    // Search signals
    const signalsRaw = type === "all" || type === "signal"
      ? await prisma.signal.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ],
        },
        select: {
          id: true,
          uuid: true,
          title: true,
          description: true,
          sizeBytes: true,
          mime: true,
          createdAt: true,
        },
        take: type === "signal" ? limit : Math.floor(limit / 2),
        orderBy: { createdAt: "desc" },
      })
      : [];

    const signals = signalsRaw.map((signal) => ({
      ...signal,
      createdAt: signal.createdAt.toISOString(),
    }));

    const total = blogs.length + signals.length;

    return NextResponse.json(
      {
        blogs,
        signals,
        total,
        query,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed", blogs: [], signals: [], total: 0 },
      { status: 500 }
    );
  }
}
