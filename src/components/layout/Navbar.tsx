"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Menu, X, Home, BookOpen, Download, BarChart2, Info, Mail, ArrowRight, User, LogOut } from "lucide-react";
import { isLoggedIn, getUser, logout } from "@/lib/auth-client";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/downloads", label: "Downloads", icon: Download },
  { href: "/signals", label: "Signals", icon: BarChart2 },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  // Check auth status on mount and route change
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = isLoggedIn();
      setIsAuthenticated(loggedIn);
      if (loggedIn) {
        const user = getUser();
        setUserName(user?.name || user?.email || null);
      } else {
        setUserName(null);
      }
    };
    checkAuth();

    // Re-check on route change
    setIsSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setUserName(null);
    router.refresh();
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-surface-50/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
            <span className="text-brand">Forex</span>Factory
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-brand transition-colors ${pathname === link.href ? "text-brand" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              title="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Auth Buttons - Desktop */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-brand hover:underline"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <User className="h-4 w-4" />
                  <span className="max-w-[100px] truncate">{userName?.split(" ")[0] || "User"}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
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

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-[100dvh] w-72 bg-surface-50 border-r border-white/10 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
            <span className="text-brand">Forex</span>Factory
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 flex flex-col p-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                  ? "bg-brand/10 text-brand border border-brand/20"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="flex-none p-4 pb-10 border-t border-white/10 space-y-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 !rounded-full bg-brand text-sm font-medium text-white hover:bg-brand/90 transition-colors"
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-2 px-2 py-2 text-sm text-zinc-300">
                <User className="h-4 w-4" />
                <span className="truncate">{userName || "User"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 !rounded-full border border-white/10 bg-white/5 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 !rounded-full border border-white/10 bg-white/5 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 !rounded-full bg-brand text-sm font-medium text-white hover:bg-brand/90 transition-colors"
              >
                Sign Up
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
