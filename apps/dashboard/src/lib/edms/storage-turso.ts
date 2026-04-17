import "server-only";

import { randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";
import { db } from "@/db";
import { edmsFileAssets } from "@/db/schema/edms-file-assets";
import { getServerAppUrl } from "@/utils/app-url";

const TURSO_EDMS_FALLBACK_MAX_BYTES = 5 * 1024 * 1024;

export interface TursoUploadedEdmsFile {
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
  pathname: string;
}

export function canStoreEdmsFileInTurso(file: File) {
  return file.size <= TURSO_EDMS_FALLBACK_MAX_BYTES;
}

export async function uploadEdmsFileToTurso(input: {
  file: File;
  projectId: string;
  folder: "documents" | "versions" | "workflow-attachments";
}): Promise<TursoUploadedEdmsFile> {
  if (!canStoreEdmsFileInTurso(input.file)) {
    throw new Error(
      `Turso EDMS fallback supports files up to ${Math.round(TURSO_EDMS_FALLBACK_MAX_BYTES / (1024 * 1024))} MB.`,
    );
  }

  const assetId = randomUUID();
  const dataBase64 = Buffer.from(await input.file.arrayBuffer()).toString("base64");
  const fileType = input.file.type || getExtensionFromFileName(input.file.name);

  await db.insert(edmsFileAssets).values({
    id: assetId,
    projectId: input.projectId,
    folder: input.folder,
    fileName: input.file.name,
    fileType,
    fileSize: input.file.size,
    dataBase64,
    createdAt: new Date(),
  });

  return {
    fileName: input.file.name,
    fileType,
    fileUrl: `${getServerAppUrl()}/api/edms/assets/${assetId}`,
    fileSize: input.file.size,
    pathname: `edms-assets/${assetId}/${input.file.name}`,
  } satisfies TursoUploadedEdmsFile;
}

function getExtensionFromFileName(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.at(-1) ?? "file") : "file";
}
