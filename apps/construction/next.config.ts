import { type NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "files.catbox.moe",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.telegram.org",
        pathname: "/file/**",
      },
    ],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              icon: true,
            },
          },
        ],
        as: '*.js',
      },
    },
  },
  experimental: {
    // Enable optimistic client-side navigation
    optimisticClientCache: true,
    // Keep static generation from exhausting local build workers on large route sets.
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 200,
    staticGenerationRetryCount: 1,
  },
};

export default nextConfig;
