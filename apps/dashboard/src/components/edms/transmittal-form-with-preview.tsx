"use client";

import { Badge } from "@midday/ui/badge";
import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { Checkbox } from "@midday/ui/checkbox";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import { ScrollArea } from "@midday/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";
import { Textarea } from "@midday/ui/textarea";
import { format } from "date-fns";
import { useState } from "react";

interface Document {
  id: string;
  code: string;
  title: string;
  revision: string;
  status: string;
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
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
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
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
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
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
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
                        {doc.code}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {doc.title}
                      </p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>Rev {doc.revision}</span>
                        <span>·</span>
                        <span>{doc.status}</span>
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
            {/* Transmittal Paper */}
            <div className="bg-white border border-border p-8 shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-black pb-3 mb-5">
                <div>
                  <div className="text-[9px] uppercase tracking-[2px] text-muted-foreground font-semibold mb-0.5">
                    Quadra EDMS
                  </div>
                  <h2 className="font-serif text-2xl font-normal">
                    Document Transmittal
                  </h2>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {selectedProject?.code || "PRJ-XXX"} ·{" "}
                    {selectedProject?.name || "Select project"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">
                    Transmittal №
                  </div>
                  <div className="font-mono text-sm font-medium">
                    {formData.transmittalNumber}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1.5">
                    {formData.date
                      ? format(new Date(formData.date), "yyyy-MM-dd")
                      : ""}
                  </div>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 mb-5 text-xs">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    From
                  </div>
                  <div className="font-medium">
                    {selectedProject?.name || "—"}
                  </div>
                  <div className="text-muted-foreground text-[10.5px]">
                    Document Controller
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    To
                  </div>
                  <div className="font-medium">
                    {selectedRecipient?.name || "—"}
                  </div>
                  <div className="text-muted-foreground text-[10.5px]">
                    {selectedRecipient?.email || ""}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    Purpose
                  </div>
                  <div>
                    <Badge
                      className={`text-[10px] font-mono ${
                        formData.purpose === "IFR"
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
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    Response Due
                  </div>
                  <div className="font-mono text-xs">
                    {formData.dueDate || "—"}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    Subject
                  </div>
                  <div className="font-medium">
                    {formData.subject || "Enter subject..."}
                  </div>
                </div>
              </div>

              {/* Documents Table */}
              <div className="mb-5">
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                  Documents Transmitted
                </div>
                {selectedDocs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="font-serif text-lg mb-1">
                      No documents selected
                    </div>
                    <div className="text-xs">
                      Choose documents on the left to include in this
                      transmittal.
                    </div>
                  </div>
                ) : (
                  <table className="w-full text-xs border border-border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border px-2 py-1.5 text-left text-[9px] uppercase tracking-wider font-semibold">
                          #
                        </th>
                        <th className="border border-border px-2 py-1.5 text-left text-[9px] uppercase tracking-wider font-semibold">
                          Document Code
                        </th>
                        <th className="border border-border px-2 py-1.5 text-left text-[9px] uppercase tracking-wider font-semibold">
                          Title
                        </th>
                        <th className="border border-border px-2 py-1.5 text-left text-[9px] uppercase tracking-wider font-semibold">
                          Rev
                        </th>
                        <th className="border border-border px-2 py-1.5 text-left text-[9px] uppercase tracking-wider font-semibold">
                          Format
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDocs.map((doc, index) => (
                        <tr key={doc.id}>
                          <td className="border border-border px-2 py-1.5">
                            {index + 1}
                          </td>
                          <td className="border border-border px-2 py-1.5 font-mono text-[11px]">
                            {doc.code}
                          </td>
                          <td className="border border-border px-2 py-1.5">
                            {doc.title}
                          </td>
                          <td className="border border-border px-2 py-1.5 font-mono text-[11px]">
                            {doc.revision}
                          </td>
                          <td className="border border-border px-2 py-1.5 font-mono text-[11px]">
                            PDF
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Remarks */}
              {formData.remarks && (
                <div className="mb-5">
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    Remarks
                  </div>
                  <div className="text-xs leading-relaxed">
                    {formData.remarks}
                  </div>
                </div>
              )}

              {/* Signature Blocks */}
              <div className="grid grid-cols-2 gap-8 mt-7 text-xs">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    Issued By
                  </div>
                  <div className="border-t border-black pt-1.5 mt-10">
                    Document Controller
                    <br />
                    <span className="text-muted-foreground text-[10px]">
                      Date:{" "}
                      {formData.date
                        ? format(new Date(formData.date), "yyyy-MM-dd")
                        : "_______________"}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    Received By
                  </div>
                  <div className="border-t border-black pt-1.5 mt-10">
                    {selectedRecipient?.name || "_______________"}
                    <br />
                    <span className="text-muted-foreground text-[10px]">
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
