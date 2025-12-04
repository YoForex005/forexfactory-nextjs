import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { BlogCard } from "@/components/blog/BlogCard";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/seo";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Find category by name (slug)
  const category = await prisma.category.findFirst({
    where: { 
      name: {
        equals: decodeURIComponent(slug).replace(/-/g, " "),
      },
    },
  });

  if (!category) {
    return {
      title: `Category Not Found | ${SITE_NAME}`,
    };
  }

  return {
    title: `${category.name} | ${SITE_NAME}`,
    description: category.description || `Browse ${category.name} articles and tutorials on Forex Factory`,
    openGraph: {
      title: `${category.name} | ${SITE_NAME}`,
      description: category.description || `Browse ${category.name} articles`,
      type: 'website',
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  
  // Find category by name
  const category = await prisma.category.findFirst({
    where: { 
      name: {
        equals: decodeURIComponent(slug).replace(/-/g, " "),
      },
    },
  });

  if (!category) {
    notFound();
  }

  // Fetch blogs in this category
  const blogCategories = await prisma.blogCategory.findMany({
    where: { categoryId: category.categoryId },
    include: {
      blog: true,
    },
    take: 20,
  });

  // Filter published blogs
  const blogs = blogCategories
    .map(bc => bc.blog)
    .filter(blog => blog.status === "published");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 bg-surface-100">
        {/* Header */}
        <section className="border-b border-white/10 bg-gradient-to-br from-brand/20 via-purple-500/20 to-surface-100 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="mb-4 text-5xl font-bold leading-tight text-white">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-xl text-zinc-300">{category.description}</p>
              )}
              <p className="mt-4 text-zinc-400">{blogs.length} articles</p>
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            {blogs.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog: any) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-zinc-400">No articles in this category yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
