import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['error'],
});

async function checkSchema() {
    try {
        console.log('Checking database schema...');

        // Check if the enum exists
        const enumCheck = await prisma.$queryRaw`
      SELECT t.typname, e.enumlabel
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = 'blogs_status'
      ORDER BY e.enumsortorder;
    `;

        console.log('BlogStatus enum values:', enumCheck);

        // Check table structure
        const tableCheck = await prisma.$queryRaw`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'blogs'
      ORDER BY ordinal_position;
    `;

        console.log('Blogs table structure:', tableCheck);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSchema();
