import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SITE_URL, SITE_NAME, generateCanonicalUrl } from "@/lib/seo";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Download, FileCode, Calendar, HardDrive, ArrowLeft } from "lucide-react";

interface SignalDetailProps {
  params: Promise<{
    uuid: string;
  }>;
}

async function getSignal(uuid: string) {
  try {
    return await prisma.signal.findFirst({
      where: { uuid },
    });
  } catch (error) {
    console.error("Failed to fetch signal:", error);
    return null;
  }
}

export async function generateMetadata({ params }: SignalDetailProps): Promise<Metadata> {
  const { uuid } = await params;
  const signal = await getSignal(uuid);

  if (!signal) {
    return {
      title: `Signal Not Found | ${SITE_NAME}`,
    };
  }

  return {
    title: `${signal.title} - Download Free | ${SITE_NAME}`,
    description: signal.description,
    openGraph: {
      title: signal.title,
      description: signal.description,
      url: `${SITE_URL}/signals/${signal.uuid}`,
      type: "website",
    },
    alternates: {
      canonical: generateCanonicalUrl(`/signals/${signal.uuid}`),
    },
  };
}

export default async function SignalDetailPage({ params }: SignalDetailProps) {
  const { uuid } = await params;
  const signal = await getSignal(uuid);

  if (!signal) {
    notFound();
  }

  const fileSizeMB = (signal.sizeBytes / (1024 * 1024)).toFixed(2);
  const createdDate = new Date(signal.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Helper to handle multiple levels of escaped HTML
  const decodeHtml = (html: string) => {
    let decoded = html;
    for (let i = 0; i < 3; i++) {
      const current = decoded
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
      if (current === decoded) break;
      decoded = current;
    }
    return { __html: decoded };
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-100">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-white/5 bg-surface-50 py-4">
          <div className="container mx-auto px-4">
            <Link
              href="/signals"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-brand"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Signals
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="border-b border-white/5 bg-surface-50 py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left: Signal Info */}
              <div className="lg:col-span-2">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-lg shadow-brand/20">
                    <FileCode className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white md:text-4xl">
                      {signal.title}
                    </h1>
                    <div className="mt-2 flex items-center gap-3 text-sm text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {createdDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-4 w-4" />
                        {fileSizeMB} MB
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="text-lg text-zinc-300 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={decodeHtml(signal.description)}
                />
              </div>

              {/* Right: Download Card */}
              <div className="lg:col-span-1">
                <div className="sticky top-20 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <div className="mb-4 text-center">
                    <div className="text-3xl font-bold text-white">Free</div>
                    <div className="text-sm text-zinc-500">Download</div>
                  </div>

                  <a
                    href={`/api/download/${signal.uuid}`}
                    className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 font-semibold text-white transition-all hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/20"
                  >
                    <Download className="h-5 w-5" />
                    Download Now
                  </a>

                  <div className="space-y-2 border-t border-white/5 pt-4 text-sm">
                    <div className="flex justify-between text-zinc-400">
                      <span>File Type:</span>
                      <span className="font-medium text-white">
                        {signal.mime.split('/')[1]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Platform:</span>
                      <span className="font-medium text-white">
                        {signal.mime.includes('mq4') ? 'MetaTrader 4' : signal.mime.includes('mq5') ? 'MetaTrader 5' : 'Expert Advisor'}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Size:</span>
                      <span className="font-medium text-white">{fileSizeMB} MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <h2 className="mb-6 text-2xl font-bold text-white">About This Signal</h2>

              <div className="space-y-6 text-zinc-300">
                <div>
                  <h3 className="mb-2 font-semibold text-white">Description</h3>
                  <div
                    className="leading-relaxed prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={decodeHtml(signal.description)}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 font-semibold text-white">File Information</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-zinc-400">UUID:</span>
                        <span className="font-mono text-xs text-zinc-300">{signal.uuid}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-zinc-400">MIME Type:</span>
                        <span className="text-zinc-300">{signal.mime}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-zinc-400">Size:</span>
                        <span className="text-zinc-300">{signal.sizeBytes.toLocaleString()} bytes</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-2 font-semibold text-white">Installation</h3>
                    <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-400">
                      <li>Download the file</li>
                      <li>Open MetaTrader platform</li>
                      <li>Go to File → Open Data Folder</li>
                      <li>Copy file to MQL4/Experts or MQL5/Experts</li>
                      <li>Restart MetaTrader</li>
                    </ol>
                  </div>
                </div>

                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-yellow-500">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Risk Warning
                  </h3>
                  <p className="text-sm text-yellow-200/80">
                    Trading forex and CFDs involves significant risk. Always test strategies on a demo account before live trading. Past performance does not guarantee future results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
