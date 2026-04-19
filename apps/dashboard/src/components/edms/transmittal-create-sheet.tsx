"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@midday/ui/badge";
import { Button } from "@midday/ui/button";
import { Checkbox } from "@midday/ui/checkbox";
import {
  Form,
  FormControl,
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
import { format } from "date-fns";
import { Building2, FileText, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { createTransmittal } from "@/actions/transmittals";
import { toast } from "@/hooks/use-toast";

const PURPOSE_LABELS: Record<string, string> = {
  IFR: "Issued for Review",
  IFA: "Issued for Approval",
  IFC: "Issued for Construction",
  IFI: "Issued for Information",
  IFT: "Issued for Tender",
};

const transmittalCreateSchema = z.object({
  projectId: z.string().min(1, "Project selection is required."),
  transmittalNumber: z
    .string()
    .trim()
    .min(2, "Transmittal number is required."),
  purposeCode: z.string().min(1, "Purpose code is required."),
  subject: z.string().trim().min(2, "Subject is required."),
  description: z.string().trim(),
  recipientUserId: z.string().min(1, "Recipient selection is required."),
  ccUserId: z.string().trim(),
  documentIds: z.array(z.string()).min(1, "Select at least one document."),
  notes: z.string().trim(),
  dueDate: z.string().trim(),
});

type TransmittalCreateValues = z.infer<typeof transmittalCreateSchema>;

const defaultValues: TransmittalCreateValues = {
  projectId: "",
  transmittalNumber: "",
  purposeCode: "IFR",
  subject: "",
  description: "",
  recipientUserId: "",
  ccUserId: "",
  documentIds: [],
  notes: "",
  dueDate: "",
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
    revision?: string | null;
    status?: string | null;
  }[];
}

/* ─── Live Transmittal Paper Preview ───────────────────────────────────── */
function TransmittalPreview({
  values,
  selectedDocs,
  projectName,
  recipientName,
  recipientRole,
}: {
  values: TransmittalCreateValues;
  selectedDocs: TransmittalCreateSheetProps["documents"];
  projectName: string;
  recipientName: string;
  recipientRole: string;
}) {
  const today = format(new Date(), "dd-MMM-yyyy");
  const purposeLabel = PURPOSE_LABELS[values.purposeCode] ?? values.purposeCode;

  return (
    <div
      id="transmittal-paper"
      className="bg-white text-[#1a1a1a] border border-border shadow-sm font-sans text-[12px] leading-relaxed"
    >
      {/* Header */}
      <div className="border-b-2 border-[#1a1a1a] px-8 py-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="size-5 text-[#1a1a1a]" />
            <span className="font-bold text-[15px] tracking-tight">
              Quadra EDMS
            </span>
          </div>
          <p className="text-[10px] text-[#666] uppercase tracking-widest">
            Engineering Document Management
          </p>
        </div>
        <div className="text-right space-y-0.5">
          <p className="font-mono font-bold text-[14px]">
            {values.transmittalNumber || "TRM-XXXX-XXX"}
          </p>
          <p className="text-[10px] text-[#666] uppercase tracking-wider">
            Transmittal No.
          </p>
        </div>
      </div>

      {/* Meta grid */}
      <div className="px-8 py-4 grid grid-cols-2 gap-x-8 gap-y-3 border-b border-[#e0e0e0]">
        <div>
          <p className="text-[9px] uppercase tracking-widest text-[#888] font-semibold mb-0.5">
            Project
          </p>
          <p className="font-medium">{projectName || "—"}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-widest text-[#888] font-semibold mb-0.5">
            Date of Issue
          </p>
          <p className="font-mono">{today}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-widest text-[#888] font-semibold mb-0.5">
            To
          </p>
          <p className="font-medium">{recipientName || "—"}</p>
          {recipientRole && (
            <p className="text-[10px] text-[#888]">{recipientRole}</p>
          )}
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-widest text-[#888] font-semibold mb-0.5">
            Purpose
          </p>
          <span className="inline-block border border-[#1a1a1a] px-2 py-0.5 text-[10px] font-mono font-semibold">
            {values.purposeCode} — {purposeLabel}
          </span>
        </div>
        <div className="col-span-2">
          <p className="text-[9px] uppercase tracking-widest text-[#888] font-semibold mb-0.5">
            Subject
          </p>
          <p className="font-medium">
            {values.subject || "No subject entered"}
          </p>
        </div>
        {values.dueDate && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-[#888] font-semibold mb-0.5">
              Response Required By
            </p>
            <p className="font-mono">{values.dueDate}</p>
          </div>
        )}
        {values.notes && (
          <div className="col-span-2">
            <p className="text-[9px] uppercase tracking-widest text-[#888] font-semibold mb-0.5">
              Cover Note
            </p>
            <p className="text-[11px] leading-relaxed text-[#444]">
              {values.notes}
            </p>
          </div>
        )}
      </div>

      {/* Document table */}
      <div className="px-8 py-4">
        <p className="text-[9px] uppercase tracking-widest text-[#888] font-semibold mb-2">
          Documents Enclosed ({selectedDocs.length})
        </p>
        {selectedDocs.length === 0 ? (
          <div className="border border-dashed border-[#ccc] py-6 text-center text-[11px] text-[#aaa]">
            No documents selected — check boxes on the left to add them here
          </div>
        ) : (
          <table className="w-full border-collapse text-[10.5px]">
            <thead>
              <tr className="bg-[#f5f5f5]">
                <th className="border border-[#d0d0d0] px-2 py-1 text-left font-semibold uppercase tracking-wide">
                  #
                </th>
                <th className="border border-[#d0d0d0] px-2 py-1 text-left font-semibold uppercase tracking-wide">
                  Document Number
                </th>
                <th className="border border-[#d0d0d0] px-2 py-1 text-left font-semibold uppercase tracking-wide">
                  Title
                </th>
                <th className="border border-[#d0d0d0] px-2 py-1 text-center font-semibold uppercase tracking-wide">
                  Rev
                </th>
                <th className="border border-[#d0d0d0] px-2 py-1 text-center font-semibold uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedDocs.map((doc, i) => (
                <tr
                  key={doc.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}
                >
                  <td className="border border-[#d0d0d0] px-2 py-1 text-center font-mono">
                    {i + 1}
                  </td>
                  <td className="border border-[#d0d0d0] px-2 py-1 font-mono font-medium">
                    {doc.documentNumber}
                  </td>
                  <td className="border border-[#d0d0d0] px-2 py-1">
                    {doc.title}
                  </td>
                  <td className="border border-[#d0d0d0] px-2 py-1 text-center font-mono">
                    {doc.revision ?? "—"}
                  </td>
                  <td className="border border-[#d0d0d0] px-2 py-1 text-center">
                    {doc.status ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Signature block */}
      <div className="px-8 py-5 border-t border-[#e0e0e0] grid grid-cols-2 gap-10 mt-2">
        <div>
          <div className="h-10 border-b border-[#999] mb-1" />
          <p className="text-[10px] text-[#888]">Issued By / Signature</p>
        </div>
        <div>
          <div className="h-10 border-b border-[#999] mb-1" />
          <p className="text-[10px] text-[#888]">Received By / Date</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Sheet Component ───────────────────────────────────────────────── */
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

  const watchedValues = useWatch({ control: form.control });

  const selectedProjectId = watchedValues.projectId ?? "";
  const selectedDocIds = watchedValues.documentIds ?? [];

  const projectMembers = useMemo(
    () => members.filter((m) => m.projectId === selectedProjectId),
    [members, selectedProjectId],
  );

  const projectDocuments = useMemo(
    () => documents.filter((d) => d.projectId === selectedProjectId),
    [documents, selectedProjectId],
  );

  const selectedDocs = useMemo(
    () => projectDocuments.filter((d) => selectedDocIds.includes(d.id)),
    [projectDocuments, selectedDocIds],
  );

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const selectedMember = projectMembers.find(
    (m) => m.id === watchedValues.recipientUserId,
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
        images: [],
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
        description:
          "The package is now tracked and waiting for recipient acknowledgement.",
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

      {/* Full-screen two-panel sheet */}
      <SheetContent className="w-full overflow-hidden p-0 sm:max-w-none md:max-w-[96vw] lg:max-w-[90vw]">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-border px-6 py-4 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle>Prepare Transmittal</SheetTitle>
                <SheetDescription>
                  Fill in the details and select documents — the formal
                  transmittal paper updates live on the right.
                </SheetDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="print:hidden"
                >
                  Print preview
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={isPending || !form.formState.isValid}
                  onClick={form.handleSubmit(onSubmit)}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sending
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Issue transmittal →
                    </>
                  )}
                </Button>
              </div>
            </div>
          </SheetHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* LEFT: Form */}
            <div className="w-full flex-shrink-0 overflow-y-auto border-r border-border bg-background px-6 py-6 lg:w-[45%]">
              <Form {...form}>
                <form className="space-y-5">
                  {/* Row: Project + Transmittal Number */}
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
                                    ? `${project.projectNumber} – ${project.name}`
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
                            <Input
                              placeholder="TRM-2026-051"
                              className="font-mono"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Purpose + Due date */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="purposeCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purpose code</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select purpose" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(PURPOSE_LABELS).map(
                                ([code, label]) => (
                                  <SelectItem key={code} value={code}>
                                    <span className="font-mono font-semibold">
                                      {code}
                                    </span>{" "}
                                    — {label}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Response required by</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Subject */}
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Issue for PMC coordination review"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Recipient + CC */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="recipientUserId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipient</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select recipient" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {projectMembers.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.name} — {member.role}
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
                          <FormLabel>CC (optional)</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(v) =>
                              field.onChange(v === "__none__" ? "" : v)
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="No CC" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="__none__">No CC</SelectItem>
                              {projectMembers
                                .filter(
                                  (m) =>
                                    m.id !== form.getValues("recipientUserId"),
                                )
                                .map((member) => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.name} — {member.role}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Cover note */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover note / Remarks</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-20 resize-none"
                            placeholder="Please review and return comments within 10 working days…"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Documents checklist */}
                  <FormField
                    control={form.control}
                    name="documentIds"
                    render={() => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Documents enclosed</FormLabel>
                          {selectedDocIds.length > 0 && (
                            <Badge
                              variant="secondary"
                              className="font-mono text-xs"
                            >
                              {selectedDocIds.length} selected
                            </Badge>
                          )}
                        </div>

                        {!selectedProjectId ? (
                          <p className="text-sm text-muted-foreground border border-dashed border-border rounded-md p-4 text-center">
                            Select a project above to see its documents
                          </p>
                        ) : projectDocuments.length === 0 ? (
                          <p className="text-sm text-muted-foreground border border-dashed border-border rounded-md p-4 text-center">
                            No documents found for this project
                          </p>
                        ) : (
                          <div className="rounded-md border border-border divide-y divide-border max-h-64 overflow-y-auto">
                            {projectDocuments.map((document) => (
                              <FormField
                                key={document.id}
                                control={form.control}
                                name="documentIds"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value.includes(
                                          document.id,
                                        )}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            field.onChange([
                                              ...field.value,
                                              document.id,
                                            ]);
                                          } else {
                                            field.onChange(
                                              field.value.filter(
                                                (v) => v !== document.id,
                                              ),
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">
                                        {document.title}
                                      </p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <p className="font-mono text-xs text-muted-foreground">
                                          {document.documentNumber}
                                        </p>
                                        {document.revision && (
                                          <span className="text-xs text-muted-foreground">
                                            Rev {document.revision}
                                          </span>
                                        )}
                                        {document.status && (
                                          <Badge
                                            variant="outline"
                                            className="text-[10px] px-1 py-0"
                                          >
                                            {document.status}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>

            {/* RIGHT: Live preview */}
            <div className="hidden flex-1 overflow-y-auto bg-muted/40 px-6 py-6 lg:block">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Live transmittal preview
                </p>
                <Badge variant="outline" className="font-mono text-[10px]">
                  FORMAL ISSUE
                </Badge>
              </div>
              <TransmittalPreview
                values={watchedValues as TransmittalCreateValues}
                selectedDocs={selectedDocs}
                projectName={
                  selectedProject
                    ? `${selectedProject.projectNumber ? `${selectedProject.projectNumber} – ` : ""}${selectedProject.name}`
                    : ""
                }
                recipientName={selectedMember?.name ?? ""}
                recipientRole={selectedMember?.role ?? ""}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
