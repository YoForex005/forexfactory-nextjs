import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasAdminAccess } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

const SITEMAP_PATH = path.join(process.cwd(), "public", "sitemap.xml");
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://forexfactory.cc";

async function generateSitemapXml() {
  const blogs = await prisma.blog.findMany({
    where: { status: "published" },
    select: { id: true, seoSlug: true, createdAt: true }
  });

  const signals = await prisma.signal.findMany({
    where: { status: "active" },
    // @ts-ignore - Signal properties exist in schema but client not updated
    select: { id: true, slug: true, updatedAt: true }
  });

  const staticPages = [
    "",
    "/about",
    "/contact",
    "/signals",
    "/blog"
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static Pages
  for (const page of staticPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${page}</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  // Blogs
  for (const blog of blogs) {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/blog/${blog.seoSlug || blog.id}</loc>\n`;
    xml += `    <lastmod>${blog.updatedAt?.toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  }

  // Signals
  for (const signal of signals) {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/signals/${signal.slug || signal.id}</loc>\n`;
    xml += `    <lastmod>${signal.updatedAt?.toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!hasAdminAccess(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      // Try to read existing sitemap
      const content = await fs.readFile(SITEMAP_PATH, "utf-8");
      return NextResponse.json({ preview: content });
    } catch (error) {
      // Generate new if not found
      const xml = await generateSitemapXml();
      return NextResponse.json({ preview: xml });
    }
  } catch (error) {
    console.error("Error reading sitemap:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!hasAdminAccess(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const xml = await generateSitemapXml();
    await fs.writeFile(SITEMAP_PATH, xml);

    return NextResponse.json({ success: true, preview: xml });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
