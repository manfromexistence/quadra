"use server";

import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { documentComments, documents } from "@/db/schema/documents";
import { notifications } from "@/db/schema/notifications";
import { transmittalDocuments, transmittals } from "@/db/schema/transmittals";
import { documentWorkflows, workflowSteps } from "@/db/schema/workflows";
import { canAccessProject } from "@/lib/edms/access";
import {
  getClientApprovalOptionByStatus,
  normalizeClientApprovalCode,
  type ClientReviewStatus,
} from "@/lib/edms/client-approval-codes";
import { logEdmsActivity, notifyUsers } from "@/lib/edms/notifications";
import {
  actionFromError,
  actionOk,
  createEdmsId,
  mapDecisionToApprovalCode,
  normalizeOptionalString,
  parseStringArray,
  requireActionSessionUser,
  requireManageEdmsContent,
  toStringArrayJson,
} from "./_edms";

interface CreateTransmittalInput {
  projectId: string;
  transmittalNumber: string;
  subject: string;
  description?: string;
  recipientUserId: string;
  ccUserId?: string;
  documentIds: string[];
  notes?: string;
  images?: string[];
}

interface ReviewTransmittalInput {
  transmittalId: string;
  reviewStatus: ClientReviewStatus;
  comments?: string;
  approvalCode?: string;
  attachmentUrl?: string;
  attachmentFileName?: string;
  attachmentFileSize?: number;
}

export async function createTransmittal(input: CreateTransmittalInput) {
  try {
    const sessionUser = await requireActionSessionUser();
    requireManageEdmsContent(sessionUser.role);

    const hasProjectAccess = await canAccessProject(sessionUser, input.projectId);

    if (!hasProjectAccess) {
      throw new Error("You do not have access to this project.");
    }

    const attachedDocuments = await db
      .select({
        id: documents.id,
      })
      .from(documents)
      .where(and(eq(documents.projectId, input.projectId), inArray(documents.id, input.documentIds)));

    if (attachedDocuments.length !== input.documentIds.length) {
      throw new Error("One or more selected documents do not belong to the project.");
    }

    const transmittalId = createEdmsId("transmittal");
    const now = new Date();

    await db.insert(transmittals).values({
      id: transmittalId,
      projectId: input.projectId,
      transmittalNumber: input.transmittalNumber.trim(),
      subject: input.subject.trim(),
      description: normalizeOptionalString(input.description),
      sentFrom: sessionUser.id,
      sentTo: toStringArrayJson([input.recipientUserId]),
      ccTo: input.ccUserId ? toStringArrayJson([input.ccUserId]) : null,
      status: "sent",
      createdAt: now,
      sentAt: now,
      notes: normalizeOptionalString(input.notes),
      images: input.images?.length ? JSON.stringify(input.images) : null,
    });

    await db.insert(transmittalDocuments).values(
      input.documentIds.map((documentId) => ({
        id: createEdmsId("transmittal-document"),
        transmittalId,
        documentId,
        addedAt: now,
      }))
    );

    await notifyUsers({
      userIds: [input.recipientUserId, input.ccUserId ?? null],
      preferenceKey: "transmittalUpdate",
      type: "transmittal_received",
      title: "New document submission for review",
      message: `${sessionUser.name} sent ${input.transmittalNumber.trim()} for your review.`,
      projectId: input.projectId,
      documentId: input.documentIds[0] ?? null,
      relatedEntityType: "transmittal",
      relatedEntityId: transmittalId,
      actionUrl: `/transmittals/${transmittalId}`,
    });

    await logEdmsActivity({
      userId: sessionUser.id,
      projectId: input.projectId,
      action: "transmittal_sent",
      entityType: "transmittal",
      entityId: transmittalId,
      entityName: input.transmittalNumber.trim(),
      description: `Issued ${input.documentIds.length} document(s) to the recipient team.`,
    });

    revalidatePath("/transmittals");
    revalidatePath(`/projects/${input.projectId}`);

    return actionOk({
      id: transmittalId,
    });
  } catch (error) {
    return actionFromError(error, "Unable to create the transmittal.");
  }
}

