import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const blogs = await prisma.blog.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: { id: true, title: true, seoSlug: true, views: true },
  });

  console.table(blogs.map((blog) => ({
    id: blog.id.toString(),
    title: blog.title,
    slug: blog.seoSlug,
    views: (blog.views ?? BigInt(0)).toString(),
  })));

  const [publishedCount, viewStats, viewedCount] = await Promise.all([
    prisma.blog.count({ where: { status: "published" } }),
    prisma.blog.aggregate({ where: { status: "published" }, _sum: { views: true } }),
    prisma.blog.count({ where: { status: "published", views: { gt: BigInt(0) } } }),
  ]);
  console.log(
    `Published-blog totals: ${publishedCount} articles, ${(viewStats._sum.views ?? BigInt(0)).toString()} views, ${viewedCount} articles with at least one view.`
  );

  try {
    const [staging] = await prisma.$queryRaw`
      SELECT
        COUNT(*)::text AS "rowCount",
        COALESCE(SUM(COALESCE(views, 0)), 0)::text AS "totalViews",
        COUNT(*) FILTER (WHERE COALESCE(views, 0) > 0)::text AS "rowsWithViews"
      FROM blogs_mysql_staging
    `;
    console.log("Staging view totals:", staging);
  } catch {
    console.log("Staging view totals: staging table is unavailable.");
  }
} finally {
  await prisma.$disconnect();
}
