import "server-only";

export interface UploadedEdmsFile {
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
  pathname: string;
}

export function isCatboxConfigured() {
  return true;
}

export async function uploadEdmsFile(input: {
  file: File;
  projectId: string;
  folder: "documents" | "versions" | "workflow-attachments";
}): Promise<UploadedEdmsFile> {
  // Catbox API endpoint
  const apiUrl = "https://catbox.moe/user/api.php";

  // Prepare form data
  const formData = new FormData();
  formData.append("reqtype", "fileupload");

  const userhash = process.env.CATBOX_USERHASH?.trim();
  if (userhash) {
    formData.append("userhash", userhash);
  }

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
  const fileUrl = (await response.text()).trim();

  if (!fileUrl || !fileUrl.startsWith("https://files.catbox.moe/")) {
    if (!userhash) {
      throw new Error(
        "Catbox rejected the upload. Anonymous Catbox uploads are unreliable right now; configure CATBOX_USERHASH or another storage provider.",
      );
    }

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
