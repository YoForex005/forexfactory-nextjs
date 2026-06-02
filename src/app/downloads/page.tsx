import { Metadata } from "next";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import Script from "next/script";
import type { Signal } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DownloadCard } from "@/components/downloads/DownloadCard";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  generateCanonicalUrl,
  sanitizeText,
} from "@/lib/seo";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Forex Robots & Expert Advisors Marketplace",
  description:
    "Download 500+ free Forex Expert Advisors, MT4/MT5 indicators, and trading robots. Verified backtests, real performance data, and daily updates.",
  alternates: {
    canonical: generateCanonicalUrl("/downloads"),
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: `Forex Robots & Expert Advisors Marketplace | ${SITE_NAME}`,
    description:
      "Browse premium and free MT4/MT5 robots with backtested performance, download stats, and trader reviews.",
    type: "website",
    url: generateCanonicalUrl("/downloads"),
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `Forex Robots & Expert Advisors Marketplace | ${SITE_NAME}`,
    description: "Browse premium and free MT4/MT5 robots with backtested performance, download stats, and trader reviews.",
    images: [DEFAULT_OG_IMAGE],
  },
};

const getDownloadsData = unstable_cache(
  async () => {
    const latestSignals = await prisma.signal.findMany({
      orderBy: { createdAt: "desc" },
      take: 9,
    });

    const totalSignals = await prisma.signal.count();

    return {
      latestSignals,
      topRatedSignals: [],
      premiumSignals: [],
      stats: {
        totalSignals,
        avgWinRate: 0,
        totalDownloads: 0,
      },
    };
  },
  ["downloads-page-data"],
  { revalidate: 300 }
);

export default async function DownloadsPage() {
  let latestSignals: Signal[] = [];
  let stats = {
    totalSignals: 0,
    avgWinRate: 0,
    totalDownloads: 0,
  };

  try {
    ({ latestSignals, stats } = await getDownloadsData());
  } catch (error) {
    console.error("Failed to fetch downloads data:", error);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Forex Robots & Expert Advisors Marketplace | ${SITE_NAME}`,
    description:
      "Download 500+ free Forex Expert Advisors, MT4/MT5 indicators, and trading robots.",
    url: `${SITE_URL}/downloads`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: latestSignals.map((signal, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/downloads/${signal.uuid}`,
        name: signal.title,
        description: sanitizeText(signal.description, 160),
      })),
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-100">
      <Script
        id="json-ld-software-application"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-white/10 bg-gradient-to-b from-surface-50 to-surface-100 py-20">
          <div className="container mx-auto px-4 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
              MT4 • MT5 • Prop-Firm Ready
            </p>
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Download <span className="gradient-text">{SITE_TAGLINE}</span>
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-zinc-400">
              Access the world&apos;s largest library of <strong>free Expert Advisors</strong> and indicators. Every tool is rigorously backtested and verified for performance, giving you the data you need to automate your trading with confidence.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <div className="glass-panel rounded-2xl border border-white/5 p-6 text-center sm:text-left">
                <p className="text-sm text-zinc-400">Robots & Indicators</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {stats.totalSignals}
                </p>
              </div>
              <div className="glass-panel rounded-2xl border border-white/5 p-6 text-center sm:text-left">
                <p className="text-sm text-zinc-400">Average Win Rate</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {stats.avgWinRate?.toFixed(1)}%
                </p>
              </div>
              <div className="glass-panel rounded-2xl border border-white/5 p-6 text-center sm:text-left">
                <p className="text-sm text-zinc-400">Total Downloads</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {stats.totalDownloads.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-zinc-400">
              <span className="rounded-full border border-white/10 px-4 py-1">Scalping</span>
              <span className="rounded-full border border-white/10 px-4 py-1">Trend Following</span>
              <span className="rounded-full border border-white/10 px-4 py-1">News Trading</span>
              <span className="rounded-full border border-white/10 px-4 py-1">Grid / Martingale</span>
              <span className="rounded-full border border-white/10 px-4 py-1">Prop Firm Ready</span>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="mb-10 flex flex-col items-center gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand/70">Featured</p>
              <h2 className="text-3xl font-bold text-white">Trending Downloads</h2>
              <p className="text-sm text-zinc-500">Handpicked systems with the strongest performance metrics.</p>
            </div>
            <Link
              href="/downloads?filter=premium"
              className="inline-flex items-center rounded-full border border-brand/30 bg-brand/5 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-brand hover:text-white hover:shadow-lg hover:shadow-brand/20 w-fit"
            >
              View Premium Library →
            </Link>
          </div>
          {latestSignals.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {latestSignals.map((signal) => (
                <DownloadCard key={signal.id} signal={signal} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-white/5 p-10 text-center text-zinc-400">
              No signals published yet.
            </div>
          )}
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="rounded-2xl border border-brand/20 bg-brand/5 p-8 text-center">
            <h3 className="text-2xl font-bold text-white">Advanced Features Coming Soon</h3>
            <p className="mt-3 text-zinc-400">
              Top-rated robots, premium signals, and performance metrics will be available once the database migration is complete.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
