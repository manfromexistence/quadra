import "server-only";

const TELEGRAM_API_BASE = "https://api.telegram.org";

interface TelegramUploadResponse {
  ok: boolean;
  result?: {
    message_id: number;
    document?: {
      file_id: string;
    };
    photo?: Array<{
      file_id: string;
    }>;
  };
  description?: string;
}

interface TelegramFileResponse {
  ok: boolean;
  result?: {
    file_path: string;
  };
  description?: string;
}

function getConfig() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken || !channelId) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID must be configured.",
    );
  }

  return { botToken, channelId };
}

export function isTelegramConfigured() {
  return Boolean(
    process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHANNEL_ID,
  );
}

export async function uploadToTelegram(
  file: File | Buffer,
  fileName: string,
  caption?: string,
) {
  const config = getConfig();
  const formData = new FormData();
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  const fileSize = file instanceof File ? file.size : file.length;

  if (isImage && fileSize > 10 * 1024 * 1024) {
    throw new Error("Image files must be under 10MB for Telegram storage.");
  }

  if (!isImage && fileSize > 50 * 1024 * 1024) {
    throw new Error("Document files must be under 50MB for Telegram storage.");
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
  const response = await fetch(
    `${TELEGRAM_API_BASE}/bot${config.botToken}/${endpoint}`,
    {
      method: "POST",
      body: formData,
    },
  );

  const payload = (await response.json()) as TelegramUploadResponse;

  if (!payload.ok || !payload.result) {
    throw new Error(payload.description || "Telegram upload failed.");
  }

  const fileId = isImage
    ? payload.result.photo?.[payload.result.photo.length - 1]?.file_id
    : payload.result.document?.file_id;

  if (!fileId) {
    throw new Error("Telegram did not return a file id.");
  }

  const fileInfo = await getFileInfo(fileId);

  return {
    url: `${TELEGRAM_API_BASE}/file/bot${config.botToken}/${fileInfo.file_path}`,
    fileId,
    messageId: payload.result.message_id,
  };
}

async function getFileInfo(fileId: string) {
  const config = getConfig();
  const response = await fetch(
    `${TELEGRAM_API_BASE}/bot${config.botToken}/getFile?file_id=${fileId}`,
  );
  const payload = (await response.json()) as TelegramFileResponse;

  if (!payload.ok || !payload.result?.file_path) {
    throw new Error(
      payload.description || "Failed to resolve Telegram file path.",
    );
  }

  return payload.result;
}
