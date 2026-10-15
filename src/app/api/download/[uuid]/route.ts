import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ uuid: string }> };

function isSafeDownloadUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return value.startsWith("/") && !value.startsWith("//");
  }
}

export async function GET(_: Request, { params }: RouteContext) {
  const { uuid } = await params;
  const signal = await prisma.signal.findFirst({
    where: { uuid },
    select: { id: true, filePath: true },
  });

  if (!signal) {
    return NextResponse.json({ error: "Download not found" }, { status: 404 });
  }

  if (!isSafeDownloadUrl(signal.filePath)) {
    console.error(`Rejected unsafe download URL for signal ${signal.id}`);
    return NextResponse.json({ error: "This download is unavailable" }, { status: 422 });
  }

  try {
    await prisma.signal.update({
      where: { id: signal.id },
      data: { downloadCount: { increment: 1 } },
    });
    revalidatePath("/downloads");
    revalidatePath(`/downloads/${uuid}`);
    revalidatePath(`/signals/${uuid}`);
  } catch (error) {
    // A temporary metrics failure should never stop delivery of a valid file.
    console.error("Could not record signal download", error);
  }

  return NextResponse.redirect(new URL(signal.filePath, _.url));
}
