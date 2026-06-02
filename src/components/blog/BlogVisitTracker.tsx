"use client";

import { useEffect } from "react";
import { getToken } from "@/lib/auth-client";

interface BlogVisitTrackerProps {
    blogId: bigint | number | string;
}

export function BlogVisitTracker({ blogId }: BlogVisitTrackerProps) {
    useEffect(() => {
        const token = getToken();
        if (!token) return;

        // Track the blog visit
        fetch("/api/user/recent-blogs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ blogId: Number(blogId) }),
        }).catch((error) => {
            console.error("Failed to track blog visit:", error);
        });
    }, [blogId]);

    // This component doesn't render anything
    return null;
}
