import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasAdminAccess } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!hasAdminAccess(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();
    const {
      type,
      metaTitle,
      metaDescription,
      keywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage
    } = body;

    if (type === "blog") {
      // Update or Create SeoMeta for Blog
      const blog = await prisma.blog.findUnique({
        where: { id },
        include: { seoMeta: true }
      });

      if (!blog) {
        return NextResponse.json({ error: "Blog not found" }, { status: 404 });
      }

      if (blog.seoMeta.length > 0) {
        // Update existing
        await prisma.seoMeta.update({
          where: { id: blog.seoMeta[0].id },
          data: {
            seoTitle: metaTitle,
            seoDescription: metaDescription,
            seoKeywords: keywords,
            canonicalUrl,
            ogTitle,
            ogDescription,
            ogImage
          }
        });
      } else {
        // Create new
        await prisma.seoMeta.create({
          data: {
            postId: id,
            seoTitle: metaTitle,
            seoDescription: metaDescription,
            seoKeywords: keywords,
            canonicalUrl,
            ogTitle,
            ogDescription,
            ogImage
          }
        });
      }
    } else if (type === "signal") {
      // Update Signal directly
      await prisma.signal.update({
        where: { id },
        data: {
          metaTitle,
          metaDescription,
          keywords,
          // Signals don't have canonicalUrl, ogTitle etc in schema yet
          // We'll map what we can
          previewImage: ogImage
        }
      });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating SEO content:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
