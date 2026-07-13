import { Metadata } from "next";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { Navbar } from "@/components/layout/Navbar";
import { prisma } from "@/lib/prisma";
import { BlogCard } from "@/components/blog/BlogCard";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  sanitizeText,
  slugifySegment,
} from "@/lib/seo";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

type CategoryBlog = {
  id: string;
  title: string;
  seoSlug: string;
  content: string;
  featuredImage: string;
  createdAt: string;
  views: number | null;
  author: string;
  status: "published" | "draft" | "scheduled";
};

function serializeCategoryBlog(blog: {
  id: bigint;
  title: string;
  seoSlug: string;
  content: string;
  featuredImage: string;
  createdAt: Date;
  views: bigint | null;
  author: string;
  status: "published" | "draft" | "scheduled";
}): CategoryBlog {
  return {
    title: blog.title,
    seoSlug: blog.seoSlug,
    content: blog.content,
    featuredImage: blog.featuredImage,
    author: blog.author,
    status: blog.status,
    id: blog.id.toString(),
    createdAt: blog.createdAt.toISOString(),
    views: blog.views === null ? null : Number(blog.views),
  };
}

const getCategoryPageData = unstable_cache(
  async (slug: string) => {
    const requestedSlug = decodeURIComponent(slug).toLowerCase();
    const categories = await prisma.category.findMany({
      where: {
        status: "active",
      },
      orderBy: { categoryId: "asc" },
    });
    const matchingCategories = categories.filter(
      (category) => slugifySegment(category.name) === requestedSlug
    );
    const category = matchingCategories[0] ?? null;

    if (!category) {
      return {
        category: null,
        blogs: [],
      };
    }

    const categoryIds = matchingCategories.map((item) => item.categoryId);
    const blogsRaw = await prisma.blog.findMany({
      where: {
        status: "published",
        categories: {
          some: {
            categoryId: { in: categoryIds },
          },
        },
      },
      select: {
        id: true,
        title: true,
        seoSlug: true,
        content: true,
        featuredImage: true,
        createdAt: true,
        views: true,
        author: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const blogs: CategoryBlog[] = blogsRaw.map((blog) =>
      serializeCategoryBlog(blog as {
        id: bigint;
        title: string;
        seoSlug: string;
        content: string;
        featuredImage: string;
        createdAt: Date;
        views: bigint | null;
        author: string;
        status: "published" | "draft" | "scheduled";
      })
    );

    return {
      category,
      blogs,
    };
  },
  ["category-page-data"],
  { revalidate: 300 }
);

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await getCategoryPageData(slug);

  if (!category) {
    return {
      title: `Category Not Found | ${SITE_NAME}`,
    };
  }

  const canonicalSlug = slugifySegment(category.name);
  const canonical = `${SITE_URL}/category/${canonicalSlug}`;
  const description =
    category.description || `Browse ${category.name} articles and tutorials on Forex Factory`;

  return {
    title: `${category.name} | ${SITE_NAME}`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${category.name} | ${SITE_NAME}`,
      description,
      type: "website",
      url: canonical,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} | ${SITE_NAME}`,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const { category, blogs } = await getCategoryPageData(slug);

  if (!category) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.name,
    "description": category.description || `Browse ${category.name} articles and tutorials on Forex Factory`,
    "url": `${SITE_URL}/category/${slugifySegment(category.name)}`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": blogs.map((blog, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${SITE_URL}/blog/${blog.seoSlug || blog.id.toString()}`,
        "name": blog.title,
        "description": sanitizeText(blog.content, 160),
      })),
    },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-surface-100">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
                {blogs.map((blog) => (
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
