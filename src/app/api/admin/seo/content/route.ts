import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasAdminAccess } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!hasAdminAccess(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch Blogs with their SeoMeta
    const blogs = await prisma.blog.findMany({
      include: { seoMeta: true },
      orderBy: { createdAt: "desc" }
    });

    // 2. Fetch Signals (which have embedded SEO fields)
    const signals = await prisma.signal.findMany({
      orderBy: { createdAt: "desc" }
    });

    // 3. Normalize data
    const content = [];

    // Process Blogs
    for (const blog of blogs) {
      const seo = blog.seoMeta[0]; // Assuming 1:1 or 1:many, take first
      const issues = [];

      if (!seo?.seoTitle && !blog.title) issues.push("Missing meta title");
      if (!seo?.seoDescription) issues.push("Missing meta description");
      if (!seo?.seoKeywords && !blog.tags) issues.push("Missing keywords");

      content.push({
        id: blog.id,
        type: "blog",
        title: blog.title,
        slug: blog.seoSlug || `blog/${blog.id}`,
        metaTitle: seo?.seoTitle || blog.title,
        metaDescription: seo?.seoDescription || "",
        keywords: seo?.seoKeywords || blog.tags,
        canonicalUrl: seo?.canonicalUrl || "",
        ogTitle: seo?.ogTitle || "",
        ogDescription: seo?.ogDescription || "",
        ogImage: seo?.ogImage || blog.featuredImage,
        updatedAt: blog.createdAt.toISOString(),
        status: issues.length === 0 ? "good" : issues.length < 2 ? "warning" : "error",
        issues
      });
    }

    // Process Signals
    for (const signal of signals) {
      const issues = [];
      if (!signal.metaTitle && !signal.name) issues.push("Missing meta title");
      if (!signal.metaDescription && !signal.description) issues.push("Missing meta description");
      if (!signal.keywords) issues.push("Missing keywords");

      content.push({
        id: signal.id,
        type: "signal",
        title: signal.name || signal.title, // specific to schema
        slug: signal.slug || `signals/${signal.id}`,
        metaTitle: signal.metaTitle || signal.title,
        metaDescription: signal.metaDescription || "",
        keywords: signal.keywords || "",
        canonicalUrl: "", // Signal model might not have this yet
        ogTitle: "",
        ogDescription: "",
        ogImage: signal.previewImage || "",
        updatedAt: signal.createdAt.toISOString(),
        status: issues.length === 0 ? "good" : issues.length < 2 ? "warning" : "error",
        issues
      });
    }

    // Calculate stats
    const stats = {
      total: content.length,
      good: content.filter(c => c.status === "good").length,
      warning: content.filter(c => c.status === "warning").length,
      error: content.filter(c => c.status === "error").length
    };

    return NextResponse.json({ content, stats });
  } catch (error) {
    console.error("Error fetching SEO content:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
