"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

interface AuthorPopoverProps {
  authorName: string;
  /** Optional short role/title under the name */
  role?: string;
  /** Optional bio; falls back to a site-default blurb */
  bio?: string;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const DEFAULT_ROLE = "Content Marketing Manager";

function buildDefaultBio(name: string): string {
  return `${name} is a digital marketing and content strategist with a strong focus on SaaS, fintech, trading technology, and B2B software. With experience in SEO, content strategy, and digital growth, they specialize in turning complex products and technical concepts into clear, engaging content for modern audiences. They lead content initiatives that combine search strategy, practical insights, and compelling storytelling to help businesses build visibility and connect with their target customers.`;
}

export function AuthorPopover({
  authorName,
  role = DEFAULT_ROLE,
  bio,
  className = "",
}: AuthorPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const name = (authorName ?? "").trim() || "Author";
  const initials = getInitials(name);
  const resolvedBio = (bio ?? "").trim() || buildDefaultBio(name);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((open) => !open), []);

  // Close on outside click / Escape
  useEffect(() => {
    if (!isOpen) return;

    const handlePointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        close();
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer, { passive: true });
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, close]);

  // Static fallback when name is missing (should not happen for published blogs)
  if (!(authorName ?? "").trim()) {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-indigo-600 text-xs font-bold text-white">
          ?
        </span>
        <span className="font-medium text-white">Author</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        aria-haspopup="dialog"
        className="group flex items-center gap-2.5 text-left"
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-indigo-600 text-xs font-bold text-white"
          aria-hidden="true"
        >
          {initials}
        </span>
        <span className="font-medium text-white underline-offset-4 transition-colors group-hover:text-brand group-hover:underline">
          {name}
        </span>
      </button>

      {isOpen ? (
        <div
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-label={`About ${name}`}
          className="absolute left-0 top-full z-50 mt-3 w-[min(calc(100vw-2rem),26rem)] origin-top-left"
        >
          <div className="relative overflow-hidden rounded-2xl border border-brand/30 bg-white shadow-2xl shadow-black/20">
            {/* Blue top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-brand to-indigo-500" aria-hidden="true" />

            <button
              type="button"
              onClick={close}
              aria-label="Close author details"
              className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-lg leading-none text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-800"
            >
              ×
            </button>

            <div className="p-5 pr-12">
              <div className="flex items-start gap-3.5">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white shadow-md shadow-brand/25"
                  aria-hidden="true"
                >
                  {initials}
                </div>

                <div className="min-w-0">
                  <span className="mb-1 inline-block rounded-full border border-brand/40 bg-brand/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                    Author
                  </span>
                  <h2 className="truncate text-xl font-semibold leading-tight text-zinc-900">
                    {name}
                  </h2>
                  <p className="mt-0.5 text-sm font-medium text-brand">{role}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-zinc-600">{resolvedBio}</p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-brand/30 bg-brand/5 px-3 py-1.5 text-xs font-semibold text-brand">
                  ForexFactory Editorial
                </span>
                <Link
                  href={`/search?q=${encodeURIComponent(name)}`}
                  className="text-sm font-medium text-brand hover:underline"
                  onClick={close}
                >
                  View profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
