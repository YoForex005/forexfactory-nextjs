import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function applyIndexes() {
    console.log('🚀 Starting database index creation...\n');

    try {
        // Read the SQL file
        const sqlPath = join(process.cwd(), 'prisma', 'migrations', 'add_performance_indexes.sql');
        const sqlContent = readFileSync(sqlPath, 'utf-8');

        // Split into individual SQL statements
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`📋 Found ${statements.length} index creation statements\n`);

        // Execute each statement
        let successCount = 0;
        let skipCount = 0;

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            const indexName = statement.match(/idx_[\w_]+/)?.[0] || `index_${i + 1}`;

            try {
                console.log(`Creating: ${indexName}...`);
                await prisma.$executeRawUnsafe(statement);
                successCount++;
                console.log(`✅ ${indexName} created successfully\n`);
            } catch (error: any) {
                if (error.message.includes('already exists')) {
                    console.log(`⏭️  ${indexName} already exists, skipping\n`);
                    skipCount++;
                } else {
                    console.error(`❌ Error creating ${indexName}:`, error.message, '\n');
                }
            }
        }

        console.log('\n📊 Summary:');
        console.log(`✅ Successfully created: ${successCount} indexes`);
        console.log(`⏭️  Skipped (already exist): ${skipCount} indexes`);
        console.log(`❌ Failed: ${statements.length - successCount - skipCount} indexes`);

        // Verify indexes on blogs table
        console.log('\n🔍 Verifying indexes on blogs table...');
        const indexes = await prisma.$queryRaw<Array<{ indexname: string; indexdef: string }>>`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'blogs'
      ORDER BY indexname;
    `;

        console.log(`\nFound ${indexes.length} indexes on blogs table:`);
        indexes.forEach(idx => {
            console.log(`  - ${idx.indexname}`);
        });

        console.log('\n✅ Database optimization complete!');
        console.log('\n📝 Next steps:');
        console.log('   1. Rebuild your application: npm run build');
        console.log('   2. Test performance improvements');
        console.log('   3. Monitor query performance in production\n');

    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

applyIndexes();
