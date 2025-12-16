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

export async function GET(req: Request) {
    try {
        const userId = getUserIdFromToken(req.headers.get("authorization"));
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const downloads = await prisma.userDownload.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ downloads });
    } catch (error) {
        console.error("Downloads fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch downloads" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const userId = getUserIdFromToken(req.headers.get("authorization"));
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, type, fileSize, blogId, signalId } = await req.json();

        const newDownload = await prisma.userDownload.create({
            data: {
                userId,
                title,
                type,
                fileSize,
                blogId,
                signalId,
            }
        });

        return NextResponse.json({ success: true, download: newDownload });
    } catch (error) {
        console.error("Download log error:", error);
        return NextResponse.json({ error: "Failed to log download" }, { status: 500 });
    }
}
