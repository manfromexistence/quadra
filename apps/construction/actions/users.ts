"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getCurrentUserId, logError } from "@/lib/shared";
import { type ActionResult, actionError, actionSuccess, ErrorCode } from "@/types/errors";

const userRoles = ["admin", "client", "pmc", "vendor", "subcontractor", "user"] as const;

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(100),
  role: z.enum(userRoles),
  organization: z.string().trim().max(255).optional(),
  jobTitle: z.string().trim().max(255).optional(),
  phone: z.string().trim().max(50).optional(),
  department: z.string().trim().max(255).optional(),
  image: z.string().url().optional().or(z.literal("")),
});

const notificationPreferencesSchema = z.object({
  documentSubmission: z.boolean(),
  reviewRequest: z.boolean(),
  approvalDecision: z.boolean(),
  transmittalUpdate: z.boolean(),
  emailNotifications: z.boolean(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateNotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;

export async function updateUserProfile(input: UpdateProfileInput): Promise<ActionResult<boolean>> {
  try {
    const validation = updateProfileSchema.safeParse(input);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid profile data.";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    const userId = await getCurrentUserId();
    const values = validation.data;
    const requestHeaders = await headers();

    await db
      .update(userTable)
      .set({
        name: values.name,
        role: values.role,
        organization: normalizeOptional(values.organization),
        jobTitle: normalizeOptional(values.jobTitle),
        phone: normalizeOptional(values.phone),
        department: normalizeOptional(values.department),
        image: normalizeOptional(values.image),
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, userId));

    try {
      await auth.api.updateUser({
        headers: requestHeaders,
        body: {
          name: values.name,
        },
      });
    } catch (sessionRefreshError) {
      logError(sessionRefreshError as Error, {
        action: "updateUserProfile.sessionRefresh",
        userId,
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/settings");
    revalidatePath("/settings/account");

    return actionSuccess(true);
  } catch (error) {
    logError(error as Error, { action: "updateUserProfile", input });
    return actionError(ErrorCode.UNKNOWN_ERROR, "Failed to update your profile. Please try again.");
  }
}

export async function updateNotificationPreferences(
  input: UpdateNotificationPreferencesInput
): Promise<ActionResult<boolean>> {
  try {
    const validation = notificationPreferencesSchema.safeParse(input);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid notification preferences.";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    const userId = await getCurrentUserId();

    await db
      .update(userTable)
      .set({
        notificationPreferences: JSON.stringify(validation.data),
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, userId));

    revalidatePath("/dashboard/notifications");
    revalidatePath("/settings/account");

    return actionSuccess(true);
  } catch (error) {
    logError(error as Error, { action: "updateNotificationPreferences", input });
    return actionError(
      ErrorCode.UNKNOWN_ERROR,
      "Failed to update notification preferences. Please try again."
    );
  }
}

function normalizeOptional(value: string | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