export async function reviewTransmittal(input: ReviewTransmittalInput) {
  try {
    const sessionUser = await requireActionSessionUser();

    const [transmittalSummary] = await db
      .select({
        id: transmittals.id,
        projectId: transmittals.projectId,
        transmittalNumber: transmittals.transmittalNumber,
        status: transmittals.status,
        sentFrom: transmittals.sentFrom,
        sentTo: transmittals.sentTo,
      })
      .from(transmittals)
      .where(eq(transmittals.id, input.transmittalId))
      .limit(1);

    if (!transmittalSummary) {
      throw new Error("Transmittal not found.");
    }

    const hasProjectAccess = await canAccessProject(sessionUser, String(transmittalSummary.projectId));

    if (!hasProjectAccess) {
      throw new Error("You do not have access to this transmittal.");
    }

    const recipients = parseStringArray(transmittalSummary.sentTo);

    if (!recipients.includes(sessionUser.id)) {
      throw new Error("Only the transmittal recipient can submit this review.");
    }

    const linkedDocuments = await db
      .select({
        documentId: transmittalDocuments.documentId,
      })
      .from(transmittalDocuments)
      .where(eq(transmittalDocuments.transmittalId, input.transmittalId));

    const documentIds = linkedDocuments.map((entry) => String(entry.documentId));

    if (documentIds.length === 0) {
      throw new Error("This transmittal has no linked documents.");
    }

    const activeSteps = await db
      .select({
        id: workflowSteps.id,
        workflowId: workflowSteps.workflowId,
        stepNumber: workflowSteps.stepNumber,
        assignedTo: workflowSteps.assignedTo,
        documentId: documentWorkflows.documentId,
        totalSteps: documentWorkflows.totalSteps,
        documentNumber: documents.documentNumber,
      })
      .from(workflowSteps)
      .innerJoin(documentWorkflows, eq(workflowSteps.workflowId, documentWorkflows.id))
      .innerJoin(documents, eq(documentWorkflows.documentId, documents.id))
      .where(
        and(
          eq(workflowSteps.assignedTo, sessionUser.id),
          inArray(documentWorkflows.documentId, documentIds),
          inArray(workflowSteps.status, ["pending", "in_progress"])
        )
      )
      .orderBy(asc(workflowSteps.stepNumber), desc(documents.updatedAt));

    const now = new Date();
    const normalizedComments = input.comments?.trim() || null;
    const approvalCode =
      normalizeClientApprovalCode(input.approvalCode) ??
      getClientApprovalOptionByStatus(input.reviewStatus)?.approvalCode ??
      null;
    const attachmentUrl = normalizeOptionalString(input.attachmentUrl);
    const attachmentFileName = normalizeOptionalString(input.attachmentFileName);
    const attachmentFileSize = input.attachmentFileSize ?? null;
    const mappedDecision =
      input.reviewStatus === "approved"
        ? "approve"
        : input.reviewStatus === "approved_with_comments"
          ? "approve_with_comments"
          : input.reviewStatus === "rejected"
            ? "reject"
            : "for_information";

    if (normalizedComments && activeSteps.length > 0) {
      await db.insert(documentComments).values(
        activeSteps.map((step) => ({
          id: createEdmsId("document-comment"),
          documentId: String(step.documentId),
          userId: sessionUser.id,
          comment: normalizedComments,
          commentType: "review",
          createdAt: now,
          updatedAt: now,
        }))
      );
    }

    for (const step of activeSteps) {
      await db
        .update(workflowSteps)
        .set({
          status: input.reviewStatus === "rejected" ? "rejected" : "completed",
          action: mappedDecision,
          comments: normalizedComments,
          approvalCode: mapDecisionToApprovalCode(mappedDecision),
          attachmentUrl,
          attachmentFileName,
          attachmentFileSize,
          completedAt: now,
          startedAt: now,
        })
        .where(eq(workflowSteps.id, step.id));

      const [nextStep] = await db
        .select({
          id: workflowSteps.id,
          stepNumber: workflowSteps.stepNumber,
          assignedTo: workflowSteps.assignedTo,
        })
        .from(workflowSteps)
        .where(
          and(eq(workflowSteps.workflowId, String(step.workflowId)), eq(workflowSteps.status, "pending"))
        )
        .orderBy(asc(workflowSteps.stepNumber))
        .limit(1);

      if (input.reviewStatus === "rejected") {
        await db
          .update(documentWorkflows)
          .set({
            status: "rejected",
            completedAt: now,
          })
          .where(eq(documentWorkflows.id, String(step.workflowId)));

        await db
          .update(documents)
          .set({
            status: "rejected",
            rejectedAt: now,
            rejectedBy: sessionUser.id,
            updatedAt: now,
            updatedBy: sessionUser.id,
          })
          .where(eq(documents.id, String(step.documentId)));
      } else if (nextStep && nextStep.assignedTo !== sessionUser.id) {
        await db
          .update(documentWorkflows)
          .set({
            currentStep: nextStep.stepNumber,
            status: "in_progress",
          })
          .where(eq(documentWorkflows.id, String(step.workflowId)));

        await db
          .update(workflowSteps)
          .set({
            status: "in_progress",
            startedAt: now,
          })
          .where(eq(workflowSteps.id, nextStep.id));
      } else {
        if (nextStep && nextStep.assignedTo === sessionUser.id) {
          await db
            .update(workflowSteps)
            .set({
              status: "completed",
              action: mappedDecision,
              comments: normalizedComments,
              approvalCode: mapDecisionToApprovalCode(mappedDecision),
              attachmentUrl,
              attachmentFileName,
              attachmentFileSize,
              completedAt: now,
              startedAt: now,
            })
            .where(eq(workflowSteps.id, nextStep.id));
        }

        await db
          .update(documentWorkflows)
          .set({
            currentStep: step.totalSteps,
            status: "approved",
            completedAt: now,
          })
          .where(eq(documentWorkflows.id, String(step.workflowId)));

        await db
          .update(documents)
          .set({
            status: "approved",
            approvedAt: now,
            approvedBy: sessionUser.id,
            updatedAt: now,
            updatedBy: sessionUser.id,
          })
          .where(eq(documents.id, String(step.documentId)));
      }
    }

    await db
      .update(transmittals)
      .set({
        status: "reviewed",
        notes: JSON.stringify({
          reviewStatus: input.reviewStatus,
          comments: normalizedComments,
          approvalCode,
          attachmentUrl,
          attachmentFileName,
          attachmentFileSize,
          reviewedAt: now.toISOString(),
          reviewedBy: sessionUser.id,
        }),
      })
      .where(eq(transmittals.id, input.transmittalId));

    if (transmittalSummary.sentFrom) {
      await notifyUsers({
        userIds: [transmittalSummary.sentFrom],
        preferenceKey: "approvalDecision",
        type: "transmittal_reviewed",
        title: "Client reviewed your document",
        message: `${transmittalSummary.transmittalNumber} has been reviewed and returned.`,
        projectId: String(transmittalSummary.projectId),
        documentId: documentIds[0] ?? null,
        relatedEntityType: "transmittal",
        relatedEntityId: input.transmittalId,
        actionUrl: `/transmittals/${input.transmittalId}`,
      });
    }

    await logEdmsActivity({
      userId: sessionUser.id,
      projectId: String(transmittalSummary.projectId),
      action: "transmittal_reviewed",
      entityType: "transmittal",
      entityId: input.transmittalId,
      entityName: transmittalSummary.transmittalNumber,
      description: `${input.reviewStatus.replaceAll("_", " ")} recorded for the issued package.`,
      metadata: approvalCode ? { approvalCode } : null,
    });

    revalidatePath("/transmittals");
    revalidatePath(`/transmittals/${input.transmittalId}`);
    revalidatePath("/workflows");
    revalidatePath("/documents");

    return actionOk({
      id: input.transmittalId,
    });
  } catch (error) {
    return actionFromError(error, "Unable to review the transmittal.");
  }
}

