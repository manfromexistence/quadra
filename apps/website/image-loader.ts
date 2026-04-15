interface ImageLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

// Use environment variable for CDN URL, fallback to current domain
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || "";

export default function imageLoader({
  src,
  width,
  quality = 80,
}: ImageLoaderParams): string {
  // Skip CDN optimization for localhost (local development)
  if (src.includes("localhost") || src.includes("127.0.0.1")) {
    return src;
  }

  // In development, serve local images without CDN
  if (process.env.NODE_ENV === "development") {
    if (src.startsWith("/")) {
      return `${src}?w=${width}&q=${quality}`;
    }
    return src;
  }

  // For local images (starting with /), serve from current domain
  if (src.startsWith("/")) {
    // If no CDN_URL is set, serve from current domain
    if (!CDN_URL) {
      return `${src}?w=${width}&q=${quality}`;
    }
    // If CDN is configured, use Cloudflare image optimization
    return `${CDN_URL}/cdn-cgi/image/width=${width},quality=${quality}${src}`;
  }

  // For _next static files
  if (src.startsWith("/_next")) {
    if (!CDN_URL) {
      return src;
    }
    return `${CDN_URL}/cdn-cgi/image/width=${width},quality=${quality}${src}`;
  }

  // For external URLs, pass through
  return src;
}
