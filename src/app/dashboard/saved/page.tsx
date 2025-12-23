"use client";

import { Bookmark, Trash2, ExternalLink, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth-client";
import { format } from "date-fns";

interface SavedArticle {
    id: number;
    blogId: number;
    createdAt: string;
    blog: {
        id: number;
        title: string;
        seoSlug: string;
        content: string;
        tags: string;
    };
}

export default function SavedArticlesPage() {
    const [articles, setArticles] = useState<SavedArticle[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [removingId, setRemovingId] = useState<number | null>(null);

    useEffect(() => {
        fetchSavedArticles();
    }, []);

    const fetchSavedArticles = async () => {
        const token = getToken();
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/user/saved", {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            });

            if (res.ok) {
                const data = await res.json();
                setArticles(data.savedArticles);
            }
        } catch (error) {
            console.error("Failed to fetch saved articles:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (blogId: number) => {
        const token = getToken();
        if (!token) return;

        setRemovingId(blogId);

        try {
            const res = await fetch(`/api/user/saved?blogId=${blogId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setArticles(articles.filter(a => a.blogId !== blogId));
            }
        } catch (error) {
            console.error("Failed to remove article:", error);
        } finally {
            setRemovingId(null);
        }
    };

    const getExcerpt = (content: string) => {
        // Strip HTML tags and get first 120 characters
        const text = content.replace(/<[^>]*>/g, "");
        return text.length > 120 ? text.slice(0, 120) + "..." : text;
    };

    const getCategory = (tags: string) => {
        const tagList = tags.split(",");
        return tagList[0]?.trim() || "Article";
    };

    const filteredArticles = articles.filter(article =>
        article.blog.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Saved Articles</h1>
                <p className="text-zinc-400">Your bookmarked articles for later reading</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search saved articles..."
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
            </div>

            {/* Articles Grid */}
            {filteredArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredArticles.map((article) => (
                        <div key={article.id} className="bg-[#0d0d14] rounded-xl border border-white/10 p-6 hover:border-white/20 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <span className="text-xs font-medium text-brand bg-brand/10 px-2 py-1 rounded">
                                    {getCategory(article.blog.tags)}
                                </span>
                                <button
                                    onClick={() => handleRemove(article.blogId)}
                                    disabled={removingId === article.blogId}
                                    className="text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-50"
                                    title="Remove from saved"
                                >
                                    {removingId === article.blogId ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                                {article.blog.title}
                            </h3>
                            <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                                {getExcerpt(article.blog.content)}
                            </p>

                            <div className="flex items-center justify-between">
                                <span className="text-xs text-zinc-500">
                                    Saved {format(new Date(article.createdAt), "MMM d, yyyy")}
                                </span>
                                <Link
                                    href={`/blog/${article.blog.seoSlug}`}
                                    className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
                                >
                                    Read
                                    <ExternalLink className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-[#0d0d14] rounded-xl border border-white/10">
                    <Bookmark className="h-16 w-16 mx-auto mb-4 text-zinc-700" />
                    <h3 className="text-lg font-medium text-white mb-2">No saved articles</h3>
                    <p className="text-zinc-500 mb-4">
                        Articles you save will appear here for easy access
                    </p>
                    <Link href="/blog" className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 transition-colors">
                        Browse Articles
                    </Link>
                </div>
            )}

            {/* Info Card */}
            {articles.length > 0 && (
                <div className="bg-brand/10 border border-brand/20 rounded-xl p-4 flex items-center gap-4">
                    <Bookmark className="h-8 w-8 text-brand" />
                    <div>
                        <p className="text-sm font-medium text-white">
                            You have {articles.length} saved article{articles.length !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-zinc-400">
                            Bookmark articles by clicking the save icon on any blog post
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
