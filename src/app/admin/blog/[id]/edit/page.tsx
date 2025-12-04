"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Save, Eye, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    featuredImage: "",
    author: "Admin",
    tags: "",
    status: "draft" as "draft" | "published",
    // SEO Fields
    seoSlug: "",
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "",
  });

  useEffect(() => {
    fetchBlogPost();
  }, [params.id]);

  const fetchBlogPost = async () => {
    try {
      const response = await fetch(`/api/admin/blog/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch post");
      
      const data = await response.json();
      setFormData({
        title: data.title || "",
        content: data.content || "",
        excerpt: data.excerpt || "",
        featuredImage: data.featuredImage || "",
        author: data.author || "Admin",
        tags: data.tags || "",
        status: data.status || "draft",
        // SEO Fields
        seoSlug: data.seoSlug || "",
        metaTitle: data.seoMeta?.[0]?.seoTitle || "",
        metaDescription: data.seoMeta?.[0]?.seoDescription || "",
        canonicalUrl: data.seoMeta?.[0]?.canonicalUrl || "",
      });
    } catch (error) {
      console.error("Error fetching post:", error);
      alert("Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, status: "draft" | "published") => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: params.id,
          ...formData,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update post");
      }

      router.push("/admin/blog");
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blog?id=${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      router.push("/admin/blog");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <AdminLayout user={{ name: "Admin", role: "Administrator" }}>
        <div className="flex h-screen items-center justify-center">
          <div className="text-zinc-400">Loading post...</div>
        </div>
      </AdminLayout>
    );
  }

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
              <h1 className="text-3xl font-bold text-white">Edit Post</h1>
              <p className="mt-1 text-sm text-zinc-400">Update your blog post</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-6 py-3 font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              <Trash2 className="h-5 w-5" />
              Delete
            </button>
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
              {formData.status === "published" ? "Update" : "Publish"}
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
            {/* Status */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 font-semibold text-white">Status</h3>
              <div
                className={`inline-flex rounded-full px-4 py-2 text-sm font-medium ${
                  formData.status === "published"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-yellow-500/10 text-yellow-400"
                }`}
              >
                {formData.status === "published" ? "Published" : "Draft"}
              </div>
            </div>

            {/* Featured Image */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 font-semibold text-white">Featured Image</h3>
              <input
                type="text"
                value={formData.featuredImage}
                onChange={(e) => handleChange("featuredImage", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="Image URL..."
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

            {/* SEO Settings */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 font-semibold text-white">SEO Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">URL Slug</label>
                  <input
                    type="text"
                    value={formData.seoSlug}
                    onChange={(e) => handleChange("seoSlug", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/20"
                    placeholder="my-blog-post"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">Meta Title</label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => handleChange("metaTitle", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/20"
                    placeholder="SEO Title"
                  />
                  <p className="mt-1 text-xs text-zinc-500">{formData.metaTitle.length}/60</p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">Meta Description</label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) => handleChange("metaDescription", e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/20"
                    placeholder="SEO Description"
                  />
                  <p className="mt-1 text-xs text-zinc-500">{formData.metaDescription.length}/160</p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">Canonical URL</label>
                  <input
                    type="text"
                    value={formData.canonicalUrl}
                    onChange={(e) => handleChange("canonicalUrl", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/20"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
