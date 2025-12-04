"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { FileUpload } from "@/components/admin/FileUpload";
import { Save, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    featuredImage: "",
    author: "Admin",
    tags: "",
    status: "draft" as "draft" | "published",
  });

  const handleSubmit = async (e: React.FormEvent, status: "draft" | "published") => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const data = await response.json();
      router.push("/admin/blog");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AdminLayout user={{ name: "Admin", role: "Administrator" }}>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/blog"
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Create New Post</h1>
              <p className="mt-1 text-sm text-zinc-400">Write and publish a new blog post</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={(e) => handleSubmit(e, "draft")}
              disabled={saving || !formData.title}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              Save Draft
            </button>
            <button
              onClick={(e) => handleSubmit(e, "published")}
              disabled={saving || !formData.title || !formData.content}
              className="flex items-center gap-2 rounded-lg bg-brand px-6 py-3 font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
            >
              <Eye className="h-5 w-5" />
              Publish
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-zinc-300">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-2xl font-bold text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="Enter post title..."
                required
              />
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="mb-2 block text-sm font-medium text-zinc-300">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => handleChange("excerpt", e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="Brief description of the post..."
              />
            </div>

            {/* Content Editor */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Content *
              </label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => handleChange("content", content)}
                placeholder="Start writing your post..."
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Image */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 font-semibold text-white">Featured Image</h3>
              <FileUpload
                onUploadComplete={(url) => handleChange("featuredImage", url)}
                accept={{ "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] }}
                folder="blog-images"
                label=""
                description="Upload featured image"
              />
              {formData.featuredImage && (
                <div className="mt-4 aspect-video overflow-hidden rounded-lg bg-zinc-800">
                  <img
                    src={formData.featuredImage}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Author */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 font-semibold text-white">Author</h3>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => handleChange("author", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="Author name..."
              />
            </div>

            {/* Tags */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 font-semibold text-white">Tags</h3>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="trading, forex, ea (comma separated)"
              />
              <p className="mt-2 text-xs text-zinc-500">Separate tags with commas</p>
            </div>

            {/* SEO Preview */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 font-semibold text-white">SEO Preview</h3>
              <div className="space-y-2">
                <div className="text-sm text-brand">forexfactory.cc › blog</div>
                <div className="font-medium text-white line-clamp-1">
                  {formData.title || "Your Post Title"}
                </div>
                <div className="text-sm text-zinc-400 line-clamp-2">
                  {formData.excerpt || "Your post excerpt will appear here..."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
