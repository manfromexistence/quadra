/** @type {import("next").NextConfig} */
const config = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    // Use maximum workers for cloud build
    cpus: 0, // Use all available CPUs
    optimizePackageImports: [
      "lucide-react",
      "react-icons", 
      "date-fns",
      "framer-motion",
      "recharts",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "usehooks-ts",
    ],
  },
  images: {
    loader: "custom",
    loaderFile: "./image-loader.ts",
    qualities: [80, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: false,
  async headers() {
    return [
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
  },
};

export default config;