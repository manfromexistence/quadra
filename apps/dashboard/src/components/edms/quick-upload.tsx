"use client";

import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import { useToast } from "@midday/ui/use-toast";
import { Loader2, UploadCloud } from "lucide-react";
import { useId, useMemo, useState, useTransition } from "react";

interface UploadedFilePayload {
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
  provider: "catbox" | "imgbb" | "telegram" | "turso";
}

export function EdmsQuickUpload({
  projects,
}: {
  projects: { id: string; name: string; projectNumber: string | null }[];
}) {
  const inputId = useId();
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState(
    projects[0]?.id ?? "",
  );
  const [lastUpload, setLastUpload] = useState<UploadedFilePayload | null>(
    null,
  );
  const [isUploading, startTransition] = useTransition();

  const selectedProjectLabel = useMemo(() => {
    const project = projects.find((entry) => entry.id === selectedProjectId);

    if (!project) {
      return "Unassigned";
    }

    return project.projectNumber
      ? `${project.projectNumber} - ${project.name}`
      : project.name;
  }, [projects, selectedProjectId]);

  const handleFileSelection = (file: File | null) => {
    if (!file) {
      return;
    }

    if (!selectedProjectId) {
      toast({
        title: "Project required",
        description: "Select a project before uploading a document.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("projectId", selectedProjectId);
      formData.set("folder", "documents");

      const response = await fetch("/api/edms/uploads", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as UploadedFilePayload & {
        error?: string;
      };

      if (!response.ok) {
        toast({
          title: "Upload failed",
          description: payload.error ?? "Unable to upload the selected file.",
          variant: "destructive",
        });
        return;
      }

      setLastUpload(payload);
      toast({
        title: "File uploaded",
        description: `${payload.fileName} is now stored on ${payload.provider}.`,
      });
    });
  };

  return (
    <Card className="border-border bg-background/90 shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg">Free-storage intake</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          Images route through ImgBB when available, standard files prefer
          Telegram, and larger files fall back to Catbox. This is live storage,
          independent from the legacy paid stack.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="edms-project">Project</Label>
            <select
              id="edms-project"
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.projectNumber
                    ? `${project.projectNumber} - ${project.name}`
                    : project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Input
              id={inputId}
              type="file"
              className="hidden"
              onChange={(event) => {
                handleFileSelection(event.target.files?.[0] ?? null);
                event.currentTarget.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              asChild
              disabled={isUploading}
              className="w-full md:w-auto"
            >
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

        {lastUpload ? (
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <span>{lastUpload.provider}</span>
              <span>{selectedProjectLabel}</span>
            </div>
            <p className="mt-2 font-medium">{lastUpload.fileName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatBytes(lastUpload.fileSize)} ·{" "}
              {lastUpload.fileType || "file"}
            </p>
            <a
              href={lastUpload.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-sm text-primary hover:underline"
            >
              Open uploaded file
            </a>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function formatBytes(value: number) {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}


