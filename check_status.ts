import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStatusValues() {
    try {
        console.log('Checking status values in the database...');

        const statusCounts = await prisma.$queryRaw`
      SELECT status, COUNT(*) as count
      FROM blogs
      GROUP BY status
      ORDER BY count DESC;
    `;

        console.log('Status distribution:', statusCounts);

        // Check for any NULL or empty status values
        const nullStatus = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM blogs
      WHERE status IS NULL;
    `;

        console.log('Blogs with NULL status:', nullStatus);

        // Get some examples of each status
        const examples = await prisma.$queryRaw`
      SELECT id, title, status
      FROM blogs
      LIMIT 10;
    `;

        console.log('\nSample blogs:', examples);

    } catch (error: any) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkStatusValues();
