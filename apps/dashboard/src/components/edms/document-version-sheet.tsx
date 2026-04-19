"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@midday/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@midday/ui/form";
import { Input } from "@midday/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@midday/ui/sheet";
import { Textarea } from "@midday/ui/textarea";
import { GitBranchPlus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createDocumentVersion } from "@/actions/documents";
import { toast } from "@/hooks/use-toast";
import { DocumentFileUpload } from "./document-file-upload";

const documentStatuses = [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "superseded",
] as const;

const documentVersionSchema = z.object({
  version: z.string().trim().min(1, "Version is required."),
  revision: z.string().trim(),
  status: z.enum(documentStatuses),
  fileName: z.string().trim().min(2, "File name is required."),
  fileSize: z.number().nonnegative().optional(),
  fileType: z.string().trim(),
  fileUrl: z.string().trim().url("Enter a valid file URL."),
  changeDescription: z
    .string()
    .trim()
    .min(2, "Change description is required."),
});

type DocumentVersionValues = z.infer<typeof documentVersionSchema>;

interface DocumentVersionSheetProps {
  documentId: string;
  projectId: string;
  currentVersion: string;
  currentRevision: string | null;
  currentFileName: string;
  currentFileType: string | null;
  currentFileUrl: string;
}

export function DocumentVersionSheet({
  documentId,
  projectId,
  currentVersion,
  currentRevision,
  currentFileName,
  currentFileType,
  currentFileUrl,
}: DocumentVersionSheetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<DocumentVersionValues>({
    resolver: zodResolver(documentVersionSchema),
    defaultValues: {
      version: currentVersion,
      revision: currentRevision ?? "",
      status: "draft",
      fileName: currentFileName,
      fileSize: undefined,
      fileType: currentFileType ?? "pdf",
      fileUrl: currentFileUrl,
      changeDescription: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        version: currentVersion,
        revision: currentRevision ?? "",
        status: "draft",
        fileName: currentFileName,
        fileSize: undefined,
        fileType: currentFileType ?? "pdf",
        fileUrl: currentFileUrl,
        changeDescription: "",
      });
    }
  }, [
    currentFileName,
    currentFileType,
    currentFileUrl,
    currentRevision,
    currentVersion,
    form,
    isOpen,
  ]);

  const onSubmit = (values: DocumentVersionValues) => {
    startTransition(async () => {
      const result = await createDocumentVersion({
        documentId,
        version: values.version,
        revision: values.revision,
        status: values.status,
        fileName: values.fileName,
        fileSize: values.fileSize,
        fileType: values.fileType,
        fileUrl: values.fileUrl,
        changeDescription: values.changeDescription,
      });

      if (!result.success) {
        toast({
          title: "Version issue failed",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "New version issued",
        description:
          "The latest controlled revision is now available in the EDMS.",
      });

      setIsOpen(false);
      router.refresh();
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <GitBranchPlus className="size-4" />
          Issue revision
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader className="space-y-1">
          <SheetTitle>Issue new revision</SheetTitle>
          <SheetDescription>
            Promote a new controlled file version and update the document
            register in one step.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8 space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input placeholder="2.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="revision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revision</FormLabel>
                    <FormControl>
                      <Input placeholder="B" {...field} />
                    </FormControl>
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
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {documentStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
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
                name="fileName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fileType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File type</FormLabel>
                    <FormControl>
                      <Input placeholder="pdf" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DocumentFileUpload
              projectId={projectId}
              folder="versions"
              helperText="Upload the next controlled revision directly to EDMS storage, or keep the external URL workflow as fallback."
              onUploaded={(file) => {
                form.setValue("fileName", file.fileName, {
                  shouldValidate: true,
                });
                form.setValue("fileType", file.fileType, {
                  shouldValidate: true,
                });
                form.setValue("fileUrl", file.fileUrl, {
                  shouldValidate: true,
                });
                form.setValue("fileSize", file.fileSize, {
                  shouldValidate: true,
                });
              }}
            />

            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Direct upload is preferred. External URLs remain supported
                    as fallback.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="changeDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Change description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-28 resize-none"
                      placeholder="Updated foundation notes and response to PMC review comments."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3 border-t pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <GitBranchPlus className="size-4" />
                    Issue revision
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
