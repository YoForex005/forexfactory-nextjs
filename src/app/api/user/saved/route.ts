import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

export async function GET(req: Request) {
    try {
        const userId = getUserIdFromToken(req.headers.get("authorization"));
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const savedArticles = await prisma.savedArticle.findMany({
            where: { userId },
            include: {
                blog: {
                    select: {
                        id: true,
                        title: true,
                        seoSlug: true,
                        content: true,
                        tags: true,
                        createdAt: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ savedArticles });
    } catch (error) {
        console.error("Saved articles fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch saved articles" }, { status: 500 });
    }
}

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

        // Check if already saved
        const existing = await prisma.savedArticle.findFirst({
            where: { userId, blogId }
        });

        if (existing) {
            return NextResponse.json({ success: true, saved: existing });
        }

        const saved = await prisma.savedArticle.create({
            data: { userId, blogId }
        });

        return NextResponse.json({ success: true, saved });
    } catch (error) {
        console.error("Save article error:", error);
        return NextResponse.json({ error: "Failed to save article" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const userId = getUserIdFromToken(req.headers.get("authorization"));
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const blogId = searchParams.get("blogId");

        if (!blogId) {
            return NextResponse.json({ error: "Missing blogId" }, { status: 400 });
        }

        await prisma.savedArticle.deleteMany({
            where: {
                userId,
                blogId: parseInt(blogId)
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Remove saved article error:", error);
        return NextResponse.json({ error: "Failed to remove saved article" }, { status: 500 });
    }
}
