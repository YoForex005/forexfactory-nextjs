import Link from "next/link";
import {
  BarChart2,
  BookOpen,
  Download,
  Home,
  Info,
  Mail,
  Menu,
  Search,
} from "lucide-react";
import { NavbarAccount } from "@/components/layout/NavbarAccount";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/downloads", label: "Downloads", icon: Download },
  { href: "/signals", label: "Signals", icon: BarChart2 },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
];

function SearchPanel() {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white [&::-webkit-details-marker]:hidden">
        <Search className="h-5 w-5" />
        <span className="sr-only">Open site search</span>
      </summary>
      <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-white/10 bg-surface-50 p-3 shadow-2xl shadow-black/40">
        <form
          action="/search"
          className="relative"
          toolname="search_forexfactory"
          tooldescription="Searches public ForexFactory articles, trading signals, and Expert Advisor resources."
        >
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          <label htmlFor="site-search" className="sr-only">Search ForexFactory content</label>
          <input
            type="search"
            id="site-search"
            name="q"
            required
            autoComplete="off"
            toolparamdescription="Keywords to search for in public ForexFactory content."
            placeholder="Search blog posts, signals, EAs..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-zinc-500 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </form>
      </div>
    </details>
  );
}

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-surface-50/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <details className="relative md:hidden">
          <summary className="flex cursor-pointer list-none items-center rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white [&::-webkit-details-marker]:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open navigation menu</span>
          </summary>
          <aside className="absolute left-0 top-[calc(100%+0.75rem)] z-50 w-72 rounded-xl border border-white/10 bg-surface-50 p-3 shadow-2xl shadow-black/40">
            <div className="space-y-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white">
                  <Icon className="h-5 w-5 text-zinc-400" />
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-3 border-t border-white/10 pt-3">
              <NavbarAccount mobile />
            </div>
          </aside>
        </details>

        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
          <span className="text-brand">Forex</span>Factory
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-zinc-400 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="transition-colors hover:text-brand">
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <SearchPanel />
          <NavbarAccount />
        </div>
      </div>
    </nav>
  );
}
