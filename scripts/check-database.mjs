import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  await prisma.$queryRaw`SELECT 1`;
  console.log("Database connection succeeded.");
} catch (error) {
  // Avoid printing DATABASE_URL or any credential. Prisma's message names the
  // actionable connection error without exposing the connection string.
  console.error("Database connection failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
