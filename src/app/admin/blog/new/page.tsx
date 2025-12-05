"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { FileUpload } from "@/components/admin/FileUpload";
import { Save, Eye, ArrowLeft, ChevronDown, Search } from "lucide-react";
import Link from "next/link";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ categoryId: number; name: string }[]>([]);
  const [seoExpanded, setSeoExpanded] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    featuredImage: "",
    author: "Admin",
    tags: "",
    categoryId: "",
    downloadLink: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    seoSlug: "",
    canonicalUrl: "",
    metaRobots: "index, follow",
    ogTitle: "",
    ogDescription: "",
    status: "draft" as "draft" | "published",
  });

  // Fetch categories on mount
  useEffect(() => {
    fetch("/api/admin/categories")
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

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


          {/* Category Selection */}
          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-medium text-zinc-300">
              Category
            </label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => handleChange("categoryId", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option value="" className="bg-zinc-900 text-white">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId} className="bg-zinc-900 text-white">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* SEO Settings - Full Width */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <button
              type="button"
              onClick={() => setSeoExpanded(!seoExpanded)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-brand" />
                <span className="text-lg font-semibold text-white">SEO Settings</span>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-zinc-400 transition-transform ${seoExpanded ? "rotate-180" : ""
                  }`}
              />
            </button>

            {seoExpanded && (
              <div className="border-t border-white/10 p-6 space-y-6">
                {/* Row 1: SEO Title and SEO Keywords */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="seoTitle" className="mb-2 block text-sm font-medium text-zinc-300">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      id="seoTitle"
                      value={formData.seoTitle}
                      onChange={(e) => handleChange("seoTitle", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      placeholder="Enter SEO title..."
                    />
                    <p className="mt-1.5 text-xs text-zinc-500">Keep it under 60 characters</p>
                  </div>

                  <div>
                    <label htmlFor="seoKeywords" className="mb-2 block text-sm font-medium text-zinc-300">
                      SEO Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      id="seoKeywords"
                      value={formData.seoKeywords}
                      onChange={(e) => handleChange("seoKeywords", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </div>

                {/* SEO Description */}
                <div>
                  <label htmlFor="seoDescription" className="mb-2 block text-sm font-medium text-zinc-300">
                    SEO Description
                  </label>
                  <textarea
                    id="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) => handleChange("seoDescription", e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    placeholder="Enter SEO description..."
                  />
                  <p className="mt-1.5 text-xs text-zinc-500">Keep it under 160 characters</p>
                </div>

                {/* Row 2: SEO Slug and Canonical URL */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="seoSlug" className="mb-2 block text-sm font-medium text-zinc-300">
                      SEO Slug
                    </label>
                    <input
                      type="text"
                      id="seoSlug"
                      value={formData.seoSlug}
                      onChange={(e) => handleChange("seoSlug", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      placeholder="my-blog-post-slug"
                    />
                  </div>

                  <div>
                    <label htmlFor="canonicalUrl" className="mb-2 block text-sm font-medium text-zinc-300">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      id="canonicalUrl"
                      value={formData.canonicalUrl}
                      onChange={(e) => handleChange("canonicalUrl", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      placeholder="https://example.com/canonical-url"
                    />
                  </div>
                </div>

                {/* Meta Robots */}
                <div>
                  <label htmlFor="metaRobots" className="mb-2 block text-sm font-medium text-zinc-300">
                    Meta Robots
                  </label>
                  <select
                    id="metaRobots"
                    value={formData.metaRobots}
                    onChange={(e) => handleChange("metaRobots", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="index, follow" className="bg-zinc-900 text-white">Index, Follow</option>
                    <option value="noindex, follow" className="bg-zinc-900 text-white">No Index, Follow</option>
                    <option value="index, nofollow" className="bg-zinc-900 text-white">Index, No Follow</option>
                    <option value="noindex, nofollow" className="bg-zinc-900 text-white">No Index, No Follow</option>
                  </select>
                </div>

                {/* OG Title */}
                <div>
                  <label htmlFor="ogTitle" className="mb-2 block text-sm font-medium text-zinc-300">
                    OG Title
                  </label>
                  <input
                    type="text"
                    id="ogTitle"
                    value={formData.ogTitle}
                    onChange={(e) => handleChange("ogTitle", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    placeholder="Open Graph title for social sharing"
                  />
                </div>

                {/* OG Description */}
                <div>
                  <label htmlFor="ogDescription" className="mb-2 block text-sm font-medium text-zinc-300">
                    OG Description
                  </label>
                  <textarea
                    id="ogDescription"
                    value={formData.ogDescription}
                    onChange={(e) => handleChange("ogDescription", e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    placeholder="Open Graph description for social sharing"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured Image */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 font-semibold text-white">Featured Image</h3>
            <FileUpload
              onUploadComplete={(url, filename, localPreview) => {
                handleChange("featuredImage", url);
              }}
              accept={{ "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] }}
              folder="admin/media"
              label=""
              description="Upload featured image"
            />
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

          {/* Download Link */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 font-semibold text-white">Download Link</h3>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <input
                type="url"
                id="downloadLink"
                value={formData.downloadLink}
                onChange={(e) => handleChange("downloadLink", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 pl-12 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="https://example.com/download/file.zip"
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500">Enter the URL where users can download the file</p>
          </div>
        </div>
      </div>



      {/* Bottom Action Buttons */}
      <div className="mt-8 flex justify-end gap-3">
        <Link
          href="/admin/blog"
          className="rounded-lg border border-white/10 bg-white/5 px-8 py-3 font-medium text-white transition-colors hover:bg-white/10"
        >
          Cancel
        </Link>
        <button
          onClick={(e) => handleSubmit(e, "published")}
          disabled={saving || !formData.title || !formData.content}
          className="rounded-lg bg-brand px-8 py-3 font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Publishing..." : "Publish Post"}
        </button>
      </div>
    </div>
  );
}
