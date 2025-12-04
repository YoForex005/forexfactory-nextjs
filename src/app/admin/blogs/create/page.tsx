"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function CreateBlogPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      seoSlug: formData.get("seoSlug"),
      author: formData.get("author"),
      content: formData.get("content"),
      featuredImage: formData.get("featuredImage"),
      tags: formData.get("tags"),
      categoryId: parseInt(formData.get("categoryId") as string) || 1, // Default to 1 for now
      status: formData.get("status"),
    };

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to create post");
      }

      router.push("/admin/blogs");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/blogs"
          className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Create New Post</h1>
          <p className="text-zinc-400">Write and publish a new article.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6 rounded-2xl border border-white/10 bg-surface-100 p-6">
          {error && (
            <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Title</label>
              <input
                name="title"
                required
                className="w-full rounded-lg border border-white/10 bg-surface-50 px-4 py-2 text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand placeholder:text-zinc-600"
                placeholder="Enter post title"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Slug (SEO)</label>
              <input
                name="seoSlug"
                required
                className="w-full rounded-lg border border-white/10 bg-surface-50 px-4 py-2 text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand placeholder:text-zinc-600"
                placeholder="enter-post-slug"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Author</label>
              <input
                name="author"
                required
                defaultValue="ForexFactory Team"
                className="w-full rounded-lg border border-white/10 bg-surface-50 px-4 py-2 text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Status</label>
              <select
                name="status"
                className="w-full rounded-lg border border-white/10 bg-surface-50 px-4 py-2 text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Featured Image URL</label>
            <input
              name="featuredImage"
              required
              className="w-full rounded-lg border border-white/10 bg-surface-50 px-4 py-2 text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand placeholder:text-zinc-600"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Tags (comma separated)</label>
            <input
              name="tags"
              className="w-full rounded-lg border border-white/10 bg-surface-50 px-4 py-2 text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand placeholder:text-zinc-600"
              placeholder="forex, trading, ea"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Content (HTML)</label>
            <textarea
              name="content"
              required
              rows={12}
              className="w-full rounded-lg border border-white/10 bg-surface-50 px-4 py-2 text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand placeholder:text-zinc-600 font-mono text-sm"
              placeholder="<p>Write your content here...</p>"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Publish Post
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
