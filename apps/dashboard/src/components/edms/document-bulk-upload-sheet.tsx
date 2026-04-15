"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FilePlus2, Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createDocument } from "@/actions/documents";
import { toast } from "@/hooks/use-toast";
import { Button } from "@midday/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@midday/ui/form";
import { Input } from "@midday/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@midday/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@midday/ui/sheet";
import { DocumentFileUpload } from "./document-file-upload";

const documentStatuses = [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "superseded",
] as const;

const bulkDocumentSchema = z.object({
  projectId: z.string().min(1, "Project is required."),
  discipline: z.string().trim(),
  category: z.string().trim(),
  status: z.enum(documentStatuses),
  files: z
    .array(
      z.object({
        fileName: z.string(),
        fileType: z.string(),
        fileUrl: z.string().url(),
        fileSize: z.number().optional(),
        title: z.string().optional(),
      })
    )
    .min(1, "At least one file is required"),
});

type BulkDocumentValues = z.infer<typeof bulkDocumentSchema>;

export function DocumentBulkUploadSheet({
  projects,
}: {
  projects: { id: string; name: string; projectNumber: string | null }[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      fileName: string;
      fileType: string;
      fileUrl: string;
      fileSize?: number;
      title?: string;
    }>
  >([]);

  const form = useForm<BulkDocumentValues>({
    resolver: zodResolver(bulkDocumentSchema),
    defaultValues: { projectId: "", discipline: "", category: "", status: "draft", files: [] },
  });

  const selectedProjectId = form.watch("projectId");

  useEffect(() => {
    if (isOpen) {
      form.reset();
      setUploadedFiles([]);
    }
  }, [form, isOpen]);

  useEffect(() => {
    form.setValue("files", uploadedFiles);
  }, [uploadedFiles, form]);

  const onSubmit = (values: BulkDocumentValues) => {
    startTransition(async () => {
      let successCount = 0;
      let failCount = 0;

      for (const file of values.files) {
        const result = await createDocument({
          projectId: values.projectId,
          documentNumber: "",
          title: file.title || file.fileName.replace(/\.[^/.]+$/, ""),
          description: "",
          discipline: values.discipline,
          category: values.category,
          version: "1.0",
          revision: "",
          status: values.status,
          fileName: file.fileName,
          fileSize: file.fileSize,
          fileType: file.fileType,
          fileUrl: file.fileUrl,
          tags: "",
          images: [],
        });

        if (result.success) successCount++;
        else failCount++;
      }

      toast({
        title: successCount > 0 ? "Bulk upload completed" : "Bulk upload failed",
        description:
          successCount > 0
            ? `Successfully uploaded ${successCount} document(s)${failCount > 0 ? `, ${failCount} failed` : ""}.`
            : "All documents failed to upload.",
        variant: successCount === 0 ? "destructive" : "default",
      });

      if (successCount > 0) {
        setIsOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Upload className="size-4" />
          Bulk upload
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto px-6 sm:max-w-3xl">
        <SheetHeader className="space-y-1">
          <div className="px-6 pt-6">
            <SheetTitle>Bulk document upload</SheetTitle>
            <SheetDescription>
              Upload multiple documents at once with shared settings.
            </SheetDescription>
          </div>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6 px-6 pb-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.projectNumber ? `${p.projectNumber} - ${p.name}` : p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {documentStatuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="discipline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discipline</FormLabel>
                    <FormControl>
                      <Input placeholder="Structural" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Drawing" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <DocumentFileUpload
                projectId={selectedProjectId}
                folder="documents"
                helperText="Upload multiple files"
                onUploaded={(file) => setUploadedFiles((prev) => [...prev, file])}
              />

              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <FormLabel>Uploaded files ({uploadedFiles.length})</FormLabel>
                  {uploadedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-medium">{file.fileName}</p>
                        <Input
                          placeholder="Title (optional)"
                          value={file.title || ""}
                          onChange={(e) =>
                            setUploadedFiles((prev) =>
                              prev.map((f, idx) =>
                                idx === i ? { ...f, title: e.target.value } : f
                              )
                            )
                          }
                          className="h-8"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i))
                        }
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <FormField
                control={form.control}
                name="files"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t pt-6">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || uploadedFiles.length === 0}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Uploading {uploadedFiles.length} document(s)
                  </>
                ) : (
                  <>
                    <FilePlus2 className="size-4" />
                    Upload {uploadedFiles.length} document(s)
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}


