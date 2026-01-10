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
    ],
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ["lucide-react", "@tiptap/react"],
    optimizeCss: true,
  },
};

export default nextConfig;
