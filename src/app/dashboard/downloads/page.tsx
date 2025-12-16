"use client";

import { Download, Search, Filter, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth-client";
import { format } from "date-fns";

interface DownloadItem {
    id: number;
    title: string;
    type: string;
    fileSize: string | null;
    createdAt: string;
}

export default function DownloadsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [downloads, setDownloads] = useState<DownloadItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDownloads();
    }, []);

    const fetchDownloads = async () => {
        const token = getToken();
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/user/downloads", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setDownloads(data.downloads);
            }
        } catch (error) {
            console.error("Failed to fetch downloads:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredDownloads = downloads.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalSize = downloads.reduce((acc, d) => {
        const size = parseFloat(d.fileSize || "0");
        return acc + size;
    }, 0);

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
                <h1 className="text-2xl font-bold text-white mb-2">My Downloads</h1>
                <p className="text-zinc-400">Track and manage all your downloaded files</p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search downloads..."
                        className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors">
                    <Filter className="h-4 w-4" />
                    Filter
                </button>
            </div>

            {/* Downloads Table */}
            <div className="bg-[#0d0d14] rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">File</th>
                                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Type</th>
                                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Size</th>
                                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Date</th>
                                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredDownloads.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                                                <Download className="h-5 w-5 text-brand" />
                                            </div>
                                            <span className="text-sm font-medium text-white">{item.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-zinc-400">{item.type}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-zinc-400">{item.fileSize || "N/A"}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-zinc-400">
                                            {format(new Date(item.createdAt), "MMM d, yyyy")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-xs font-medium hover:bg-brand/20 transition-colors">
                                            <Download className="h-3 w-3" />
                                            Re-download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredDownloads.length === 0 && (
                    <div className="text-center py-12 text-zinc-500">
                        <Download className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>{downloads.length === 0 ? "No downloads yet" : "No matching downloads"}</p>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0d0d14] rounded-lg border border-white/10 p-4 text-center">
                    <p className="text-2xl font-bold text-white">{downloads.length}</p>
                    <p className="text-xs text-zinc-500">Total Downloads</p>
                </div>
                <div className="bg-[#0d0d14] rounded-lg border border-white/10 p-4 text-center">
                    <p className="text-2xl font-bold text-white">
                        {downloads.filter(d => d.type === "Expert Advisor").length}
                    </p>
                    <p className="text-xs text-zinc-500">Expert Advisors</p>
                </div>
                <div className="bg-[#0d0d14] rounded-lg border border-white/10 p-4 text-center">
                    <p className="text-2xl font-bold text-white">
                        {downloads.filter(d => d.type === "Indicator").length}
                    </p>
                    <p className="text-xs text-zinc-500">Indicators</p>
                </div>
                <div className="bg-[#0d0d14] rounded-lg border border-white/10 p-4 text-center">
                    <p className="text-2xl font-bold text-white">{totalSize.toFixed(1)} MB</p>
                    <p className="text-xs text-zinc-500">Total Size</p>
                </div>
            </div>
        </div>
    );
}
