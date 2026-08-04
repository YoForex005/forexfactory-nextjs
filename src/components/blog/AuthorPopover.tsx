"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

interface AuthorPopoverProps {
  authorName: string;
  /** Optional short role/title under the name */
  role?: string;
  /** Optional bio; falls back to a site-default blurb */
  bio?: string;
  className?: string;
}

interface PanelCoords {
  top: number;
  left: number;
  width: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const DEFAULT_ROLE = "Content Marketing Manager";
const PANEL_WIDTH = 416; // ~26rem
const PANEL_GAP = 12;
const VIEWPORT_PAD = 16;

function buildDefaultBio(name: string): string {
  return `${name} is a digital marketing and content strategist with a strong focus on SaaS, fintech, trading technology, and B2B software. With experience in SEO, content strategy, and digital growth, they specialize in turning complex products and technical concepts into clear, engaging content for modern audiences. They lead content initiatives that combine search strategy, practical insights, and compelling storytelling to help businesses build visibility and connect with their target customers.`;
}

function computePanelCoords(trigger: DOMRect): PanelCoords {
  const width = Math.min(PANEL_WIDTH, window.innerWidth - VIEWPORT_PAD * 2);
  let left = trigger.left;
  // Keep panel fully on-screen horizontally
  if (left + width > window.innerWidth - VIEWPORT_PAD) {
    left = window.innerWidth - VIEWPORT_PAD - width;
  }
  if (left < VIEWPORT_PAD) left = VIEWPORT_PAD;

  // Prefer below the trigger; if not enough room, flip above
  const spaceBelow = window.innerHeight - trigger.bottom - VIEWPORT_PAD;
  const estimatedHeight = 320;
  let top = trigger.bottom + PANEL_GAP;

  if (spaceBelow < estimatedHeight && trigger.top > estimatedHeight + VIEWPORT_PAD) {
    top = trigger.top - PANEL_GAP; // will be adjusted with transform after measure
  }

  return { top, left, width };
}

export function AuthorPopover({
  authorName,
  role = DEFAULT_ROLE,
  bio,
  className = "",
}: AuthorPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<PanelCoords | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const name = (authorName ?? "").trim() || "Author";
  const initials = getInitials(name);
  const resolvedBio = (bio ?? "").trim() || buildDefaultBio(name);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((open) => !open), []);

  // Portal needs document — only after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = computePanelCoords(rect);

    // If panel already rendered, fine-tune vertical placement so it never clips
    const panel = panelRef.current;
    if (panel) {
      const h = panel.offsetHeight;
      const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PAD;
      if (spaceBelow < h && rect.top > h + VIEWPORT_PAD) {
        next.top = rect.top - PANEL_GAP - h;
      } else {
        next.top = rect.bottom + PANEL_GAP;
      }
      // Clamp vertically if still overflowing
      if (next.top + h > window.innerHeight - VIEWPORT_PAD) {
        next.top = Math.max(VIEWPORT_PAD, window.innerHeight - VIEWPORT_PAD - h);
      }
      if (next.top < VIEWPORT_PAD) next.top = VIEWPORT_PAD;
    }

    setCoords(next);
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      setCoords(null);
      return;
    }
    updatePosition();
  }, [isOpen, updatePosition]);

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!isOpen) return;

    const onReposition = () => updatePosition();
    window.addEventListener("resize", onReposition);
    // capture so nested scroll containers still update
    window.addEventListener("scroll", onReposition, true);

    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [isOpen, updatePosition]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!isOpen) return;

    const handlePointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      close();
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

  // Re-measure after paint so height-based flip is accurate
  useLayoutEffect(() => {
    if (!isOpen || !panelRef.current) return;
    updatePosition();
  }, [isOpen, updatePosition, name, resolvedBio]);

  // Static fallback when name is missing
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

  const panel =
    mounted && isOpen && coords
      ? createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="false"
            aria-label={`About ${name}`}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 9999,
            }}
            className="rounded-2xl border border-brand/30 bg-white shadow-2xl shadow-black/30"
          >
            {/* Blue top accent bar */}
            <div
              className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-brand to-indigo-500"
              aria-hidden="true"
            />

            <button
              type="button"
              onClick={close}
              aria-label="Close author details"
              className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-lg leading-none text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-800"
            >
              ×
            </button>

            <div className="relative p-5 pr-12">
              <div className="flex items-start gap-3.5">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white shadow-md shadow-brand/25"
                  aria-hidden="true"
                >
                  {initials}
                </div>

                <div className="min-w-0 flex-1">
                  <span className="mb-1 inline-block rounded-full border border-brand/40 bg-brand/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                    Author
                  </span>
                  <h2 className="text-xl font-semibold leading-tight text-zinc-900 break-words">
                    {name}
                  </h2>
                  <p className="mt-0.5 text-sm font-medium text-brand">{role}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                {resolvedBio}
              </p>

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
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className={`inline-flex ${className}`}>
        <button
          ref={triggerRef}
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
      </div>
      {panel}
    </>
  );
}
