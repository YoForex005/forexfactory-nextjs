import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get single signal by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const signal = await prisma.signal.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    // Parse JSON fields if they exist
    const formattedSignal = {
      ...signal,
      features: signal.features ? JSON.parse(signal.features as string) : [],
      requirements: signal.requirements ? JSON.parse(signal.requirements as string) : []
    };

    return NextResponse.json(formattedSignal, { status: 200 });
  } catch (error) {
    console.error("Error fetching signal:", error);
    return NextResponse.json(
      { error: "Failed to fetch signal" },
      { status: 500 }
    );
  }
}

// Update signal
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      version,
      platform,
      strategyType,
      status,
      fileUrl,
      previewImage,
      features,
      requirements,
      installInstructions,
      isPaid,
      price,
      minBalance,
      recommendedBalance,
      supportedPairs,
      timeframe,
      slug,
      metaTitle,
      metaDescription,
      keywords
    } = body;

    // Check if signal exists
    const existingSignal = await prisma.signal.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!existingSignal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    // Update signal
    const updatedSignal = await prisma.signal.update({
      where: { id: parseInt(params.id) },
      data: {
        name,
        description,
        version,
        platform,
        strategyType,
        status,
        fileUrl,
        previewImage,
        features: features ? JSON.stringify(features) : null,
        requirements: requirements ? JSON.stringify(requirements) : null,
        installInstructions,
        isPaid: isPaid || false,
        price: isPaid ? price : 0,
        minBalance,
        recommendedBalance,
        supportedPairs,
        timeframe,
        slug,
        metaTitle,
        metaDescription,
        keywords,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(
      { success: true, signal: updatedSignal },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating signal:", error);
    return NextResponse.json(
      { error: "Failed to update signal" },
      { status: 500 }
    );
  }
}

// Delete signal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if signal exists
    const existingSignal = await prisma.signal.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!existingSignal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    // Delete signal
    await prisma.signal.delete({
      where: { id: parseInt(params.id) }
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
