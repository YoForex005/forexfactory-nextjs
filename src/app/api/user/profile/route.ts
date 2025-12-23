import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Helper to get userId from token
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

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: {
                        downloads: true,
                        savedArticles: true,
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                country: user.country,
                createdAt: user.createdAt,
            },
            stats: {
                downloads: user._count.downloads,
                savedArticles: user._count.savedArticles,
            }
        });
    } catch (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const userId = getUserIdFromToken(req.headers.get("authorization"));
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, phone, country } = await req.json();

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name, phone, country },
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
