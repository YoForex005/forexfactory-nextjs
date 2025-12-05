"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/admin/FileUpload";
import { Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewSignalPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    filePath: "",
    mime: "",
    sizeBytes: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/admin/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create signal");
      }

      router.push("/admin/signals");
    } catch (error) {
      console.error("Error creating signal:", error);
      alert("Failed to create signal. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (url: string, filename: string) => {
    // Extract file info
    const extension = filename.split(".").pop()?.toLowerCase() || "";
    const mimeTypes: Record<string, string> = {
      mq4: "application/x-mq4",
      mq5: "application/x-mq5",
      ex4: "application/x-ex4",
      ex5: "application/x-ex5",
      zip: "application/zip",
    };

    setFormData(prev => ({
      ...prev,
      filePath: url,
      mime: mimeTypes[extension] || "application/octet-stream",
    }));
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/signals"
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Upload New Signal/EA</h1>
            <p className="mt-1 text-sm text-zinc-400">Upload a new trading signal or Expert Advisor</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || !formData.title || !formData.filePath}
          className="flex items-center gap-2 rounded-lg bg-brand px-6 py-3 font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
        >
          <Upload className="h-5 w-5" />
          {saving ? "Uploading..." : "Upload Signal"}
        </button>
      </div>

      {/* Form */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium text-zinc-300">
              Signal/EA Name *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-xl font-bold text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              placeholder="Enter signal/EA name..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-zinc-300">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              placeholder="Describe the signal/EA, its features, strategy, and usage instructions..."
              required
            />
          </div>

          {/* File Upload */}
          <div>
            <FileUpload
              onUploadComplete={handleFileUpload}
              accept={{
                "application/*": [".mq4", ".mq5", ".ex4", ".ex5", ".zip"],
              }}
              folder="signals"
              label="Signal/EA File *"
              description="Upload .mq4, .mq5, .ex4, .ex5, or .zip file"
              maxSize={100 * 1024 * 1024} // 100MB
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* File Info */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 font-semibold text-white">File Information</h3>
            {formData.filePath ? (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-zinc-500">Status:</span>
                  <span className="ml-2 text-emerald-400">✓ Uploaded</span>
                </div>
                <div>
                  <span className="text-zinc-500">Type:</span>
                  <span className="ml-2 text-white">{formData.mime}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No file uploaded yet</p>
            )}
          </div>

          {/* Guidelines */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 font-semibold text-white">Upload Guidelines</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-brand">•</span>
                <span>Supported formats: .mq4, .mq5, .ex4, .ex5, .zip</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand">•</span>
                <span>Maximum file size: 100MB</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand">•</span>
                <span>Provide clear description and usage instructions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand">•</span>
                <span>Include strategy details and recommended settings</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
