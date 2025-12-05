import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasAdminAccess } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

// Get all signals (for admin)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!hasAdminAccess(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const signals = await prisma.signal.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        uuid: true,
        title: true,
        description: true,
        filePath: true,
        mime: true,
        sizeBytes: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ signals }, { status: 200 });
  } catch (error) {
    console.error("Error fetching signals:", error);
    return NextResponse.json(
      { error: "Failed to fetch signals" },
      { status: 500 }
    );
  }
}

// Create new signal
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!hasAdminAccess(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, filePath, mime, sizeBytes } = body;

    if (!title || !description || !filePath) {
      return NextResponse.json(
        { error: "Title, description, and file are required" },
        { status: 400 }
      );
    }

    // Create signal
    const signal = await prisma.signal.create({
      data: {
        uuid: randomUUID(),
        title,
        description,
        filePath,
        mime: mime || "application/octet-stream",
        sizeBytes: sizeBytes || 0,
      },
    });

    return NextResponse.json({ success: true, signal }, { status: 201 });
  } catch (error) {
    console.error("Error creating signal:", error);
    return NextResponse.json(
      { error: "Failed to create signal" },
      { status: 500 }
    );
  }
}

// Update signal
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!hasAdminAccess(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, filePath, mime } = body;

    if (!id) {
      return NextResponse.json({ error: "Signal ID is required" }, { status: 400 });
    }

    const signal = await prisma.signal.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        filePath,
        mime,
      },
    });

    return NextResponse.json({ success: true, signal }, { status: 200 });
  } catch (error) {
    console.error("Error updating signal:", error);
    return NextResponse.json(
      { error: "Failed to update signal" },
      { status: 500 }
    );
  }
}

// Delete signal
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!hasAdminAccess(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Signal ID is required" }, { status: 400 });
    }

    await prisma.signal.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting signal:", error);
    return NextResponse.json(
      { error: "Failed to delete signal" },
      { status: 500 }
    );
  }
}
