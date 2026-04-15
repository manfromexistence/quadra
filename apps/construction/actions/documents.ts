"use server";

import { and, count, eq, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { documents, documentVersions } from "@/db/schema/documents";
import { projectMembers, projects } from "@/db/schema/projects";
import { logEdmsActivity, notifyUsers } from "@/lib/edms/notifications";
import { requireEdmsRole } from "@/lib/edms/rbac";
import { logError } from "@/lib/shared";
import { prepareDatabaseUrls } from "@/lib/storage-utils";
import { type ActionResult, actionError, actionSuccess, ErrorCode } from "@/types/errors";

const documentStatuses = [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "superseded",
] as const;

const createDocumentSchema = z.object({
  projectId: z.string().uuid("Project selection is required."),
  documentNumber: z.string().trim().max(100, "Document number is too long."),
  title: z.string().trim().min(2, "Document title is required.").max(500, "Title is too long."),
  description: z.string().trim().max(2000, "Description is too long."),
  discipline: z.string().trim().max(100, "Discipline is too long."),
  category: z.string().trim().max(100, "Category is too long."),
  version: z.string().trim().min(1, "Version is required.").max(50, "Version is too long."),
  revision: z.string().trim().max(50, "Revision is too long."),
  status: z.enum(documentStatuses),
  fileName: z.string().trim().min(2, "File name is required.").max(500, "File name is too long."),
  fileSize: z.number().int().nonnegative().optional(),
  fileType: z.string().trim().max(50, "File type is too long."),
  fileUrl: z.string().trim().url("Enter a valid file URL."),
  tags: z.string().trim().max(500, "Tags are too long."),
  images: z.array(z.string().url()).optional(),
});

const createDocumentVersionSchema = z.object({
  documentId: z.string().uuid("Document selection is required."),
  version: z.string().trim().min(1, "Version is required.").max(50, "Version is too long."),
  revision: z.string().trim().max(50, "Revision is too long."),
  status: z.enum(documentStatuses),
  fileName: z.string().trim().min(2, "File name is required.").max(500, "File name is too long."),
  fileSize: z.number().int().nonnegative().optional(),
  fileType: z.string().trim().max(50, "File type is too long."),
  fileUrl: z.string().trim().url("Enter a valid file URL."),
  changeDescription: z
    .string()
    .trim()
    .min(2, "Change description is required.")
    .max(2000, "Change description is too long."),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type CreateDocumentVersionInput = z.infer<typeof createDocumentVersionSchema>;

export async function createDocument(
  input: CreateDocumentInput
): Promise<ActionResult<{ id: string; documentNumber: string }>> {
  try {
    const validation = createDocumentSchema.safeParse(input);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid document data.";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    const access = await requireEdmsRole("vendor");
    const values = validation.data;
    const now = new Date();
    const documentNumber =
      values.documentNumber.trim().length > 0
        ? values.documentNumber.trim()
        : await generateDocumentNumber(values.projectId, values.discipline, values.category);

    // Optimize URLs for database storage (saves ~40-60 chars per URL)
    const optimizedData = prepareDatabaseUrls({
      fileUrl: values.fileUrl,
      images: values.images,
    });

    // Insert document
    const [insertedDocument] = await db
      .insert(documents)
      .values({
        projectId: values.projectId,
        documentNumber,
        title: values.title,
        description: normalizeOptionalString(values.description),
        discipline: normalizeOptionalString(values.discipline),
        category: normalizeOptionalString(values.category),
        version: values.version,
        revision: normalizeOptionalString(values.revision),
        fileName: values.fileName,
        fileSize: values.fileSize,
        fileType: normalizeOptionalString(values.fileType),
        fileUrl: optimizedData.fileUrl!,
        status: values.status,
        tags: normalizeTags(values.tags),
        images: optimizedData.images || null,
        uploadedBy: access.id,
        updatedBy: access.id,
        updatedAt: now,
      })
      .returning({ id: documents.id });

    // Insert initial version
    await db.insert(documentVersions).values({
      documentId: insertedDocument.id,
      version: values.version,
      fileName: values.fileName,
      fileUrl: values.fileUrl,
      fileSize: values.fileSize,
      changeDescription: "Initial issue",
      uploadedBy: access.id,
    });

    const createdDocument = insertedDocument;
    const recipientIds = await getProjectMemberUserIds(values.projectId, access.id);

    await Promise.allSettled([
      notifyUsers({
        userIds: recipientIds,
        preferenceKey: "documentSubmission",
        type: "document_submitted",
        title: `New document submitted: ${documentNumber}`,
        message: `${values.title} has been registered in document control and is ready for project review activity.`,
        projectId: values.projectId,
        documentId: createdDocument.id,
        relatedEntityType: "document",
        relatedEntityId: createdDocument.id,
        actionUrl: `/dashboard/documents/${createdDocument.id}`,
        emailSubject: `QUADRA: ${documentNumber} submitted`,
      }),
      logEdmsActivity({
        userId: access.id,
        projectId: values.projectId,
        action: "document_submitted",
        entityType: "document",
        entityId: createdDocument.id,
        entityName: values.title,
        description: `${documentNumber} was registered with version ${values.version}.`,
        metadata: {
          documentNumber,
          status: values.status,
          version: values.version,
        },
      }),
    ]);

    revalidateDocuments(createdDocument.id, values.projectId);
    return actionSuccess({ id: createdDocument.id, documentNumber });
  } catch (error) {
    logError(error as Error, { action: "createDocument", input });

    return actionError(
      ErrorCode.UNKNOWN_ERROR,
      getDocumentErrorMessage(error, "Failed to create document. Please try again.")
    );
  }
}

export async function createDocumentVersion(
  input: CreateDocumentVersionInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validation = createDocumentVersionSchema.safeParse(input);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid version data.";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    const access = await requireEdmsRole("vendor");
    const values = validation.data;
    const now = new Date();

    const documentRows = await db
      .select({
        id: documents.id,
        projectId: documents.projectId,
        currentVersion: documents.version,
        documentNumber: documents.documentNumber,
        title: documents.title,
      })
      .from(documents)
      .where(eq(documents.id, values.documentId))
      .limit(1);

    const [documentRecord] = documentRows;

    if (!documentRecord) {
      return actionError(ErrorCode.VALIDATION_ERROR, "Document was not found.");
    }

    if (documentRecord.currentVersion === values.version) {
      return actionError(
        ErrorCode.VALIDATION_ERROR,
        "The new version must differ from the current document version."
      );
    }

    await db
      .update(documents)
      .set({
        version: values.version,
        revision: normalizeOptionalString(values.revision),
        fileName: values.fileName,
        fileSize: values.fileSize,
        fileType: normalizeOptionalString(values.fileType),
        fileUrl: values.fileUrl,
        status: values.status,
        updatedAt: now,
        updatedBy: access.id,
      })
      .where(eq(documents.id, values.documentId));

    await db.insert(documentVersions).values({
      documentId: values.documentId,
      version: values.version,
      fileName: values.fileName,
      fileUrl: values.fileUrl,
      fileSize: values.fileSize,
      changeDescription: values.changeDescription,
      uploadedBy: access.id,
    });

    const recipientIds = await getProjectMemberUserIds(documentRecord.projectId, access.id);

    await Promise.allSettled([
      notifyUsers({
        userIds: recipientIds,
        preferenceKey: "documentSubmission",
        type: "document_revision_issued",
        title: `Revision issued: ${documentRecord.documentNumber}`,
        message: `${documentRecord.title} now has version ${values.version}${values.revision ? ` / revision ${values.revision}` : ""}.`,
        projectId: documentRecord.projectId,
        documentId: values.documentId,
        relatedEntityType: "document",
        relatedEntityId: values.documentId,
        actionUrl: `/dashboard/documents/${values.documentId}`,
        emailSubject: `QUADRA: ${documentRecord.documentNumber} revised`,
      }),
      logEdmsActivity({
        userId: access.id,
        projectId: documentRecord.projectId,
        action: "document_revision_issued",
        entityType: "document",
        entityId: values.documentId,
        entityName: documentRecord.title,
        description: `${documentRecord.documentNumber} advanced from version ${documentRecord.currentVersion} to ${values.version}.`,
        metadata: {
          documentNumber: documentRecord.documentNumber,
          previousVersion: documentRecord.currentVersion,
          nextVersion: values.version,
          revision: values.revision,
          status: values.status,
        },
      }),
    ]);

    revalidateDocuments(values.documentId, documentRecord.projectId);
    return actionSuccess({ id: values.documentId });
  } catch (error) {
    logError(error as Error, { action: "createDocumentVersion", input });

    return actionError(
      ErrorCode.UNKNOWN_ERROR,
      getDocumentErrorMessage(error, "Failed to issue the new version. Please try again.")
    );
  }
}

async function generateDocumentNumber(projectId: string, discipline: string, category: string) {
  const projectRows = await db
    .select({
      projectNumber: projects.projectNumber,
    })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  const [project] = projectRows;
  const projectCode = toSegmentCode(project?.projectNumber ?? "", "PRJ");
  const disciplineCode = toSegmentCode(discipline, "GEN");
  const categoryCode = toSegmentCode(category, "DOC");
  const likePattern = `${projectCode}-${disciplineCode}-${categoryCode}-%`;

  const countRows = await db
    .select({ value: count() })
    .from(documents)
    .where(and(eq(documents.projectId, projectId), ilike(documents.documentNumber, likePattern)));

  const [currentCount] = countRows;
  const sequence = String(Number(currentCount?.value ?? 0) + 1).padStart(3, "0");

  return `${projectCode}-${disciplineCode}-${categoryCode}-${sequence}`;
}

function toSegmentCode(value: string, fallback: string) {
  const cleaned = value.replace(/[^a-z0-9]+/gi, "").toUpperCase();

  if (cleaned.length === 0) {
    return fallback;
  }

  return cleaned.slice(0, 3).padEnd(3, "X");
}

async function getProjectMemberUserIds(projectId: string, excludeUserId?: string) {
  const memberRows = await db
    .select({
      userId: projectMembers.userId,
    })
    .from(projectMembers)
    .where(eq(projectMembers.projectId, projectId));

  return memberRows.map((member) => member.userId).filter((userId) => userId !== excludeUserId);
}

function revalidateDocuments(documentId: string, projectId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/workflows");
  revalidatePath(`/dashboard/documents/${documentId}`);
}

function normalizeOptionalString(value: string | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeTags(value: string | undefined) {
  if (!value) {
    return null;
  }

  const tags = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return tags.length > 0 ? JSON.stringify(tags) : null;
}

function getDocumentErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  if (error.message.includes("does not exist")) {
    return "Document tables are not available yet. Run the EDMS migrations before creating documents.";
  }

  if (error.message.includes("Insufficient permissions")) {
    return "Your role is not allowed to create controlled documents.";
  }

  return fallback;
}
