import "server-only";

import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import {
  documentComments,
  documents,
  documentVersions,
} from "@/db/schema/documents";
import { projects } from "@/db/schema/projects";
import { documentWorkflows, workflowSteps } from "@/db/schema/workflows";
import { canAccessProject } from "./access";
import { getEdmsDashboardData } from "./dashboard";
import { formatStoredAbsoluteDate } from "./dates";
import type { DashboardSessionUser } from "./session";

export interface DocumentDetailData {
  document: {
    id: string;
    title: string;
    documentNumber: string;
    description: string | null;
    projectName: string;
    projectId: string;
    status: string;
    discipline: string | null;
    category: string | null;
    version: string;
    revision: string | null;
    fileName: string;
    fileType: string | null;
    fileUrl: string;
    images: string | null;
    tags: string[];
    uploadedLabel: string;
  };
  versions: {
    id: string;
    version: string;
    fileName: string;
    fileUrl: string;
    changeDescription: string | null;
    uploadedLabel: string;
    uploadedByName: string;
  }[];
  comments: {
    id: string;
    comment: string;
    commentType: string;
    authorName: string;
    createdLabel: string;
  }[];
  workflow: {
    workflowName: string;
    status: string;
    currentStep: number;
    totalSteps: number;
    steps: {
      id: string;
      stepName: string;
      status: string;
      assignedRole: string | null;
      assignedToName: string;
      completedLabel: string;
      comments: string | null;
    }[];
  } | null;
  isUsingFallbackData: boolean;
  statusMessage: string | null;
}

export async function getDocumentDetailData(
  documentId: string,
  sessionUser: DashboardSessionUser,
): Promise<DocumentDetailData | null> {
  try {
    const [documentRows, versionRows, commentRows, workflowRows] =
      await Promise.all([
        db
          .select({
            id: documents.id,
            title: documents.title,
            documentNumber: documents.documentNumber,
            description: documents.description,
            projectName: projects.name,
            projectId: projects.id,
            status: documents.status,
            discipline: documents.discipline,
            category: documents.category,
            version: documents.version,
            revision: documents.revision,
            fileName: documents.fileName,
            fileType: documents.fileType,
            fileUrl: documents.fileUrl,
            images: documents.images,
            tags: documents.tags,
            uploadedAt: documents.uploadedAt,
          })
          .from(documents)
          .innerJoin(projects, eq(documents.projectId, projects.id))
          .where(eq(documents.id, documentId))
          .limit(1),
        db
          .select({
            id: documentVersions.id,
            version: documentVersions.version,
            fileName: documentVersions.fileName,
            fileUrl: documentVersions.fileUrl,
            changeDescription: documentVersions.changeDescription,
            uploadedAt: documentVersions.uploadedAt,
            uploadedByName: userTable.name,
          })
          .from(documentVersions)
          .leftJoin(userTable, eq(documentVersions.uploadedBy, userTable.id))
          .where(eq(documentVersions.documentId, documentId))
          .orderBy(desc(documentVersions.uploadedAt)),
        db
          .select({
            id: documentComments.id,
            comment: documentComments.comment,
            commentType: documentComments.commentType,
            authorName: userTable.name,
            createdAt: documentComments.createdAt,
          })
          .from(documentComments)
          .leftJoin(userTable, eq(documentComments.userId, userTable.id))
          .where(eq(documentComments.documentId, documentId))
          .orderBy(desc(documentComments.createdAt)),
        db
          .select({
            id: documentWorkflows.id,
            workflowName: documentWorkflows.workflowName,
            status: documentWorkflows.status,
            currentStep: documentWorkflows.currentStep,
            totalSteps: documentWorkflows.totalSteps,
          })
          .from(documentWorkflows)
          .where(eq(documentWorkflows.documentId, documentId))
          .orderBy(desc(documentWorkflows.startedAt))
          .limit(1),
      ]);

    const [document] = documentRows;

    if (!document) {
      return null;
    }

    const hasAccess = await canAccessProject(
      sessionUser,
      String(document.projectId),
    );

    if (!hasAccess) {
      return null;
    }

    const [workflow] = workflowRows;
    const workflowStepRows = workflow
      ? await db
          .select({
            id: workflowSteps.id,
            stepName: workflowSteps.stepName,
            status: workflowSteps.status,
            assignedRole: workflowSteps.assignedRole,
            assignedToName: userTable.name,
            completedAt: workflowSteps.completedAt,
            comments: workflowSteps.comments,
          })
          .from(workflowSteps)
          .leftJoin(userTable, eq(workflowSteps.assignedTo, userTable.id))
          .where(eq(workflowSteps.workflowId, workflow.id))
          .orderBy(asc(workflowSteps.stepNumber))
      : [];

    return {
      document: {
        id: String(document.id),
        title: document.title,
        documentNumber: document.documentNumber,
        description: document.description,
        projectName: document.projectName,
        projectId: String(document.projectId),
        status: document.status,
        discipline: document.discipline,
        category: document.category,
        version: document.version,
        revision: document.revision,
        fileName: document.fileName,
        fileType: document.fileType,
        fileUrl: document.fileUrl,
        images: document.images,
        tags: parseTags(document.tags),
        uploadedLabel: formatDateLabel(document.uploadedAt, "Uploaded"),
      },
      versions: versionRows.map((version) => ({
        id: String(version.id),
        version: version.version,
        fileName: version.fileName,
        fileUrl: version.fileUrl,
        changeDescription: version.changeDescription,
        uploadedLabel: formatDateLabel(version.uploadedAt, "Uploaded"),
        uploadedByName: version.uploadedByName ?? "System",
      })),
      comments: commentRows.map((comment) => ({
        id: String(comment.id),
        comment: comment.comment,
        commentType: comment.commentType,
        authorName: comment.authorName ?? "System",
        createdLabel: formatDateLabel(comment.createdAt, "Logged"),
      })),
      workflow: workflow
        ? {
            workflowName: workflow.workflowName,
            status: workflow.status,
            currentStep: workflow.currentStep,
            totalSteps: workflow.totalSteps,
            steps: workflowStepRows.map((step) => ({
              id: String(step.id),
              stepName: step.stepName,
              status: step.status,
              assignedRole: step.assignedRole,
              assignedToName: step.assignedToName ?? "Unassigned",
              completedLabel: formatDateLabel(step.completedAt, "Completed"),
              comments: step.comments,
            })),
          }
        : null,
      isUsingFallbackData: false,
      statusMessage: null,
    };
  } catch (error) {
    return createFallbackDocumentDetail(documentId, sessionUser, error);
  }
}

