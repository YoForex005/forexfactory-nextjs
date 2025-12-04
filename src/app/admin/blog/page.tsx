"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, Search, Loader2 } from "lucide-react";

interface Blog {
  id: number;
  title: string;
  seoSlug: string;
  status: string;
  createdAt: string;
  views: number | null;
  author: string;
}

export default function AdminBlogListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
      return;
    }

    if (status === "authenticated") {
      fetchBlogs();
    }
  }, [status, router]);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/admin/blog");
      if (!response.ok) throw new Error("Failed to fetch blogs");
      const data = await response.json();
      setBlogs(data.blogs || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Blog Posts</h1>
            <p className="mt-1 text-sm text-zinc-400">{blogs.length} total posts</p>
          </div>
          <Link
            href="/admin/blog/new"
            className="flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 font-medium text-white transition-colors hover:bg-brand-dark"
          >
            <Plus className="h-5 w-5" />
            New Post
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search posts..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <select className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20">
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
          </select>
        </div>

        {/* Blog List */}
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Author
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Views
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {blogs.map((blog) => (
                  <tr key={blog.id} className="transition-colors hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{blog.title}</div>
                      <div className="text-sm text-zinc-500">/{blog.seoSlug}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {blog.author}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          blog.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {blog.views || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/blog/${blog.seoSlug}`}
                          target="_blank"
                          className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/blog/${blog.id}/edit`}
                          className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-brand"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
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
        </div>

        {blogs.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-zinc-400">No blog posts yet. Create your first post!</p>
            <Link
              href="/admin/blog/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 font-medium text-white transition-colors hover:bg-brand-dark"
            >
              <Plus className="h-5 w-5" />
              Create First Post
            </Link>
          </div>
        )}
      </div>
  );
}
