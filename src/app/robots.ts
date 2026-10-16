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

// Explicit rules make the public / private boundary clear to both traditional
// crawlers and agents acting on a visitor's behalf. The generic rule remains
// the source of truth for every other user agent.
const AGENT_USER_AGENTS = [
  "ChatGPT-User",
  "GPTBot",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
];

export const revalidate = 86400;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_PATHS,
      },
      ...AGENT_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOWED_PATHS,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_HOST,
  };
}
