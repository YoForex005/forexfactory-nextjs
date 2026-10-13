import { PrismaClient } from "@prisma/client";
import { repairBlogImageUrl, sanitizeBlogHtml } from "../src/lib/content-links";

const prisma = new PrismaClient();
const applyChanges = process.argv.includes("--apply");

async function main() {
  const blogs = await prisma.blog.findMany({
    select: { id: true, seoSlug: true, title: true, content: true, featuredImage: true },
  });

  const repairs = blogs
    .map((blog) => ({
      ...blog,
      repairedContent: sanitizeBlogHtml(blog.content),
      repairedImage: repairBlogImageUrl(blog.featuredImage),
    }))
    .filter((blog) => blog.repairedContent !== blog.content
      || (blog.repairedImage !== null && blog.repairedImage !== blog.featuredImage));

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
        ...(blog.repairedImage ? { featuredImage: blog.repairedImage } : {}),
      },
    })),
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
