import { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Script from "next/script";
import { Activity, ArrowDown, ChartNoAxesCombined, CircleCheckBig, ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CatalogSignal, DownloadCatalog } from "@/components/downloads/DownloadCatalog";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, generateCanonicalUrl, sanitizeText } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Forex Signals & Automated Strategies | ${SITE_NAME}`,
  description: "Explore Forex signal tools and automated strategies for MT4 and MT5, with transparent platform, file, strategy, and performance information.",
  alternates: { canonical: generateCanonicalUrl("/signals") },
  robots: { index: true, follow: true },
  openGraph: {
    title: `Forex Signals & Automated Strategies | ${SITE_NAME}`,
    description: "Explore Forex signal tools and automated strategies with clear platform and strategy information.",
    type: "website", url: generateCanonicalUrl("/signals"), images: [DEFAULT_OG_IMAGE],
  },
  twitter: { card: "summary_large_image", title: `Forex Signals & Automated Strategies | ${SITE_NAME}`, description: "Explore Forex signal tools and automated strategies with clear platform and strategy information.", images: [DEFAULT_OG_IMAGE] },
};

type SignalsData = {
  signals: CatalogSignal[];
  stats: {
    totalSignals: number;
    averageWinRate: number | null;
    platformCount: number;
  };
};

const getSignalsData = unstable_cache(
  async (): Promise<SignalsData> => {
    const [signals, totalSignals, signalStats, platforms] = await Promise.all([
      prisma.signal.findMany({
        orderBy: { createdAt: "desc" }, take: 100,
        select: {
          id: true, uuid: true, title: true, description: true, mime: true, sizeBytes: true,
          createdAt: true, platform: true, strategy: true, version: true, winRate: true,
          rating: true, downloadCount: true, isPremium: true,
        },
      }),
      prisma.signal.count(),
      prisma.signal.aggregate({ _avg: { winRate: true } }),
      prisma.signal.findMany({ distinct: ["platform"], select: { platform: true } }),
    ]);
    const platformCount = platforms.filter((signal) => signal.platform !== null).length;
    return {
      signals: signals.map((signal): CatalogSignal => ({ ...signal, createdAt: signal.createdAt.toISOString() })),
      stats: { totalSignals, averageWinRate: signalStats._avg.winRate, platformCount },
    };
  },
  ["signals-page-data-v5"],
  { revalidate: 60 },
);

async function loadSignalsData(): Promise<SignalsData & { catalogueUnavailable?: boolean }> {
  try {
    return await getSignalsData();
  } catch {
    // Do not cache an outage as an empty strategy directory.
    return {
      signals: [],
      stats: { totalSignals: 0, averageWinRate: null, platformCount: 0 },
      catalogueUnavailable: true,
    };
  }
}

export default async function SignalsPage() {
  const data = await loadSignalsData();
  const { signals, stats, catalogueUnavailable = false } = data;
  const jsonLd = {
    "@context": "https://schema.org", "@type": "CollectionPage",
    name: `Forex Signals & Automated Strategies | ${SITE_NAME}`,
    description: "A directory of Forex signal tools and automated strategies with compatibility and performance information.",
    url: `${SITE_URL}/signals`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: signals.map((signal, index) => ({ "@type": "ListItem", position: index + 1, url: `${SITE_URL}/signals/${signal.uuid}`, name: signal.title, description: sanitizeText(signal.description, 160) })),
    },
  };
  const metrics = [
    { label: "Strategies available", value: stats.totalSignals.toLocaleString(), icon: Activity },
    { label: "Platform coverage", value: stats.platformCount ? `${stats.platformCount} platform${stats.platformCount === 1 ? "" : "s"}` : "MT4 & MT5", icon: ChartNoAxesCombined },
    { label: "Reported win rate", value: stats.averageWinRate ? `${stats.averageWinRate.toFixed(1)}% avg.` : "See tool details", icon: CircleCheckBig },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-surface-100">
      <Script id="signals-directory-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden border-b border-white/10 bg-surface-50 py-16 sm:py-20 lg:py-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(10,132,255,0.25),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.12),transparent_30%)]" />
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-light"><Activity className="h-4 w-4" /> Strategy signal directory</div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">Better signal discovery, <span className="gradient-text">less guesswork</span></h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">Search the available strategies, inspect the information behind each tool, and choose the setup that matches your MetaTrader platform and risk process.</p>
              <a href="#catalogue" className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark focus:outline-none focus:ring-4 focus:ring-brand/30">Explore strategies <ArrowDown className="h-4 w-4" /></a>
            </div>
            <div className="mx-auto mt-12 grid max-w-4xl divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {metrics.map(({ label, value, icon: Icon }) => <div key={label} className="flex items-center gap-3 px-5 py-5 sm:block sm:px-7 sm:py-6"><Icon className="h-5 w-5 shrink-0 text-brand sm:mb-4" /><div><p className="text-xl font-bold text-white sm:text-2xl">{value}</p><p className="mt-0.5 text-xs text-zinc-500 sm:mt-1 sm:text-sm">{label}</p></div></div>)}
            </div>
          </div>
        </section>
        <DownloadCatalog
          signals={signals}
          catalogueUnavailable={catalogueUnavailable}
          detailBasePath="/signals"
          sectionLabel="Strategy directory"
          emptyLibraryTitle="Signals are being prepared"
          emptyLibraryCopy="No strategies have been published yet. This directory will update automatically when a new signal is available."
        />
        <section className="border-t border-white/10 bg-surface-50/40">
          <div className="container mx-auto grid gap-6 px-4 py-10 sm:grid-cols-[auto_1fr] sm:items-center">
            <ShieldAlert className="mx-auto h-9 w-9 text-amber-300 sm:mx-0" />
            <div><h2 className="text-lg font-semibold text-white">Trade with an independent risk plan</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">Performance figures and strategy descriptions are provided for evaluation, not as a guarantee of future results. Test any strategy on a demo account and define position sizing before live use.</p></div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
