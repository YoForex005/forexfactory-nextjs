"use client";

import { useEffect, useState } from "react";

type BlogCardViewCountProps = {
  blogId: string;
  initialViews: string;
};

function formatViews(value: string) {
  try {
    const views = BigInt(value);
    return views > BigInt(0) ? `${new Intl.NumberFormat("en-US").format(views)} views` : "New";
  } catch {
    return "New";
  }
}

/** Reads the live database total without counting a listing-card impression. */
export function BlogCardViewCount({ blogId, initialViews }: BlogCardViewCountProps) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    let cancelled = false;

    void fetch(`/api/blogs/${encodeURIComponent(blogId)}/view`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data: { views?: string } | null) => {
        if (!cancelled && typeof data?.views === "string") setViews(data.views);
      })
      .catch(() => {
        // The server-rendered value remains available during a transient outage.
      });

    return () => {
      cancelled = true;
    };
  }, [blogId]);

  return <span>{formatViews(views)}</span>;
}
