"use server";

function getTelegramConfig() {
  const botToken =
    process.env.TELEGRAM_SUPPORT_BOT ?? process.env.TELEGRAM_BOT_TOKEN;
  const chatId =
    process.env.TELEGRAM_SUPPORT_CHAT ?? process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken || !chatId) {
    return null;
  }

  return { botToken, chatId };
}

function escapeTelegramMarkdown(value: string) {
  return value.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

export async function sendTelegramMessage(message: string) {
  const config = getTelegramConfig();

  if (!config) {
    throw new Error("Telegram support is not configured.");
  }

  const response = await fetch(
    `https://api.telegram.org/bot${config.botToken}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: escapeTelegramMarkdown(message),
        parse_mode: "MarkdownV2",
        disable_web_page_preview: true,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram notification failed: ${errorText}`);
  }

  return response.json();
}
