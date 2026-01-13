"use client";

import { Download } from "lucide-react";

interface DownloadBoxProps {
    downloadLink?: string | null;  // Made optional - button shows even without link
}

export function DownloadBox({ downloadLink }: DownloadBoxProps) {
    const handleDownloadClick = () => {
        // Allow direct download without authentication
        if (downloadLink) {
            window.open(downloadLink, "_blank");
        } else {
            // No specific download link - redirect to signals/downloads page
            window.location.href = "/signals";
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
            </div>
        </>
    );
}
