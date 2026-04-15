import "server-only";

export interface UploadedEdmsFile {
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
  pathname: string;
}

export function isCatboxConfigured() {
  // Catbox doesn't require API key for anonymous uploads
  return true;
}

export async function uploadEdmsFile(input: {
  file: File;
  projectId: string;
  folder: "documents" | "versions";
}): Promise<UploadedEdmsFile> {
  // Catbox API endpoint
  const apiUrl = "https://catbox.moe/user/api.php";

  // Prepare form data
  const formData = new FormData();
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", input.file);

  // Upload to Catbox
  const response = await fetch(apiUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Catbox upload failed: ${errorText}`);
  }

  // Catbox returns the direct URL as plain text
  const fileUrl = await response.text();

  if (!fileUrl || !fileUrl.startsWith("https://files.catbox.moe/")) {
    throw new Error("Invalid response from Catbox");
  }

  return {
    fileName: input.file.name,
    fileType: input.file.type || getExtensionFromFileName(input.file.name),
    fileUrl: fileUrl.trim(),
    fileSize: input.file.size,
    pathname: `${input.projectId}/${input.folder}/${input.file.name}`,
  } satisfies UploadedEdmsFile;
}

function getExtensionFromFileName(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.at(-1) ?? "file") : "file";
}
