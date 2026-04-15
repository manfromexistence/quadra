"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MessageSquareMore, ShieldCheck, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { recordWorkflowDecision } from "@/actions/workflows";
import { toast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Textarea } from "../ui/textarea";
import { DocumentFileUpload } from "./document-file-upload";

const workflowDecisionSchema = z.object({
  decision: z.enum(["approve", "approve_with_comments", "reject", "comment", "for_information"]),
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

type WorkflowDecisionValues = z.infer<typeof workflowDecisionSchema>;

const defaultValues: WorkflowDecisionValues = {
  decision: "approve",
  comments: "",
  attachmentUrl: "",
  attachmentFileName: "",
  attachmentFileSize: undefined,
};

interface WorkflowActionSheetProps {
  stepId: string;
  title: string;
  isActionable: boolean;
  projectId?: string;
}

export function WorkflowActionSheet({
  stepId,
  title,
  isActionable,
  projectId,
}: WorkflowActionSheetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploadedFile, setUploadedFile] = useState<{
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileSize?: number;
  } | null>(null);

  const form = useForm<WorkflowDecisionValues>({
    resolver: zodResolver(workflowDecisionSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
      setUploadedFile(null);
    }
  }, [form, isOpen]);

  useEffect(() => {
    if (uploadedFile) {
      form.setValue("attachmentUrl", uploadedFile.fileUrl);
      form.setValue("attachmentFileName", uploadedFile.fileName);
      form.setValue("attachmentFileSize", uploadedFile.fileSize);
    } else {
      form.setValue("attachmentUrl", "");
      form.setValue("attachmentFileName", "");
      form.setValue("attachmentFileSize", undefined);
    }
  }, [uploadedFile, form]);

  const onSubmit = (values: WorkflowDecisionValues) => {
    startTransition(async () => {
      const result = await recordWorkflowDecision({
        stepId,
        decision: values.decision,
        comments: values.comments || undefined,
        attachmentUrl: values.attachmentUrl || undefined,
        attachmentFileName: values.attachmentFileName || undefined,
        attachmentFileSize: values.attachmentFileSize,
      });

      if (!result.success) {
        toast({
          title: "Workflow update failed",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Workflow updated",
        description: "The latest review decision has been recorded.",
      });

      setIsOpen(false);
      router.refresh();
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="sm" disabled={!isActionable}>
          <ShieldCheck className="size-4" />
          Act on step
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="space-y-1">
          <SheetTitle>Record decision</SheetTitle>
          <SheetDescription>{title}</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <FormField
              control={form.control}
              name="decision"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Decision</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select decision" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="approve">
                        Code-1: Approve (No comments required)
                      </SelectItem>
                      <SelectItem value="approve_with_comments">
                        Code-2: Approved with Comments
                      </SelectItem>
                      <SelectItem value="reject">Code-3: Reject</SelectItem>
                      <SelectItem value="for_information">Code-4: For Information Only</SelectItem>
                      <SelectItem value="comment">Comment only (doesn't complete step)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-32 resize-none"
                      placeholder="Add review notes, approval remarks, or rejection comments."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>CSR Attachment (Optional)</FormLabel>
              <FormDescription>
                Upload a Comments Resolution Sheet (Excel/PDF) or other supporting documents
              </FormDescription>

              {!uploadedFile && projectId && (
                <DocumentFileUpload
                  projectId={projectId}
                  folder="workflow-attachments"
                  helperText="Upload CSR or supporting document"
                  onUploaded={(file) => setUploadedFile(file)}
                />
              )}

              {uploadedFile && (
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

            <div className="flex items-center justify-end gap-3 border-t pt-6">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
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
                    <MessageSquareMore className="size-4" />
                    Save decision
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
