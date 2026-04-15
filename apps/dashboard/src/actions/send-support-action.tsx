"use server";

import { LogEvents } from "@midday/events/events";
import { z } from "zod";
import { sendTelegramMessage } from "@/lib/telegram";
import { authActionClient } from "./safe-action";

export const sendSupportAction = authActionClient
  .schema(
    z.object({
      subject: z.string(),
      priority: z.string(),
      type: z.string(),
      message: z.string(),
      url: z.string().optional(),
    }),
  )
  .metadata({
    name: "send-support",
    track: {
      event: LogEvents.SupportTicket.name,
      channel: LogEvents.SupportTicket.channel,
    },
  })
  .action(async ({ parsedInput: data, ctx: { user } }) => {
    await sendTelegramMessage(
      [
        "*Quadra Support Request*",
        `Subject: ${data.subject}`,
        `Priority: ${data.priority}`,
        `Type: ${data.type}`,
        `User ID: ${user.id}`,
        `Email: ${user.email ?? "unknown"}`,
        ...(data.url ? [`URL: ${data.url}`] : []),
        "",
        data.message,
      ].join("\n"),
    );

    return { ok: true };
  });
