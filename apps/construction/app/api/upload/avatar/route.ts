import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isImgBBConfigured, uploadAvatarImage } from "@/lib/storage-imgbb";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be signed in to upload avatars." },
      { status: 401 }
    );
  }

  if (!isImgBBConfigured()) {
    return NextResponse.json(
      {
        error: "Image upload is not configured yet. Add IMGBB to enable avatar uploads.",
      },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Select an image file to upload." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, GIF, and WebP images are supported." },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Uploaded file cannot be empty." }, { status: 400 });
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return NextResponse.json(
      { error: "Avatar images must be smaller than 5 MB." },
      { status: 400 }
    );
  }

  try {
    const imageUrl = await uploadAvatarImage(file);

    return NextResponse.json({
      url: imageUrl,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message.length > 0
        ? error.message
        : "Avatar upload failed. Please try again.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
