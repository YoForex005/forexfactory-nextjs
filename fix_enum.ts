import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixEnum() {
    try {
        console.log('Fixing blogs_status enum by recreating it...\n');

        // Step 1: Convert the column to text
        console.log('Step 1: Converting status column to text...');
        await prisma.$executeRaw`
      ALTER TABLE blogs ALTER COLUMN status TYPE text;
    `;
        console.log('✅ Column converted to text');

        // Step 2: Drop the old enum type
        console.log('\nStep 2: Dropping old enum type...');
        await prisma.$executeRaw`
      DROP TYPE IF EXISTS blogs_status CASCADE;
    `;
        console.log('✅ Old enum type dropped');

        // Step 3: Create the new enum type
        console.log('\nStep 3: Creating new enum type...');
        await prisma.$executeRaw`
      CREATE TYPE blogs_status AS ENUM ('published', 'draft', 'scheduled');
    `;
        console.log('✅ New enum type created');

        // Step 4: Convert the column back to the enum type
        console.log('\nStep 4: Converting status column back to enum...');
        await prisma.$executeRaw`
      ALTER TABLE blogs ALTER COLUMN status TYPE blogs_status USING status::blogs_status;
    `;
        console.log('✅ Column converted back to enum');

        console.log('\n✅✅✅ Enum fixed successfully!');

        // Verify it works
        console.log('\nVerifying...');
        const count = await prisma.blog.count({
            where: { status: 'published' },
        });
        console.log(`Found ${count} published blogs`);

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

fixEnum();
