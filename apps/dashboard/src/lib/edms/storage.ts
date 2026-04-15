import "server-only";

import { put } from "@vercel/blob";

const EDMS_UPLOAD_PREFIX = "edms";

export interface UploadedEdmsFile {
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
  pathname: string;
}

export function isBlobStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function uploadEdmsFile(input: {
  file: File;
  projectId: string;
  folder: "documents" | "versions";
}) {
  if (!isBlobStorageConfigured()) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured.");
  }

  const pathname = buildBlobPath(input.projectId, input.folder, input.file.name);
  const uploadedFile = await put(pathname, input.file, {
    access: "public",
    addRandomSuffix: true,
    contentType: input.file.type || undefined,
  });

  return {
    fileName: input.file.name,
    fileType: input.file.type || getExtensionFromFileName(input.file.name),
    fileUrl: uploadedFile.url,
    fileSize: input.file.size,
    pathname: uploadedFile.pathname,
  } satisfies UploadedEdmsFile;
}

function buildBlobPath(projectId: string, folder: string, fileName: string) {
  return `${EDMS_UPLOAD_PREFIX}/${sanitizeSegment(projectId)}/${folder}/${sanitizeFileName(fileName)}`;
}

function sanitizeFileName(value: string) {
  const lastDotIndex = value.lastIndexOf(".");
  const baseName = lastDotIndex >= 0 ? value.slice(0, lastDotIndex) : value;
  const extension = lastDotIndex >= 0 ? value.slice(lastDotIndex).toLowerCase() : "";

  return `${sanitizeSegment(baseName)}${extension}`;
}

function sanitizeSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function getExtensionFromFileName(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.at(-1) ?? "file") : "file";
}
