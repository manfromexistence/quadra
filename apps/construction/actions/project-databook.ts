"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { documents } from "@/db/schema/documents";
import { projects } from "@/db/schema/projects";
import { canManageEdmsContent } from "@/lib/edms/rbac";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { mergePDFsWithCover } from "@/lib/pdf-merger";
import { expandStorageUrl } from "@/lib/storage-utils";
import type { ActionResult } from "@/types/errors";
import { actionError, actionSuccess } from "@/types/errors";

interface DataBookDocument {
  id: string;
  documentNumber: string;
  title: string;
  discipline: string | null;
  category: string | null;
  revision: string | null;
  fileUrl: string;
  fileName: string;
}

async function uploadPDFToCatbox(
  pdfBuffer: Buffer,
  fileName: string
): Promise<{ success: boolean; url: string }> {
  try {
    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append(
      "fileToUpload",
      new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" }),
      fileName
    );

    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return { success: false, url: "" };
    }

    const fileUrl = await response.text();
    return { success: true, url: fileUrl.trim() };
  } catch (error) {
    console.error("Catbox upload error:", error);
    return { success: false, url: "" };
  }
}

export async function getProjectDataBookDocuments(
  projectId: string
): Promise<ActionResult<{ documents: DataBookDocument[]; projectName: string }>> {
  try {
    const access = await getRequiredDashboardSessionUser();

    if (!canManageEdmsContent(access.role)) {
      return actionError(
        "UNAUTHORIZED",
        "You do not have permission to generate project data books."
      );
    }

    const [project] = await db
      .select({ name: projects.name })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return actionError("VALIDATION_ERROR", "Project not found.");
    }

    const approvedDocs = await db
      .select({
        id: documents.id,
        documentNumber: documents.documentNumber,
        title: documents.title,
        discipline: documents.discipline,
        category: documents.category,
        revision: documents.revision,
        fileUrl: documents.fileUrl,
        fileName: documents.fileName,
      })
      .from(documents)
      .where(eq(documents.projectId, projectId))
      .orderBy(documents.documentNumber);

    return actionSuccess({
      documents: approvedDocs.map((doc) => ({
        id: String(doc.id),
        documentNumber: doc.documentNumber,
        title: doc.title,
        discipline: doc.discipline,
        category: doc.category,
        revision: doc.revision,
        fileUrl: expandStorageUrl(doc.fileUrl),
        fileName: doc.fileName,
      })),
      projectName: project.name,
    });
  } catch (error) {
    console.error("Error fetching project data book documents:", error);
    return actionError(
      "UNKNOWN_ERROR",
      "Failed to fetch project documents for data book compilation."
    );
  }
}

export async function generateProjectDataBook(
  projectId: string,
  documentIds: string[]
): Promise<ActionResult<{ downloadUrl: string; fileName: string }>> {
  try {
    const access = await getRequiredDashboardSessionUser();

    if (!canManageEdmsContent(access.role)) {
      return actionError(
        "UNAUTHORIZED",
        "You do not have permission to generate project data books."
      );
    }

    const [project] = await db
      .select({ name: projects.name, projectNumber: projects.projectNumber })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return actionError("VALIDATION_ERROR", "Project not found.");
    }

    const allDocs = await db
      .select({
        id: documents.id,
        documentNumber: documents.documentNumber,
        title: documents.title,
        fileUrl: documents.fileUrl,
        fileName: documents.fileName,
      })
      .from(documents)
      .where(eq(documents.projectId, projectId))
      .orderBy(documents.documentNumber);

    const selectedDocs = allDocs.filter((doc) => documentIds.includes(String(doc.id)));

    if (selectedDocs.length === 0) {
      return actionError("VALIDATION_ERROR", "No documents selected for compilation.");
    }

    const pdfFiles = selectedDocs.map((doc) => ({
      url: expandStorageUrl(doc.fileUrl),
      fileName: doc.fileName,
    }));

    const mergedPdfBytes = await mergePDFsWithCover(pdfFiles, project.name, project.projectNumber);

    const timestamp = new Date().toISOString().split("T")[0];
    const dataBookFileName = `${project.projectNumber || "PROJECT"}_DataBook_${timestamp}.pdf`;

    const pdfBuffer = Buffer.from(mergedPdfBytes);

    const uploadResult = await uploadPDFToCatbox(pdfBuffer, dataBookFileName);

    if (!uploadResult.success) {
      return actionError("UNKNOWN_ERROR", "Failed to upload merged PDF to storage.");
    }

    return actionSuccess({
      downloadUrl: uploadResult.url,
      fileName: dataBookFileName,
    });
  } catch (error) {
    console.error("Error generating project data book:", error);
    return actionError(
      "UNKNOWN_ERROR",
      error instanceof Error ? error.message : "Failed to generate project data book."
    );
  }
}
