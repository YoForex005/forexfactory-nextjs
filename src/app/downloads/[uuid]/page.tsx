import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, Star, ShieldCheck, Gauge, Cpu, ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  SITE_NAME,
  generateCanonicalUrl,
  generateSoftwareApplicationSchema,
} from "@/lib/seo";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

async function getSignal(uuid: string) {
  return prisma.signal.findUnique({
    where: { uuid },
  });
}

async function getSuggestedSignals(id: number) {
  return prisma.signal.findMany({
    where: {
      id: { not: id },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { uuid } = await params;
  const signal = await getSignal(uuid);

  if (!signal) {
    return {
      title: `Download not found | ${SITE_NAME}`,
      description: "The requested Expert Advisor could not be located.",
    };
  }

  const title = `${signal.title} for ${signal.platform ?? "MT4/MT5"} | ${SITE_NAME}`;
  const description = signal.description.substring(0, 155);
  const url = generateCanonicalUrl(`/downloads/${signal.uuid}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "article",
      url,
    },
  };
}

export default async function DownloadDetailPage({ params }: PageProps) {
  const { uuid } = await params;
  const signal = await getSignal(uuid);

  if (!signal) {
    notFound();
  }

  const [suggestedSignals] = await Promise.all([
    getSuggestedSignals(signal.id, signal.platform ?? undefined),
  ]);

  const winRate = signal.winRate ? Number(signal.winRate).toFixed(1) : null;
  const rating = signal.rating ? Number(signal.rating).toFixed(1) : null;
  const profitFactor = signal.profitFactor ? Number(signal.profitFactor).toFixed(2) : null;
  const drawdown = signal.maxDrawdown ? Number(signal.maxDrawdown).toFixed(1) : null;
  const downloadCount = signal.downloadCount ?? 0;
  const priceLabel = signal.isPremium ? `$${Number(signal.price ?? 0).toFixed(2)}` : "Free Download";
  const featureList = signal.features?.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean) ?? [];
  const requirements = signal.requirements?.split(/\r?\n/).filter(Boolean) ?? [];
  const compatibility = signal.compatibility?.split(/,|\/|•/).map((item) => item.trim()).filter(Boolean) ?? [];
  const fileSizeMb = signal.sizeBytes ? `${(signal.sizeBytes / (1024 * 1024)).toFixed(2)} MB` : null;

  const schema = generateSoftwareApplicationSchema({
    name: signal.title,
    description: signal.description,
    applicationCategory: signal.strategy ? `${signal.strategy.replace(/_/g, " ")} Strategy` : "Forex Expert Advisor",
    operatingSystem:
      signal.platform === "Both"
        ? "MetaTrader 4 & MetaTrader 5"
        : signal.platform
          ? `MetaTrader ${signal.platform}`
          : "MetaTrader",
    softwareVersion: signal.version ?? "1.0",
    downloadUrl: signal.filePath,
    fileSize: fileSizeMb ?? undefined,
    datePublished: signal.createdAt.toISOString(),
    aggregateRating: rating
      ? {
        ratingValue: Number(rating),
        reviewCount: Math.max(downloadCount, 1),
      }
      : undefined,
  });

  // Helper to handle multiple levels of escaped HTML
  const decodeHtml = (html: string) => {
    let decoded = html;
    for (let i = 0; i < 3; i++) {
      const current = decoded
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
      if (current === decoded) break;
      decoded = current;
    }
    return { __html: decoded };
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-100">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-white/10 bg-gradient-to-b from-surface-50 to-surface-100 py-16">
          <div className="container mx-auto px-4">
            <Link href="/downloads" className="mb-6 inline-flex items-center text-sm text-zinc-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to downloads
            </Link>
            <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.3em] text-brand/70">Expert Advisor</p>
                <h1 className="text-4xl font-bold text-white md:text-5xl">{signal.title}</h1>
                <div
                  className="mt-4 text-lg text-zinc-400 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={decodeHtml(signal.description)}
                />
                <div className="mt-6 flex flex-wrap gap-3">
                  {signal.platform && (
                    <span className="rounded-full border border-white/10 px-4 py-1 text-sm text-white">
                      Platform: {signal.platform}
                    </span>
                  )}
                  {signal.strategy && (
                    <span className="rounded-full border border-white/10 px-4 py-1 text-sm capitalize text-white">
                      Strategy: {signal.strategy.replace(/_/g, " ")}
                    </span>
                  )}
                  {signal.version && (
                    <span className="rounded-full border border-white/10 px-4 py-1 text-sm text-white">
                      Version {signal.version}
                    </span>
                  )}
                </div>
                <div className="mt-8 flex flex-wrap gap-6 rounded-2xl border border-white/5 bg-white/5 p-6">
                  <div>
                    <p className="text-sm text-zinc-500">Win Rate</p>
                    <p className="text-3xl font-semibold text-white">{winRate ? `${winRate}%` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Profit Factor</p>
                    <p className="text-3xl font-semibold text-white">{profitFactor ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Max Drawdown</p>
                    <p className="text-3xl font-semibold text-white">{drawdown ? `${drawdown}%` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Downloads</p>
                    <p className="text-3xl font-semibold text-white">{downloadCount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">License</span>
                  {rating && (
                    <span className="flex items-center gap-1 text-sm text-yellow-400">
                      <Star className="h-4 w-4 fill-yellow-400" /> {rating}
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-white">{priceLabel}</p>
                <p className="mt-1 text-sm text-zinc-400">Instant digital download. Includes lifetime updates.</p>
                <Link
                  href={signal.filePath}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
                >
                  <Download className="mr-2 h-5 w-5" /> Download Files
                </Link>
                <div className="mt-6 space-y-3 text-sm text-zinc-400">
                  {fileSizeMb && <p>File Size: {fileSizeMb}</p>}
                  <p>Compatibility: {compatibility.length ? compatibility.join(" • ") : "MT4/MT5 Terminals"}</p>
                  <p>Released: {signal.createdAt.toLocaleDateString()}</p>
                </div>
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/5 bg-surface-50/60 p-4 text-sm text-zinc-400">
                  <ShieldCheck className="h-5 w-5 text-brand" />
                  Verified by ForexFactory.cc security & compliance checks.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto grid gap-10 px-4 py-16 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            <div className="rounded-3xl border border-white/5 bg-white/5 p-8">
              <h2 className="text-2xl font-semibold text-white">Performance Overview</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Gauge className="h-4 w-4" /> Win Rate
                  </div>
                  <p className="mt-3 text-3xl font-bold text-white">{winRate ? `${winRate}%` : "Data pending"}</p>
                  <p className="text-sm text-zinc-500">Based on verified backtests.</p>
                </div>
                <div className="rounded-2xl border border-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Cpu className="h-4 w-4" /> Strategy Model
                  </div>
                  <p className="mt-3 text-xl font-semibold text-white">
                    {signal.strategy ? signal.strategy.replace(/_/g, " ") : "Multi-market adaptive"}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {signal.requirements || "Optimized for major FX pairs with smart risk management."}
                  </p>
                </div>
              </div>
              {requirements.length > 1 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Setup Requirements</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-400">
                    {requirements.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {featureList.length > 0 && (
              <div className="rounded-3xl border border-white/5 bg-white/5 p-8">
                <h2 className="text-2xl font-semibold text-white">Key Features</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {featureList.map((feature) => (
                    <div key={feature} className="rounded-2xl border border-white/5 bg-surface-50/70 p-5 text-sm text-zinc-300">
                      <p>{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white">Risk Management</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Built-in equity guard, news filters, and dynamic lot sizing to comply with prop-firm drawdown limits.
              </p>
              <ul className="mt-4 space-y-3 text-sm text-zinc-300">
                <li>• Dynamic stop-loss per ATR</li>
                <li>• Auto lot calculator</li>
                <li>• Session filters</li>
                <li>• News avoidance window</li>
              </ul>
            </div>

            {suggestedSignals.length > 0 && (
              <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white">More like this</h3>
                <div className="mt-4 space-y-4">
                  {suggestedSignals.map((item) => (
                    <Link
                      key={item.id}
                      href={`/downloads/${item.uuid}`}
                      className="block rounded-2xl border border-white/5 bg-surface-50/70 p-4 hover:border-brand"
                    >
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-sm text-zinc-500">
                        {item.strategy?.replace(/_/g, " ")} • {item.platform}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                        <Download className="h-3 w-3" /> {item.downloadCount ?? 0}
                        <Star className="h-3 w-3" />
                        {item.rating ? Number(item.rating).toFixed(1) : "New"}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </section>
      </main>

      <Footer />

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </div>
  );
}
