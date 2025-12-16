# How to Restore Real Data

Once your database connection is fixed and you have successfully ran `npx prisma db push`, follow these steps to switch your dashboard from **Mock Data** back to **Real Data**.

You only need to update the 3 API files in `src/app/api/user/`.

## Step 1: Update Profile API
**File:** `src/app/api/user/profile/route.ts`

Replace the entire file content with:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

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
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, phone, country } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, phone, country },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
```

## Step 2: Update Downloads API
**File:** `src/app/api/user/downloads/route.ts`

Replace the entire file content with:

```typescript
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
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const downloads = await prisma.userDownload.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ downloads });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromToken(req.headers.get("authorization"));
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    return NextResponse.json({ error: "Failed to log download" }, { status: 500 });
  }
}
```

## Step 3: Update Saved Articles API
**File:** `src/app/api/user/saved/route.ts`

Replace the entire file content with:

```typescript
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
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromToken(req.headers.get("authorization"));
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { blogId } = await req.json();

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
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = getUserIdFromToken(req.headers.get("authorization"));
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const blogId = searchParams.get("blogId");

    if (!blogId) return NextResponse.json({ error: "Missing blogId" }, { status: 400 });

    await prisma.savedArticle.deleteMany({
      where: { 
        userId, 
        blogId: parseInt(blogId) 
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove" }, { status: 500 });
  }
}
```
