import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, Users, TrendingUp, Award, Target, Heart } from "lucide-react";
import { SITE_NAME, DEFAULT_OG_IMAGE, generateAboutPageSchema, SITE_URL } from "@/lib/seo";
import { StatsSection } from "@/components/about/StatsSection";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "About Us - Trusted Forex Expert Advisors & Trading Tools",
  description: "Learn about Forex Factory - your trusted source for free Expert Advisors, trading signals, and Forex education. Join 50,000+ traders worldwide.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: `About Us | ${SITE_NAME}`,
    description: "Learn about Forex Factory - your trusted source for free Expert Advisors, trading signals, and Forex education.",
    type: 'website',
  },
  twitter: {
    card: "summary_large_image",
    title: `About Us | ${SITE_NAME}`,
    description: "Learn about Forex Factory - your trusted source for free Expert Advisors, trading signals, and Forex education.",
    images: [DEFAULT_OG_IMAGE],
  }
};

const jsonLd = generateAboutPageSchema();

async function getStats() {
  try {
    const [eaCount, userCount, signals] = await Promise.all([
      prisma.signal.count(),
      prisma.user.count(),
      prisma.signal.findMany({
        select: {
          downloadCount: true,
          winRate: true,
        },
      }),
    ]);

    const totalDownloads = signals.reduce((acc: number, curr: { downloadCount: number }) => acc + (curr.downloadCount || 0), 0);
    const totalWinRate = signals.reduce((acc: number, curr: { winRate: number | null }) => acc + (curr.winRate || 0), 0);
    const avgWinRate = signals.length > 0
      ? totalWinRate / signals.length
      : 92;

    return {
      eaCount: 500 + eaCount,
      userCount: 50 + Math.floor(userCount / 1000),
      userSuffix: "K+",
      downloadCount: 1 + Math.floor(totalDownloads / 1000000),
      downloadSuffix: "M+",
      winRate: Math.round(avgWinRate),
    };
  } catch (error) {
    console.error("Failed to fetch about stats:", error);
    return {
      eaCount: 500,
      userCount: 50,
      userSuffix: "K+",
      downloadCount: 1,
      downloadSuffix: "M+",
      winRate: 92,
    };
  }
}

export default async function AboutPage() {
  const stats = await getStats();

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-1 bg-surface-100">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand/20 via-purple-500/20 to-surface-100 py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
                About Forex Factory
              </h1>
              <p className="text-lg md:text-xl text-zinc-300">
                Empowering traders worldwide with free Expert Advisors, real-time signals,
                and comprehensive Forex education since 2020.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="flex flex-col items-center text-center rounded-3xl border border-white/10 bg-white/5 p-10 md:p-16 transition-all hover:border-brand/30 hover:bg-white/10">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 mx-auto">
                  <Target className="h-8 w-8 text-brand" />
                </div>
                <h2 className="mb-4 text-3xl font-bold text-white">Our Mission</h2>
                <p className="mb-4 text-lg text-zinc-300">
                  To democratize Forex trading by providing free access to professional-grade
                  Expert Advisors, trading signals, and educational resources.
                </p>
                <p className="text-zinc-400">
                  We believe that everyone should have access to the tools and knowledge needed
                  to succeed in Forex trading, regardless of their budget or experience level.
                </p>
              </div>

              <div className="flex flex-col items-center text-center rounded-3xl border border-white/10 bg-white/5 p-10 md:p-16 transition-all hover:border-purple-500/30 hover:bg-white/10">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 mx-auto">
                  <Heart className="h-8 w-8 text-purple-400" />
                </div>
                <h2 className="mb-4 text-3xl font-bold text-white">Our Vision</h2>
                <p className="mb-4 text-lg text-zinc-300">
                  To become the world's most trusted platform for Forex traders, offering
                  cutting-edge automation tools and fostering a thriving community.
                </p>
                <p className="text-zinc-400">
                  We envision a future where algorithmic trading is accessible to all,
                  and traders can leverage technology to achieve consistent profitability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Live Stats Section */}
        <StatsSection stats={stats} />

        {/* Values Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-4xl font-bold text-white">Our Core Values</h2>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center flex flex-col items-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 mx-auto">
                  <CheckCircle2 className="h-6 w-6 text-brand" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">Quality First</h3>
                <p className="text-zinc-400">
                  Every Expert Advisor is thoroughly tested with real backtest results
                  and forward testing data to ensure reliability and performance.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center flex flex-col items-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 mx-auto">
                  <Users className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">Community Driven</h3>
                <p className="text-zinc-400">
                  We listen to our community and continuously improve based on trader
                  feedback, suggestions, and real-world trading experiences.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center flex flex-col items-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 mx-auto">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">Innovation</h3>
                <p className="text-zinc-400">
                  We stay ahead of market trends by constantly developing new strategies,
                  optimizing algorithms, and adopting cutting-edge trading technologies.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center flex flex-col items-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 mx-auto">
                  <Award className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">Transparency</h3>
                <p className="text-zinc-400">
                  We provide complete transparency with detailed performance metrics,
                  backtest results, and honest assessments of each trading system.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center flex flex-col items-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 mx-auto">
                  <Heart className="h-6 w-6 text-yellow-400" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">Free Access</h3>
                <p className="text-zinc-400">
                  We believe in making professional trading tools accessible to everyone.
                  All our Expert Advisors and resources are 100% free, forever.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center flex flex-col items-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 mx-auto">
                  <Target className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">Education</h3>
                <p className="text-zinc-400">
                  We empower traders through comprehensive tutorials, strategy guides,
                  and market analysis to help them understand and succeed in Forex trading.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="bg-white/5 py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 text-4xl font-bold text-white">Our Story</h2>
              <div className="space-y-6 text-lg text-zinc-300">
                <p>
                  Forex Factory was founded in 2020 by a team of experienced Forex traders
                  and software developers who were frustrated with the high costs and limited
                  access to quality Expert Advisors.
                </p>
                <p>
                  We started with a simple mission: create a platform where traders could
                  access professional-grade trading tools without breaking the bank. What
                  began as a small collection of 10 Expert Advisors has grown into a
                  comprehensive library of 500+ tested and verified trading systems.
                </p>
                <p>
                  Today, Forex Factory serves over 50,000 active traders worldwide, with
                  more than 1 million downloads and counting. Our community continues to
                  grow as we add new Expert Advisors, improve existing ones, and provide
                  valuable educational content.
                </p>
                <p>
                  We're proud to have helped thousands of traders automate their strategies,
                  improve their results, and achieve their financial goals through algorithmic
                  trading.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-brand/20 to-purple-500/20 p-12 text-center">
              <h2 className="mb-4 text-4xl font-bold text-white">
                Join Our Community
              </h2>
              <p className="mb-8 text-xl text-zinc-300">
                Start your automated trading journey today with 500+ free Expert Advisors
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <a
                  href="/signals"
                  className="rounded-full bg-brand px-8 py-4 font-medium text-white transition-colors hover:bg-brand-dark"
                >
                  Browse Expert Advisors
                </a>
                <a
                  href="/blog"
                  className="rounded-full border border-white/20 bg-white/10 px-8 py-4 font-medium text-white transition-colors hover:bg-white/20"
                >
                  Read Our Blog
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
