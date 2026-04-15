"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { createDocumentWorkflow } from "@/actions/workflows";
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
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

const workflowCreateSchema = z.object({
  documentId: z.string().min(1, "Document selection is required."),
  workflowName: z.string().trim().min(2, "Workflow name is required."),
  reviewUserId: z.string().min(1, "Reviewer is required."),
  approveUserId: z.string().trim(),
  dueDate: z.string().trim(),
});

type WorkflowCreateValues = z.infer<typeof workflowCreateSchema>;

const defaultValues: WorkflowCreateValues = {
  documentId: "",
  workflowName: "",
  reviewUserId: "",
  approveUserId: "",
  dueDate: "",
};

interface WorkflowCreateSheetProps {
  documents: {
    id: string;
    projectId: string;
    documentNumber: string;
    title: string;
    projectName: string;
    status: string;
  }[];
  assignees: {
    id: string;
    projectId: string;
    name: string;
    email: string;
    role: string;
    organization: string | null;
  }[];
}

export function WorkflowCreateSheet({ documents, assignees }: WorkflowCreateSheetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<WorkflowCreateValues>({
    resolver: zodResolver(workflowCreateSchema),
    defaultValues,
  });

  const selectedDocumentId = useWatch({
    control: form.control,
    name: "documentId",
  });

  const reviewUserId = useWatch({
    control: form.control,
    name: "reviewUserId",
  });

  const selectedDocument = useMemo(
    () => documents.find((document) => document.id === selectedDocumentId) ?? null,
    [documents, selectedDocumentId]
  );

  const eligibleAssignees = useMemo(() => {
    if (!selectedDocument) {
      return [];
    }

    return assignees.filter((assignee) => assignee.projectId === selectedDocument.projectId);
  }, [assignees, selectedDocument]);

  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
    }
  }, [form, isOpen]);

  useEffect(() => {
    if (!selectedDocument) {
      return;
    }

    const currentReviewSelection = eligibleAssignees.some(
      (assignee) => assignee.id === reviewUserId
    );

    if (!currentReviewSelection) {
      form.setValue("reviewUserId", "");
      form.setValue("approveUserId", "");
    }
  }, [eligibleAssignees, form, reviewUserId, selectedDocument]);

  const onSubmit = (values: WorkflowCreateValues) => {
    const reviewAssignee = eligibleAssignees.find(
      (assignee) => assignee.id === values.reviewUserId
    );
    const finalApprover = eligibleAssignees.find(
      (assignee) => assignee.id === values.approveUserId
    );

    if (!reviewAssignee) {
      form.setError("reviewUserId", {
        type: "manual",
        message: "Reviewer selection is required.",
      });
      return;
    }

    startTransition(async () => {
      const result = await createDocumentWorkflow({
        documentId: values.documentId,
        workflowName: values.workflowName,
        reviewUserId: reviewAssignee.id,
        reviewRole: reviewAssignee.role,
        approveUserId: finalApprover?.id,
        approveRole: finalApprover?.role,
        dueDate: values.dueDate,
      });

      if (!result.success) {
        toast({
          title: "Workflow creation failed",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Workflow created",
        description: "The document is now in review and the first assignee can act immediately.",
      });

      setIsOpen(false);
      router.refresh();
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button disabled={documents.length === 0}>
          <CheckCheck className="size-4" />
          Create workflow
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader className="space-y-1">
          <SheetTitle>Create workflow</SheetTitle>
          <SheetDescription>
            Route a controlled document into sequential review and approval without leaving the EDMS
            workspace.
          </SheetDescription>
        </SheetHeader>

        {documents.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5">
            <p className="text-sm text-muted-foreground">
              Create at least one document before starting a workflow route.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <FormField
                control={form.control}
                name="documentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a document" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {documents.map((document) => (
                          <SelectItem key={document.id} value={document.id}>
                            {document.documentNumber} - {document.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Documents are grouped by project so assignees stay inside the same workspace.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workflowName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workflow name</FormLabel>
                    <FormControl>
                      <Input placeholder="Vendor review and client approval" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="reviewUserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reviewer</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)}
                        disabled={!selectedDocument || eligibleAssignees.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select reviewer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eligibleAssignees.map((assignee) => (
                            <SelectItem key={assignee.id} value={assignee.id}>
                              {assignee.name} - {assignee.role}
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
                  name="approveUserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final approver</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!selectedDocument || eligibleAssignees.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Optional second step" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="__none__">No final approver</SelectItem>
                          {eligibleAssignees
                            .filter((assignee) => assignee.id !== reviewUserId)
                            .map((assignee) => (
                              <SelectItem key={assignee.id} value={assignee.id}>
                                {assignee.name} - {assignee.role}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Add a second step when the route needs formal client or PMC sign-off.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end gap-3 border-t pt-6">
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Routing
                    </>
                  ) : (
                    <>
                      <CheckCheck className="size-4" />
                      Start workflow
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
