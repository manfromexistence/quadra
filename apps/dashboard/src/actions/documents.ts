"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { documents, documentVersions } from "@/db/schema/documents";
import { projects } from "@/db/schema/projects";
import { canAccessProject } from "@/lib/edms/access";
import { logEdmsActivity } from "@/lib/edms/notifications";
import type { DashboardSessionUser } from "@/lib/edms/session";
import {
  actionFromError,
  actionError,
  actionOk,
  createEdmsId,
  normalizeOptionalString,
  parseTagList,
  requireActionSessionUser,
  requireManageEdmsContent,
} from "./_edms";

interface CreateDocumentInput {
  projectId: string;
  documentNumber?: string;
  title: string;
  description?: string;
  discipline?: string;
  category?: string;
  version: string;
  revision?: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "superseded";
  fileName: string;
  fileSize?: number;
  fileType?: string;
  fileUrl: string;
  tags?: string;
  images?: string[];
}

interface CreateDocumentsBatchInput {
  projectId: string;
  discipline?: string;
  category?: string;
  status: CreateDocumentInput["status"];
  version?: string;
  revision?: string;
  description?: string;
  tags?: string;
  images?: string[];
  files: Array<{
    fileName: string;
    fileType?: string;
    fileUrl: string;
    fileSize?: number;
    title?: string;
  }>;
}

interface CreateDocumentVersionInput {
  documentId: string;
  version: string;
  revision?: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "superseded";
  fileName: string;
  fileSize?: number;
  fileType?: string;
  fileUrl: string;
  changeDescription: string;
}

export async function createDocument(input: CreateDocumentInput) {
  try {
    const sessionUser = await requireActionSessionUser();
    requireManageEdmsContent(sessionUser.role);

    const [documentCount] = await db
      .select({ value: count() })
      .from(documents)
      .where(eq(documents.projectId, input.projectId));

    const projectSummary = await requireProjectAccessSummary(sessionUser, input.projectId);
    const created = await insertDocumentRecord({
      sessionUser,
      projectId: input.projectId,
      projectNumber: projectSummary.projectNumber,
      sequence: Number(documentCount?.value ?? 0) + 1,
      input,
    });

    revalidatePath("/documents");
    revalidatePath(`/projects/${input.projectId}`);

    return actionOk({
      id: created.id,
      documentNumber: created.documentNumber,
    });
  } catch (error) {
    return actionFromError(error, "Unable to create the document.");
  }
}

export async function createDocumentsBatch(input: CreateDocumentsBatchInput) {
  try {
    const sessionUser = await requireActionSessionUser();
    requireManageEdmsContent(sessionUser.role);

    if (input.files.length === 0) {
      return actionError("Add at least one uploaded file before submitting the batch.");
    }

    const projectSummary = await requireProjectAccessSummary(sessionUser, input.projectId);

    const [documentCount] = await db
      .select({ value: count() })
      .from(documents)
      .where(eq(documents.projectId, input.projectId));

    const created: Array<{ id: string; documentNumber: string; fileName: string }> = [];
    const failed: Array<{ fileName: string; message: string }> = [];
    const startingSequence = Number(documentCount?.value ?? 0);

    for (const [index, file] of input.files.entries()) {
      try {
        const createdDocument = await insertDocumentRecord({
          sessionUser,
          projectId: input.projectId,
          projectNumber: projectSummary.projectNumber,
          sequence: startingSequence + index + 1,
          input: {
            projectId: input.projectId,
            documentNumber: "",
            title:
              normalizeOptionalString(file.title) ??
              file.fileName.replace(/\.[^/.]+$/, ""),
            description: input.description,
            discipline: input.discipline,
            category: input.category,
            version: normalizeOptionalString(input.version) ?? "1.0",
            revision: input.revision,
            status: input.status,
            fileName: file.fileName,
            fileSize: file.fileSize,
            fileType: file.fileType,
            fileUrl: file.fileUrl,
            tags: input.tags,
            images: input.images,
          },
        });

        created.push({
          id: createdDocument.id,
          documentNumber: createdDocument.documentNumber,
          fileName: file.fileName,
        });
      } catch (error) {
        failed.push({
          fileName: file.fileName,
          message:
            error instanceof Error && error.message.trim().length > 0
              ? error.message
              : "Unable to create the document.",
        });
      }
    }

    if (created.length > 0) {
      revalidatePath("/documents");
      revalidatePath(`/projects/${input.projectId}`);
    }

    return actionOk({
      created,
      failed,
    });
  } catch (error) {
    return actionFromError(error, "Unable to create the bulk document batch.");
  }
}

