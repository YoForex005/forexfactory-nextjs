import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileText, Download, TrendingUp, Users } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  // Fetch dashboard stats with error handling
  let blogCount = 0;
  let signalCount = 0;
  let recentBlogs: any[] = [];
  let dbError = null;

  try {
    [blogCount, signalCount, recentBlogs] = await Promise.all([
      prisma.blog.count(),
      prisma.signal.count(),
      prisma.blog.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          views: true,
        },
      }),
    ]);
  } catch (error) {
    console.error("Database connection failed:", error);
    dbError = "Unable to connect to the database. Please check your connection.";
  }

  return (
    <div className="p-6 lg:p-8">
      {dbError && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          <p className="font-medium">Connection Error</p>
          <p className="text-sm">{dbError}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <FileText className="h-8 w-8 text-brand" />
            <span className="text-sm text-zinc-500">Total</span>
          </div>
          <div className="text-3xl font-bold text-white">{blogCount}</div>
          <div className="text-sm text-zinc-400">Blog Posts</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <Download className="h-8 w-8 text-purple-400" />
            <span className="text-sm text-zinc-500">Total</span>
          </div>
          <div className="text-3xl font-bold text-white">{signalCount}</div>
          <div className="text-sm text-zinc-400">Signals/EAs</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <TrendingUp className="h-8 w-8 text-emerald-400" />
            <span className="text-sm text-zinc-500">This Month</span>
          </div>
          <div className="text-3xl font-bold text-white">-</div>
          <div className="text-sm text-zinc-400">Page Views</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <Users className="h-8 w-8 text-yellow-400" />
            <span className="text-sm text-zinc-500">Active</span>
          </div>
          <div className="text-3xl font-bold text-white">-</div>
          <div className="text-sm text-zinc-400">Users</div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-6 text-xl font-bold text-white">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/blog/new"
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:border-brand/50 hover:bg-white/10"
            >
              <FileText className="h-5 w-5 text-brand" />
              <div>
                <div className="font-medium text-white">New Blog Post</div>
                <div className="text-xs text-zinc-500">Create article</div>
              </div>
            </Link>

            <Link
              href="/admin/signals/new"
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:border-purple-400/50 hover:bg-white/10"
            >
              <Download className="h-5 w-5 text-purple-400" />
              <div>
                <div className="font-medium text-white">Upload Signal/EA</div>
                <div className="text-xs text-zinc-500">Add new file</div>
              </div>
            </Link>

            <Link
              href="/admin/blog"
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:border-emerald-400/50 hover:bg-white/10"
            >
              <FileText className="h-5 w-5 text-emerald-400" />
              <div>
                <div className="font-medium text-white">Manage Blogs</div>
                <div className="text-xs text-zinc-500">View all posts</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-6 text-xl font-bold text-white">Recent Posts</h2>
          <div className="space-y-4">
            {recentBlogs.map((blog) => (
              <div key={blog.id} className="flex items-start justify-between gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <Link href={`/admin/blog/${blog.id}/edit`} className="font-medium text-white hover:text-brand line-clamp-1">
                    {blog.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{blog.views || 0} views</span>
                  </div>
                </div>
                <span
                  className={`shrink-0 inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    blog.status === "published"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-yellow-500/10 text-yellow-400"
                  }`}
                >
                  {blog.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
