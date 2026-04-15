"use client";

import { Loader2, UploadCloud } from "lucide-react";
import { type ChangeEvent, useId, useState, useTransition } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "../ui/button";

export interface UploadedDocumentFile {
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
}

interface DocumentFileUploadProps {
  projectId: string;
  folder: "documents" | "versions" | "workflow-attachments";
  onUploaded: (file: UploadedDocumentFile) => void;
  helperText: string;
}

export function DocumentFileUpload({
  projectId,
  folder,
  onUploaded,
  helperText,
}: DocumentFileUploadProps) {
  const inputId = useId();
  const [isUploading, startTransition] = useTransition();
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    if (!projectId) {
      toast({
        title: "Project required",
        description: "Select a project before uploading a controlled document.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", selectedFile);
      formData.set("projectId", projectId);
      formData.set("folder", folder);

      const response = await fetch("/api/edms/uploads", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as UploadedDocumentFile & { error?: string };

      if (!response.ok) {
        toast({
          title: "Upload failed",
          description: payload.error ?? "Unable to upload the selected file.",
          variant: "destructive",
        });
        return;
      }

      onUploaded(payload);
      setUploadedFileName(payload.fileName);
      toast({
        title: "File uploaded",
        description: "The document file is now stored and linked to this EDMS record.",
      });
    });
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">Direct file upload</p>
          <p className="text-sm leading-6 text-muted-foreground">{helperText}</p>
          {uploadedFileName ? (
            <p className="text-xs text-foreground">Uploaded file: {uploadedFileName}</p>
          ) : null}
        </div>
        <div>
          <input
            id={inputId}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.dxf,.jpg,.jpeg,.png,.txt"
            onChange={handleFileSelection}
          />
          <Button type="button" variant="outline" asChild disabled={isUploading}>
            <label htmlFor={inputId} className="cursor-pointer">
              {isUploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Uploading
                </>
              ) : (
                <>
                  <UploadCloud className="size-4" />
                  Upload file
                </>
              )}
            </label>
          </Button>
        </div>
      </div>
    </div>
  );
}
