"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { documents } from "@/db/schema/documents";
import { transmittalDocuments, transmittals } from "@/db/schema/transmittals";
import { logEdmsActivity, notifyUsers } from "@/lib/edms/notifications";
import { requireEdmsRole } from "@/lib/edms/rbac";
import { logError } from "@/lib/shared";
import { type ActionResult, actionError, actionSuccess, ErrorCode } from "@/types/errors";

const createTransmittalSchema = z.object({
  projectId: z.string().uuid("Project selection is required."),
  transmittalNumber: z.string().trim().min(2, "Transmittal number is required.").max(100),
  subject: z.string().trim().min(2, "Subject is required.").max(500),
  description: z.string().trim().max(2000).optional(),
  recipientUserId: z.string().trim().min(1, "Recipient selection is required."),
  ccUserId: z.string().trim().optional(),
  documentIds: z.array(z.string().uuid()).min(1, "Select at least one document."),
  notes: z.string().trim().max(2000).optional(),
  images: z.array(z.string().url()).optional(),
});

const acknowledgeTransmittalSchema = z.object({
  transmittalId: z.string().uuid("Transmittal selection is required."),
});

export type CreateTransmittalInput = z.infer<typeof createTransmittalSchema>;
export type AcknowledgeTransmittalInput = z.infer<typeof acknowledgeTransmittalSchema>;

export async function createTransmittal(
  input: CreateTransmittalInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validation = createTransmittalSchema.safeParse(input);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid transmittal data.";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    const access = await requireEdmsRole("vendor");
    const values = validation.data;
    const now = new Date();
    const recipientIds = [values.recipientUserId, values.ccUserId].filter(
      (userId): userId is string => Boolean(userId && userId !== access.id)
    );

    // Insert transmittal
    const [insertedTransmittal] = await db
      .insert(transmittals)
      .values({
        projectId: values.projectId,
        transmittalNumber: values.transmittalNumber,
        subject: values.subject,
        description: normalizeOptionalString(values.description),
        sentFrom: access.id,
        sentTo: JSON.stringify([values.recipientUserId]),
        ccTo: values.ccUserId ? JSON.stringify([values.ccUserId]) : null,
        status: "sent",
        createdAt: now,
        sentAt: now,
        notes: normalizeOptionalString(values.notes),
        images: values.images && values.images.length > 0 ? JSON.stringify(values.images) : null,
      })
      .returning({ id: transmittals.id });

    // Insert transmittal documents
    await db.insert(transmittalDocuments).values(
      values.documentIds.map((documentId) => ({
        transmittalId: insertedTransmittal.id,
        documentId,
      }))
    );

    // Update documents
    await db
      .update(documents)
      .set({
        updatedAt: now,
        updatedBy: access.id,
      })
      .where(eq(documents.projectId, values.projectId));

    const createdTransmittal = insertedTransmittal;

    await Promise.allSettled([
      notifyUsers({
        userIds: recipientIds,
        preferenceKey: "transmittalUpdate",
        type: "transmittal_received",
        title: `Transmittal sent: ${values.transmittalNumber}`,
        message: `${values.subject} has been issued to you with ${values.documentIds.length} attached document(s).`,
        projectId: values.projectId,
        relatedEntityType: "transmittal",
        relatedEntityId: createdTransmittal.id,
        actionUrl: "/dashboard/transmittals",
        emailSubject: `QUADRA: transmittal ${values.transmittalNumber}`,
      }),
      logEdmsActivity({
        userId: access.id,
        projectId: values.projectId,
        action: "transmittal_sent",
        entityType: "transmittal",
        entityId: createdTransmittal.id,
        entityName: values.transmittalNumber,
        description: `${values.subject} was issued to project parties.`,
        metadata: {
          recipientUserId: values.recipientUserId,
          ccUserId: values.ccUserId ?? null,
          documentCount: values.documentIds.length,
        },
      }),
    ]);

    revalidateTransmittalPaths(values.projectId);
    return actionSuccess({ id: createdTransmittal.id });
  } catch (error) {
    logError(error as Error, { action: "createTransmittal", input });

    return actionError(
      ErrorCode.UNKNOWN_ERROR,
      getTransmittalErrorMessage(error, "Failed to create transmittal. Please try again.")
    );
  }
}

