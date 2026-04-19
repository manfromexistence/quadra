import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import { Resend } from "resend";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { activityLog, notifications } from "@/db/schema/notifications";
import { logError } from "@/lib/shared";

const DEFAULT_NOTIFICATION_PREFERENCES = {
  documentSubmission: true,
  reviewRequest: true,
  approvalDecision: true,
  transmittalUpdate: true,
  emailNotifications: false,
} as const;

export type NotificationPreferenceKey = Exclude<
  keyof typeof DEFAULT_NOTIFICATION_PREFERENCES,
  "emailNotifications"
>;

interface NotifyUsersInput {
  userIds: string[];
  preferenceKey: NotificationPreferenceKey;
  type: string;
  title: string;
  message: string;
  projectId?: string | null;
  documentId?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  actionUrl?: string | null;
  emailSubject?: string;
}

interface LogEdmsActivityInput {
  userId: string;
  projectId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
}

export async function notifyUsers(input: NotifyUsersInput) {
  try {
    const userIds = Array.from(new Set(input.userIds.filter(Boolean)));

    if (userIds.length === 0) {
      return;
    }

    const recipients = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        isActive: userTable.isActive,
        notificationPreferences: userTable.notificationPreferences,
      })
      .from(userTable)
      .where(and(inArray(userTable.id, userIds), eq(userTable.isActive, true)));

    if (recipients.length === 0) {
      return;
    }

    const enabledRecipients = recipients.filter((recipient) => {
      const preferences = parseNotificationPreferences(
        recipient.notificationPreferences,
      );
      return preferences[input.preferenceKey];
    });

    if (enabledRecipients.length === 0) {
      return;
    }

    const now = new Date();
    const insertedNotifications = await db
      .insert(notifications)
      .values(
        enabledRecipients.map((recipient) => ({
          userId: recipient.id,
          type: input.type,
          title: input.title,
          message: input.message,
          projectId: input.projectId ?? null,
          documentId: input.documentId ?? null,
          relatedEntityType: normalizeOptional(input.relatedEntityType),
          relatedEntityId: input.relatedEntityId ?? null,
          actionUrl: normalizeOptional(input.actionUrl),
          createdAt: now,
        })),
      )
      .returning({
        id: notifications.id,
        userId: notifications.userId,
      });

    const resendClient = getResendClient();

    if (!resendClient) {
      return;
    }

    const emailEnabledRecipients = enabledRecipients.filter((recipient) => {
      const preferences = parseNotificationPreferences(
        recipient.notificationPreferences,
      );
      return (
        preferences.emailNotifications && recipient.email.trim().length > 0
      );
    });

    if (emailEnabledRecipients.length === 0) {
      return;
    }

    const sentNotificationIds: string[] = [];

    await Promise.allSettled(
      emailEnabledRecipients.map(async (recipient) => {
        const result = await resendClient.emails.send({
          from: getResendFromAddress(),
          to: recipient.email,
          subject: input.emailSubject ?? input.title,
          html: renderNotificationEmail({
            recipientName: recipient.name,
            title: input.title,
            message: input.message,
            actionUrl: toAbsoluteUrl(input.actionUrl),
          }),
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        const notificationRecord = insertedNotifications.find(
          (notification) => notification.userId === recipient.id,
        );

        if (notificationRecord) {
          sentNotificationIds.push(notificationRecord.id);
        }
      }),
    );

    if (sentNotificationIds.length === 0) {
      return;
    }

    await db
      .update(notifications)
      .set({
        emailSent: true,
        emailSentAt: new Date(),
      })
      .where(inArray(notifications.id, sentNotificationIds));
  } catch (error) {
    logError(error as Error, {
      action: "notifyUsers",
      type: input.type,
      relatedEntityType: input.relatedEntityType,
      relatedEntityId: input.relatedEntityId,
    });
  }
}

export async function logEdmsActivity(input: LogEdmsActivityInput) {
  try {
    await db.insert(activityLog).values({
      userId: input.userId,
      projectId: input.projectId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      entityName: normalizeOptional(input.entityName),
      description: normalizeOptional(input.description),
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    });
  } catch (error) {
    logError(error as Error, {
      action: "logEdmsActivity",
      entityType: input.entityType,
      entityId: input.entityId,
    });
  }
}

function parseNotificationPreferences(value: string | null | undefined) {
  if (!value) {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  try {
    const parsed = JSON.parse(value) as Partial<
      typeof DEFAULT_NOTIFICATION_PREFERENCES
    >;

    return {
      documentSubmission:
        parsed.documentSubmission ??
        DEFAULT_NOTIFICATION_PREFERENCES.documentSubmission,
      reviewRequest:
        parsed.reviewRequest ?? DEFAULT_NOTIFICATION_PREFERENCES.reviewRequest,
      approvalDecision:
        parsed.approvalDecision ??
        DEFAULT_NOTIFICATION_PREFERENCES.approvalDecision,
      transmittalUpdate:
        parsed.transmittalUpdate ??
        DEFAULT_NOTIFICATION_PREFERENCES.transmittalUpdate,
      emailNotifications:
        parsed.emailNotifications ??
        DEFAULT_NOTIFICATION_PREFERENCES.emailNotifications,
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY ?? process.env.RESEND;

  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
}

function getResendFromAddress() {
  const fromAddress = process.env.RESEND_FROM_EMAIL?.trim();
  return fromAddress && fromAddress.length > 0
    ? fromAddress
    : "QUADRA <onboarding@resend.dev>";
}

function toAbsoluteUrl(actionUrl: string | null | undefined) {
  if (!actionUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(actionUrl)) {
    return actionUrl;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    toVercelUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    toVercelUrl(process.env.VERCEL_URL);

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl.replace(/\/$/, "")}${actionUrl.startsWith("/") ? actionUrl : `/${actionUrl}`}`;
}

function toVercelUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return null;
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function renderNotificationEmail(input: {
  recipientName: string;
  title: string;
  message: string;
  actionUrl: string | null;
}) {
  const actionMarkup = input.actionUrl
    ? `<p style="margin:24px 0 0"><a href="${escapeHtmlAttribute(input.actionUrl)}" style="display:inline-block;border-radius:9999px;background:#0f172a;color:#ffffff;padding:12px 18px;text-decoration:none;font-weight:600">Open in QUADRA</a></p>`
    : "";

  return [
    "<!doctype html>",
    '<html lang="en">',
    '<body style="margin:0;padding:32px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a">',
    '<div style="margin:0 auto;max-width:640px;border-radius:24px;background:#ffffff;padding:32px;box-shadow:0 18px 50px rgba(15,23,42,0.08)">',
    '<p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#64748b">QUADRA</p>',
    `<h1 style="margin:0 0 16px;font-size:24px;line-height:1.3">${escapeHtml(input.title)}</h1>`,
    `<p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#334155">Hello ${escapeHtml(input.recipientName)},</p>`,
    `<p style="margin:0;font-size:14px;line-height:1.7;color:#334155">${escapeHtml(input.message)}</p>`,
    actionMarkup,
    '<p style="margin:24px 0 0;font-size:12px;line-height:1.7;color:#94a3b8">This message was sent by the QUADRA notification service.</p>',
    "</div>",
    "</body>",
    "</html>",
  ].join("");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeHtmlAttribute(value: string) {
  return escapeHtml(value);
}

function normalizeOptional(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
