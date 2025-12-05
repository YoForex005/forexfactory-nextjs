import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

// Initialize R2 client
const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "forexfactory";

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    try {
        const path = params.path.join("/");

        // Fetch the file from R2
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: path,
        });

        const response = await r2Client.send(command);

        if (!response.Body) {
            return new NextResponse("File not found", { status: 404 });
        }

        // Convert stream to buffer
        const chunks: Uint8Array[] = [];
        for await (const chunk of response.Body as any) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // Return the image with proper content type
        return new NextResponse(buffer, {
            headers: {
                "Content-Type": response.ContentType || "application/octet-stream",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Error fetching image from R2:", error);
        return new NextResponse("Error fetching image", { status: 500 });
    }
}
