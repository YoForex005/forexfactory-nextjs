import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";

// The GET handler is polled by an open article and must always read PostgreSQL.
export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid blog id" }, { status: 400 });
  }

  try {
    const blog = await prisma.blog.findUnique({
      where: { id: BigInt(id) },
      select: { views: true },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(
      { views: (blog.views ?? BigInt(0)).toString() },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("Blog view count could not be read:", error);
    return NextResponse.json({ error: "View count unavailable" }, { status: 503 });
  }
}

/**
 * Count one read per browser, per article, per 24 hours. Keeping the marker in
 * an HTTP-only cookie prevents refreshes and client-side navigation from
 * inflating the public view total.
 */
export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid blog id" }, { status: 400 });
  }

  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const viewCookieName = `blog-view-${id}`;
  if (request.headers.get("cookie")?.includes(`${viewCookieName}=1`)) {
    return NextResponse.json({ counted: false });
  }

  try {
    const blogId = BigInt(id);
    const updatedBlogs = await prisma.$queryRaw<{ views: bigint | null }[]>`
      UPDATE "blogs"
      SET "views" = COALESCE("views", 0) + 1
      WHERE "id" = ${blogId}
      RETURNING "views"
    `;

    const updatedBlog = updatedBlogs[0];
    if (!updatedBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Refresh card caches so the updated count is visible on the next visit.
    revalidateTag("blog-card-data", "max");

    const response = NextResponse.json({
      counted: true,
      // JSON cannot serialize BigInt. A string retains the exact database value.
      views: (updatedBlog.views ?? BigInt(0)).toString(),
    });
    response.cookies.set(viewCookieName, "1", {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return response;
  } catch (error) {
    // Keep the reader-facing response generic, but retain the actual failure in
    // server logs. Previously this failure was completely silent, making a
    // broken database connection look like a working view counter.
    console.error("Blog view could not be recorded:", error);

    // The public article remains usable if the database is temporarily down.
    return NextResponse.json({ counted: false }, { status: 503 });
  }
}
