"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Search, FileText, Download, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<any>({ blogs: [], signals: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "blog" | "signal">("all");

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (q: string) => {
    if (!q || q.length < 2) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${activeTab}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length >= 2) {
      window.history.pushState({}, "", `/search?q=${encodeURIComponent(searchQuery)}`);
      performSearch(searchQuery);
    }
  };

  const handleTabChange = (tab: "all" | "blog" | "signal") => {
    setActiveTab(tab);
    if (query) {
      performSearch(query);
    }
  };

  const stripHtml = (html: string) => {
    return html?.replace(/<[^>]*>/g, "").substring(0, 200) || "";
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 bg-surface-100">
        {/* Search Header */}
        <section className="border-b border-white/10 bg-surface-50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="mb-6 text-4xl font-bold text-white">Search</h1>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for blog posts, signals, EAs..."
                className="w-full rounded-lg border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </form>

            {/* Results Count */}
            {query && (
              <p className="mt-4 text-zinc-400">
                {loading ? "Searching..." : `Found ${results.total} results for "${query}"`}
              </p>
            )}
          </div>
        </section>

        {/* Tabs */}
        <section className="border-b border-white/10 bg-surface-50">
          <div className="container mx-auto px-4">
            <div className="flex gap-6">
              <button
                onClick={() => handleTabChange("all")}
                className={`border-b-2 px-4 py-4 font-medium transition-colors ${
                  activeTab === "all"
                    ? "border-brand text-brand"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                All ({results.total})
              </button>
              <button
                onClick={() => handleTabChange("blog")}
                className={`border-b-2 px-4 py-4 font-medium transition-colors ${
                  activeTab === "blog"
                    ? "border-brand text-brand"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                Blog Posts ({results.blogs?.length || 0})
              </button>
              <button
                onClick={() => handleTabChange("signal")}
                className={`border-b-2 px-4 py-4 font-medium transition-colors ${
                  activeTab === "signal"
                    ? "border-brand text-brand"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                Signals ({results.signals?.length || 0})
              </button>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
              </div>
            ) : results.total === 0 && query ? (
              <div className="py-20 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
                <h2 className="mb-2 text-2xl font-bold text-white">No results found</h2>
                <p className="text-zinc-400">
                  Try different keywords or check your spelling
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Blog Results */}
                {(activeTab === "all" || activeTab === "blog") && results.blogs?.length > 0 && (
                  <div>
                    <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-white">
                      <FileText className="h-6 w-6" />
                      Blog Posts
                    </h2>
                    <div className="space-y-4">
                      {results.blogs.map((blog: any) => (
                        <Link
                          key={blog.id}
                          href={`/blog/${blog.seoSlug}`}
                          className="block rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-brand/50 hover:bg-white/10"
                        >
                          <h3 className="mb-2 text-xl font-bold text-white hover:text-brand">
                            {blog.title}
                          </h3>
                          <p className="mb-3 text-zinc-400 line-clamp-2">
                            {stripHtml(blog.content)}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-zinc-500">
                            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{blog.views || 0} views</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signal Results */}
                {(activeTab === "all" || activeTab === "signal") && results.signals?.length > 0 && (
                  <div>
                    <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-white">
                      <Download className="h-6 w-6" />
                      Signals & Expert Advisors
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {results.signals.map((signal: any) => (
                        <Link
                          key={signal.id}
                          href={`/signals/${signal.uuid}`}
                          className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-brand/50 hover:bg-white/10"
                        >
                          <div className="mb-4 flex items-start justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                              <Download className="h-6 w-6 text-brand" />
                            </div>
                            <span className="text-xs text-zinc-500">
                              {(signal.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                          <h3 className="mb-2 font-bold text-white line-clamp-1">
                            {signal.title}
                          </h3>
                          <p className="text-sm text-zinc-400 line-clamp-2">
                            {signal.description}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
