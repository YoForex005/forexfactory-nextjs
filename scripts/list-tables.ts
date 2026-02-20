import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Fetching tables...');
        const tables: any[] = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
        console.log('Existing tables:', tables.map(t => t.table_name));
    } catch (err) {
        console.error('Error fetching tables:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
