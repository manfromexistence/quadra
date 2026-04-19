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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";
import { Textarea } from "@midday/ui/textarea";
import { useToast } from "@midday/ui/use-toast";
import { Loader2, ShieldCheck, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { reviewTransmittal } from "@/actions/transmittals";
import {
  CLIENT_APPROVAL_OPTIONS,
  type ClientApprovalCode,
  getReviewStatusForApprovalCode,
} from "@/lib/edms/client-approval-codes";
import {
  DocumentFileUpload,
  type UploadedDocumentFile,
} from "./document-file-upload";

const reviewSchema = z.object({
  approvalCode: z.enum(["Code-1", "Code-2", "Code-3", "Code-4"]),
  comments: z.string().trim(),
  attachmentUrl: z
    .string()
    .trim()
    .url("Enter a valid attachment URL.")
    .optional()
    .or(z.literal("")),
  attachmentFileName: z.string().trim().optional(),
  attachmentFileSize: z.number().int().nonnegative().optional(),
});

type ReviewValues = z.infer<typeof reviewSchema>;

const defaultValues: ReviewValues = {
  approvalCode: "Code-2",
  comments: "",
  attachmentUrl: "",
  attachmentFileName: "",
  attachmentFileSize: undefined,
};

export function ReviewTransmittalForm({
  transmittalId,
  projectId,
}: {
  transmittalId: string;
  projectId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [uploadedFile, setUploadedFile] = useState<UploadedDocumentFile | null>(
    null,
  );

  const form = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues,
  });

  const selectedApprovalCode = form.watch("approvalCode");
  const selectedOption =
    CLIENT_APPROVAL_OPTIONS.find(
      (option) => option.approvalCode === selectedApprovalCode,
    ) ?? null;

  useEffect(() => {
    if (uploadedFile) {
      form.setValue("attachmentUrl", uploadedFile.fileUrl);
      form.setValue("attachmentFileName", uploadedFile.fileName);
      form.setValue("attachmentFileSize", uploadedFile.fileSize);
      return;
    }

    form.setValue("attachmentUrl", "");
    form.setValue("attachmentFileName", "");
    form.setValue("attachmentFileSize", undefined);
  }, [form, uploadedFile]);

  const onSubmit = (values: ReviewValues) => {
    startTransition(async () => {
      const approvalCode = values.approvalCode as ClientApprovalCode;
      const result = await reviewTransmittal({
        transmittalId,
        reviewStatus: getReviewStatusForApprovalCode(approvalCode),
        comments: values.comments,
        approvalCode,
        attachmentUrl: values.attachmentUrl || undefined,
        attachmentFileName: values.attachmentFileName || undefined,
        attachmentFileSize: values.attachmentFileSize,
      });

      if (!result.success) {
        toast({
          title: "Review failed",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Review submitted",
        description:
          "The workflow, transmittal status, and notifications have been updated.",
      });

      form.reset(defaultValues);
      setUploadedFile(null);
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="approvalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client approval code</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) =>
                  field.onChange(value as ClientApprovalCode)
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CLIENT_APPROVAL_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.approvalCode}
                      value={option.approvalCode}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {selectedOption?.description ??
                  "Select the client review outcome that should be stamped on this transmittal."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comments / CSR notes</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-28 resize-none"
                  placeholder="Summarize review comments, clarify the required revision, or note that the package is for information only."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>CSR attachment (optional)</FormLabel>
          <FormDescription>
            Upload the client CSR sheet or any returned marked-up review
            document.
          </FormDescription>

          {!uploadedFile ? (
            <DocumentFileUpload
              projectId={projectId}
              folder="workflow-attachments"
              helperText="Attach CSR Excel, PDF markup, or supporting review file"
              onUploaded={(file) => setUploadedFile(file)}
            />
          ) : (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Upload className="size-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">{uploadedFile.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {uploadedFile.fileSize
                    ? `${(uploadedFile.fileSize / 1024).toFixed(1)} KB`
                    : "Uploaded"}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setUploadedFile(null)}
              >
                <X className="size-4" />
              </Button>
            </div>
          )}
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving
            </>
          ) : (
            <>
              <ShieldCheck className="size-4" />
              Submit review
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
