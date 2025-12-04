"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-surface-50/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
          <span className="text-brand">Forex</span>Factory
        </Link>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <Link href="/blog" className="hover:text-brand transition-colors">Blog</Link>
          <Link href="/downloads" className="hover:text-brand transition-colors">Downloads</Link>
          <Link href="/signals" className="hover:text-brand transition-colors">Signals</Link>
          <Link href="/about" className="hover:text-brand transition-colors">About</Link>
          <Link href="/contact" className="hover:text-brand transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Button */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            title="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          <Link href="/admin/login" className="text-sm font-medium text-zinc-400 hover:text-white">
            Login
          </Link>
          <Link href="/signals" className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors">
            Get Started
          </Link>
        </div>
      </div>

      {/* Search Dropdown */}
      {showSearch && (
        <div className="border-t border-white/10 bg-surface-50">
          <div className="container mx-auto px-4 py-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blog posts, signals, EAs..."
                autoFocus
                className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
