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
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                    Welcome back, {userName}! 👋
                </h1>
                <p className="text-zinc-400 mt-1">Here's what's happening with your account today.</p>
            </div>

            {/* Stats Grid - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                    title="Total Downloads"
                    value={stats.downloads}
                    icon={Download}
                    description=""
                />
                <StatsCard
                    title="Saved Articles"
                    value={stats.savedArticles}
                    icon={Bookmark}
                    description=""
                />
                <StatsCard
                    title="Recently Viewed"
                    value={recentBlogs.length}
                    icon={Eye}
                    description=""
                />
            </div>

            {/* Two Column Layout - Recent Downloads & Recently Viewed side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Downloads */}
                <div className="bg-[#0d0d14] rounded-xl border border-white/10 p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <FileDown className="h-5 w-5 text-brand" />
                            Recent Downloads
                        </h2>
                        <Link href="/dashboard/downloads" className="text-sm text-brand hover:underline flex items-center gap-1">
                            View all <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto max-h-[280px] space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">
                        {recentDownloads.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                                        <Download className="h-4 w-4 text-brand" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{item.title}</p>
                                        <p className="text-xs text-zinc-500">{item.type}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-500 shrink-0 ml-2">{formatTimeAgo(item.createdAt)}</p>
                            </div>
                        ))}
                    </div>

                    {recentDownloads.length === 0 && (
                        <div className="text-center py-12 text-zinc-500">
                            <Download className="h-10 w-10 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No downloads yet</p>
                            <Link href="/downloads" className="text-brand text-sm hover:underline mt-2 inline-block">
                                Browse downloads
                            </Link>
                        </div>
                    )}
                </div>

                {/* Recently Viewed */}
                <div className="bg-[#0d0d14] rounded-xl border border-white/10 p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Eye className="h-5 w-5 text-brand" />
                            Recently Viewed
                        </h2>
                        <Link href="/blog" className="text-sm text-brand hover:underline flex items-center gap-1">
                            Browse more <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto max-h-[280px] space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">
                        {recentBlogs.map((item) => (
                            <Link
                                key={item.id}
                                href={`/blog/${item.blog.seoSlug}`}
                                className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                            >
                                <div className="w-2 h-2 rounded-full bg-brand mt-2 shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-white truncate group-hover:text-brand transition-colors">
                                        {item.blog.title}
                                    </p>
                                    <p className="text-xs text-zinc-500">Viewed {formatTimeAgo(item.visitedAt)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {recentBlogs.length === 0 && (
                        <div className="text-center py-12 text-zinc-500">
                            <Eye className="h-10 w-10 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No recently viewed blogs</p>
                            <Link href="/blog" className="text-brand text-sm hover:underline mt-2 inline-block">
                                Start reading
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions - Horizontal buttons at bottom */}
            <div className="bg-[#0d0d14] rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/downloads"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
                    >
                        Browse EAs
                    </Link>
                    <Link
                        href="/dashboard/saved"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                        View Saved
                    </Link>
                    <Link
                        href="/dashboard/profile"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                        Edit Profile
                    </Link>
                </div>
            </div>
        </div>
    );
}
