"use client";

import { useState, useEffect } from "react";
import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";
import { Textarea } from "@midday/ui/textarea";
import { Checkbox } from "@midday/ui/checkbox";
import { ScrollArea } from "@midday/ui/scroll-area";
import { Badge } from "@midday/ui/badge";
import { format } from "date-fns";

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
    dueDate: format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    remarks: "",
    selectedDocuments: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProject = projects.find((p) => p.id === formData.projectId);
  const selectedRecipient = members.find((m) => m.id === formData.recipientId);
  const selectedDocs = documents.filter((d) =>
    formData.selectedDocuments.includes(d.id)
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
            <CardTitle>Transmittal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="transmittalNumber">Transmittal Number</Label>
                <Input
                  id="transmittalNumber"
                  value={formData.transmittalNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, transmittalNumber: e.target.value })
                  }
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Issue Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief description of transmittal purpose"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Additional notes or instructions"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Select Documents</CardTitle>
              <Badge variant="secondary">
                {formData.selectedDocuments.length} selected
              </Badge>
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
                      <p className="font-mono text-sm font-medium">{doc.code}</p>
                      <p className="text-sm text-muted-foreground">{doc.title}</p>
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

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !formData.subject ||
              formData.selectedDocuments.length === 0
            }
            className="flex-1"
          >
            {isSubmitting ? "Creating..." : "Create Transmittal"}
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="lg:sticky lg:top-6 lg:h-fit">
        <Card className="bg-white text-black">
          <CardHeader className="border-b-2 border-black">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-2xl font-normal">
                  Document Transmittal
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedProject?.name || "Select project"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Transmittal No.
                </p>
                <p className="font-mono text-sm font-medium">
                  {formData.transmittalNumber}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Issue Date
                </p>
                <p className="mt-1">
                  {formData.date
                    ? format(new Date(formData.date), "MMM dd, yyyy")
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Due Date
                </p>
                <p className="mt-1">
                  {formData.dueDate
                    ? format(new Date(formData.dueDate), "MMM dd, yyyy")
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">To</p>
                <p className="mt-1">{selectedRecipient?.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Purpose
                </p>
                <p className="mt-1">{formData.purpose}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Subject
              </p>
              <p className="mt-1 text-sm">
                {formData.subject || "Enter subject..."}
              </p>
            </div>

            {formData.remarks && (
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Remarks
                </p>
                <p className="mt-1 text-sm">{formData.remarks}</p>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">
                Attached Documents ({selectedDocs.length})
              </p>
              {selectedDocs.length === 0 ? (
                <p className="text-sm italic text-gray-400">
                  No documents selected
                </p>
              ) : (
                <div className="overflow-hidden rounded border border-gray-300">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border-b border-gray-300 px-2 py-1 text-left font-medium uppercase tracking-wider">
                          Document No.
                        </th>
                        <th className="border-b border-gray-300 px-2 py-1 text-left font-medium uppercase tracking-wider">
                          Title
                        </th>
                        <th className="border-b border-gray-300 px-2 py-1 text-left font-medium uppercase tracking-wider">
                          Rev
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDocs.map((doc) => (
                        <tr key={doc.id} className="border-b border-gray-200">
                          <td className="px-2 py-1 font-mono">{doc.code}</td>
                          <td className="px-2 py-1">{doc.title}</td>
                          <td className="px-2 py-1">{doc.revision}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-8 border-t border-gray-300 pt-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Prepared By
                </p>
                <div className="mt-8 border-t border-gray-400 pt-1">
                  <p className="text-xs">Signature & Date</p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Received By
                </p>
                <div className="mt-8 border-t border-gray-400 pt-1">
                  <p className="text-xs">Signature & Date</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
