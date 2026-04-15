"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { notifications } from "@/db/schema/notifications";
import { getCurrentUserId, logError } from "@/lib/shared";
import { type ActionResult, actionError, actionSuccess, ErrorCode } from "@/types/errors";

const markNotificationReadSchema = z.object({
  notificationId: z.string().uuid("Notification selection is required."),
});

export async function markNotificationRead(
  input: z.infer<typeof markNotificationReadSchema>
): Promise<ActionResult<boolean>> {
  try {
    const validation = markNotificationReadSchema.safeParse(input);

    if (!validation.success) {
      const firstError =
        validation.error.issues[0]?.message ?? "Invalid notification update request.";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    const userId = await getCurrentUserId();

    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(eq(notifications.id, validation.data.notificationId), eq(notifications.userId, userId))
      );

    revalidateNotificationPaths();
    return actionSuccess(true);
  } catch (error) {
    logError(error as Error, { action: "markNotificationRead", input });
    return actionError(
      ErrorCode.UNKNOWN_ERROR,
      "Failed to update the notification. Please try again."
    );
  }
}

export async function markAllNotificationsRead(): Promise<ActionResult<boolean>> {
  try {
    const userId = await getCurrentUserId();

    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

    revalidateNotificationPaths();
    return actionSuccess(true);
  } catch (error) {
    logError(error as Error, { action: "markAllNotificationsRead" });
    return actionError(
      ErrorCode.UNKNOWN_ERROR,
      "Failed to mark notifications as read. Please try again."
    );
  }
}

function revalidateNotificationPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
}
