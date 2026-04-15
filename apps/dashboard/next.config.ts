import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

/** @type {import("next").NextConfig} */
const config = {
  poweredByHeader: false,
  reactStrictMode: true,
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
  experimental: {
    // Local dev: Use reasonable CPU count for stability
    // Production: Use all CPUs for maximum performance
    cpus: process.env.NODE_ENV === "production" ? 0 : Math.min(4, require("os").cpus().length),
    optimizePackageImports: [
      "lucide-react",
      "react-icons", 
      "date-fns",
      "framer-motion",
      "recharts",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "usehooks-ts",
      "@tanstack/react-query",
      "@tanstack/react-table",
      "react-hook-form",
      "zod",
      "superjson",
    ],
    // Local dev optimizations
    ...(process.env.NODE_ENV === "development" && {
      // Faster local builds - removed invalid turbo config
    }),
    // PRODUCTION BEAST MODE 🔥
    ...(process.env.NODE_ENV === "production" && {
      // Enable all experimental optimizations for production
      optimizeCss: true,
      optimizeServerReact: true,
      serverMinification: true,
      swcMinify: true,
      // Aggressive bundling
      bundlePagesRouterDependencies: true,
      // Enable React Compiler for maximum performance
      reactCompiler: true,
    }),
  },
  images: {
    loader: "custom",
    loaderFile: "./image-loader.ts",
    // Production: Ultra-high quality images with multiple formats
    qualities: process.env.NODE_ENV === "production" ? [50, 75, 90, 100] : [80, 100],
    formats: process.env.NODE_ENV === "production" ? ["image/avif", "image/webp"] : ["image/webp"],
    // Aggressive caching for production
    minimumCacheTTL: process.env.NODE_ENV === "production" ? 31536000 : 60, // 1 year vs 1 minute
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Production optimizations
    ...(process.env.NODE_ENV === "production" && {
      dangerouslyAllowSVG: false,
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    }),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: false,
  async headers() {
    const headers = [
      {
        source: "/((?!api/proxy).*)",
        headers: [
          {
            key: "X-Frame-Options", 
            value: "DENY",
          },
        ],
      },
    ];

    // PRODUCTION BEAST MODE HEADERS 🚀
    if (process.env.NODE_ENV === "production") {
      headers.push(
        // Static assets - cache for 1 year
        {
          source: "/_next/static/(.*)",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
            {
              key: "X-Content-Type-Options",
              value: "nosniff",
            },
          ],
        },
        // Images - cache for 1 month
        {
          source: "/(.*\\.(png|jpg|jpeg|gif|webp|avif|ico|svg))",
          headers: [
            {
              key: "Cache-Control", 
              value: "public, max-age=2592000",
            },
          ],
        },
        // API routes - no cache but security headers
        {
          source: "/api/(.*)",
          headers: [
            {
              key: "X-Content-Type-Options",
              value: "nosniff",
            },
            {
              key: "X-Frame-Options",
              value: "DENY", 
            },
            {
              key: "X-XSS-Protection",
              value: "1; mode=block",
            },
          ],
        },
        // All pages - security headers
        {
          source: "/(.*)",
          headers: [
            {
              key: "Strict-Transport-Security",
              value: "max-age=31536000; includeSubDomains; preload",
            },
            {
              key: "X-Content-Type-Options", 
              value: "nosniff",
            },
            {
              key: "Referrer-Policy",
              value: "strict-origin-when-cross-origin",
            },
            {
              key: "Permissions-Policy",
              value: "camera=(), microphone=(), geolocation=()",
            },
          ],
        }
      );
    }

    return headers;
  },
};

export default config;
