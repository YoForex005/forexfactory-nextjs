import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getUserIdFromToken(authHeader: string | null): number | null {
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    try {
        const token = authHeader.replace("Bearer ", "");
        const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
        if (decoded.exp < Date.now()) return null;
        return decoded.userId;
    } catch {
        return null;
    }
}

// GET - Fetch user's recent blogs
export async function GET(req: Request) {
    try {
        const userId = getUserIdFromToken(req.headers.get("authorization"));
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "10");

        const recentBlogs = await prisma.recentBlog.findMany({
            where: { userId },
            include: {
                blog: {
                    select: {
                        id: true,
                        title: true,
                        seoSlug: true,
                        featuredImage: true,
                        createdAt: true,
                        author: true,
                    }
                }
            },
            orderBy: { visitedAt: 'desc' },
            take: limit,
        });

        return NextResponse.json({ recentBlogs });
    } catch (error) {
        console.error("Recent blogs fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch recent blogs" }, { status: 500 });
    }
}

// POST - Log a blog visit
export async function POST(req: Request) {
    try {
        const userId = getUserIdFromToken(req.headers.get("authorization"));
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { blogId } = await req.json();

        if (!blogId) {
            return NextResponse.json({ error: "Blog ID required" }, { status: 400 });
        }

        // Upsert - update visitedAt if exists, create if not
        const recentBlog = await prisma.recentBlog.upsert({
            where: {
                userId_blogId: { userId, blogId }
            },
            update: {
                visitedAt: new Date()
            },
            create: {
                userId,
                blogId,
            }
        });

        // Keep only the last 50 recent blogs per user
        const allRecent = await prisma.recentBlog.findMany({
            where: { userId },
            orderBy: { visitedAt: 'desc' },
            skip: 50,
        });

        if (allRecent.length > 0) {
            await prisma.recentBlog.deleteMany({
                where: {
                    id: { in: allRecent.map(r => r.id) }
                }
            });
        }

        return NextResponse.json({ success: true, recentBlog });
    } catch (error) {
        console.error("Log blog visit error:", error);
        return NextResponse.json({ error: "Failed to log blog visit" }, { status: 500 });
    }
}

// DELETE - Clear recent blogs history
export async function DELETE(req: Request) {
    try {
        const userId = getUserIdFromToken(req.headers.get("authorization"));
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.recentBlog.deleteMany({
            where: { userId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Clear recent blogs error:", error);
        return NextResponse.json({ error: "Failed to clear recent blogs" }, { status: 500 });
    }
}
