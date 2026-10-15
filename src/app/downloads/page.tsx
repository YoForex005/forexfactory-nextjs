import { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Script from "next/script";
import { ArrowDown, BadgeCheck, BookOpenCheck, Bot, ChartCandlestick, Download, Settings2, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CatalogSignal, DownloadCatalog } from "@/components/downloads/DownloadCatalog";
import { BrowseCatalogueButton } from "@/components/downloads/BrowseCatalogueButton";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  generateCanonicalUrl,
  sanitizeText,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Forex Expert Advisors & Indicators | ${SITE_NAME}`,
  description: "Browse Forex Expert Advisors and MT4/MT5 indicators. Compare platform support, strategies, file details, and download options in one place.",
  alternates: { canonical: generateCanonicalUrl("/downloads") },
  robots: { index: true, follow: true },
  openGraph: {
    title: `Forex Expert Advisors & Indicators | ${SITE_NAME}`,
    description: "Browse and download MT4/MT5 trading tools with clear compatibility and file details.",
    type: "website",
    url: generateCanonicalUrl("/downloads"),
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `Forex Expert Advisors & Indicators | ${SITE_NAME}`,
    description: "Browse and download MT4/MT5 trading tools with clear compatibility and file details.",
    images: [DEFAULT_OG_IMAGE],
  },
};

type DownloadsData = {
  signals: CatalogSignal[];
  stats: {
    totalSignals: number;
    totalDownloads: number;
    averageRating: number | null;
  };
};

const getDownloadsData = unstable_cache(
  async (): Promise<DownloadsData> => {
    const [signals, totalSignals, downloadStats] = await Promise.all([
      prisma.signal.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true, uuid: true, title: true, description: true, mime: true, sizeBytes: true,
          createdAt: true, platform: true, strategy: true, version: true, winRate: true,
          rating: true, downloadCount: true, isPremium: true,
        },
      }),
      prisma.signal.count(),
      prisma.signal.aggregate({
        _sum: { downloadCount: true },
        _avg: { rating: true },
      }),
    ]);

    return {
      signals: signals.map((signal): CatalogSignal => ({ ...signal, createdAt: signal.createdAt.toISOString() })),
      stats: {
        totalSignals,
        totalDownloads: downloadStats._sum.downloadCount ?? 0,
        averageRating: downloadStats._avg.rating,
      },
    };
  },
  ["downloads-page-data-v5"],
  { revalidate: 60 },
);

async function loadDownloadsData(): Promise<DownloadsData & { catalogueUnavailable?: boolean }> {
  try {
    return await getDownloadsData();
  } catch {
    // Keep failed reads outside unstable_cache. A transient database outage must
    // not be served as an empty catalogue for the next five minutes.
    return {
      signals: [],
      stats: { totalSignals: 0, totalDownloads: 0, averageRating: null },
      catalogueUnavailable: true,
    };
  }
}

export default async function DownloadsPage() {
  const data = await loadDownloadsData();
  const { signals, stats, catalogueUnavailable = false } = data;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Forex Expert Advisors & Indicators | ${SITE_NAME}`,
    description: "A catalogue of Forex Expert Advisors and MT4/MT5 indicators with file and compatibility details.",
    url: `${SITE_URL}/downloads`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: signals.map((signal, index) => ({
        "@type": "ListItem", position: index + 1, url: `${SITE_URL}/downloads/${signal.uuid}`,
        name: signal.title, description: sanitizeText(signal.description, 160),
      })),
    },
  };
  const statsItems = catalogueUnavailable
    ? [
      { label: "Catalogue status", value: "Temporarily offline", icon: Download },
      { label: "Recorded downloads", value: "Unavailable", icon: ArrowDown },
      { label: "Average rating", value: "Unavailable", icon: BadgeCheck },
    ]
    : [
      { label: "Tools in library", value: stats.totalSignals.toLocaleString(), icon: Download },
      { label: "Recorded downloads", value: stats.totalDownloads.toLocaleString(), icon: ArrowDown },
      { label: "Average rating", value: stats.averageRating ? `${stats.averageRating.toFixed(1)} / 5` : "New library", icon: BadgeCheck },
    ];

  return (
    <div className="flex min-h-screen flex-col bg-surface-100">
      <Script id="download-catalogue-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden border-b border-white/10 bg-surface-50 py-16 sm:py-20 lg:py-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(10,132,255,0.22),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(99,102,241,0.16),transparent_30%)]" />
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-light">
                <ShieldCheck className="h-4 w-4" /> MT4 &amp; MT5 downloads
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">Trading tools, <span className="gradient-text">clearly organised</span></h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">Explore Expert Advisors and indicators with the practical details that matter: platform support, strategy information, file size, and a straightforward download path.</p>
              <BrowseCatalogueButton />
            </div>
            <div className="mx-auto mt-12 grid max-w-4xl divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {statsItems.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3 px-5 py-5 sm:block sm:px-7 sm:py-6">
                  <Icon className="h-5 w-5 shrink-0 text-brand sm:mb-4" />
                  <div><p className="text-xl font-bold text-white sm:text-2xl">{value}</p><p className="mt-0.5 text-xs text-zinc-500 sm:mt-1 sm:text-sm">{label}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <DownloadCatalog signals={signals} catalogueUnavailable={catalogueUnavailable} />
        <section className="border-t border-white/10 bg-surface-50/30">
          <div className="container mx-auto px-4 py-14 sm:py-16">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">Build a considered setup</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Know what each download is for</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">The library is designed around practical MetaTrader tools. Use the product page to understand a tool&apos;s role before adding it to your trading workspace.</p>
            </div>
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-6"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand"><Bot className="h-5 w-5" /></div><h3 className="mt-5 text-lg font-semibold text-white">Expert Advisors</h3><p className="mt-2 text-sm leading-6 text-zinc-400">Automate a defined trading workflow in MetaTrader. Review its entry logic, risk controls, and compatibility before attaching it to a chart.</p></article>
              <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-6"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand"><ChartCandlestick className="h-5 w-5" /></div><h3 className="mt-5 text-lg font-semibold text-white">Indicators</h3><p className="mt-2 text-sm leading-6 text-zinc-400">Visualise price behaviour and trading conditions. Indicators support analysis; they should be used with your own rules and risk management.</p></article>
              <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-6"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand"><Settings2 className="h-5 w-5" /></div><h3 className="mt-5 text-lg font-semibold text-white">Setup resources</h3><p className="mt-2 text-sm leading-6 text-zinc-400">Check platform, version, file size, and requirements on every detail page so installation is predictable and your terminal stays organised.</p></article>
            </div>
          </div>
        </section>
        <section className="border-t border-white/10 bg-surface-100">
          <div className="container mx-auto grid gap-8 px-4 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand"><BookOpenCheck className="h-5 w-5" /></div><h2 className="mt-5 text-2xl font-bold text-white">A safer way to get started</h2><p className="mt-3 text-sm leading-6 text-zinc-400">Start with a demo account, one strategy at a time, and settings you understand. Downloading a tool is the beginning of your evaluation—not a trading recommendation.</p></div>
            <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.025] px-5">
              <details className="group py-5" open><summary className="cursor-pointer list-none pr-8 text-sm font-semibold text-white">Which platform should I choose?<span className="float-right text-brand transition group-open:rotate-45">+</span></summary><p className="mt-3 text-sm leading-6 text-zinc-400">Choose the version that matches your installed MetaTrader terminal: MT4 tools are for MetaTrader 4 and MT5 tools are for MetaTrader 5. Check each product page before downloading.</p></details>
              <details className="group py-5"><summary className="cursor-pointer list-none pr-8 text-sm font-semibold text-white">Where do I install a downloaded tool?<span className="float-right text-brand transition group-open:rotate-45">+</span></summary><p className="mt-3 text-sm leading-6 text-zinc-400">Open your terminal&apos;s data folder, then place the file in the matching MQL4 or MQL5 Experts or Indicators directory. Restart or refresh the terminal after installation.</p></details>
              <details className="group py-5"><summary className="cursor-pointer list-none pr-8 text-sm font-semibold text-white">Why test on a demo account?<span className="float-right text-brand transition group-open:rotate-45">+</span></summary><p className="mt-3 text-sm leading-6 text-zinc-400">Spreads, broker execution, settings, and market conditions can change outcomes. A demo test helps you verify installation and understand behaviour before risking capital.</p></details>
            </div>
          </div>
        </section>
        <section className="border-t border-white/10 bg-surface-50/40">
          <div className="container mx-auto grid gap-6 px-4 py-10 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5"><p className="text-sm font-semibold text-white">1. Review the details</p><p className="mt-2 text-sm leading-6 text-zinc-400">Open a tool page to check its platform, version, requirements, and strategy notes.</p></div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5"><p className="text-sm font-semibold text-white">2. Download securely</p><p className="mt-2 text-sm leading-6 text-zinc-400">Use the download button to retrieve the published file and keep your download history up to date when signed in.</p></div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5"><p className="text-sm font-semibold text-white">3. Test before live use</p><p className="mt-2 text-sm leading-6 text-zinc-400">Use a demo environment and your own risk controls before applying any automated strategy to a live account.</p></div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
