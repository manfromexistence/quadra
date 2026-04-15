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
  expiration?: number;
}): Promise<UploadedImage> {
  const apiKey = process.env.IMGBB;

  if (!apiKey) {
    throw new Error("IMGBB is not configured.");
  }

  const arrayBuffer = await input.file.arrayBuffer();
  const base64Image = Buffer.from(arrayBuffer).toString("base64");

  const formData = new FormData();
  formData.append("key", apiKey);
  formData.append("image", base64Image);

  if (input.name) {
    formData.append("name", input.name);
  }

  if (input.expiration) {
    formData.append("expiration", input.expiration.toString());
  }

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`ImgBB upload failed: ${await response.text()}`);
  }

  const payload = await response.json();

  if (!payload.success) {
    throw new Error(payload.error?.message || "ImgBB upload failed.");
  }

  return {
    fileName: payload.data.title || input.file.name,
    fileType: payload.data.image?.extension || input.file.type || "image",
    fileUrl: payload.data.url,
    fileSize: payload.data.size,
    thumbnailUrl: payload.data.thumb?.url,
    mediumUrl: payload.data.medium?.url,
    deleteUrl: payload.data.delete_url,
  };
}