async function createFallbackDocumentDetail(
  documentId: string,
  sessionUser: DashboardSessionUser,
  error: unknown,
): Promise<DocumentDetailData | null> {
  const dashboard = await getEdmsDashboardData(sessionUser);
  const document = dashboard.documents.find((entry) => entry.id === documentId);

  if (!document) {
    return null;
  }

  return {
    document: {
      id: document.id,
      title: document.title,
      documentNumber: document.documentNumber,
      description:
        "Fallback document detail is active while the live EDMS database is still being connected.",
      projectName: document.projectName,
      projectId: "fallback-project-1",
      status: document.status,
      discipline: document.discipline,
      category: "Drawing",
      version: "1.0",
      revision: document.revision,
      fileName: "sample-document.pdf",
      fileType: "pdf",
      fileUrl: "https://example.com/sample-document.pdf",
      images: null,
      tags: ["sample", "fallback"],
      uploadedLabel: document.uploadedLabel,
    },
    versions: [
      {
        id: "fallback-version-1",
        version: "1.0",
        fileName: "sample-document.pdf",
        fileUrl: "https://example.com/sample-document.pdf",
        changeDescription: "Initial issue for review",
        uploadedLabel: document.uploadedLabel,
        uploadedByName: sessionUser.name,
      },
    ],
    comments: [
      {
        id: "fallback-comment-1",
        comment:
          "PMC review comments will appear here once the live database is connected.",
        commentType: "review",
        authorName: "Ayesha Karim",
        createdLabel: "Logged 01 Apr 2026",
      },
    ],
    workflow: {
      workflowName: "Fallback review route",
      status: "in_progress",
      currentStep: 1,
      totalSteps: 2,
      steps: [
        {
          id: "fallback-step-1",
          stepName: "Technical review",
          status: "in_progress",
          assignedRole: "pmc",
          assignedToName: "Ayesha Karim",
          completedLabel: "Completed not scheduled",
          comments: "Review notes are pending in fallback mode.",
        },
      ],
    },
    isUsingFallbackData: true,
    statusMessage: getFallbackMessage(error),
  };
}

function parseTags(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function formatDateLabel(date: Date | null, prefix: string) {
  if (!date) {
    return `${prefix} not scheduled`;
  }

  return `${prefix} ${formatStoredAbsoluteDate(date) ?? "date pending"}`;
}

function getFallbackMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Showing sample document detail while the live EDMS workspace is still being connected.";
  }

  if (error.message.includes("DATABASE_URL")) {
    return "Showing sample document detail because DATABASE_URL is not configured in this environment.";
  }

  if (
    error.message.includes("does not exist") ||
    error.message.includes("relation") ||
    error.message.includes("column")
  ) {
    return "Showing sample document detail until the EDMS database migrations are applied.";
  }

  return "Showing sample document detail while the live EDMS workspace is still being connected.";
}
