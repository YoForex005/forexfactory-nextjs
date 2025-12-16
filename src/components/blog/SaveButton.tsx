"use client";

import { useState, useEffect } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { isLoggedIn, getToken } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface SaveButtonProps {
    blogId: number;
}

export function SaveButton({ blogId }: SaveButtonProps) {
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isToggling, setIsToggling] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkSavedStatus();
    }, [blogId]);

    const checkSavedStatus = async () => {
        const token = getToken();
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/user/saved", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                // Check if any mock article matches this blog id (flexible check)
                const saved = data.savedArticles.some((a: any) => Number(a.blogId) === Number(blogId));
                setIsSaved(saved);
            }
        } catch (error) {
            console.error("Failed to check saved status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleSave = async () => {
        if (!isLoggedIn()) {
            router.push("/login?from=" + window.location.pathname);
            return;
        }

        setIsToggling(true);
        const token = getToken();

        try {
            if (isSaved) {
                // Remove
                const res = await fetch(`/api/user/saved?blogId=${blogId}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) setIsSaved(false);
            } else {
                // Save
                const res = await fetch("/api/user/saved", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ blogId }),
                });
                if (res.ok) setIsSaved(true);
            }
        } catch (error) {
            console.error("Failed to toggle save:", error);
        } finally {
            setIsToggling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-20 h-9 bg-white/5 rounded-lg animate-pulse" />
        );
    }

    return (
        <button
            onClick={handleToggleSave}
            disabled={isToggling}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all ${isSaved
                ? "bg-brand text-white border-brand hover:bg-brand/90"
                : "text-zinc-300 bg-white/5 hover:bg-white/10 border-white/10"
                }`}
        >
            {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            )}
            {isSaved ? "Saved" : "Save"}
        </button>
    );
}