export async function acknowledgeTransmittal(input: { transmittalId: string }) {
  try {
    const sessionUser = await requireActionSessionUser();

    const [transmittalSummary] = await db
      .select({
        id: transmittals.id,
        projectId: transmittals.projectId,
        transmittalNumber: transmittals.transmittalNumber,
        status: transmittals.status,
        sentFrom: transmittals.sentFrom,
      })
      .from(transmittals)
      .where(eq(transmittals.id, input.transmittalId))
      .limit(1);

    if (!transmittalSummary) {
      throw new Error("Transmittal not found.");
    }

    if (transmittalSummary.sentFrom !== sessionUser.id && sessionUser.role !== "admin") {
      throw new Error("Only the sender can acknowledge this transmittal.");
    }

    if (transmittalSummary.status !== "reviewed") {
      throw new Error("Only reviewed transmittals can be acknowledged.");
    }

    const now = new Date();

    await db
      .update(transmittals)
      .set({
        status: "acknowledged",
        acknowledgedAt: now,
        acknowledgedBy: sessionUser.id,
      })
      .where(eq(transmittals.id, input.transmittalId));

    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: now,
      })
      .where(
        and(
          eq(notifications.userId, sessionUser.id),
          eq(notifications.relatedEntityType, "transmittal"),
          eq(notifications.relatedEntityId, input.transmittalId)
        )
      );

    await logEdmsActivity({
      userId: sessionUser.id,
      projectId: String(transmittalSummary.projectId),
      action: "transmittal_acknowledged",
      entityType: "transmittal",
      entityId: input.transmittalId,
      entityName: transmittalSummary.transmittalNumber,
      description: "Acknowledged reviewed package and closed the issue cycle.",
    });

    revalidatePath("/transmittals");
    revalidatePath(`/transmittals/${input.transmittalId}`);

    return actionOk({
      id: input.transmittalId,
    });
  } catch (error) {
    return actionFromError(error, "Unable to acknowledge the transmittal.");
  }
}
