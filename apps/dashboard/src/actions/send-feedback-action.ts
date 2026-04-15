"use server";

import { LogEvents } from "@midday/events/events";
import { z } from "zod";
import { sendTelegramMessage } from "@/lib/telegram";
import { authActionClient } from "./safe-action";

export const sendFeebackAction = authActionClient
  .schema(
    z.object({
      feedback: z.string(),
    }),
  )
  .metadata({
    name: "send-feedback",
    track: {
      event: LogEvents.SendFeedback.name,
      channel: LogEvents.SendFeedback.channel,
    },
  })
  .action(async ({ parsedInput: { feedback }, ctx: { user } }) => {
    await sendTelegramMessage(
      [
        "*Quadra Feedback*",
        `User ID: ${user.id}`,
        `Email: ${user.email ?? "unknown"}`,
        "",
        feedback,
      ].join("\n"),
    );

    return { ok: true };
  });