export async function acknowledgeTransmittal(
  input: AcknowledgeTransmittalInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validation = acknowledgeTransmittalSchema.safeParse(input);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid acknowledgement request.";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    const access = await requireEdmsRole("user");
    const values = validation.data;

    const transmittalRows = await db
      .select({
        id: transmittals.id,
        projectId: transmittals.projectId,
        sentTo: transmittals.sentTo,
        status: transmittals.status,
        sentFrom: transmittals.sentFrom,
        transmittalNumber: transmittals.transmittalNumber,
        subject: transmittals.subject,
      })
      .from(transmittals)
      .where(eq(transmittals.id, values.transmittalId))
      .limit(1);

    const [transmittalRecord] = transmittalRows;

    if (!transmittalRecord) {
      return actionError(ErrorCode.VALIDATION_ERROR, "Transmittal was not found.");
    }

    const recipients = parseRecipients(transmittalRecord.sentTo);

    if (!recipients.includes(access.id) && access.role !== "admin") {
      return actionError(
        ErrorCode.UNAUTHORIZED,
        "Only a listed recipient or an admin can acknowledge this transmittal."
      );
    }

    if (transmittalRecord.status === "acknowledged") {
      return actionError(
        ErrorCode.VALIDATION_ERROR,
        "This transmittal has already been acknowledged."
      );
    }

    await db
      .update(transmittals)
      .set({
        status: "acknowledged",
        acknowledgedAt: new Date(),
        acknowledgedBy: access.id,
      })
      .where(eq(transmittals.id, values.transmittalId));

    await Promise.allSettled([
      notifyUsers({
        userIds: [transmittalRecord.sentFrom].filter((userId) => userId !== access.id),
        preferenceKey: "transmittalUpdate",
        type: "transmittal_acknowledged",
        title: `Transmittal acknowledged: ${transmittalRecord.transmittalNumber}`,
        message: `${transmittalRecord.subject} has been acknowledged by a listed recipient.`,
        projectId: transmittalRecord.projectId,
        relatedEntityType: "transmittal",
        relatedEntityId: transmittalRecord.id,
        actionUrl: "/dashboard/transmittals",
        emailSubject: `QUADRA: transmittal ${transmittalRecord.transmittalNumber} acknowledged`,
      }),
      logEdmsActivity({
        userId: access.id,
        projectId: transmittalRecord.projectId,
        action: "transmittal_acknowledged",
        entityType: "transmittal",
        entityId: transmittalRecord.id,
        entityName: transmittalRecord.transmittalNumber,
        description: `${transmittalRecord.subject} was acknowledged by a recipient.`,
        metadata: {
          acknowledgedBy: access.id,
        },
      }),
    ]);

    revalidateTransmittalPaths(transmittalRecord.projectId);
    return actionSuccess({ id: transmittalRecord.id });
  } catch (error) {
    logError(error as Error, { action: "acknowledgeTransmittal", input });

    return actionError(
      ErrorCode.UNKNOWN_ERROR,
      getTransmittalErrorMessage(error, "Failed to acknowledge transmittal. Please try again.")
    );
  }
}

function revalidateTransmittalPaths(projectId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transmittals");
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);
}

function normalizeOptionalString(value: string | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseRecipients(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    return [];
  }
}

function getTransmittalErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  if (error.message.includes("does not exist")) {
    return "Transmittal tables are not available yet. Run the EDMS migrations before sending packages.";
  }

  if (error.message.includes("Insufficient permissions")) {
    return "Your role is not allowed to send or acknowledge transmittals.";
  }

  return fallback;
}
