import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all"; // all, blog, signal
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query || query.length < 2) {
      return NextResponse.json(
        { blogs: [], signals: [], total: 0 },
        { status: 200 }
      );
    }

    const searchTerm = `%${query}%`;

    // Search blogs
    const blogs = type === "all" || type === "blog"
      ? await prisma.blog.findMany({
          where: {
            AND: [
              { status: "published" },
              {
                OR: [
                  { title: { contains: query } },
                  { content: { contains: query } },
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
          },
          take: type === "blog" ? limit : Math.floor(limit / 2),
          orderBy: { createdAt: "desc" },
        })
      : [];

    // Search signals
    const signals = type === "all" || type === "signal"
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
