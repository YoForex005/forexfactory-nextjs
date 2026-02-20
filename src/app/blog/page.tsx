import { prisma } from "@/lib/prisma";
import { BlogCard } from "@/components/blog/BlogCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SITE_NAME, DEFAULT_OG_IMAGE, SITE_URL, generateBlogSchema } from "@/lib/seo";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Trading Blog & Insights | ${SITE_NAME}`,
  description: "Expert guides, trading strategies, and market analysis for Forex traders. Master algorithmic trading with our in-depth tutorials.",
  openGraph: {
    title: `Trading Blog & Insights | ${SITE_NAME}`,
    description: "Expert guides, trading strategies, and market analysis for Forex traders.",
    type: 'website',
  },
  twitter: {
    card: "summary_large_image",
    title: `Trading Blog & Insights | ${SITE_NAME}`,
    description: "Expert guides, trading strategies, and market analysis for Forex traders.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Enable dynamic rendering to avoid build-time DB connection
export const dynamic = 'force-dynamic';
// export const revalidate = 60; // Revalidate every 60 seconds

const BLOGS_PER_PAGE = 12; // Show 12 blogs per page

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const skip = (currentPage - 1) * BLOGS_PER_PAGE;

  let allContent: any[] = [];
  let totalBlogs = 0;

  try {
    // Fetch blogs with pagination
    const [blogs, count] = await Promise.all([
      prisma.blog.findMany({
        where: { status: "published" },
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
          content: true, // Need content for schema description
          seoMeta: true, // Need metadescription for schema
        },
      }),
      prisma.blog.count({
        where: { status: "published" },
      }),
    ]);

    allContent = blogs;
    totalBlogs = count;
  } catch (error) {
    console.error("Failed to fetch content:", error);
  }

  const totalPages = Math.ceil(totalBlogs / BLOGS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const jsonLd = generateBlogSchema({
    title: `Trading Blog & Insights | ${SITE_NAME}`,
    description: "Expert guides, trading strategies, and market analysis for Forex traders.",
    url: `${SITE_URL}/blog`,
    blogs: allContent
  });

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
                {allContent.map((item) => (
                  <BlogCard key={item.id} blog={item} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-2">
                  {/* Previous Button */}
                  {hasPrevPage ? (
                    <Link
                      href={`/blog?page=${currentPage - 1}`}
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
                          href={`/blog?page=${pageNum}`}
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
                      href={`/blog?page=${currentPage + 1}`}
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
