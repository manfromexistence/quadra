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
      transmittalId: z.string().optional(),
      recipientEmail: z.string().email().optional(),
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
    const messageParts = [
      "*Quadra Support Request*",
      `Subject: ${data.subject}`,
      `Priority: ${data.priority}`,
      `Type: ${data.type}`,
      `User ID: ${user.id}`,
      `Email: ${user.email ?? "unknown"}`,
      ...(data.url ? [`URL: ${data.url}`] : []),
      ...(data.transmittalId ? [`Transmittal ID: ${data.transmittalId}`] : []),
      ...(data.recipientEmail ? [`Recipient: ${data.recipientEmail}`] : []),
      "",
      data.message,
    ];

    await sendTelegramMessage(messageParts.join("\n"));

    // TODO: Add email sending functionality here if recipientEmail is provided
    if (data.recipientEmail) {
      // Implement email sending logic using your email service
      console.log(`Email would be sent to: ${data.recipientEmail}`);
    }

    return { ok: true };
  });
