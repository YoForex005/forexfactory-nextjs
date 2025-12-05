import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Trash2, Download, Search } from "lucide-react";

export default async function AdminSignalsListPage() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  const signals = await prisma.signal.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      uuid: true,
      title: true,
      description: true,
      sizeBytes: true,
      mime: true,
      createdAt: true,
    },
  });

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Signals & Expert Advisors</h1>
          <p className="mt-1 text-sm text-zinc-400">{signals.length} total files</p>
        </div>
        <Link
          href="/admin/signals/new"
          className="flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 font-medium text-white transition-colors hover:bg-brand-dark"
        >
          <Plus className="h-5 w-5" />
          Upload New
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search signals..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      {/* Signals Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {signals.map((signal) => {
          const fileSizeMB = (signal.sizeBytes / (1024 * 1024)).toFixed(2);
          return (
            <div
              key={signal.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-brand/50"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Download className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-zinc-400">
                  {fileSizeMB} MB
                </span>
              </div>

              <h3 className="mb-2 font-semibold text-white line-clamp-2">{signal.title}</h3>
              <p className="mb-4 text-sm text-zinc-400 line-clamp-2">{signal.description}</p>

              <div className="mb-4 flex items-center gap-2 text-xs text-zinc-500">
                <span className="rounded-md bg-white/5 px-2 py-1">
                  {signal.mime.includes('mq4') ? 'MT4' : signal.mime.includes('mq5') ? 'MT5' : 'EA'}
                </span>
                <span>{new Date(signal.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/signals/${signal.uuid}`}
                  target="_blank"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  View
                </Link>
                <Link
                  href={`/admin/signals/${signal.id}/edit`}
                  className="flex-1 rounded-lg border border-brand/50 bg-brand/10 px-4 py-2 text-center text-sm font-medium text-brand transition-colors hover:bg-brand/20"
                >
                  Edit
                </Link>
                <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {signals.length === 0 && (
        <div className="py-20 text-center">
          <Download className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
          <p className="text-zinc-400">No signals uploaded yet. Upload your first file!</p>
          <Link
            href="/admin/signals/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 font-medium text-white transition-colors hover:bg-brand-dark"
          >
            <Plus className="h-5 w-5" />
            Upload First Signal
          </Link>
        </div>
      )}
    </div>
  );
}

