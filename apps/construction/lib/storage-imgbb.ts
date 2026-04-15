import "server-only";

export interface UploadedImage {
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
  thumbnailUrl?: string;
  mediumUrl?: string;
  deleteUrl?: string;
}

export function isImgBBConfigured() {
  return Boolean(process.env.IMGBB);
}

export async function uploadImageToImgBB(input: {
  file: File;
  name?: string;
  expiration?: number; // in seconds, 60-15552000
}): Promise<UploadedImage> {
  if (!isImgBBConfigured()) {
    throw new Error("IMGBB is not configured.");
  }

  const apiKey = process.env.IMGBB;
  if (!apiKey) {
    throw new Error("IMGBB is not configured.");
  }

  // Convert file to base64
  const arrayBuffer = await input.file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = buffer.toString("base64");

  // Prepare form data
  const formData = new FormData();
  formData.append("key", apiKey);
  formData.append("image", base64Image);

  if (input.name) {
    formData.append("name", input.name);
  }

  if (input.expiration) {
    formData.append("expiration", input.expiration.toString());
  }

  // Upload to ImgBB
  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ImgBB upload failed: ${errorText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || "ImgBB upload failed with unknown error");
  }

  const imageData = data.data;

  return {
    fileName: imageData.title || input.file.name,
    fileType: imageData.image.extension || input.file.type,
    fileUrl: imageData.url,
    fileSize: imageData.size,
    thumbnailUrl: imageData.thumb?.url,
    mediumUrl: imageData.medium?.url,
    deleteUrl: imageData.delete_url,
  };
}

export async function uploadAvatarImage(file: File): Promise<string> {
  const result = await uploadImageToImgBB({
    file,
    name: `avatar-${Date.now()}`,
  });

  return result.fileUrl;
}
