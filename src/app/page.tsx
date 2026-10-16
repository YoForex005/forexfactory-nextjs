import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import Script from "next/script";
import { ArrowRight, Download, BarChart2, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BlogSection } from "@/components/blog/BlogSection";
import { AdBanner } from "@/components/layout/AdBanner";

// Serve a cached, static homepage and refresh it in the background every five
// minutes. The homepage already uses cached database queries, so forcing a new
// server render for every visitor only adds avoidable TTFB.
export const revalidate = 300;


import { Metadata } from 'next';
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  generateOrganizationSchema,
  generateWebPageSchema,
  generateWebsiteSchema,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: `${SITE_NAME} | ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  verification: {
    google: "zaVCeEONH2MBblcEN1wrlJhwNvknYX-5JcCcpvJWChk",
  },
  openGraph: {
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
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

const jsonLdOrganization = generateOrganizationSchema();
const jsonLdWebsite = generateWebsiteSchema();
const jsonLdWebPage = generateWebPageSchema({
  title: `${SITE_NAME} | ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  url: SITE_URL
});

// Blog selection type
type BlogPreview = {
  id: string;
  title: string;
  seoSlug: string;
  status: string;
  views: number | null;
  createdAt: string;
  featuredImage: string;
  tags: string;
  author: string;
  href?: string;
};

type PublicSearchBlog = {
  id: string;
  title: string;
  seoSlug: string;
  createdAt: string;
  featuredImage: string;
  views: number | null;
  tags: string;
  author: string;
};

const PUBLIC_SITE_ORIGIN = "https://forexfactory.cc";

const offlineBlogFallback: BlogPreview[] = [
  {
    id: "offline-articles",
    title: "Browse Forex Articles",
    seoSlug: "articles",
    status: "published",
    views: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    featuredImage: "",
    tags: "Forex, Expert Advisors",
    author: "ForexFactory",
    href: `${PUBLIC_SITE_ORIGIN}/blog`,
  },
];

function isPublicSearchBlog(value: unknown): value is PublicSearchBlog {
  if (typeof value !== "object" || value === null) return false;

  const blog = value as Record<string, unknown>;
  return ["id", "title", "seoSlug", "createdAt", "featuredImage", "tags", "author"].every(
    (key) => typeof blog[key] === "string"
  ) && (typeof blog.views === "number" || blog.views === null);
}

const getPublicFallbackBlogs = unstable_cache(
  async (query: string): Promise<BlogPreview[]> => {
    try {
      const response = await fetch(
        `${PUBLIC_SITE_ORIGIN}/api/search?q=${encodeURIComponent(query)}&type=blog&limit=3`,
        { next: { revalidate: 300 } }
      );

      if (!response.ok) return offlineBlogFallback;

      const payload: unknown = await response.json();
      if (typeof payload !== "object" || payload === null) return offlineBlogFallback;

      const blogs = (payload as { blogs?: unknown }).blogs;
      if (!Array.isArray(blogs)) return offlineBlogFallback;

      const fallbackBlogs = blogs
        .filter(isPublicSearchBlog)
        .slice(0, 3)
        .map((blog) => ({
          ...blog,
          status: "published",
          href: `${PUBLIC_SITE_ORIGIN}/blog/${blog.seoSlug}`,
        }));

      return fallbackBlogs.length > 0 ? fallbackBlogs : offlineBlogFallback;
    } catch {
      return offlineBlogFallback;
    }
  },
  ["public-home-page-fallback-v2"],
  { revalidate: 300 }
);

function serializeBlogPreview(blog: {
  id: bigint;
  title: string;
  seoSlug: string;
  status: string;
  views: bigint | null;
  createdAt: Date;
  featuredImage: string;
  tags: string;
  author: string;
}): BlogPreview {
  return {
    ...blog,
    id: blog.id.toString(),
    views: blog.views === null ? null : Number(blog.views),
    createdAt: blog.createdAt.toISOString(),
  };
}

const getCachedHomePageDatabaseData = unstable_cache(
  async () => {
      const [latestBlogsRaw, popularBlogsRaw, allCategoryBlogsRaw] = await Promise.all([
        prisma.blog.findMany({
          where: { status: "published", views: { gt: BigInt(0) } },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: {
            id: true,
            title: true,
            seoSlug: true,
            status: true,
            views: true,
            createdAt: true,
            featuredImage: true,
            tags: true,
            author: true,
          },
        }),
        prisma.blog.findMany({
          where: { status: "published", views: { gt: BigInt(0) } },
          orderBy: { views: "desc" },
          take: 3,
          select: {
            id: true,
            title: true,
            seoSlug: true,
            status: true,
            views: true,
            createdAt: true,
            featuredImage: true,
            tags: true,
            author: true,
          },
        }),
        prisma.blog.findMany({
          where: { status: "published", views: { gt: BigInt(0) } },
          orderBy: { views: "desc" },
          // The homepage needs a small, diverse candidate pool—not every
          // published record—to create its three-card topic sections.
          take: 150,
          select: {
            id: true,
            title: true,
            seoSlug: true,
            status: true,
            views: true,
            createdAt: true,
            featuredImage: true,
            tags: true,
            author: true,
          },
        }),
      ]);

      const latestBlogs = latestBlogsRaw.map(serializeBlogPreview);
      const popularBlogs = popularBlogsRaw.map(serializeBlogPreview);
      const allCategoryBlogs = allCategoryBlogsRaw.map(serializeBlogPreview);

      return { latestBlogs, popularBlogs, allCategoryBlogs, usingFallback: false };
  },
  ["home-page-database-data-v4"],
  { revalidate: 300, tags: ["blog-card-data"] }
);

