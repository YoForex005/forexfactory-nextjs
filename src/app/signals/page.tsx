import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SITE_NAME, generateCanonicalUrl } from "@/lib/seo";
import { Metadata } from "next";
import { Signal } from "@prisma/client";
import { SignalCard } from "@/components/signals/SignalCard";

export const metadata: Metadata = {
  title: `Free Forex Signals & Trading Alerts | ${SITE_NAME}`,
  description: "Real-time forex trading signals with entry, stop-loss, and take-profit levels. Expert analysis for EUR/USD, GBP/USD, and major currency pairs.",
  openGraph: {
    title: `Free Forex Signals & Trading Alerts | ${SITE_NAME}`,
    description: "Real-time forex trading signals with expert analysis and performance tracking.",
    type: "website",
    url: generateCanonicalUrl("/signals"),
  },
};

async function getSignalsData() {
  let signals: Signal[] = [];
  
  try {
    signals = await prisma.signal.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (error) {
    console.error("Failed to fetch signals:", error);
  }

  return { signals };
}

export default async function SignalsPage() {
  const { signals } = await getSignalsData();

  return (
    <div className="flex min-h-screen flex-col bg-surface-100">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative border-b border-white/10 bg-surface-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-sm font-medium text-brand">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand"></span>
              </span>
              Live Trading Signals
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Expert Forex <span className="gradient-text">Signals</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-zinc-400">
              Professional trading signals with detailed analysis, risk management, and real-time updates. Download expert advisors and automated trading systems.
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-b border-white/5 bg-surface-50/50 py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{signals.length}</div>
                <div className="text-sm text-zinc-500">Total Signals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand">Live</div>
                <div className="text-sm text-zinc-500">Market Status</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-sm text-zinc-500">Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">Free</div>
                <div className="text-sm text-zinc-500">Access</div>
              </div>
            </div>
          </div>
        </div>

        {/* Signals Grid */}
        <div className="container mx-auto px-4 py-16">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white">Latest Signals & Expert Advisors</h2>
            <p className="text-sm text-zinc-500">Download automated trading systems and get real-time market alerts</p>
          </div>

          {signals.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {signals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 rounded-full bg-white/5 p-4">
                <svg className="h-8 w-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white">No signals available</h3>
              <p className="mt-2 text-zinc-400">Check back soon for new trading signals and expert advisors.</p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="border-t border-white/5 bg-surface-50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">Want Premium Signals?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-zinc-400">
              Get access to exclusive trading signals, advanced analytics, and priority support with our premium membership.
            </p>
            <button className="rounded-full bg-brand px-8 py-3 font-medium text-white transition-colors hover:bg-brand-dark">
              Upgrade to Premium
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
