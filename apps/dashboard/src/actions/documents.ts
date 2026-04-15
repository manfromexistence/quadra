"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { documents, documentVersions } from "@/db/schema/documents";
import { projects } from "@/db/schema/projects";
import { canAccessProject } from "@/lib/edms/access";
import { logEdmsActivity } from "@/lib/edms/notifications";
import {
  actionFromError,
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

    const hasProjectAccess = await canAccessProject(sessionUser, input.projectId);

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
      .where(eq(projects.id, input.projectId))
      .limit(1);

    if (!projectSummary) {
      throw new Error("Project not found.");
    }

    const [documentCount] = await db
      .select({ value: count() })
      .from(documents)
      .where(eq(documents.projectId, input.projectId));

    const documentId = createEdmsId("document");
    const now = new Date();
    const documentNumber =
      normalizeOptionalString(input.documentNumber) ??
      buildDocumentNumber({
        projectNumber: projectSummary.projectNumber,
        discipline: input.discipline,
        category: input.category,
        sequence: Number(documentCount?.value ?? 0) + 1,
      });

    await db.insert(documents).values({
      id: documentId,
      projectId: input.projectId,
      documentNumber,
      title: input.title.trim(),
      description: normalizeOptionalString(input.description),
      discipline: normalizeOptionalString(input.discipline),
      category: normalizeOptionalString(input.category),
      version: input.version.trim(),
      revision: normalizeOptionalString(input.revision),
      fileName: input.fileName.trim(),
      fileSize: input.fileSize ?? null,
      fileType: normalizeOptionalString(input.fileType),
      fileUrl: input.fileUrl.trim(),
      status: input.status,
      tags: JSON.stringify(parseTagList(input.tags)),
      images: input.images?.length ? JSON.stringify(input.images) : null,
      uploadedAt: now,
      uploadedBy: sessionUser.id,
      updatedAt: now,
      updatedBy: sessionUser.id,
      approvedAt: input.status === "approved" ? now : null,
      approvedBy: input.status === "approved" ? sessionUser.id : null,
      rejectedAt: input.status === "rejected" ? now : null,
      rejectedBy: input.status === "rejected" ? sessionUser.id : null,
    });

    await db.insert(documentVersions).values({
      id: createEdmsId("document-version"),
      documentId,
      version: input.version.trim(),
      fileName: input.fileName.trim(),
      fileUrl: input.fileUrl.trim(),
      fileSize: input.fileSize ?? null,
      changeDescription: "Initial issue",
      uploadedAt: now,
      uploadedBy: sessionUser.id,
    });

    await logEdmsActivity({
      userId: sessionUser.id,
      projectId: input.projectId,
      action: "document_uploaded",
      entityType: "document",
      entityId: documentId,
      entityName: documentNumber,
      description: `Registered ${input.title.trim()} in document control.`,
    });

    revalidatePath("/documents");
    revalidatePath(`/projects/${input.projectId}`);

    return actionOk({
      id: documentId,
      documentNumber,
    });
  } catch (error) {
    return actionFromError(error, "Unable to create the document.");
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
