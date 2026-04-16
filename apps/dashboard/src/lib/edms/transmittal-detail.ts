import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { documents } from "@/db/schema/documents";
import { projects } from "@/db/schema/projects";
import { transmittalDocuments, transmittals } from "@/db/schema/transmittals";
import { documentWorkflows, workflowSteps } from "@/db/schema/workflows";
import { canAccessProject } from "./access";
import type { DashboardSessionUser } from "./session";

export interface TransmittalDetailData {
  transmittal: {
    id: string;
    transmittalNumber: string;
    subject: string;
    description: string | null;
    status: string;
    projectId: string;
    projectName: string;
    senderId: string | null;
    senderName: string;
    sentLabel: string;
    recipients: string[];
    ccRecipients: string[];
    review: {
      reviewStatus: string | null;
      comments: string | null;
      approvalCode: string | null;
      attachmentUrl: string | null;
      attachmentFileName: string | null;
      attachmentFileSize: number | null;
      reviewedAt: string | null;
      reviewedBy: string | null;
    } | null;
  };
  documents: Array<{
    id: string;
    documentNumber: string;
    title: string;
    fileUrl: string;
    fileType: string | null;
    revision: string | null;
    discipline: string | null;
    status: string;
  }>;
  activeWorkflowStep: {
    id: string;
    workflowId: string;
    stepName: string;
    documentId: string;
    documentTitle: string;
    isActionable: boolean;
  } | null;
  isSender: boolean;
  isRecipient: boolean;
}

export async function getTransmittalDetailData(
  transmittalId: string,
  sessionUser: DashboardSessionUser
): Promise<TransmittalDetailData | null> {
  const [transmittal] = await db
    .select({
      id: transmittals.id,
      transmittalNumber: transmittals.transmittalNumber,
      subject: transmittals.subject,
      description: transmittals.description,
      status: transmittals.status,
      projectId: projects.id,
      projectName: projects.name,
      senderId: transmittals.sentFrom,
      senderName: userTable.name,
      sentAt: transmittals.sentAt,
      createdAt: transmittals.createdAt,
      sentTo: transmittals.sentTo,
      ccTo: transmittals.ccTo,
      notes: transmittals.notes,
    })
    .from(transmittals)
    .innerJoin(projects, eq(transmittals.projectId, projects.id))
    .leftJoin(userTable, eq(transmittals.sentFrom, userTable.id))
    .where(eq(transmittals.id, transmittalId))
    .limit(1);

  if (!transmittal) {
    return null;
  }

  const hasProjectAccess = await canAccessProject(sessionUser, String(transmittal.projectId));

  if (!hasProjectAccess) {
    return null;
  }

  const documentRows = await db
    .select({
      id: documents.id,
      documentNumber: documents.documentNumber,
      title: documents.title,
      fileUrl: documents.fileUrl,
      fileType: documents.fileType,
      revision: documents.revision,
      discipline: documents.discipline,
      status: documents.status,
    })
    .from(transmittalDocuments)
    .innerJoin(documents, eq(transmittalDocuments.documentId, documents.id))
    .where(eq(transmittalDocuments.transmittalId, transmittalId))
    .orderBy(asc(documents.documentNumber));

  const documentIds = documentRows.map((row) => row.id);

  const [activeStep] =
    documentIds.length === 0
      ? []
      : await db
          .select({
            id: workflowSteps.id,
            workflowId: workflowSteps.workflowId,
            stepName: workflowSteps.stepName,
            assignedTo: workflowSteps.assignedTo,
            documentId: documents.id,
            documentTitle: documents.title,
          })
          .from(workflowSteps)
          .innerJoin(documentWorkflows, eq(workflowSteps.workflowId, documentWorkflows.id))
          .innerJoin(documents, eq(documentWorkflows.documentId, documents.id))
          .where(
            and(
              inArray(documents.id, documentIds),
              inArray(workflowSteps.status, ["pending", "in_progress"])
            )
          )
          .orderBy(asc(workflowSteps.stepNumber));

  const recipients = parseJsonArray(transmittal.sentTo);
  const ccRecipients = parseJsonArray(transmittal.ccTo);

  return {
    transmittal: {
      id: transmittal.id,
      transmittalNumber: transmittal.transmittalNumber,
      subject: transmittal.subject,
      description: transmittal.description,
      status: transmittal.status,
      projectId: transmittal.projectId,
      projectName: transmittal.projectName,
      senderId: transmittal.senderId,
      senderName: transmittal.senderName ?? "System",
      sentLabel: formatDateLabel(transmittal.sentAt ?? transmittal.createdAt),
      recipients,
      ccRecipients,
      review: parseReviewNotes(transmittal.notes),
    },
    documents: documentRows.map((row) => ({
      id: row.id,
      documentNumber: row.documentNumber,
      title: row.title,
      fileUrl: row.fileUrl,
      fileType: row.fileType,
      revision: row.revision,
      discipline: row.discipline,
      status: row.status,
    })),
    activeWorkflowStep: activeStep
      ? {
          id: activeStep.id,
          workflowId: activeStep.workflowId,
          stepName: activeStep.stepName,
          documentId: activeStep.documentId,
          documentTitle: activeStep.documentTitle,
          isActionable: activeStep.assignedTo === sessionUser.id,
        }
      : null,
    isSender: transmittal.senderId === sessionUser.id,
    isRecipient: recipients.includes(sessionUser.id),
  };
}

function parseJsonArray(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    return [];
  }
}

function parseReviewNotes(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as {
      reviewStatus?: string | null;
      comments?: string | null;
      approvalCode?: string | null;
      attachmentUrl?: string | null;
      attachmentFileName?: string | null;
      attachmentFileSize?: number | null;
      reviewedAt?: string | null;
      reviewedBy?: string | null;
    };

    return {
      reviewStatus: parsed.reviewStatus ?? null,
      comments: parsed.comments ?? null,
      approvalCode: parsed.approvalCode ?? null,
      attachmentUrl: parsed.attachmentUrl ?? null,
      attachmentFileName: parsed.attachmentFileName ?? null,
      attachmentFileSize: parsed.attachmentFileSize ?? null,
      reviewedAt: parsed.reviewedAt ?? null,
      reviewedBy: parsed.reviewedBy ?? null,
    };
  } catch {
    return null;
  }
}

function formatDateLabel(date: Date | null) {
  if (!date) {
    return "Issued date pending";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
