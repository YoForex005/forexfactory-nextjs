import { PrismaClient } from "@prisma/client";
import {
  repairBlogFeaturedImageUrl,
  sanitizeBlogHtml,
} from "../src/lib/content-links";

const prisma = new PrismaClient();
const applyChanges = process.argv.includes("--apply");

async function main() {
  const blogs = await prisma.blog.findMany({
    select: {
      id: true,
      seoSlug: true,
      title: true,
      content: true,
      featuredImage: true,
      seoMeta: { select: { id: true, ogImage: true } },
    },
  });

  const repairs = blogs
    .map((blog) => ({
      ...blog,
      repairedContent: sanitizeBlogHtml(blog.content),
      repairedImage: repairBlogFeaturedImageUrl(blog.featuredImage),
      repairedOgImages: blog.seoMeta
        .map((meta) => ({ id: meta.id, value: repairBlogFeaturedImageUrl(meta.ogImage) }))
        .filter((meta) => meta.value !== blog.seoMeta.find((item) => item.id === meta.id)?.ogImage),
    }))
    .filter((blog) => blog.repairedContent !== blog.content
      || blog.repairedImage !== blog.featuredImage
      || blog.repairedOgImages.length > 0);

  console.log(`${repairs.length} of ${blogs.length} blog posts need link repairs.`);
  for (const blog of repairs) {
    console.log(`${blog.id}: ${blog.seoSlug} — ${blog.title}`);
  }

  if (!applyChanges) {
    console.log("Dry run only. Re-run with --apply to update the database.");
    return;
  }

  await prisma.$transaction(
    repairs.map((blog) => prisma.blog.update({
      where: { id: blog.id },
      data: {
        content: blog.repairedContent,
        featuredImage: blog.repairedImage,
      },
    })).concat(
      repairs.flatMap((blog) => blog.repairedOgImages.map((meta) =>
        prisma.seoMeta.update({ where: { id: meta.id }, data: { ogImage: meta.value } }),
      )),
    ),
  );
  console.log(`Repaired ${repairs.length} blog posts.`);
}

main()
  .catch((error) => {
    console.error("Link repair failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
