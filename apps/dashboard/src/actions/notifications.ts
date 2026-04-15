"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { notifications } from "@/db/schema/notifications";
import { actionFromError, actionOk, requireActionSessionUser } from "./_edms";

export async function markNotificationRead(input: { notificationId: string }) {
  try {
    const sessionUser = await requireActionSessionUser();
    const now = new Date();

    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: now,
      })
      .where(and(eq(notifications.id, input.notificationId), eq(notifications.userId, sessionUser.id)));

    revalidatePath("/notifications");

    return actionOk({
      id: input.notificationId,
    });
  } catch (error) {
    return actionFromError(error, "Unable to update the notification.");
  }
}

export async function markAllNotificationsRead() {
  try {
    const sessionUser = await requireActionSessionUser();
    const now = new Date();

    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: now,
      })
      .where(and(eq(notifications.userId, sessionUser.id), eq(notifications.isRead, false)));

    revalidatePath("/notifications");

    return actionOk({
      updated: true,
    });
  } catch (error) {
    return actionFromError(error, "Unable to update the notifications.");
  }
}
