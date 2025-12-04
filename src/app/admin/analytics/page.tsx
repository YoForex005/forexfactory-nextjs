"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Eye, Download, FileText, ArrowUp } from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalBlogs: 0,
    totalSignals: 0,
    totalDownloads: 0,
    popularBlogs: [] as any[],
    popularSignals: [] as any[],
    recentActivity: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch blog stats
      const blogsRes = await fetch("/api/admin/blog");
      const blogsData = await blogsRes.json();

      // Fetch signal stats  
      const signalsRes = await fetch("/api/admin/signals");
      const signalsData = await signalsRes.json();

      // Calculate total views
      const totalViews = blogsData.blogs?.reduce((sum: number, blog: any) => sum + (blog.views || 0), 0) || 0;

      // Get popular blogs
      const popularBlogs = blogsData.blogs
        ?.sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
        .slice(0, 5) || [];

      setStats({
        totalViews,
        totalBlogs: blogsData.blogs?.length || 0,
        totalSignals: signalsData.signals?.length || 0,
        totalDownloads: Math.floor(Math.random() * 10000) + 5000, // Placeholder
        popularBlogs,
        popularSignals: [],
        recentActivity: [],
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-zinc-400">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-400">Track your site performance and engagement</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <Eye className="h-8 w-8 text-brand" />
              <div className="flex items-center gap-1 text-sm text-emerald-400">
                <ArrowUp className="h-4 w-4" />
                <span>12%</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalViews.toLocaleString()}</div>
            <div className="text-sm text-zinc-400">Total Views</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <FileText className="h-8 w-8 text-purple-400" />
              <div className="flex items-center gap-1 text-sm text-emerald-400">
                <ArrowUp className="h-4 w-4" />
                <span>8%</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalBlogs}</div>
            <div className="text-sm text-zinc-400">Blog Posts</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <Download className="h-8 w-8 text-emerald-400" />
              <div className="flex items-center gap-1 text-sm text-emerald-400">
                <ArrowUp className="h-4 w-4" />
                <span>15%</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalSignals}</div>
            <div className="text-sm text-zinc-400">Signals/EAs</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <TrendingUp className="h-8 w-8 text-yellow-400" />
              <div className="flex items-center gap-1 text-sm text-emerald-400">
                <ArrowUp className="h-4 w-4" />
                <span>23%</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalDownloads.toLocaleString()}</div>
            <div className="text-sm text-zinc-400">Downloads</div>
          </div>
        </div>

        {/* Popular Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Popular Blog Posts */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-6 text-xl font-bold text-white">Popular Blog Posts</h2>
            <div className="space-y-4">
              {stats.popularBlogs.length > 0 ? (
                stats.popularBlogs.map((blog, index) => (
                  <div key={blog.id} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-sm font-bold text-brand">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white line-clamp-1">{blog.title}</h3>
                      <div className="mt-1 flex items-center gap-3 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {blog.views || 0} views
                        </span>
                        <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">No blog posts yet</p>
              )}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-6 text-xl font-bold text-white">Traffic Sources</h2>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Direct</span>
                  <span className="font-medium text-white">45%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-[45%] bg-brand"></div>
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Search Engines</span>
                  <span className="font-medium text-white">30%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-[30%] bg-purple-400"></div>
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Social Media</span>
                  <span className="font-medium text-white">15%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-[15%] bg-emerald-400"></div>
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Referrals</span>
                  <span className="font-medium text-white">10%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-[10%] bg-yellow-400"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-8 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6">
          <h3 className="mb-2 font-semibold text-blue-400">Analytics Integration</h3>
          <p className="text-sm text-zinc-400">
            This is a basic analytics dashboard. For advanced analytics, integrate with Google Analytics, Plausible, or similar services.
            Traffic sources and growth percentages are placeholder data for demonstration.
          </p>
        </div>
      </div>
    </div>
  );
}
