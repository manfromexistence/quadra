/**
 * Telegram Bot API Storage
 *
 * Truly unlimited storage using Telegram Bot API
 * - ~30 messages/second (~108,000 operations/hour)
 * - Unlimited storage, permanent
 * - No OAuth required from users
 * - Files up to 50MB (documents), 10MB (photos)
 *
 * Setup:
 * 1. Create a bot via @BotFather on Telegram
 * 2. Get your bot token
 * 3. Create a private channel and add your bot as admin
 * 4. Get the channel ID (use @userinfobot)
 * 5. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID in .env
 */

const TELEGRAM_API_BASE = "https://api.telegram.org";

interface TelegramUploadResponse {
  ok: boolean;
  result?: {
    message_id: number;
    document?: {
      file_id: string;
      file_unique_id: string;
      file_name: string;
      file_size: number;
    };
    photo?: Array<{
      file_id: string;
      file_unique_id: string;
      file_size: number;
      width: number;
      height: number;
    }>;
  };
  description?: string;
}

interface TelegramFileResponse {
  ok: boolean;
  result?: {
    file_id: string;
    file_unique_id: string;
    file_size: number;
    file_path: string;
  };
  description?: string;
}

export interface TelegramStorageConfig {
  botToken: string;
  channelId: string;
}

function getConfig(): TelegramStorageConfig {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken || !channelId) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID must be set in environment variables"
    );
  }

  return { botToken, channelId };
}

/**
 * Upload a file to Telegram storage
 * Returns a permanent URL to access the file
 */
export async function uploadToTelegram(
  file: File | Buffer,
  fileName: string,
  caption?: string
): Promise<{ url: string; fileId: string; messageId: number }> {
  const config = getConfig();
  const formData = new FormData();

  // Determine if it's an image or document
  const isImage = fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const fileSize = file instanceof File ? file.size : file.length;

  // Telegram limits: 10MB for photos, 50MB for documents
  if (isImage && fileSize > 10 * 1024 * 1024) {
    throw new Error("Image files must be under 10MB for Telegram storage");
  }
  if (!isImage && fileSize > 50 * 1024 * 1024) {
    throw new Error("Document files must be under 50MB for Telegram storage");
  }

  formData.append("chat_id", config.channelId);

  if (file instanceof File) {
    formData.append(isImage ? "photo" : "document", file, fileName);
  } else {
    const blob = new Blob([new Uint8Array(file)]);
    formData.append(isImage ? "photo" : "document", blob, fileName);
  }

  if (caption) {
    formData.append("caption", caption);
  }

  const endpoint = isImage ? "sendPhoto" : "sendDocument";
  const url = `${TELEGRAM_API_BASE}/bot${config.botToken}/${endpoint}`;

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const data: TelegramUploadResponse = await response.json();

  if (!data.ok || !data.result) {
    throw new Error(`Telegram upload failed: ${data.description || "Unknown error"}`);
  }

  const fileId = isImage
    ? data.result.photo?.[data.result.photo.length - 1]?.file_id
    : data.result.document?.file_id;

  if (!fileId) {
    throw new Error("Failed to get file ID from Telegram response");
  }

  // Get file path to construct permanent URL
  const fileInfo = await getFileInfo(fileId);
  const permanentUrl = `${TELEGRAM_API_BASE}/file/bot${config.botToken}/${fileInfo.file_path}`;

  return {
    url: permanentUrl,
    fileId,
    messageId: data.result.message_id,
  };
}

/**
 * Get file information from Telegram
 */
async function getFileInfo(fileId: string): Promise<{ file_path: string }> {
  const config = getConfig();
  const url = `${TELEGRAM_API_BASE}/bot${config.botToken}/getFile?file_id=${fileId}`;

  const response = await fetch(url);
  const data: TelegramFileResponse = await response.json();

  if (!data.ok || !data.result?.file_path) {
    throw new Error(`Failed to get file info: ${data.description || "Unknown error"}`);
  }

  return { file_path: data.result.file_path };
}

/**
 * Delete a file from Telegram storage
 */
export async function deleteFromTelegram(messageId: number): Promise<void> {
  const config = getConfig();
  const url = `${TELEGRAM_API_BASE}/bot${config.botToken}/deleteMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: config.channelId,
      message_id: messageId,
    }),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Failed to delete file: ${data.description || "Unknown error"}`);
  }
}

/**
 * Upload file from URL to Telegram
 */
export async function uploadUrlToTelegram(
  fileUrl: string,
  fileName: string,
  caption?: string
): Promise<{ url: string; fileId: string; messageId: number }> {
  // Fetch the file
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return uploadToTelegram(buffer, fileName, caption);
}
