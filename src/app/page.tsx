import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight, Download, BarChart2, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BlogSection } from "@/components/blog/BlogSection";

// Cache this page for 5 minutes (300 seconds)
export const revalidate = 300;

export default async function Home() {
  // OPTIMIZATION: Run all queries in parallel using Promise.all
  const [
    popularBlogs,
    latestBlogs,
    mt4Blogs,
    mt5Blogs,
    indicatorMT4Blogs,
    indicatorMT5Blogs,
    beginnerGuideBlogs,
    indicatorMT4OnlyBlogs,
    sourceCodeMQ4Blogs,
    sourceCodeMQ5Blogs,
    flexyMarketsBlogs,
    eaMT4MT5Blogs,
    courseBlogs,
    indicatorMT4MT5Blogs,
    copyTradingBlogs,
    indicatorMQ4Blogs,
    propFirmPassingBlogs,
  ] = await Promise.all([
    // Popular blogs
    prisma.blog.findMany({
      take: 3,
      orderBy: { views: "desc" },
      where: { status: "published" },
    }),
    // Latest blogs
    prisma.blog.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      where: { status: "published" },
    }),
    // MT4 blogs
    prisma.blog.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      where: {
        status: "published",
        OR: [
          { title: { contains: "MT4" } },
          { tags: { contains: "MT4" } }
        ]
      },
    }),
    // MT5 blogs
    prisma.blog.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      where: {
        status: "published",
        OR: [
          { title: { contains: "MT5" } },
          { tags: { contains: "MT5" } }
        ]
      },
    }),
    // Indicator MT4 Articles
    prisma.blog.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      where: {
        status: "published",
        AND: [
          {
            OR: [
              { title: { contains: "Indicator" } },
              { tags: { contains: "Indicator" } }
            ]
          },
          {
            OR: [
              { title: { contains: "MT4" } },
              { tags: { contains: "MT4" } }
            ]
          }
        ]
      },
    }),
    // Indicator MT5 Articles
    prisma.blog.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      where: {
        status: "published",
        AND: [
          {
            OR: [
              { title: { contains: "Indicator" } },
              { tags: { contains: "Indicator" } }
            ]
          },
          {
            OR: [
              { title: { contains: "MT5" } },
              { tags: { contains: "MT5" } }
            ]
          }
        ]
      },
    }),
    // Beginner Guides Articles
    prisma.blog.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      where: {
        status: "published",
        OR: [
          { title: { contains: "Beginner" } },
          { title: { contains: "Guide" } },
          { tags: { contains: "Beginner" } },
          { tags: { contains: "Guide" } }
        ]
      },
    }),
    // Indicator MT4 Articles (without MT5)
    prisma.blog.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      where: {
        status: "published",
        AND: [
          {
            OR: [
              { title: { contains: "Indicator" } },
              { tags: { contains: "Indicator" } }
            ]
          },
          {
            OR: [
              { title: { contains: "MT4" } },
              { tags: { contains: "MT4" } }
            ]
          }
        ]
      },
    }),
    // Source Code MQ4 Articles
    prisma.blog.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      where: {
        status: "published",
        AND: [
          {
            OR: [
              { title: { contains: "Source Code" } },
              { title: { contains: "Source" } },
              { tags: { contains: "Source Code" } },
              { tags: { contains: "Source" } }
            ]
          },
          {
            OR: [
              { title: { contains: "MQ4" } },
              { tags: { contains: "MQ4" } }
            ]
          }
        ]
      },
    }),
    // Source Code MQ5 Articles
    prisma.blog.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      where: {
        status: "published",
        AND: [
          {
            OR: [
              { title: { contains: "Source Code" } },
              { title: { contains: "Source" } },
              { tags: { contains: "Source Code" } },
              { tags: { contains: "Source" } }
            ]
          },
          {
            OR: [
              { title: { contains: "MQ5" } },
              { tags: { contains: "MQ5" } }
            ]
          }
        ]
      },
    }),
    // Flexy Markets Articles
    prisma.blog.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      where: {
        status: "published",
        OR: [
          { title: { contains: "Flexy" } },
          { title: { contains: "Flexy Markets" } },
          { tags: { contains: "Flexy" } },
          { tags: { contains: "Flexy Markets" } }
        ]
      },
    }),
    // EA - MT4/MT5 Articles
    prisma.blog.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      where: {
        status: "published",
        OR: [
          { title: { contains: "EA" } },
          { title: { contains: "Expert Advisor" } },
          { tags: { contains: "EA" } },
          { tags: { contains: "Expert Advisor" } }
        ]
      },
    }),
    // Course Articles
    prisma.blog.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      where: {
        status: "published",
        OR: [
          { title: { contains: "Course" } },
          { title: { contains: "Training" } },
          { tags: { contains: "Course" } },
          { tags: { contains: "Training" } }
        ]
      },
    }),
    // Indicator - MT4/MT5 Articles
    prisma.blog.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      where: {
        status: "published",
        OR: [
          { title: { contains: "Indicator" } },
          { tags: { contains: "Indicator" } }
        ]
      },
    }),
    // Copy Trading Articles
    prisma.blog.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      where: {
        status: "published",
        OR: [
          { title: { contains: "Copy Trading" } },
          { title: { contains: "Copy" } },
          { tags: { contains: "Copy Trading" } },
          { tags: { contains: "Copy" } }
        ]
      },
    }),
    // Indicator - MQ4 Articles
    prisma.blog.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      where: {
        status: "published",
        AND: [
          {
            OR: [
              { title: { contains: "Indicator" } },
              { tags: { contains: "Indicator" } }
            ]
          },
          {
            OR: [
              { title: { contains: "MQ4" } },
              { tags: { contains: "MQ4" } }
            ]
          }
        ]
      },
    }),
    // PropFirm Passing Articles
    prisma.blog.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      where: {
        status: "published",
        OR: [
          { title: { contains: "PropFirm" } },
          { title: { contains: "Prop Firm" } },
          { title: { contains: "Passing" } },
          { tags: { contains: "PropFirm" } },
          { tags: { contains: "Prop Firm" } },
          { tags: { contains: "Passing" } }
        ]
      },
    }),
  ]);

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
