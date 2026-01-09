import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'error'],
});

async function testRawQuery() {
    try {
        console.log('Test 1: Raw SQL query...');
        const rawBlogs = await prisma.$queryRaw`
      SELECT id, title, seo_slug, status, views, created_at, author, featured_image, tags, category_id, download_link, content
      FROM blogs
      WHERE status = 'published'::blogs_status
      ORDER BY created_at DESC
      LIMIT 5;
    `;
        console.log(`✅ Raw query successful! Found ${(rawBlogs as any[]).length} blogs`);
        console.log('First blog:', (rawBlogs as any[])[0]);

        console.log('\n\nTest 2: Prisma query WITHOUT type safety...');
        const untypedBlogs = await (prisma.blog as any).findMany({
            orderBy: { createdAt: 'desc' },
            where: { status: 'published' },
            take: 5,
        });
        console.log(`✅ Untyped query successful! Found ${untypedBlogs.length} blogs`);

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        console.error('Code:', error.code);
        if (error.meta) {
            console.error('Meta:', JSON.stringify(error.meta, null, 2));
        }
    } finally {
        await prisma.$disconnect();
    }
}

testRawQuery();
