import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadEdmsFile } from "@/lib/edms/storage-catbox";
import { canStoreEdmsFileInTurso, uploadEdmsFileToTurso } from "@/lib/edms/storage-turso";
import { isImgBBConfigured, uploadImageToImgBB } from "@/lib/storage-imgbb";
import { isTelegramConfigured, uploadToTelegram } from "@/lib/storage-telegram";

const MAX_FILE_SIZE = 200 * 1024 * 1024;
const BANNED_EXTENSIONS = [".exe", ".scr", ".cpl", ".jar"];

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be signed in to upload files." },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const projectId = formData.get("projectId");
  const folder = formData.get("folder");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Select a file to upload." },
      { status: 400 },
    );
  }

  if (typeof projectId !== "string" || projectId.trim().length === 0) {
    return NextResponse.json(
      { error: "A valid project is required." },
      { status: 400 },
    );
  }

  if (
    folder !== "documents" &&
    folder !== "versions" &&
    folder !== "workflow-attachments"
  ) {
    return NextResponse.json(
      { error: "Invalid upload destination." },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { error: "Uploaded files cannot be empty." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      {
        error:
          "Files larger than 200 MB are not supported in the free storage pipeline.",
      },
      { status: 400 },
    );
  }

  if (hasBannedExtension(file.name)) {
    return NextResponse.json(
      {
        error:
          "Executable uploads are blocked. Use PDF or common project file formats instead.",
      },
      { status: 400 },
    );
  }

  try {
    const upload = await uploadWithFreeProvider(file, projectId, folder);
    return NextResponse.json(upload);
  } catch (error) {
    const message =
      error instanceof Error && error.message.length > 0
        ? error.message
        : "Upload failed. Please try again.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function uploadWithFreeProvider(
  file: File,
  projectId: string,
  folder: "documents" | "versions" | "workflow-attachments"
) {
  const isImage = file.type.startsWith("image/");

  if (isImage && isImgBBConfigured()) {
    try {
      const uploaded = await uploadImageToImgBB({
        file,
        name: `${Date.now()}-${sanitizeFileName(file.name)}`,
      });

      return {
        fileName: uploaded.fileName,
        fileType: uploaded.fileType,
        fileUrl: uploaded.fileUrl,
        fileSize: uploaded.fileSize,
        provider: "imgbb" as const,
      };
    } catch {
      // Fall through to the remaining free providers.
    }
  }

  if (!isImage && file.size <= 50 * 1024 * 1024 && isTelegramConfigured()) {
    try {
      const uploaded = await uploadToTelegram(
        file,
        file.name,
        "QUADRA EDMS upload",
      );

      return {
        fileName: file.name,
        fileType: file.type || getExtensionFromFileName(file.name),
        fileUrl: uploaded.url,
        fileSize: file.size,
        provider: "telegram" as const,
      };
    } catch {
      // Fall back to Catbox.
    }
  }

  const uploaded = await uploadEdmsFile({
    file,
    projectId,
    folder,
  }).catch(async (error) => {
    if (!canStoreEdmsFileInTurso(file)) {
      throw error;
    }

    return {
      ...(await uploadEdmsFileToTurso({
        file,
        projectId,
        folder,
      })),
      provider: "turso" as const,
    };
  });

  if ("provider" in uploaded) {
    return uploaded;
  }

  return {
    ...uploaded,
    provider: "catbox" as const,
  };
}

function hasBannedExtension(fileName: string) {
  const lowerFileName = fileName.toLowerCase();
  return BANNED_EXTENSIONS.some((ext) => lowerFileName.endsWith(ext));
}

function sanitizeFileName(value: string) {
  return value.replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();
}

function getExtensionFromFileName(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.at(-1) ?? "file") : "file";
}
