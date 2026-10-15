import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ??
  new PrismaClient({
    // Query failures are handled at their call sites. Prisma's error logger is
    // opt-in so transient connection failures do not get forwarded to the
    // browser console during development.
    log: process.env.PRISMA_LOG_ERRORS === 'true' ? ['error'] : [],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export const db = prisma;
