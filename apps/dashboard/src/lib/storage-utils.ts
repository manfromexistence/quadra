const IMGBB_BASE = "https://i.ibb.co/";
const CATBOX_BASE = "https://files.catbox.moe/";
const TELEGRAM_BASE = "https://api.telegram.org/file/bot";

export function extractImgBBId(url: string) {
  if (!url.includes("i.ibb.co")) {
    return url;
  }

  return url.replace(IMGBB_BASE, "");
}

export function buildImgBBUrl(fileId: string) {
  if (fileId.startsWith("http")) {
    return fileId;
  }

  return `${IMGBB_BASE}${fileId}`;
}

export function extractCatboxId(url: string) {
  if (!url.includes("catbox.moe")) {
    return url;
  }

  return url.replace(CATBOX_BASE, "");
}

export function buildCatboxUrl(fileId: string) {
  if (fileId.startsWith("http")) {
    return fileId;
  }

  return `${CATBOX_BASE}${fileId}`;
}

export function extractTelegramPath(url: string) {
  if (!url.includes("api.telegram.org/file/bot")) {
    return url;
  }

  const match = url.match(/\/file\/bot[^/]+\/(.+)$/);
  return match ? match[1] : url;
}

export function buildTelegramUrl(filePath: string) {
  if (filePath.startsWith("http")) {
    return filePath;
  }

  const botToken =
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN ||
    process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return filePath;
  }

  return `${TELEGRAM_BASE}${botToken}/${filePath}`;
}

export function truncateStorageUrl(url: string) {
  if (!url.startsWith("http")) {
    return url;
  }

  if (url.includes("i.ibb.co")) {
    return `imgbb:${extractImgBBId(url)}`;
  }

  if (url.includes("catbox.moe")) {
    return `catbox:${extractCatboxId(url)}`;
  }

  if (url.includes("api.telegram.org/file/bot")) {
    return `tg:${extractTelegramPath(url)}`;
  }

  return url;
}

export function expandStorageUrl(truncatedUrl: string) {
  if (!truncatedUrl) {
    return "";
  }

  if (truncatedUrl.startsWith("imgbb:")) {
    return buildImgBBUrl(truncatedUrl.replace("imgbb:", ""));
  }

  if (truncatedUrl.startsWith("catbox:")) {
    return buildCatboxUrl(truncatedUrl.replace("catbox:", ""));
  }

  if (truncatedUrl.startsWith("tg:")) {
    return buildTelegramUrl(truncatedUrl.replace("tg:", ""));
  }

  return truncatedUrl;
}

export function truncateImageArray(urls: string[]) {
  return JSON.stringify(urls.map(truncateStorageUrl));
}

export function expandImageArray(truncatedJson: string | null | undefined) {
  if (!truncatedJson) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(truncatedJson) as unknown;

    if (!Array.isArray(parsed)) {
      return [] as string[];
    }

    return parsed
      .filter((entry): entry is string => typeof entry === "string")
      .map(expandStorageUrl);
  } catch {
    return [] as string[];
  }
}

export function prepareDatabaseUrls(data: {
  fileUrl?: string;
  images?: string[];
  [key: string]: unknown;
}) {
  const { fileUrl, images, ...rest } = data;

  return {
    ...rest,
    fileUrl: fileUrl ? truncateStorageUrl(fileUrl) : undefined,
    images:
      images && Array.isArray(images) ? truncateImageArray(images) : undefined,
  };
}
