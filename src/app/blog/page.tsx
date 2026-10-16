import { prisma } from "@/lib/prisma";
import { BlogCard } from "@/components/blog/BlogCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  generateBlogSchema,
  sanitizeText,
} from "@/lib/seo";
import { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Link from "next/link";

const BLOG_TITLE = `Trading Blog & Insights | ${SITE_NAME}`;
const BLOG_DESCRIPTION =
  "Expert guides, trading strategies, and market analysis for Forex traders. Master algorithmic trading with our in-depth tutorials.";

// Cache the public listing response and regenerate it in the background. The
// article data itself is independently cached below, so forced SSR only adds
// document latency for visitors.
export const revalidate = 300;

const BLOGS_PER_PAGE = 12; // Show 12 blogs per page
const VIEWED_PUBLISHED_BLOGS = {
  status: "published" as const,
  views: { gt: BigInt(0) },
};

type BlogListItem = {
  id: string;
  title: string;
  seoSlug: string;
  featuredImage: string;
  createdAt: string;
  views: number | null;
  author: string;
  content: string;
  seoMeta: Array<{
    seoDescription: string | null;
  }>;
  href?: string;
};

type PublicBlogFallback = {
  id: string;
  title: string;
  seoSlug: string;
  featuredImage: string;
  createdAt: string;
  views: number | null;
  author: string;
  content: string;
};

const PUBLIC_SITE_ORIGIN = "https://forexfactory.cc";

function serializeBlogListItem(blog: {
  id: bigint;
  title: string;
  seoSlug: string;
  featuredImage: string;
  createdAt: Date;
  views: bigint | null;
  author: string;
  seoMeta: Array<{
    seoDescription: string | null;
  }>;
}): BlogListItem {
  return {
    title: blog.title,
    seoSlug: blog.seoSlug,
    featuredImage: blog.featuredImage,
    author: blog.author,
    seoMeta: blog.seoMeta.map((meta) => ({
      seoDescription: meta.seoDescription,
    })),
    // Listing schema needs a summary, not the full article body. Fetching full
    // HTML for every card increases database work and response latency.
    content: blog.seoMeta[0]?.seoDescription ?? "",
    id: blog.id.toString(),
    createdAt: blog.createdAt.toISOString(),
    views: blog.views === null ? null : Number(blog.views),
  };
}

function isPublicBlogFallback(value: unknown): value is PublicBlogFallback {
  if (typeof value !== "object" || value === null) return false;

  const blog = value as Record<string, unknown>;
  return ["id", "title", "seoSlug", "featuredImage", "createdAt", "author", "content"].every(
    (key) => typeof blog[key] === "string"
  ) && (typeof blog.views === "number" || blog.views === null);
}

async function getPublicBlogFallback(currentPage: number): Promise<BlogListItem[]> {
  if (currentPage > 1) return [];

  try {
    const response = await fetch(
      `${PUBLIC_SITE_ORIGIN}/api/search?q=EA&type=blog&limit=${BLOGS_PER_PAGE}`,
      { next: { revalidate: 300 } }
    );
    if (!response.ok) return [];

    const payload: unknown = await response.json();
    const blogs = typeof payload === "object" && payload !== null
      ? (payload as { blogs?: unknown }).blogs
      : undefined;

    return Array.isArray(blogs)
      ? blogs.filter(isPublicBlogFallback).map((blog) => ({
        ...blog,
        seoMeta: [],
        href: `${PUBLIC_SITE_ORIGIN}/blog/${blog.seoSlug}`,
      }))
      : [];
  } catch {
    return [];
  }
}

const getBlogListingData = unstable_cache(
  async (currentPage: number) => {
  const skip = (currentPage - 1) * BLOGS_PER_PAGE;
  try {
    const [blogsRaw, count] = await Promise.all([
      prisma.blog.findMany({
        where: VIEWED_PUBLISHED_BLOGS,
        orderBy: { createdAt: "desc" },
        skip,
        take: BLOGS_PER_PAGE,
        select: {
          id: true,
          title: true,
          seoSlug: true,
          featuredImage: true,
          createdAt: true,
          views: true,
          author: true,
          seoMeta: {
            select: {
              seoDescription: true,
            },
          },
        },
      }),
      prisma.blog.count({
        where: VIEWED_PUBLISHED_BLOGS,
      }),
    ]);

    const blogs = blogsRaw.map(serializeBlogListItem);
    return { blogs, count };
  } catch {
    const blogs = await getPublicBlogFallback(currentPage);
    return { blogs, count: blogs.length };
  }
  },
  ["blog-listing-data-v2"],
  { revalidate: 300, tags: ["blog-card-data"] }
);

export const metadata: Metadata = {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    alternates: {
      canonical: `${SITE_URL}/blog`,
    },
    openGraph: {
      title: BLOG_TITLE,
      description: BLOG_DESCRIPTION,
      type: "website",
      url: `${SITE_URL}/blog`,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: BLOG_TITLE,
      description: BLOG_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };

export default function BlogPage() {
  return <BlogListingPage currentPage={1} />;
}

export async function BlogListingPage({ currentPage }: { currentPage: number }) {
  const skip = (currentPage - 1) * BLOGS_PER_PAGE;

  const { blogs: allContent, count: totalBlogs } = await getBlogListingData(currentPage);

  const totalPages = Math.ceil(totalBlogs / BLOGS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const jsonLd = generateBlogSchema({
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: currentPage > 1 ? `${SITE_URL}/blog/page/${currentPage}` : `${SITE_URL}/blog`,
    blogs: allContent.map((blog) => ({
      ...blog,
      content: sanitizeText(blog.content, 160),
      createdAt: blog.createdAt,
    })),
  });
  const pageHref = (page: number) => page === 1 ? "/blog" : `/blog/page/${page}`;

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-1 bg-surface-100">
        {/* Header */}
        <div className="relative border-b border-white/10 bg-surface-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Trading <span className="gradient-text">Insights</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-zinc-400">
              Discover the latest strategies, expert advisor reviews, and technical analysis guides to elevate your trading.
            </p>
            <p className="mt-4 text-sm text-zinc-500">
              Showing {skip + 1}-{Math.min(skip + BLOGS_PER_PAGE, totalBlogs)} of {totalBlogs} articles
            </p>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="container mx-auto px-4 py-16">
          {allContent.length > 0 ? (
            <>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {allContent.map((item, index) => (
                  <BlogCard key={item.id} blog={item} priority={index === 0} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-2">
                  {/* Previous Button */}
                  {hasPrevPage ? (
                    <Link
                      href={pageHref(currentPage - 1)}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
                    >
                      ← Previous
                    </Link>
                  ) : (
                    <span className="rounded-lg border border-white/5 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-600 cursor-not-allowed">
                      ← Previous
                    </span>
                  )}

                  {/* Page Numbers */}
                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      const isActive = pageNum === currentPage;
                      return (
                        <Link
                          key={pageNum}
                          href={pageHref(pageNum)}
                          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${isActive
                            ? "bg-brand text-white"
                            : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                            }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  {hasNextPage ? (
                    <Link
                      href={pageHref(currentPage + 1)}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
                    >
                      Next →
                    </Link>
                  ) : (
                    <span className="rounded-lg border border-white/5 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-600 cursor-not-allowed">
                      Next →
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-white/5 p-4 mb-4">
                <svg className="h-8 w-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white">No articles yet</h3>
              <p className="mt-2 text-zinc-400">Check back soon for new content.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
