"use client";

import { Loader2, UploadCloud } from "lucide-react";
import { type ChangeEvent, useId, useState, useTransition } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@midday/ui/button";

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

  const handleFileSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    
    // Convert to array and clear input
    const selectedFiles = Array.from(files);
    event.target.value = "";

    if (!projectId) {
      toast({
        title: "Project required",
        description: "Select a project before uploading a controlled document.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      let successCount = 0;
      let failCount = 0;
      
      for (const selectedFile of selectedFiles) {
        const formData = new FormData();
        formData.set("file", selectedFile);
        formData.set("projectId", projectId);
        formData.set("folder", folder);

        try {
          const response = await fetch("/api/edms/uploads", {
            method: "POST",
            body: formData,
          });

          const payload = (await response.json()) as UploadedDocumentFile & { error?: string };

          if (!response.ok) {
            failCount++;
            toast({
              title: "Upload failed",
              description: payload.error ?? `Unable to upload ${selectedFile.name}.`,
              variant: "destructive",
            });
            continue;
          }

          onUploaded(payload);
          setUploadedFileName(payload.fileName);
          successCount++;
        } catch (e) {
          failCount++;
          toast({
            title: "Upload failed",
            description: `Network error uploading ${selectedFile.name}.`,
            variant: "destructive",
          });
        }
      }

      if (successCount > 0) {
        toast({
          title: "Files uploaded",
          description: `Successfully uploaded ${successCount} file(s)${failCount > 0 ? `, ${failCount} failed` : ""}.`,
        });
      }
    });
  };

  return (
    <div className="border border-border bg-card p-4">
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
            accept="*/*"
            multiple
            onChange={handleFileSelection}
          />
          <Button type="button" variant="outline" asChild disabled={isUploading}>
            <label htmlFor={inputId} className="cursor-pointer">
              {isUploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="size-4" />
                  Upload file(s)
                </>
              )}
            </label>
          </Button>
        </div>
      </div>
    </div>
  );
}


