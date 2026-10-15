"use client";

import { Eye } from "lucide-react";
import { useEffect, useState } from "react";

interface BlogViewCounterProps {
  blogId: bigint | number | string;
  initialViews: string;
}

interface ViewResponse {
  counted?: boolean;
  views?: string;
}

function formatViews(value: string) {
  try {
    return new Intl.NumberFormat("en-US").format(BigInt(value));
  } catch {
    return "0";
  }
}

/** Renders the exact value returned by the atomic database update. */
export function BlogViewCounter({ blogId, initialViews }: BlogViewCounterProps) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    let cancelled = false;
    const endpoint = `/api/blogs/${encodeURIComponent(String(blogId))}/view`;

    function applyDatabaseValue(value: string) {
      if (cancelled) return;

      // Counts only increase. Do not let a slower, older request overwrite a
      // newer value that has already arrived from the database.
      setViews((current) => {
        try {
          return BigInt(value) >= BigInt(current) ? value : current;
        } catch {
          return current;
        }
      });
    }

    async function refreshViews() {
      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        const data = (await response.json().catch(() => null)) as ViewResponse | null;
        if (response.ok && typeof data?.views === "string") {
          applyDatabaseValue(data.views);
        }
      } catch {
        // The initial server-rendered value remains visible during a transient outage.
      }
    }

    async function recordView() {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
        });
        const data = (await response.json().catch(() => null)) as ViewResponse | null;

        if (!cancelled && response.ok && data?.counted && typeof data.views === "string") {
          applyDatabaseValue(data.views);
        } else if (!response.ok && process.env.NODE_ENV === "development") {
          console.warn(`Blog view was not recorded (HTTP ${response.status}).`);
        }
      } catch {
        if (process.env.NODE_ENV === "development") {
          console.warn("Blog view was not recorded because the request failed.");
        }
      }
    }

    void recordView();
    void refreshViews();
    const refreshInterval = window.setInterval(() => void refreshViews(), 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(refreshInterval);
    };
  }, [blogId]);

  return (
    <div className="flex items-center gap-1.5">
      <Eye className="h-3.5 w-3.5 text-zinc-500" />
      <span>{formatViews(views)} views</span>
    </div>
  );
}
