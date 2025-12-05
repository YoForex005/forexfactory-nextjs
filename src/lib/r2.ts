import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize R2 client using Cloudflare R2
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "forexfactory";
// Public URL base - automatically uses localhost in dev, production URL when deployed
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Generate a presigned URL for uploading a file
 */
export async function getPresignedUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  return url;
}

/**
 * Upload a file directly to R2
 */
export async function uploadToR2(key: string, file: Buffer, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await r2Client.send(command);
  return `${PUBLIC_URL}/${key}`;
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * Generate a unique file key matching the expected format
 * Example output: uploads/img_690db8c71f9fb1.87759979.png
 */
export function generateFileKey(originalName: string, folder: string = "uploads"): string {
  const timestamp = Date.now().toString(16);
  const randomPart = Math.random().toString().substring(2, 10);
  const extension = originalName.split(".").pop();
  return `${folder}/img_${timestamp}.${randomPart}.${extension}`;
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}

