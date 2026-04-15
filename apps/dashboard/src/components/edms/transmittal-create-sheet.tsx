"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { createTransmittal } from "@/actions/transmittals";
import { toast } from "@/hooks/use-toast";
import { Button } from "@midday/ui/button";
import { Checkbox } from "@midday/ui/checkbox";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@midday/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@midday/ui/sheet";
import { Textarea } from "@midday/ui/textarea";
import { ImageCardUpload } from "./image-card-upload";

const transmittalCreateSchema = z.object({
  projectId: z.string().min(1, "Project selection is required."),
  transmittalNumber: z.string().trim().min(2, "Transmittal number is required."),
  subject: z.string().trim().min(2, "Subject is required."),
  description: z.string().trim(),
  recipientUserId: z.string().min(1, "Recipient selection is required."),
  ccUserId: z.string().trim(),
  documentIds: z.array(z.string()).min(1, "Select at least one document."),
  notes: z.string().trim(),
  images: z.array(z.string().url()).optional(),
});

type TransmittalCreateValues = z.infer<typeof transmittalCreateSchema>;

const defaultValues: TransmittalCreateValues = {
  projectId: "",
  transmittalNumber: "",
  subject: "",
  description: "",
  recipientUserId: "",
  ccUserId: "",
  documentIds: [],
  notes: "",
  images: [],
};

interface TransmittalCreateSheetProps {
  projects: {
    id: string;
    name: string;
    projectNumber: string | null;
  }[];
  members: {
    id: string;
    projectId: string;
    name: string;
    email: string;
    role: string;
  }[];
  documents: {
    id: string;
    projectId: string;
    documentNumber: string;
    title: string;
  }[];
}

export function TransmittalCreateSheet({
  projects,
  members,
  documents,
}: TransmittalCreateSheetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<TransmittalCreateValues>({
    resolver: zodResolver(transmittalCreateSchema),
    defaultValues,
  });

  const selectedProjectId = useWatch({
    control: form.control,
    name: "projectId",
  });

  const projectMembers = useMemo(
    () => members.filter((member) => member.projectId === selectedProjectId),
    [members, selectedProjectId]
  );

  const projectDocuments = useMemo(
    () => documents.filter((document) => document.projectId === selectedProjectId),
    [documents, selectedProjectId]
  );

  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
    }
  }, [form, isOpen]);

  const onSubmit = (values: TransmittalCreateValues) => {
    startTransition(async () => {
      const result = await createTransmittal({
        projectId: values.projectId,
        transmittalNumber: values.transmittalNumber,
        subject: values.subject,
        description: values.description,
        recipientUserId: values.recipientUserId,
        ccUserId: values.ccUserId,
        documentIds: values.documentIds,
        notes: values.notes,
        images: values.images,
      });

      if (!result.success) {
        toast({
          title: "Transmittal creation failed",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Transmittal sent",
        description: "The package is now tracked and waiting for recipient acknowledgement.",
      });

      setIsOpen(false);
      router.refresh();
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button disabled={projects.length === 0 || documents.length === 0}>
          <Send className="size-4" />
          Create transmittal
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader className="space-y-1">
          <SheetTitle>Create transmittal</SheetTitle>
          <SheetDescription>
            Issue a formal package to a project party and track the acknowledgement in the EDMS.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("recipientUserId", "");
                        form.setValue("ccUserId", "");
                        form.setValue("documentIds", []);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.projectNumber
                              ? `${project.projectNumber} - ${project.name}`
                              : project.name}
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
                name="transmittalNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transmittal number</FormLabel>
                    <FormControl>
                      <Input placeholder="TRM-2026-051" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Issue for PMC coordination review" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-24 resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="recipientUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projectMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} - {member.role}
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
                name="ccUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CC</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Optional copy recipient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">No CC</SelectItem>
                        {projectMembers
                          .filter((member) => member.id !== form.getValues("recipientUserId"))
                          .map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} - {member.role}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Copy another stakeholder onto the issue package.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="documentIds"
              render={() => (
                <FormItem>
                  <FormLabel>Attached documents</FormLabel>
                  <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                    {projectDocuments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No documents are available for the selected project yet.
                      </p>
                    ) : (
                      projectDocuments.map((document) => (
                        <FormField
                          key={document.id}
                          control={form.control}
                          name="documentIds"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start gap-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value.includes(document.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, document.id]);
                                      return;
                                    }

                                    field.onChange(
                                      field.value.filter((value) => value !== document.id)
                                    );
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">{document.title}</p>
                                <p className="font-mono text-xs text-muted-foreground">
                                  {document.documentNumber}
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-24 resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <ImageCardUpload
                    value={field.value}
                    onChange={field.onChange}
                    label="Transmittal images"
                    helperText="Add cover sheets, sign-offs, or supporting visuals (up to 5 images)"
                    maxImages={5}
                  />
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
                    Sending
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Send package
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


