"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { getUser, getToken } from "@/lib/auth-client";
import {
    Download,
    Bookmark,
    Calendar,
    Clock,
    ArrowRight,
    FileDown,
    BookOpen,
    Loader2,
    Eye
} from "lucide-react";
import { format } from "date-fns";

interface UserStats {
    downloads: number;
    savedArticles: number;
}

interface UserProfile {
    id: number;
    email: string;
    name: string | null;
    createdAt: string;
}

interface DownloadItem {
    id: number;
    title: string;
    type: string;
    createdAt: string;
}

interface RecentBlogItem {
    id: number;
    visitedAt: string;
    blog: {
        id: number;
        title: string;
        seoSlug: string;
        author: string;
    };
}

export default function DashboardPage() {
    const [userName, setUserName] = useState<string>("User");
    const [currentTime, setCurrentTime] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<UserStats>({ downloads: 0, savedArticles: 0 });
    const [memberSince, setMemberSince] = useState<string>("N/A");
    const [recentDownloads, setRecentDownloads] = useState<DownloadItem[]>([]);
    const [recentBlogs, setRecentBlogs] = useState<RecentBlogItem[]>([]);

    useEffect(() => {
        const user = getUser();
        setUserName(user?.name?.split(" ")[0] || "User");
        setCurrentTime(format(new Date(), "EEEE, MMMM d, yyyy"));

        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        const token = getToken();
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            // Fetch profile and stats
            const profileRes = await fetch("/api/user/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (profileRes.ok) {
                const data = await profileRes.json();
                setStats(data.stats);
                if (data.user.createdAt) {
                    setMemberSince(format(new Date(data.user.createdAt), "MMM yyyy"));
                }
            }

            // Fetch recent downloads
            const downloadsRes = await fetch("/api/user/downloads", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (downloadsRes.ok) {
                const data = await downloadsRes.json();
                setRecentDownloads(data.downloads.slice(0, 3));
            }

            // Fetch recent blogs
            const recentBlogsRes = await fetch("/api/user/recent-blogs?limit=5", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (recentBlogsRes.ok) {
                const data = await recentBlogsRes.json();
                setRecentBlogs(data.recentBlogs || []);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return "Just now";
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 1) return "Yesterday";
        return `${diffDays} days ago`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-brand/20 via-brand/10 to-transparent rounded-2xl border border-brand/20 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Welcome back, {userName}! 👋
                        </h1>
                        <p className="text-zinc-400">{currentTime}</p>
                    </div>
                    <div>
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors w-full md:w-auto justify-center"
                        >
                            Explore Content
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Downloads"
                    value={stats.downloads}
                    icon={Download}
                    description="All time"
                />
                <StatsCard
                    title="Saved Articles"
                    value={stats.savedArticles}
                    icon={Bookmark}
                    description="Bookmarked"
                />
                <StatsCard
                    title="Member Since"
                    value={memberSince}
                    icon={Calendar}
                    description="Active member"
                />
                <StatsCard
                    title="Last Active"
                    value="Today"
                    icon={Clock}
                    description="Recent activity"
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Downloads */}
                <div className="bg-[#0d0d14] rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <FileDown className="h-5 w-5 text-brand" />
                            Recent Downloads
                        </h2>
                        <Link href="/dashboard/downloads" className="text-sm text-brand hover:underline">
                            View all
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentDownloads.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                                        <Download className="h-5 w-5 text-brand" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{item.title}</p>
                                        <p className="text-xs text-zinc-500">{item.type}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-500">{formatTimeAgo(item.createdAt)}</p>
                            </div>
                        ))}
                    </div>

                    {recentDownloads.length === 0 && (
                        <div className="text-center py-8 text-zinc-500">
                            <Download className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No downloads yet</p>
                            <Link href="/downloads" className="text-brand text-sm hover:underline mt-2 inline-block">
                                Browse downloads
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-[#0d0d14] rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-brand" />
                            Quick Actions
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/downloads" className="flex flex-col items-center gap-3 p-6 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <Download className="h-8 w-8 text-brand" />
                            <span className="text-sm text-zinc-300">Browse EAs</span>
                        </Link>
                        <Link href="/blog" className="flex flex-col items-center gap-3 p-6 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <BookOpen className="h-8 w-8 text-brand" />
                            <span className="text-sm text-zinc-300">Read Articles</span>
                        </Link>
                        <Link href="/dashboard/saved" className="flex flex-col items-center gap-3 p-6 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <Bookmark className="h-8 w-8 text-brand" />
                            <span className="text-sm text-zinc-300">Saved Items</span>
                        </Link>
                        <Link href="/dashboard/profile" className="flex flex-col items-center gap-3 p-6 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <Calendar className="h-8 w-8 text-brand" />
                            <span className="text-sm text-zinc-300">My Profile</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Blogs Section */}
            <div className="bg-[#0d0d14] rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Eye className="h-5 w-5 text-brand" />
                        Recently Viewed Blogs
                    </h2>
                    <Link href="/blog" className="text-sm text-brand hover:underline">
                        Browse all
                    </Link>
                </div>

                <div className="space-y-3">
                    {recentBlogs.map((item) => (
                        <Link
                            key={item.id}
                            href={`/blog/${item.blog.seoSlug}`}
                            className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                                    <BookOpen className="h-5 w-5 text-brand" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate group-hover:text-brand transition-colors">
                                        {item.blog.title}
                                    </p>
                                    <p className="text-xs text-zinc-500">by {item.blog.author}</p>
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500 shrink-0 ml-4">
                                {formatTimeAgo(item.visitedAt)}
                            </p>
                        </Link>
                    ))}
                </div>

                {recentBlogs.length === 0 && (
                    <div className="text-center py-8 text-zinc-500">
                        <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No recently viewed blogs</p>
                        <Link href="/blog" className="text-brand text-sm hover:underline mt-2 inline-block">
                            Start reading
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
