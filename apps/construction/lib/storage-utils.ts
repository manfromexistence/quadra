/**
 * Storage URL Optimization Utilities
 *
 * Minimize database storage by storing only file IDs instead of full URLs.
 * Reconstruct full URLs on the client side.
 */

// Storage service base URLs (not stored in DB)
const IMGBB_BASE = "https://i.ibb.co/";
const CATBOX_BASE = "https://files.catbox.moe/";
const TELEGRAM_BASE = "https://api.telegram.org/file/bot";

/**
 * Extract file ID from ImgBB URL
 * Input: https://i.ibb.co/Z6hL6DGY/avatar-1775128985453.png
 * Output: Z6hL6DGY/avatar-1775128985453.png
 */
export function extractImgBBId(url: string): string {
  if (!url.includes("i.ibb.co")) return url;
  return url.replace(IMGBB_BASE, "");
}

/**
 * Reconstruct full ImgBB URL from file ID
 * Input: Z6hL6DGY/avatar-1775128985453.png
 * Output: https://i.ibb.co/Z6hL6DGY/avatar-1775128985453.png
 */
export function buildImgBBUrl(fileId: string): string {
  if (fileId.startsWith("http")) return fileId; // Already full URL
  return `${IMGBB_BASE}${fileId}`;
}

/**
 * Extract file ID from Catbox URL
 * Input: https://files.catbox.moe/4yp8lc.pdf
 * Output: 4yp8lc.pdf
 */
export function extractCatboxId(url: string): string {
  if (!url.includes("catbox.moe")) return url;
  return url.replace(CATBOX_BASE, "");
}

/**
 * Reconstruct full Catbox URL from file ID
 * Input: 4yp8lc.pdf
 * Output: https://files.catbox.moe/4yp8lc.pdf
 */
export function buildCatboxUrl(fileId: string): string {
  if (fileId.startsWith("http")) return fileId; // Already full URL
  return `${CATBOX_BASE}${fileId}`;
}

/**
 * Extract file path from Telegram URL
 * Input: https://api.telegram.org/file/bot<TOKEN>/documents/file_123.pdf
 * Output: documents/file_123.pdf
 */
export function extractTelegramPath(url: string): string {
  if (!url.includes("api.telegram.org/file/bot")) return url;
  const match = url.match(/\/file\/bot[^/]+\/(.+)$/);
  return match ? match[1] : url;
}

/**
 * Reconstruct full Telegram URL from file path
 * Requires bot token from environment
 * Input: documents/file_123.pdf
 * Output: https://api.telegram.org/file/bot<TOKEN>/documents/file_123.pdf
 */
export function buildTelegramUrl(filePath: string): string {
  if (filePath.startsWith("http")) return filePath; // Already full URL
  const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.warn("Telegram bot token not found, returning path as-is");
    return filePath;
  }
  return `${TELEGRAM_BASE}${botToken}/${filePath}`;
}

/**
 * Smart URL truncation - automatically detect service and extract ID
 * Saves ~40-60 characters per URL in database
 */
export function truncateStorageUrl(url: string): string {
  if (!url || !url.startsWith("http")) return url;

  if (url.includes("i.ibb.co")) {
    return `imgbb:${extractImgBBId(url)}`;
  }

  if (url.includes("catbox.moe")) {
    return `catbox:${extractCatboxId(url)}`;
  }

  if (url.includes("api.telegram.org/file/bot")) {
    return `tg:${extractTelegramPath(url)}`;
  }

  return url; // Unknown service, store as-is
}

/**
 * Smart URL expansion - automatically detect service and build full URL
 */
export function expandStorageUrl(truncatedUrl: string): string {
  if (!truncatedUrl) return "";

  if (truncatedUrl.startsWith("imgbb:")) {
    return buildImgBBUrl(truncatedUrl.replace("imgbb:", ""));
  }

  if (truncatedUrl.startsWith("catbox:")) {
    return buildCatboxUrl(truncatedUrl.replace("catbox:", ""));
  }

  if (truncatedUrl.startsWith("tg:")) {
    return buildTelegramUrl(truncatedUrl.replace("tg:", ""));
  }

  if (truncatedUrl.startsWith("http")) {
    return truncatedUrl; // Already full URL
  }

  return truncatedUrl;
}

/**
 * Truncate array of URLs (for images field)
 * Input: ["https://i.ibb.co/Z6hL6DGY/img1.png", "https://i.ibb.co/ABC123/img2.png"]
 * Output: ["imgbb:Z6hL6DGY/img1.png", "imgbb:ABC123/img2.png"]
 */
export function truncateImageArray(urls: string[]): string {
  const truncated = urls.map(truncateStorageUrl);
  return JSON.stringify(truncated);
}

/**
 * Expand array of truncated URLs
 * Input: ["imgbb:Z6hL6DGY/img1.png", "imgbb:ABC123/img2.png"]
 * Output: ["https://i.ibb.co/Z6hL6DGY/img1.png", "https://i.ibb.co/ABC123/img2.png"]
 */
export function expandImageArray(truncatedJson: string | null | undefined): string[] {
  if (!truncatedJson) return [];

  try {
    const parsed = JSON.parse(truncatedJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(expandStorageUrl);
  } catch {
    return [];
  }
}

/**
 * Calculate storage savings
 * Returns percentage of space saved by truncation
 */
export function calculateStorageSavings(originalUrl: string): number {
  const truncated = truncateStorageUrl(originalUrl);
  const originalSize = originalUrl.length;
  const truncatedSize = truncated.length;
  const saved = originalSize - truncatedSize;
  return Math.round((saved / originalSize) * 100);
}

/**
 * Batch truncate URLs for database insert/update
 */
export function prepareDatabaseUrls(data: {
  fileUrl?: string;
  images?: string[];
  [key: string]: unknown;
}): {
  fileUrl?: string;
  images?: string;
  [key: string]: unknown;
} {
  const { fileUrl, images, ...rest } = data;
  const prepared: {
    fileUrl?: string;
    images?: string;
    [key: string]: unknown;
  } = { ...rest };

  if (fileUrl) {
    prepared.fileUrl = truncateStorageUrl(fileUrl);
  }

  if (images && Array.isArray(images)) {
    prepared.images = truncateImageArray(images);
  }

  return prepared;
}

/**
 * Batch expand URLs from database query
 */
export function expandDatabaseUrls<
  T extends {
    fileUrl?: string | null;
    images?: string | null | undefined;
    [key: string]: unknown;
  },
>(
  data: T
): T & {
  fileUrl: string;
  images: string[];
} {
  return {
    ...data,
    fileUrl: data.fileUrl ? expandStorageUrl(data.fileUrl) : "",
    images: expandImageArray(data.images),
  };
}
