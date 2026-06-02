import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

const SITE_HOST = new URL(SITE_URL).host;

const DISALLOWED_PATHS: string[] = [
  "/admin/",
  "/api/",
  "/dashboard/",
  "/login",
  "/signup",
  "/search",
];

export const revalidate = 86400;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: DISALLOWED_PATHS,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_HOST,
  };
}
