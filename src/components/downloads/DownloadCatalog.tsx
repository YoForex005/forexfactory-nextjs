"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  FileCode2,
  Search,
  SlidersHorizontal,
  Star,
  TrendingUp,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CatalogSignal = {
  id: number;
  uuid: string;
  title: string;
  description: string;
  mime: string;
  sizeBytes: number;
  createdAt: string;
  platform: string | null;
  strategy: string | null;
  version: string | null;
  winRate: number | null;
  rating: number | null;
  downloadCount: number;
  isPremium: boolean;
};

type Filter = "all" | "mt4" | "mt5" | "premium";
type Sort = "newest" | "popular" | "rating";

function plainText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function platformLabel(signal: CatalogSignal) {
  const source = `${signal.platform ?? ""} ${signal.mime}`.toLowerCase();
  if (source.includes("mq4") || source.includes("mt4")) return "MT4";
  if (source.includes("mq5") || source.includes("mt5")) return "MT5";
  return signal.platform || "Expert Advisor";
}

function matchesPlatform(signal: CatalogSignal, filter: Filter) {
  const source = `${signal.platform ?? ""} ${signal.mime}`.toLowerCase();
  if (filter === "mt4") return source.includes("mq4") || source.includes("mt4");
  if (filter === "mt5") return source.includes("mq5") || source.includes("mt5");
  if (filter === "premium") return signal.isPremium;
  return true;
}

type DownloadCatalogProps = {
  signals: CatalogSignal[];
  detailBasePath?: "/downloads" | "/signals";
  sectionLabel?: string;
  emptyLibraryTitle?: string;
  emptyLibraryCopy?: string;
  catalogueUnavailable?: boolean;
};

export function DownloadCatalog({
  signals,
  detailBasePath = "/downloads",
  sectionLabel = "Browse the library",
  emptyLibraryTitle = "The library is being prepared",
  emptyLibraryCopy = "New Expert Advisors and indicators will appear here as soon as they are published. Explore our market education while you wait.",
  catalogueUnavailable = false,
}: DownloadCatalogProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");

  const visibleSignals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return signals
      .filter((signal) => {
        const searchable = `${signal.title} ${signal.description} ${signal.strategy ?? ""} ${signal.platform ?? ""}`.toLowerCase();
        return (!normalizedQuery || searchable.includes(normalizedQuery)) && matchesPlatform(signal, filter);
      })
      .sort((a, b) => {
        if (sort === "popular") return b.downloadCount - a.downloadCount;
        if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [filter, query, signals, sort]);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All tools" },
    { key: "mt4", label: "MT4" },
    { key: "mt5", label: "MT5" },
    { key: "premium", label: "Premium" },
  ];
  const libraryIsEmpty = signals.length === 0;

  return (
    <section id="catalogue" className="container mx-auto scroll-mt-24 px-4 py-12 sm:py-16">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">{sectionLabel}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Find a tool that fits your setup</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
            Compare platform support, strategy details, file size, and community interest before you download.
          </p>
        </div>
        <p className="text-sm text-zinc-500" aria-live="polite">
          Showing <span className="font-semibold text-zinc-200">{visibleSignals.length}</span> of {signals.length} tools
        </p>
      </div>

      <div className="mb-8 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 shadow-2xl shadow-black/10 lg:grid-cols-[1fr_auto_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          <span className="sr-only">Search downloads</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by robot, indicator, strategy..."
            className="h-12 w-full rounded-xl border border-white/10 bg-surface-50/80 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-brand focus:ring-4 focus:ring-brand/10"
          />
        </label>
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-white/10 bg-surface-50/60 p-1" aria-label="Filter downloads">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${filter === key ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-surface-50/80 px-3 text-sm text-zinc-400">
          <SlidersHorizontal className="h-4 w-4 text-zinc-500" />
          <Select
            value={sort}
            onValueChange={(value) => setSort(value as Sort)}
          >
            <SelectTrigger aria-label="Sort downloads" className="h-10 min-w-32 flex-1 border-0 bg-transparent px-0 text-sm text-zinc-100 focus:ring-2 focus:ring-brand/30 focus:ring-offset-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="!z-[60] !rounded-xl !border-white/10 !bg-surface-50 !p-1 !text-zinc-100 !shadow-2xl !shadow-black/40">
              <SelectItem value="newest" className="!text-zinc-100 focus:!bg-brand/20 focus:!text-white data-[state=checked]:!bg-brand/15">Newest first</SelectItem>
              <SelectItem value="popular" className="!text-zinc-100 focus:!bg-brand/20 focus:!text-white data-[state=checked]:!bg-brand/15">Most downloaded</SelectItem>
              <SelectItem value="rating" className="!text-zinc-100 focus:!bg-brand/20 focus:!text-white data-[state=checked]:!bg-brand/15">Top rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {visibleSignals.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleSignals.map((signal) => {
            const size = signal.sizeBytes > 0 ? `${(signal.sizeBytes / 1024 / 1024).toFixed(2)} MB` : "File size pending";
            const description = plainText(signal.description) || "View the full product details, compatibility, and setup notes.";
            return (
              <article key={signal.id} className="group relative flex min-h-[290px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition duration-300 hover:-translate-y-1 hover:border-brand/50 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-brand/10">
                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-brand/10 blur-3xl transition group-hover:bg-brand/20" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-brand">
                    <FileCode2 className="h-5 w-5" />
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <span className="rounded-full border border-white/10 bg-surface-50/90 px-2.5 py-1 text-xs font-semibold text-zinc-300">{platformLabel(signal)}</span>
                    {signal.isPremium && <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-300">Premium</span>}
                  </div>
                </div>
                <div className="relative mt-5">
                  <h3 className="line-clamp-2 text-lg font-bold text-white transition group-hover:text-brand">{signal.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">{description}</p>
                </div>
                <div className="relative mt-auto pt-5">
                  <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500">
                    <span>{size}</span>
                    {signal.strategy && <span className="capitalize">{signal.strategy.replace(/_/g, " ")}</span>}
                    {signal.rating && <span className="inline-flex items-center gap-1 text-amber-300"><Star className="h-3 w-3 fill-current" /> {signal.rating.toFixed(1)}</span>}
                    <span className="inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {signal.downloadCount.toLocaleString()}</span>
                  </div>
                  <Link href={`${detailBasePath}/${signal.uuid}`} className="flex items-center justify-between border-t border-white/10 pt-4 text-sm font-semibold text-white transition group-hover:text-brand">
                    View details <span className="inline-flex items-center gap-2">Download <ArrowRight className="h-4 w-4" /></span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand"><Search className="h-5 w-5" /></div>
          <h3 className="mt-4 text-lg font-semibold text-white">
            {catalogueUnavailable
              ? "The live library is temporarily unavailable"
              : libraryIsEmpty
                ? emptyLibraryTitle
                : "No matching tools found"}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
            {catalogueUnavailable
              ? "The page is ready, but we could not reach the catalogue service. Please try again shortly."
              : libraryIsEmpty
                ? emptyLibraryCopy
                : "Try another search term or clear the active filters to browse the entire library."}
          </p>
          {(!libraryIsEmpty || catalogueUnavailable) && (
            <button type="button" onClick={() => {
              if (catalogueUnavailable) {
                window.location.reload();
                return;
              }
              setQuery("");
              setFilter("all");
            }} className="mt-5 text-sm font-semibold text-brand hover:text-brand-light">{catalogueUnavailable ? "Try again" : "Clear filters"}</button>
          )}
        </div>
      )}

    </section>
  );
}
