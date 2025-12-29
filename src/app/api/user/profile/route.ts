
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as fs from 'fs';
import * as path from 'path';

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
    console.log("API: Profile GET request received");
    try {
        const userId = getUserIdFromToken(req.headers.get("authorization"));
        console.log("API: Extracted userId:", userId);

        if (!userId) {
            console.log("API: No userId, returning 401");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const debugPath = path.join(process.cwd(), 'debug_stats.txt');

        // Sequential queries for debugging
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                country: true,
                createdAt: true,
            }
        });
        console.log("API: User found:", user ? "yes" : "no");

        const downloadsCount = await prisma.userDownload.count({
            where: { userId }
        });
        console.log("API: Downloads count:", downloadsCount);

        const savedArticlesCount = await prisma.savedArticle.count({
            where: { userId }
        });
        console.log("API: SavedArticles count (via count()):", savedArticlesCount);

        // Verification query
        const savedArticlesList = await prisma.savedArticle.findMany({
            where: { userId },
            select: { id: true }
        });
        console.log("API: SavedArticles actual length:", savedArticlesList.length);

        const log = `
----------------------------------------
Time: ${new Date().toISOString()}
User ID: ${userId}
User Found: ${!!user}
Downloads Count: ${downloadsCount}
Saved Count (via count): ${savedArticlesCount}
Saved Count (via findMany): ${savedArticlesList.length}
----------------------------------------
`;
        try {
            fs.appendFileSync(debugPath, log);
        } catch (e) {
            console.error("Failed to write to debug file", e);
        }

        // If user not found, still return stats with fallback user data
        const responseData = {
            user: user ? {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                country: user.country,
                createdAt: user.createdAt,
            } : {
                id: userId,
                email: "unknown",
                name: "User",
                phone: null,
                country: null,
                createdAt: new Date(),
            },
            stats: {
                downloads: downloadsCount,
                savedArticles: savedArticlesCount,
            }
        };

        console.log("API: Sending response:", JSON.stringify(responseData));

        return NextResponse.json(responseData);
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
