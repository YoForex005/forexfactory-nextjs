import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasAdminAccess } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

// Get all media files
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!hasAdminAccess(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // all, image, file
    const limit = parseInt(searchParams.get("limit") || "50");

    const media = await prisma.media.findMany({
      take: limit,
      orderBy: { uploadedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ media }, { status: 200 });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// Create media record (called after upload)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!hasAdminAccess(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fileName, filePath, uploadedBy } = body;

    if (!fileName || !filePath || !uploadedBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const media = await prisma.media.create({
      data: {
        fileName,
        filePath,
        uploadedBy: parseInt(uploadedBy),
      },
    });

    return NextResponse.json({ success: true, media }, { status: 201 });
  } catch (error) {
    console.error("Error creating media record:", error);
    return NextResponse.json(
      { error: "Failed to create media record" },
      { status: 500 }
    );
  }
}

// Delete media
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!hasAdminAccess(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
    }

    await prisma.media.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
