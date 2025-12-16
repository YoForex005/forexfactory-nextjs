"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, X, LogIn, UserPlus } from "lucide-react";
import { isLoggedIn, getUser } from "@/lib/auth-client";

interface DownloadBoxProps {
    downloadLink: string;
}

export function DownloadBox({ downloadLink }: DownloadBoxProps) {
    const [showModal, setShowModal] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check auth status on mount
        setIsAuthenticated(isLoggedIn());
    }, []);

    const handleDownloadClick = async () => {
        if (isAuthenticated) {
            // Log download
            const token = localStorage.getItem("auth_token");
            if (token) {
                try {
                    await fetch("/api/user/downloads", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            title: "Download from Blog",
                            type: "Resource",
                            fileSize: "Unknown"
                        })
                    });
                } catch (e) {
                    console.error("Failed to log download", e);
                }
            }

            // User is logged in, allow download
            window.open(downloadLink, "_blank");
        } else {
            // Show login modal
            setShowModal(true);
        }
    };

    return (
        <>
            {/* Download Box */}
            <div className="mt-8 p-8 bg-gradient-to-br from-[#0d0d14] to-[#12121a] rounded-2xl border border-brand/20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-brand/10 border border-brand/20">
                    <Download className="h-8 w-8 text-brand" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Download Files</h3>
                <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">
                    Get the Expert Advisor, indicator, or resources mentioned in this article.
                </p>
                <button
                    onClick={handleDownloadClick}
                    className="inline-flex items-center gap-2 px-8 py-3 text-base font-semibold text-white bg-brand hover:bg-brand/90 rounded-xl transition-all shadow-lg shadow-brand/20 hover:shadow-brand/30"
                >
                    <Download className="h-5 w-5" />
                    Download Now
                </button>
                {isAuthenticated && (
                    <p className="mt-3 text-xs text-green-400">✓ You are logged in</p>
                )}
            </div>

            {/* Login Required Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-[#0d0d14] rounded-2xl border border-white/10 p-8 max-w-md w-full shadow-2xl">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Content */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-brand/10 border border-brand/20">
                                <LogIn className="h-8 w-8 text-brand" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
                            <p className="text-sm text-zinc-400 mb-6">
                                Please log in or create an account to download this file.
                            </p>

                            {/* Buttons */}
                            <div className="space-y-3">
                                <Link
                                    href="/login"
                                    className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg bg-brand text-sm font-semibold text-white hover:bg-brand/90 transition-colors"
                                >
                                    <LogIn className="h-4 w-4" />
                                    Log in
                                </Link>
                                <Link
                                    href="/signup"
                                    className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Create Account
                                </Link>
                            </div>

                            <p className="mt-4 text-xs text-zinc-500">
                                Free downloads for registered users
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
