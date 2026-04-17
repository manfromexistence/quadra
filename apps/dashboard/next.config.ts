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
  reactCompiler: process.env.NODE_ENV === "production",
  outputFileTracingRoot: workspaceRoot,
  outputFileTracingIncludes: {
    "/*": [
      "../../node_modules/@libsql/**/*",
      "../../node_modules/node-fetch/**/*",
      "../../node_modules/ws/**/*",
    ],
  },
  outputFileTracingExcludes: {
    "/*": [
      // Workspace packages — fully bundled into JS chunks by Next.js/Turbopack.
      // bun symlinks these under node_modules/@midday/* which causes Vercel to
      // reject the serverless function package ("files in symlinked directories").
      "../../packages/**/*",
      "../../node_modules/@midday/**/*",
      // Build-tool compilers — never needed at runtime
      "../../node_modules/@swc/core-linux-x64-gnu/**/*",
      "../../node_modules/@swc/core-linux-x64-musl/**/*",
      "../../node_modules/@swc/core-darwin-x64/**/*",
      "../../node_modules/@swc/core-darwin-arm64/**/*",
      "../../node_modules/@swc/core-win32-x64-msvc/**/*",
      "../../node_modules/@esbuild/linux-x64/**/*",
      "../../node_modules/@esbuild/darwin-x64/**/*",
      "../../node_modules/@esbuild/darwin-arm64/**/*",
      "../../node_modules/@esbuild/win32-x64/**/*",
      "../../node_modules/@esbuild/win32-ia32/**/*",
      "../../node_modules/@esbuild/win32-arm64/**/*",
      "../../node_modules/@esbuild/linux-arm64/**/*",
      "../../node_modules/@esbuild/linux-ia32/**/*",
      "../../node_modules/@esbuild/linux-arm/**/*",
      // Native modules not needed in serverless
      "../../node_modules/canvas/**/*",
      "../../node_modules/sharp/**/*",
      // pdfjs-dist: exclude every non-essential subfolder
      // (build/pdf.worker.* is loaded via CDN in the browser — not server-side)
      "../../node_modules/pdfjs-dist/legacy/**/*",
      "../../node_modules/pdfjs-dist/es5/**/*",
      "../../node_modules/pdfjs-dist/cmaps/**/*",
      "../../node_modules/pdfjs-dist/standard_fonts/**/*",
      "../../node_modules/pdfjs-dist/web/**/*",
      "../../node_modules/pdfjs-dist/wasm/**/*",
      "../../node_modules/pdfjs-dist/image_decoders/**/*",
      "../../node_modules/pdfjs-dist/iccs/**/*",
      // Docs / metadata
      "../../node_modules/**/*.md",
      "../../node_modules/**/*.map",
      "../../node_modules/**/LICENSE",
      "../../node_modules/**/LICENSE.txt",
      "../../node_modules/**/README",
      "../../node_modules/**/README.txt",
      "../../node_modules/**/CHANGELOG",
      "../../node_modules/**/*.d.ts",
      // Tests & examples
      "../../node_modules/**/*.test.js",
      "../../node_modules/**/*.spec.js",
      "../../node_modules/**/test/**/*",
      "../../node_modules/**/tests/**/*",
      "../../node_modules/**/__tests__/**/*",
      "../../node_modules/**/examples/**/*",
      "../../node_modules/**/docs/**/*",
      // Turbopack / dev tooling
      "../../node_modules/.turbopack/**/*",
      "../../node_modules/.cache/**/*",
    ],
  },
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
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-tooltip",
      "react-pdf",
      "pdfjs-dist",
    ],
    // PRODUCTION BEAST MODE 🔥
    ...(process.env.NODE_ENV === "production" && {
      // Enable all experimental optimizations for production
      optimizeCss: true,
      optimizeServerReact: true,
      serverMinification: true,
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

  // Reduce preloading warnings in development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Suppress ALL webpack logging
      config.infrastructureLogging = {
        level: 'none',
      };

      // Suppress webpack stats logging completely
      config.stats = 'none';

      // Disable CSS preloading in development to prevent warnings
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'async', // Only split async chunks in development
          cacheGroups: {
            default: false,
            vendors: false,
            // Don't create separate CSS chunks in development
            styles: false,
          },
        },
      };

      // Nuclear option: Completely suppress all console output during webpack operations
      config.plugins = config.plugins || [];
      config.plugins.push({
        apply: (compiler) => {
          // Store original console methods
          let originalConsole = {};

          compiler.hooks.compile.tap('SuppressAllLogsPlugin', () => {
            // Store and override all console methods during compilation
            originalConsole = {
              log: console.log,
              warn: console.warn,
              info: console.info,
              error: console.error,
            };

            // Completely silence console during webpack operations
            console.log = () => {};
            console.warn = () => {};
            console.info = () => {};
            // Keep errors for actual webpack errors
            console.error = (...args) => {
              const message = args.join(' ');
              if (!message.includes('IncrementalCache') && !message.includes('FileSystemCache') && !message.includes('use-cache')) {
                originalConsole.error.apply(console, args);
              }
            };
          });

          compiler.hooks.done.tap('RestoreConsolePlugin', () => {
            // Restore console methods after compilation
            if (originalConsole.log) {
              console.log = originalConsole.log;
              console.warn = originalConsole.warn;
              console.info = originalConsole.info;
              console.error = originalConsole.error;
            }
          });

          // Suppress all webpack warnings
          compiler.hooks.done.tap('SuppressAllWarningsPlugin', (stats) => {
            stats.compilation.warnings = [];
            stats.compilation.errors = stats.compilation.errors.filter(error =>
              !error.message.includes('IncrementalCache') &&
              !error.message.includes('FileSystemCache') &&
              !error.message.includes('use-cache')
            );
          });
        }
      });

      // Disable source maps in development to reduce overhead
      config.devtool = false;
    }
    return config;
  },
  async headers() {
    const headers = [
      {
        source: "/:path*",
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
          source: "/_next/static/:path*",
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
          source: "/:path*\\.:ext(png|jpg|jpeg|gif|webp|avif|ico|svg)",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=2592000",
            },
          ],
        },
        // API routes - no cache but security headers
        {
          source: "/api/:path*",
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
          source: "/:path*",
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
