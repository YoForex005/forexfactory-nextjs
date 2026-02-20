"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageSquare, ExternalLink } from "lucide-react";

export function AdBanner() {
  return (
    <div className="w-full bg-[#0B0D16] border-b border-white/5 py-4 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8">
          {/* Logo & Slogan Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="relative p-2 bg-brand/10 rounded-xl border border-brand/20 transition-all group-hover:scale-110 group-hover:bg-brand/20">
                <span className="text-xl">🤖</span>
                <div className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand"></span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tighter text-white leading-none">
                  YO<span className="text-brand">FOREX</span>
                </span>
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none mt-1">
                  Custom AI Bots
                </span>
              </div>
            </div>
            <div className="h-px w-12 bg-white/10 hidden sm:block"></div>
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-white uppercase italic">
              TURN YOUR STRATEGY INTO A <span className="text-[#0A84FF]">POWERFUL EA</span> 🤖
            </h2>
            <div className="hidden xl:flex items-center gap-4 text-[10px] sm:text-xs font-medium text-zinc-400">
              <span className="flex items-center gap-1.5 whitespace-nowrap"><span className="text-emerald-400">✔️</span> Smart Money Concept EAs</span>
              <span className="flex items-center gap-1.5 whitespace-nowrap"><span className="text-emerald-400">✔️</span> Scalping / Swing / Gold Bots</span>
              <span className="flex items-center gap-1.5 whitespace-nowrap"><span className="text-emerald-400">✔️</span> Fully Custom Logic</span>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="https://wa.me/917449454349"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20"
            >
              <span className="animate-bounce">🔥</span>
              Get Your Custom Trading Bot Today
              <MessageSquare className="h-4 w-4" />
            </Link>

            <Link
              href="https://yoforex.co.in/how-we-work.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-white/5 text-zinc-300 text-sm font-medium transition-all hover:bg-white/10 hover:text-white"
            >
              <span className="text-brand">👉</span>
              Visit Our Official Website
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
