import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isImgBBConfigured, uploadImageToImgBB } from "@/lib/storage-imgbb";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for avatars/images
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

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

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Select a file to upload." },
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
        { error: "File size must be less than 10MB." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only image files (JPEG, PNG, GIF, WebP) are allowed." },
        { status: 400 },
      );
    }

    // Check if ImgBB is configured
    if (!isImgBBConfigured()) {
      return NextResponse.json(
        { 
          error: "ImgBB is not configured. Please set the IMGBB environment variable." 
        },
        { status: 503 },
      );
    }

    // Upload to ImgBB
    const uploaded = await uploadImageToImgBB({
      file,
      name: `${Date.now()}-${sanitizeFileName(file.name)}`,
    });

    return NextResponse.json({
      url: uploaded.fileUrl,
      fileName: uploaded.fileName,
      fileType: uploaded.fileType,
      fileSize: uploaded.fileSize,
    });

  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function sanitizeFileName(value: string) {
  return value.replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();
}