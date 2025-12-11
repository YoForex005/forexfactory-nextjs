import Link from "next/link";
import { Signal } from "@prisma/client";
import { Download, FileCode, Calendar } from "lucide-react";

interface SignalCardProps {
  signal: Signal;
}

export function SignalCard({ signal }: SignalCardProps) {
  const fileSizeMB = (signal.sizeBytes / (1024 * 1024)).toFixed(2);
  const createdDate = new Date(signal.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Helper to handle multiple levels of escaped HTML from database
  const createMarkup = (htmlContent: string) => {
    let decoded = htmlContent;
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
    <Link
      href={`/signals/${signal.uuid}`}
      className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-brand/50 hover:bg-white/10 hover:shadow-xl hover:shadow-brand/5"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-lg shadow-brand/20">
          <FileCode className="h-7 w-7" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="rounded-full bg-surface-50 px-3 py-1 text-xs font-medium text-zinc-400 border border-white/5">
            {fileSizeMB} MB
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Calendar className="h-3 w-3" />
            {createdDate}
          </div>
        </div>
      </div>

      <h3 className="mb-2 text-lg font-bold text-white group-hover:text-brand transition-colors line-clamp-2">
        {signal.title}
      </h3>

      <div
        className="mb-4 flex-1 text-sm text-zinc-400 line-clamp-3"
        dangerouslySetInnerHTML={createMarkup(signal.description)}
      />

      <div className="mt-auto space-y-3">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="rounded-md bg-white/5 px-2 py-1 font-mono">
            {signal.mime.includes('mq4') ? 'MT4' : signal.mime.includes('mq5') ? 'MT5' : 'EA'}
          </span>
          <span className="rounded-md bg-white/5 px-2 py-1">
            {signal.mime.split('/')[1]?.toUpperCase() || 'FILE'}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex items-center gap-2 text-sm font-medium text-brand">
            <Download className="h-4 w-4" />
            <span>Download</span>
          </div>
          <span className="text-sm font-bold text-white">Free</span>
        </div>
      </div>
    </Link>
  );
}
