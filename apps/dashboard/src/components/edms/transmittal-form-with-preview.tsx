"use client";

import { Badge } from "@midday/ui/badge";
import { Button } from "@midday/ui/button";
import { Calendar } from "@midday/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { Checkbox } from "@midday/ui/checkbox";
import { cn } from "@midday/ui/cn";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@midday/ui/popover";
import { ScrollArea } from "@midday/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import { Textarea } from "@midday/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

interface Document {
  id: string;
  documentNumber: string;
  title: string;
  revision: string | null;
  status: string | null;
}

interface Project {
  id: string;
  name: string;
  code: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
}

interface TransmittalFormData {
  transmittalNumber: string;
  date: string;
  projectId: string;
  recipientId: string;
  purpose: string;
  subject: string;
  dueDate: string;
  remarks: string;
  selectedDocuments: string[];
}

interface Props {
  projects: Project[];
  members: Member[];
  documents: Document[];
  onSubmit: (data: TransmittalFormData) => Promise<void>;
}

export function TransmittalFormWithPreview({
  projects,
  members,
  documents,
  onSubmit,
}: Props) {
  const [formData, setFormData] = useState<TransmittalFormData>({
    transmittalNumber: `TM-${format(new Date(), "yyyyMMdd")}-001`,
    date: format(new Date(), "yyyy-MM-dd"),
    projectId: projects[0]?.id || "",
    recipientId: members[0]?.id || "",
    purpose: "IFR",
    subject: "",
    dueDate: format(
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd",
    ),
    remarks: "",
    selectedDocuments: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProject = projects.find((p) => p.id === formData.projectId);
  const selectedRecipient = members.find((m) => m.id === formData.recipientId);
  const selectedDocs = documents.filter((d) =>
    formData.selectedDocuments.includes(d.id),
  );

  const handleDocumentToggle = (docId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedDocuments: prev.selectedDocuments.includes(docId)
        ? prev.selectedDocuments.filter((id) => id !== docId)
        : [...prev.selectedDocuments, docId],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.subject || formData.selectedDocuments.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: Form */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Transmittal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="transmittalNumber">Transmittal ID</Label>
                <Input
                  id="transmittalNumber"
                  value={formData.transmittalNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transmittalNumber: e.target.value,
                    })
                  }
                  className="font-mono bg-muted"
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  Auto-generated from project configuration
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Issue Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date
                        ? format(new Date(formData.date), "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        formData.date ? new Date(formData.date) : undefined
                      }
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          date: date ? format(date, "yyyy-MM-dd") : "",
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) =>
                  setFormData({ ...formData, projectId: value })
                }
              >
                <SelectTrigger id="project">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} ({project.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Select
                  value={formData.recipientId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, recipientId: value })
                  }
                >
                  <SelectTrigger id="recipient">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member, index) => (
                      <SelectItem
                        key={`${member.id}-${index}`}
                        value={member.id}
                      >
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Select
                  value={formData.purpose}
                  onValueChange={(value) =>
                    setFormData({ ...formData, purpose: value })
                  }
                >
                  <SelectTrigger id="purpose">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IFR">IFR - For Review</SelectItem>
                    <SelectItem value="IFA">IFA - For Approval</SelectItem>
                    <SelectItem value="IFC">IFC - For Construction</SelectItem>
                    <SelectItem value="IFI">IFI - For Information</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="Brief description of transmittal purpose"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dueDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate
                      ? format(new Date(formData.dueDate), "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      formData.dueDate ? new Date(formData.dueDate) : undefined
                    }
                    onSelect={(date) =>
                      setFormData({
                        ...formData,
                        dueDate: date ? format(date, "yyyy-MM-dd") : "",
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
                placeholder="Additional notes or instructions"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                2. Select Documents{" "}
                <span className="font-mono text-xs text-muted-foreground ml-2">
                  {formData.selectedDocuments.length} SELECTED
                </span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                  >
                    <Checkbox
                      id={`doc-${doc.id}`}
                      checked={formData.selectedDocuments.includes(doc.id)}
                      onCheckedChange={() => handleDocumentToggle(doc.id)}
                    />
                    <label
                      htmlFor={`doc-${doc.id}`}
                      className="flex-1 cursor-pointer space-y-1"
                    >
                      <p className="font-mono text-sm font-medium">
                        {doc.documentNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {doc.title}
                      </p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>Rev {doc.revision || "—"}</span>
                        <span>·</span>
                        <span>{doc.status || "—"}</span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right: Live Preview */}
      <div className="lg:sticky lg:top-6 lg:h-fit">
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle>
                Live Preview{" "}
                <span className="font-mono text-xs text-muted-foreground ml-2">
                  FORMAL ISSUE
                </span>
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.print()}
                >
                  Print
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    !formData.subject ||
                    formData.selectedDocuments.length === 0
                  }
                >
                  {isSubmitting ? "Issuing..." : "Issue Transmittal →"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-muted p-6">
            {/* Transmittal Paper - Force light theme appearance */}
            <div className="bg-white text-black border border-gray-300 p-8 shadow-sm [&_*]:!text-black dark:bg-white dark:text-black dark:border-gray-300">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-gray-900 pb-3 mb-5">
                <div>
                  <div className="text-[9px] uppercase tracking-[2px] text-gray-600 font-semibold mb-0.5">
                    Quadra EDMS
                  </div>
                  <h2 className="font-serif text-2xl font-normal text-black">
                    Document Transmittal
                  </h2>
                  <div className="text-[10px] text-gray-600 mt-0.5">
                    {selectedProject?.code || "PRJ-XXX"} ·{" "}
                    {selectedProject?.name || "Select project"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-wider text-gray-600 mb-1">
                    Transmittal №
                  </div>
                  <div className="font-mono text-sm font-medium text-black">
                    {formData.transmittalNumber}
                  </div>
                  <div className="text-[10px] text-gray-600 mt-1.5">
                    {formData.date
                      ? format(new Date(formData.date), "yyyy-MM-dd")
                      : ""}
                  </div>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 mb-5 text-xs">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-gray-600 font-semibold mb-1">
                    From
                  </div>
                  <div className="font-medium text-black">
                    {selectedProject?.name || "—"}
                  </div>
                  <div className="text-gray-600 text-[10.5px]">
                    Document Controller
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-gray-600 font-semibold mb-1">
                    To
                  </div>
                  <div className="font-medium text-black">
                    {selectedRecipient?.name || "—"}
                  </div>
                  <div className="text-gray-600 text-[10.5px]">
                    {selectedRecipient?.email || ""}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-gray-600 font-semibold mb-1">
                    Purpose
                  </div>
                  <div>
                    <Badge
                      className={`text-[10px] font-mono ${formData.purpose === "IFR"
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : formData.purpose === "IFA"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : formData.purpose === "IFC"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-slate-100 text-slate-800 border-slate-300"
                        }`}
                    >
                      ● {formData.purpose}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-gray-600 font-semibold mb-1">
                    Response Due
                  </div>
                  <div className="font-mono text-xs text-black">
                    {formData.dueDate || "—"}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-[9px] uppercase tracking-wider text-gray-600 font-semibold mb-1">
                    Subject
                  </div>
                  <div className="font-medium text-black">
                    {formData.subject || "Enter subject..."}
                  </div>
                </div>
              </div>

              {/* Documents Table */}
              <div className="mb-5">
                <div className="text-[9px] uppercase tracking-wider text-gray-600 font-semibold mb-1.5">
                  Documents Transmitted
                </div>
                {selectedDocs.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <div className="font-serif text-lg mb-1">
                      No documents selected
                    </div>
                    <div className="text-xs">
                      Choose documents on the left to include in this
                      transmittal.
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100 border-b border-gray-300">
                          <TableHead className="text-[9px] uppercase tracking-wider font-semibold text-gray-900 border-r border-gray-300 p-2">
                            #
                          </TableHead>
                          <TableHead className="text-[9px] uppercase tracking-wider font-semibold text-gray-900 border-r border-gray-300 p-2">
                            Document Code
                          </TableHead>
                          <TableHead className="text-[9px] uppercase tracking-wider font-semibold text-gray-900 border-r border-gray-300 p-2">
                            Title
                          </TableHead>
                          <TableHead className="text-[9px] uppercase tracking-wider font-semibold text-gray-900 border-r-2 border-gray-900 p-2">
                            Rev
                          </TableHead>
                          <TableHead className="text-[9px] uppercase tracking-wider font-semibold text-gray-900 border-r border-gray-300 p-2">
                            Format
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedDocs.map((doc, index) => (
                          <TableRow
                            key={doc.id}
                            className="border-b border-gray-300 last:border-b-0"
                          >
                            <TableCell className="text-black border-r border-gray-300 p-2">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-mono text-[11px] text-black border-r border-gray-300 p-2">
                              {doc.documentNumber}
                            </TableCell>
                            <TableCell className="text-black border-r border-gray-300 p-2">
                              {doc.title}
                            </TableCell>
                            <TableCell className="font-mono text-[11px] text-black border-r-2 border-gray-900 p-2">
                              {doc.revision || "—"}
                            </TableCell>
                            <TableCell className="font-mono text-[11px] text-black p-2">
                              PDF
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Remarks */}
              {formData.remarks && (
                <div className="mb-5">
                  <div className="text-[9px] uppercase tracking-wider text-gray-600 font-semibold mb-1">
                    Remarks
                  </div>
                  <div className="text-xs leading-relaxed text-black">
                    {formData.remarks}
                  </div>
                </div>
              )}

              {/* Signature Blocks */}
              <div className="grid grid-cols-2 gap-8 mt-7 text-xs">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-gray-600 font-semibold mb-1">
                    Issued By
                  </div>
                  <div className="border-t border-gray-900 pt-1.5 mt-10 text-black">
                    Document Controller
                    <br />
                    <span className="text-gray-600 text-[10px]">
                      Date:{" "}
                      {formData.date
                        ? format(new Date(formData.date), "yyyy-MM-dd")
                        : "_______________"}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-gray-600 font-semibold mb-1">
                    Received By
                  </div>
                  <div className="border-t border-gray-900 pt-1.5 mt-10 text-black">
                    {selectedRecipient?.name || "_______________"}
                    <br />
                    <span className="text-gray-600 text-[10px]">
                      Date: _______________
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
