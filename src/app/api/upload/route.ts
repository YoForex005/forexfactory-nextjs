import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToR2, generateFileKey } from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user?.role !== "admin" && session.user?.role !== "editor")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique key
    const key = generateFileKey(file.name, folder);

    // Upload to R2
    const url = await uploadToR2(key, buffer, file.type);

    return NextResponse.json({
      url,
      key,
      message: "File uploaded successfully to R2"
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload file",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