async function getHomePageData() {
  try {
    return await getCachedHomePageDatabaseData();
  } catch {

      const [generalBlogs, mt4FallbackBlogs, mt5FallbackBlogs] = await Promise.all([
        getPublicFallbackBlogs("EA"),
        getPublicFallbackBlogs("MT4"),
        getPublicFallbackBlogs("MT5"),
      ]);

      const allCategoryBlogs = Array.from(
        new Map(
          [...mt4FallbackBlogs, ...mt5FallbackBlogs].map((blog) => [blog.id, blog])
        ).values()
      );

    return {
      latestBlogs: generalBlogs,
      popularBlogs: generalBlogs,
      allCategoryBlogs,
      usingFallback: true,
    };
  }
}

export default async function Home() {
  const { latestBlogs, popularBlogs, allCategoryBlogs, usingFallback } = await getHomePageData();

  // Optimized helper function with memoization
  function filterByKeywords(blogs: BlogPreview[], keywords: string[], limit = 3): BlogPreview[] {
    const results: BlogPreview[] = [];
    const keywordsLower = keywords.map(k => k.toLowerCase());

    for (const blog of blogs) {
      if (results.length >= limit) break;

      const title = blog.title.toLowerCase();
      const tags = blog.tags.toLowerCase();

      if (keywordsLower.some(keyword =>
        title.includes(keyword) || tags.includes(keyword)
      )) {
        results.push(blog);
      }
    }

    // The local fallback contains a compact MT4/MT5 article set. When the
    // private database is offline, fill any remaining slots from that set so
    // every homepage category keeps the same three-card layout.
    if (usingFallback && results.length < limit) {
      for (const fallbackBlog of allCategoryBlogs) {
        if (results.length >= limit) break;
        if (!results.some((blog) => blog.id === fallbackBlog.id)) {
          results.push(fallbackBlog);
        }
      }
    }

    return results;
  }

  // Keep the homepage focused on the most useful starting points. The full
  // catalogue is available from /blog, so it does not need to be parsed and
  // hydrated before the visitor can see the first screen.
  const platformBlogs = filterByKeywords(allCategoryBlogs, ['MT4', 'MT5']);
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
              <Link href="/downloads" className="w-56 sm:w-auto inline-flex items-center justify-center rounded-full bg-brand px-8 py-4 text-base font-semibold text-white hover:bg-brand-dark transition-all">
                Browse Robots <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/blog" className="w-56 sm:w-auto inline-flex items-center justify-center rounded-full border border-brand/30 bg-brand/5 px-8 py-4 text-base font-semibold text-white hover:bg-brand hover:text-white transition-all shadow-lg shadow-brand/10">
                Read Guides
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-surface-50">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="glass-panel p-8 relative overflow-hidden group flex flex-col items-center text-center md:items-start md:text-left">
                <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Download className="h-10 w-10 text-brand mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">Free Downloads</h3>
                <p className="text-zinc-400">Access a massive library of EAs and indicators for MetaTrader 4 and 5 platforms.</p>
              </div>

              <div className="glass-panel p-8 relative overflow-hidden group flex flex-col items-center text-center md:items-start md:text-left">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <BarChart2 className="h-10 w-10 text-purple-400 mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">Live Signals</h3>
                <p className="text-zinc-400">Follow high-performance trading signals with verified Myfxbook track records.</p>
              </div>

              <div className="glass-panel p-8 relative overflow-hidden group flex flex-col items-center text-center md:items-start md:text-left">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <BookOpen className="h-10 w-10 text-emerald-400 mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">Education</h3>
                <p className="text-zinc-400">Deep dive into algorithmic trading strategies, backtesting, and optimization.</p>
              </div>
            </div>
          </div>
        </section>

        <AdBanner />

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
            title="MetaTrader Tools & Guides"
            subtitle="MT4 and MT5 tools, indicators, and practical setup guides"
            blogs={platformBlogs}
          />
        </div>

        <section className="border-t border-white/5 bg-surface-50/50 py-16 sm:py-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-zinc-400">Looking for a specific platform, strategy, or trading topic?</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Explore the complete trading library</h2>
            <Link href="/blog" className="mt-7 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand">
              Browse all articles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />

      <Script
        id="json-ld-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLdOrganization, jsonLdWebsite, jsonLdWebPage]) }}
      />
    </div>
  );
}
