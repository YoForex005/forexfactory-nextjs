import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, Edit, Trash2, Eye, FileText } from "lucide-react";

export default async function AdminBlogsPage() {
  const blogs = await prisma.blog.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Blog Posts</h1>
          <p className="text-zinc-400">Manage your articles and trading guides.</p>
        </div>
        <Link
          href="/admin/blogs/create"
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-50 text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Author</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Views</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {blogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-50 text-zinc-500">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{blog.title}</div>
                        <div className="text-xs text-zinc-500">/{blog.seoSlug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      blog.status === 'published' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{blog.author}</td>
                  <td className="px-6 py-4">
                    {format(new Date(blog.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4">{blog.views || 0}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/blog/${blog.seoSlug}`} 
                        target="_blank"
                        className="rounded-lg p-2 hover:bg-white/10 hover:text-white text-zinc-500"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link 
                        href={`/admin/blogs/edit/${blog.id}`}
                        className="rounded-lg p-2 hover:bg-white/10 hover:text-white text-zinc-500"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button className="rounded-lg p-2 hover:bg-red-500/10 hover:text-red-500 text-zinc-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No posts found. Create your first one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
