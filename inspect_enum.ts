import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectEnum() {
    try {
        console.log('Inspecting blogs_status enum...');

        // Get enum definition
        const enumDef = await prisma.$queryRaw`
      SELECT 
        t.typname,
        e.enumlabel,
        e.enumsortorder,
        e.oid
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = 'blogs_status'
      ORDER BY e.enumsortorder;
    `;

        console.log('Enum definition:', JSON.stringify(enumDef, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value, 2
        ));

        // Check table column type
        const columnType = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        udt_name,
        column_default
      FROM information_schema.columns
     WHERE table_name = 'blogs' AND column_name = 'status';
    `;

        console.log('\nColumn type:', columnType);

        // Try direct enum comparison
        console.log('\nTesting direct enum value query...');
        const directQuery = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM blogs
      WHERE status::text = 'published';
    `;

        console.log('Count with text cast:', directQuery);

    } catch (error: any) {
        console.error('Error:', error.message);
        console.error('Full:', error);
    } finally {
        await prisma.$disconnect();
    }
}

inspectEnum();
