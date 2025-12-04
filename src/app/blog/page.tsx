import { prisma } from "@/lib/prisma";
import { BlogCard } from "@/components/blog/BlogCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SITE_NAME } from "@/lib/seo";
import { Metadata } from "next";
import { Blog } from "@prisma/client";

export const metadata: Metadata = {
  title: `Trading Blog & Insights | ${SITE_NAME}`,
  description: "Expert guides, trading strategies, and market analysis for Forex traders. Master algorithmic trading with our in-depth tutorials.",
  openGraph: {
    title: `Trading Blog & Insights | ${SITE_NAME}`,
    description: "Expert guides, trading strategies, and market analysis for Forex traders.",
    type: 'website',
  }
};

// Enable static generation with revalidation
export const revalidate = 60; // Revalidate every 60 seconds

export default async function BlogPage() {
  let blogs: any[] = [];
  
  try {
    blogs = await prisma.blog.findMany({
      where: { status: "published" },
      orderBy: { createdAt: "desc" },
      take: 20, // Reduce to 20 for better performance
      select: {
        id: true,
        title: true,
        seoSlug: true,
        content: true,
        featuredImage: true,
        createdAt: true,
        views: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
  }

  return (
    <div className="flex min-h-screen flex-col">
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
           </div>
        </div>

        {/* Blog Grid */}
        <div className="container mx-auto px-4 py-16">
          {blogs.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
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
