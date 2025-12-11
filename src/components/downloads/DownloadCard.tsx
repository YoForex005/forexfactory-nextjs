import Link from "next/link";
import { Signal } from "@prisma/client";
import { Download, FileCode } from "lucide-react";

interface DownloadCardProps {
  signal: Signal;
}

export function DownloadCard({ signal }: DownloadCardProps) {
  const fileSizeMB = (signal.sizeBytes / (1024 * 1024)).toFixed(2);

  // Helper to handle multiple levels of escaped HTML from database
  const createMarkup = (htmlContent: string) => {
    let decoded = htmlContent;
    // Decode up to 3 times to handle triple-escaped content
    for (let i = 0; i < 3; i++) {
      const current = decoded
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");

      if (current === decoded) break; // Stop if no changes
      decoded = current;
    }
    return { __html: decoded };
  };

  return (
    <Link
      href={`/downloads/${signal.uuid}`}
      className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-brand/50 hover:bg-white/10 hover:shadow-xl hover:shadow-brand/5"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
          <FileCode className="h-6 w-6" />
        </div>
        <div className="rounded-full bg-surface-50 px-3 py-1 text-xs font-medium text-zinc-400 border border-white/5">
          {fileSizeMB} MB
        </div>
      </div>

      <h3 className="mb-2 text-lg font-bold text-white group-hover:text-brand transition-colors">
        {signal.title}
      </h3>

      <div
        className="mb-4 flex-1 text-sm text-zinc-400 line-clamp-2"
        dangerouslySetInnerHTML={createMarkup(signal.description)}
      />

      <div className="mt-auto space-y-4">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="rounded-md bg-white/5 px-2 py-1">
            {signal.mime.includes('mq4') ? 'MT4' : signal.mime.includes('mq5') ? 'MT5' : 'EA'}
          </span>
          <span className="rounded-md bg-white/5 px-2 py-1">
            {new Date(signal.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Download className="h-4 w-4" />
            <span>Download</span>
          </div>
          <span className="text-sm font-bold text-brand">Free</span>
        </div>
      </div>
    </Link>
  );
}
