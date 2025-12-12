import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable experimental React compiler for better stability
  reactCompiler: false,

  // Turbopack configuration
  turbopack: {
    root: path.join(__dirname),
  },

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
    ],
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ["lucide-react", "@tiptap/react"],
  },
};

export default nextConfig;
