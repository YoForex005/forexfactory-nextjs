import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight, Download, BarChart2, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BlogSection } from "@/components/blog/BlogSection";

// Cache this page for 5 minutes (300 seconds)
export const revalidate = 300;

export default async function Home() {
  // Fetch blogs from the Blog table
  const allBlogs = await prisma.blog.findMany({
    orderBy: { createdAt: "desc" },
    where: { status: "published" },
  });

  // Helper function to filter blogs by keywords
  function filterByKeywords(blogs: any[], keywords: string[]) {
    return blogs.filter(blog => {
      const title = (blog.title || '').toLowerCase();
      const tags = (blog.tags || '').toLowerCase();
      return keywords.some(keyword =>
        title.includes(keyword.toLowerCase()) || tags.includes(keyword.toLowerCase())
      );
    }).slice(0, 3);
  }

  // Create filtered lists
  const popularBlogs = [...allBlogs].sort((a, b) => Number(b.views || 0) - Number(a.views || 0)).slice(0, 3);
  const latestBlogs = allBlogs.slice(0, 3);
  const mt4Blogs = filterByKeywords(allBlogs, ['MT4']);
  const mt5Blogs = filterByKeywords(allBlogs, ['MT5']);
  const indicatorMT4Blogs = filterByKeywords(allBlogs, ['Indicator']).filter(b =>
    (b.title?.toLowerCase().includes('mt4') || b.tags?.toLowerCase().includes('mt4'))
  ).slice(0, 3);
  const indicatorMT5Blogs = filterByKeywords(allBlogs, ['Indicator']).filter(b =>
    (b.title?.toLowerCase().includes('mt5') || b.tags?.toLowerCase().includes('mt5'))
  ).slice(0, 3);
  const beginnerGuideBlogs = filterByKeywords(allBlogs, ['Beginner', 'Guide']);
  const indicatorMT4OnlyBlogs = indicatorMT4Blogs;
  const sourceCodeMQ4Blogs = filterByKeywords(allBlogs, ['Source Code', 'Source', 'MQ4']);
  const sourceCodeMQ5Blogs = filterByKeywords(allBlogs, ['Source Code', 'Source', 'MQ5']);
  const flexyMarketsBlogs = filterByKeywords(allBlogs, ['Flexy', 'Flexy Markets']);
  const eaMT4MT5Blogs = filterByKeywords(allBlogs, ['EA', 'Expert Advisor']);
  const courseBlogs = filterByKeywords(allBlogs, ['Course', 'Training']);
  const indicatorMT4MT5Blogs = filterByKeywords(allBlogs, ['Indicator']);
  const copyTradingBlogs = filterByKeywords(allBlogs, ['Copy Trading', 'Copy']);
  const indicatorMQ4Blogs = filterByKeywords(allBlogs, ['Indicator', 'MQ4']);
  const propFirmPassingBlogs = filterByKeywords(allBlogs, ['PropFirm', 'Prop Firm', 'Passing']);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-sm font-medium text-brand mb-8">
              <span className="flex h-2 w-2 rounded-full bg-brand mr-2 animate-pulse"></span>
              New EAs Added Daily
            </div>

            <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-7xl mb-6">
              Master the Markets with <span className="gradient-text">Algorithmic Precision</span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-zinc-400 mb-10">
              Download 500+ professional Expert Advisors, indicators, and trading systems.
              Backtested, verified, and ready for MT4 &amp; MT5.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/downloads" className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-brand px-8 py-4 text-base font-semibold text-white hover:bg-brand-dark transition-all">
                Browse Robots <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/blog" className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-all">
                Read Guides
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-surface-50">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="glass-panel p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Download className="h-10 w-10 text-brand mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">Free Downloads</h3>
                <p className="text-zinc-400">Access a massive library of EAs and indicators for MetaTrader 4 and 5 platforms.</p>
              </div>

              <div className="glass-panel p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <BarChart2 className="h-10 w-10 text-purple-400 mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">Live Signals</h3>
                <p className="text-zinc-400">Follow high-performance trading signals with verified Myfxbook track records.</p>
              </div>

              <div className="glass-panel p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <BookOpen className="h-10 w-10 text-emerald-400 mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">Education</h3>
                <p className="text-zinc-400">Deep dive into algorithmic trading strategies, backtesting, and optimization.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Sections */}
        <div className="space-y-0 divide-y divide-white/5 bg-surface-50/50">
          <BlogSection
            title="Popular Forex Articles"
            subtitle="Most read insights and strategies"
            blogs={popularBlogs}
          />

          <BlogSection
            title="Latest Market Updates"
            subtitle="Stay ahead with fresh market news"
            blogs={latestBlogs}
          />

          <BlogSection
            title="EA-MT4 Articles"
            subtitle="Expert Advisors for MetaTrader 4"
            blogs={mt4Blogs}
          />

          <BlogSection
            title="EA-MT5 Articles"
            subtitle="Expert Advisors for MetaTrader 5"
            blogs={mt5Blogs}
          />

          <BlogSection
            title="Indicator - MT4 Articles"
            subtitle="Technical indicators for MetaTrader 4"
            blogs={indicatorMT4Blogs}
          />

          <BlogSection
            title="Indicator - MT5 Articles"
            subtitle="Technical indicators for MetaTrader 5"
            blogs={indicatorMT5Blogs}
          />

          <BlogSection
            title="Beginner Guides Articles"
            subtitle="Start your trading journey with step-by-step guides"
            blogs={beginnerGuideBlogs}
          />

          <BlogSection
            title="Indicator MT4 Articles"
            subtitle="MT4 technical indicators and analysis tools"
            blogs={indicatorMT4OnlyBlogs}
          />

          <BlogSection
            title="Source Code MQ4 Articles"
            subtitle="MQ4 source code and programming guides"
            blogs={sourceCodeMQ4Blogs}
          />

          <BlogSection
            title="Source Code MQ5 Articles"
            subtitle="MQ5 source code and programming guides"
            blogs={sourceCodeMQ5Blogs}
          />

          <BlogSection
            title="Flexy Markets Articles"
            subtitle="Market analysis and Flexy trading strategies"
            blogs={flexyMarketsBlogs}
          />

          <BlogSection
            title="EA - MT4/MT5 Articles"
            subtitle="Expert Advisors for both MetaTrader platforms"
            blogs={eaMT4MT5Blogs}
          />

          <BlogSection
            title="Course Articles"
            subtitle="Educational courses and training materials"
            blogs={courseBlogs}
          />

          <BlogSection
            title="Indicator - MT4/MT5 Articles"
            subtitle="Indicators compatible with both platforms"
            blogs={indicatorMT4MT5Blogs}
          />

          <BlogSection
            title="Copy Trading Articles"
            subtitle="Social and copy trading strategies"
            blogs={copyTradingBlogs}
          />

          <BlogSection
            title="Indicator - MQ4 Articles"
            subtitle="MQ4 indicator development and customization"
            blogs={indicatorMQ4Blogs}
          />

          <BlogSection
            title="PropFirm Passing Articles"
            subtitle="Tips and strategies for passing prop firm challenges"
            blogs={propFirmPassingBlogs}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
