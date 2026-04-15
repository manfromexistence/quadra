import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { EDMS_ROLE_ORDER, normalizeEdmsRole } from "@/lib/edms/rbac";
import { isCatboxConfigured, uploadEdmsFile } from "@/lib/edms/storage-catbox";

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB - Catbox limit
const MINIMUM_UPLOAD_ROLE = "vendor";

// Catbox banned extensions
const BANNED_EXTENSIONS = [".exe", ".scr", ".cpl", ".doc", ".docx", ".jar"];

function hasBannedExtension(fileName: string): boolean {
  const lowerFileName = fileName.toLowerCase();
  return BANNED_EXTENSIONS.some((ext) => lowerFileName.endsWith(ext));
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be signed in to upload files." }, { status: 401 });
  }

  const userRows = await db
    .select({
      role: userTable.role,
    })
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1);

  const [user] = userRows;
  const userRole = normalizeEdmsRole(user?.role);

  if (EDMS_ROLE_ORDER.indexOf(userRole) < EDMS_ROLE_ORDER.indexOf(MINIMUM_UPLOAD_ROLE)) {
    return NextResponse.json(
      { error: "Your role is not allowed to upload controlled documents." },
      { status: 403 }
    );
  }

  if (!isCatboxConfigured()) {
    return NextResponse.json(
      {
        error: "File upload service is not available. Please contact support.",
      },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const projectId = formData.get("projectId");
  const folder = formData.get("folder");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Select a file to upload." }, { status: 400 });
  }

  if (hasBannedExtension(file.name)) {
    return NextResponse.json(
      {
        error:
          "This file type is not allowed. Catbox does not support .exe, .scr, .cpl, .doc, .docx, or .jar files. Please use PDF format for documents.",
      },
      { status: 400 }
    );
  }

  if (typeof projectId !== "string" || projectId.trim().length === 0) {
    return NextResponse.json({ error: "A valid project is required." }, { status: 400 });
  }

  if (folder !== "documents" && folder !== "versions") {
    return NextResponse.json({ error: "Invalid upload destination." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Uploaded files cannot be empty." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Files larger than 200 MB are not supported by Catbox." },
      { status: 400 }
    );
  }

  try {
    const uploadedFile = await uploadEdmsFile({
      file,
      projectId,
      folder,
    });

    return NextResponse.json(uploadedFile);
  } catch (error) {
    const message =
      error instanceof Error && error.message.length > 0
        ? error.message
        : "Upload failed. Please try again.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
