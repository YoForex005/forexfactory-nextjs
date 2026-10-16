import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable experimental React compiler for better stability
  reactCompiler: false,

  // Turbopack configuration
  turbopack: {
    root: path.join(__dirname),
  },

  // Enable compression for faster page loads
  compress: true,

  // Production optimizations
  productionBrowserSourceMaps: false,
  poweredByHeader: false,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "forexfactory.cc",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "**.pexels.com",
      },
      {
        protocol: "https",
        hostname: "yoforex.net",
      },
      {
        protocol: "https",
        hostname: "fxcracked.org",
      },
      {
        protocol: "https",
        hostname: "yopips.com",
      },
      {
        protocol: "https",
        hostname: "www.yopips.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // Include the common card widths before the larger full-screen breakpoints
    // so a three-column card does not receive a 750px source unnecessarily.
    deviceSizes: [360, 414, 480, 576, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ["lucide-react", "@tiptap/react"],
    optimizeCss: true,
  },

  // Canonical host: 301-redirect www -> non-www so both hosts don't serve
  // 200s (fixes the canonical mismatch; keeps forexfactory.cc authoritative).
  async redirects() {
    return [
      // Preserve historic query-string pagination while serving the primary
      // listing from the prerendered /blog route.
      {
        source: "/blog",
        has: [{ type: "query", key: "page", value: "(?<page>[2-9]|[1-9]\\d+)" }],
        destination: "/blog/page/:page",
        permanent: true,
      },
      // The old WordPress uploads directory has been retired. Historic posts
      // may still reference it until the database migration can run; always
      // return a valid local image instead of a 404 in the meantime.
      {
        source: "/uploads/:path*",
        destination: "/og-image.png",
        permanent: true,
      },
      // Historic post links that were published without the /blog prefix or
      // with an outdated slug. Keep them reachable instead of returning 404.
      {
        source: "/aicon-ea-v8-18-mt5",
        destination: "/blog/aicon-ea-v8-18-mt5",
        permanent: true,
      },
      {
        source: "/blog/TrendCandleEA",
        destination: "/blog/trendcandleea-v1-0-mt5",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.forexfactory.cc" }],
        destination: "https://forexfactory.cc/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
