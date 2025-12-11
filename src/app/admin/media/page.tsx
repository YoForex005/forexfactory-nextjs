"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FileUpload } from "@/components/admin/FileUpload";
import { Image as ImageIcon, FileIcon, Trash2, Copy, Check, Upload, Search, Grid3x3, List } from "lucide-react";

interface MediaFile {
  id: number;
  fileName: string;
  filePath: string;
  uploadedAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function MediaManagerPage() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const response = await fetch("/api/admin/media");
      const data = await response.json();
      setMedia(data.media || []);
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/media?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete media");
      }

      await fetchMedia();
    } catch (error) {
      console.error("Error deleting media:", error);
      alert("Failed to delete media");
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleUploadComplete = async (url: string, filename: string) => {
    setShowUpload(false);
    await fetchMedia();
  };

  const filteredMedia = media.filter((file) =>
    file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isImage = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 bg-surface-100">
          <div className="flex h-screen items-center justify-center">
            <div className="text-zinc-400">Loading media...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-surface-100">
        <div className="container mx-auto p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Media Library</h1>
              <p className="mt-1 text-sm text-zinc-400">{media.length} files</p>
            </div>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 font-medium text-white transition-colors hover:bg-brand-dark"
            >
              <Upload className="h-5 w-5" />
              Upload Files
            </button>
          </div>

          {/* Upload Section */}
          {showUpload && (
            <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
              <FileUpload
                onUploadComplete={handleUploadComplete}
                accept={{
                  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
                  "application/*": [".pdf", ".zip", ".mq4", ".mq5"],
                }}
                folder="media"
                label="Upload Media"
                description="Upload images, documents, or files"
              />
            </div>
          )}

          {/* Toolbar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-lg border p-2 transition-colors ${viewMode === "grid"
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                  }`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg border p-2 transition-colors ${viewMode === "list"
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                  }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Media Grid/List */}
          {filteredMedia.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredMedia.map((file) => (
                  <div
                    key={file.id}
                    className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-colors hover:border-brand/50"
                  >
                    {/* Preview */}
                    <div className="aspect-video bg-zinc-800 flex items-center justify-center">
                      {isImage(file.fileName) ? (
                        <img
                          src={file.filePath}
                          alt={file.fileName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FileIcon className="h-12 w-12 text-zinc-600" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="mb-2 font-medium text-white line-clamp-1" title={file.fileName}>
                        {file.fileName}
                      </h3>
                      <p className="mb-4 text-xs text-zinc-500">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyUrl(file.filePath)}
                          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                        >
                          {copiedUrl === file.filePath ? (
                            <Check className="mx-auto h-4 w-4 text-emerald-400" />
                          ) : (
                            <Copy className="mx-auto h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="flex-1 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                        >
                          <Trash2 className="mx-auto h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                <table className="w-full">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                        File
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Uploaded
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredMedia.map((file) => (
                      <tr key={file.id} className="transition-colors hover:bg-white/5">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                              {isImage(file.fileName) ? (
                                <ImageIcon className="h-5 w-5 text-brand" />
                              ) : (
                                <FileIcon className="h-5 w-5 text-zinc-500" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-white">{file.fileName}</div>
                              <div className="text-xs text-zinc-500">{file.filePath}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-300">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleCopyUrl(file.filePath)}
                              className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                              title="Copy URL"
                            >
                              {copiedUrl === file.filePath ? (
                                <Check className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(file.id)}
                              className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="py-20 text-center">
              <ImageIcon className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
              <p className="text-zinc-400">
                {searchQuery ? "No files found matching your search" : "No files uploaded yet"}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
