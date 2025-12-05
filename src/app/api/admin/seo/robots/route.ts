import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasAdminAccess } from "@/lib/auth-utils";
import fs from "fs/promises";
import path from "path";

const ROBOTS_PATH = path.join(process.cwd(), "public", "robots.txt");

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!hasAdminAccess(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const content = await fs.readFile(ROBOTS_PATH, "utf-8");
      return NextResponse.json({ content });
    } catch (error) {
      // Return default if file doesn't exist
      const defaultRobots = "User-agent: *\nAllow: /\n\nSitemap: https://forexfactory.cc/sitemap.xml";
      return NextResponse.json({ content: defaultRobots });
    }
  } catch (error) {
    console.error("Error reading robots.txt:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!hasAdminAccess(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();
    await fs.writeFile(ROBOTS_PATH, content);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving robots.txt:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