export async function createDocumentVersion(input: CreateDocumentVersionInput) {
  try {
    const sessionUser = await requireActionSessionUser();
    requireManageEdmsContent(sessionUser.role);

    const [documentSummary] = await db
      .select({
        id: documents.id,
        projectId: documents.projectId,
        title: documents.title,
        documentNumber: documents.documentNumber,
      })
      .from(documents)
      .where(eq(documents.id, input.documentId))
      .limit(1);

    if (!documentSummary) {
      throw new Error("Document not found.");
    }

    const hasProjectAccess = await canAccessProject(sessionUser, String(documentSummary.projectId));

    if (!hasProjectAccess) {
      throw new Error("You do not have access to this document.");
    }

    const now = new Date();

    await db.insert(documentVersions).values({
      id: createEdmsId("document-version"),
      documentId: input.documentId,
      version: input.version.trim(),
      fileName: input.fileName.trim(),
      fileUrl: input.fileUrl.trim(),
      fileSize: input.fileSize ?? null,
      changeDescription: input.changeDescription.trim(),
      uploadedAt: now,
      uploadedBy: sessionUser.id,
    });

    await db
      .update(documents)
      .set({
        version: input.version.trim(),
        revision: normalizeOptionalString(input.revision),
        fileName: input.fileName.trim(),
        fileSize: input.fileSize ?? null,
        fileType: normalizeOptionalString(input.fileType),
        fileUrl: input.fileUrl.trim(),
        status: input.status,
        updatedAt: now,
        updatedBy: sessionUser.id,
        approvedAt: input.status === "approved" ? now : null,
        approvedBy: input.status === "approved" ? sessionUser.id : null,
        rejectedAt: input.status === "rejected" ? now : null,
        rejectedBy: input.status === "rejected" ? sessionUser.id : null,
      })
      .where(eq(documents.id, input.documentId));

    await logEdmsActivity({
      userId: sessionUser.id,
      projectId: String(documentSummary.projectId),
      action: "document_revision_issued",
      entityType: "document",
      entityId: input.documentId,
      entityName: documentSummary.documentNumber,
      description: `Issued revision ${normalizeOptionalString(input.revision) ?? input.version.trim()}.`,
    });

    revalidatePath("/documents");
    revalidatePath(`/documents/${input.documentId}`);
    revalidatePath(`/projects/${documentSummary.projectId}`);

    return actionOk({
      id: input.documentId,
    });
  } catch (error) {
    return actionFromError(error, "Unable to issue the revision.");
  }
}

function buildDocumentNumber(input: {
  projectNumber: string | null;
  discipline?: string;
  category?: string;
  sequence: number;
}) {
  const projectSegment = input.projectNumber?.trim() || "PRJ";
  const disciplineSegment = abbreviateSegment(input.discipline, "GEN");
  const categorySegment = abbreviateSegment(input.category, "DOC");

  return `${projectSegment}-${disciplineSegment}-${categorySegment}-${String(input.sequence).padStart(3, "0")}`;
}

function abbreviateSegment(value: string | null | undefined, fallback: string) {
  const normalized = normalizeOptionalString(value);

  if (!normalized) {
    return fallback;
  }

  const compact = normalized.replace(/[^a-z0-9]+/gi, "");
  return compact.slice(0, 4).toUpperCase() || fallback;
}

async function requireProjectAccessSummary(
  sessionUser: DashboardSessionUser,
  projectId: string
) {
  const hasProjectAccess = await canAccessProject(sessionUser, projectId);

  if (!hasProjectAccess) {
    throw new Error("You do not have access to this project.");
  }

  const [projectSummary] = await db
    .select({
      id: projects.id,
      name: projects.name,
      projectNumber: projects.projectNumber,
    })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!projectSummary) {
    throw new Error("Project not found.");
  }

  return projectSummary;
}

async function insertDocumentRecord(input: {
  sessionUser: DashboardSessionUser;
  projectId: string;
  projectNumber: string | null;
  sequence: number;
  input: CreateDocumentInput;
}) {
  const documentId = createEdmsId("document");
  const now = new Date();
  const documentNumber =
    normalizeOptionalString(input.input.documentNumber) ??
    buildDocumentNumber({
      projectNumber: input.projectNumber,
      discipline: input.input.discipline,
      category: input.input.category,
      sequence: input.sequence,
    });

  await db.insert(documents).values({
    id: documentId,
    projectId: input.projectId,
    documentNumber,
    title: input.input.title.trim(),
    description: normalizeOptionalString(input.input.description),
    discipline: normalizeOptionalString(input.input.discipline),
    category: normalizeOptionalString(input.input.category),
    version: input.input.version.trim(),
    revision: normalizeOptionalString(input.input.revision),
    fileName: input.input.fileName.trim(),
    fileSize: input.input.fileSize ?? null,
    fileType: normalizeOptionalString(input.input.fileType),
    fileUrl: input.input.fileUrl.trim(),
    status: input.input.status,
    tags: JSON.stringify(parseTagList(input.input.tags)),
    images: input.input.images?.length ? JSON.stringify(input.input.images) : null,
    uploadedAt: now,
    uploadedBy: input.sessionUser.id,
    updatedAt: now,
    updatedBy: input.sessionUser.id,
    approvedAt: input.input.status === "approved" ? now : null,
    approvedBy: input.input.status === "approved" ? input.sessionUser.id : null,
    rejectedAt: input.input.status === "rejected" ? now : null,
    rejectedBy: input.input.status === "rejected" ? input.sessionUser.id : null,
  });

  await db.insert(documentVersions).values({
    id: createEdmsId("document-version"),
    documentId,
    version: input.input.version.trim(),
    fileName: input.input.fileName.trim(),
    fileUrl: input.input.fileUrl.trim(),
    fileSize: input.input.fileSize ?? null,
    changeDescription: "Initial issue",
    uploadedAt: now,
    uploadedBy: input.sessionUser.id,
  });

  await logEdmsActivity({
    userId: input.sessionUser.id,
    projectId: input.projectId,
    action: "document_uploaded",
    entityType: "document",
    entityId: documentId,
    entityName: documentNumber,
    description: `Registered ${input.input.title.trim()} in document control.`,
  });

  return {
    id: documentId,
    documentNumber,
  };
}
