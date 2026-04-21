"use client";

import { Badge } from "@midday/ui/badge";
import { Button } from "@midday/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@midday/ui/dialog";
import { Input } from "@midday/ui/input";
import { FileText, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: string[];
}

export function QuickTemplates() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [templates] = useState<Template[]>([
    {
      id: "1",
      name: "Technical Specification",
      category: "Document",
      description: "Standard template for technical specifications",
      fields: ["Title", "Version", "Author", "Discipline", "Project"],
    },
    {
      id: "2",
      name: "Transmittal Cover Letter",
      category: "Transmittal",
      description: "Cover letter for document transmittals",
      fields: ["From", "To", "Subject", "Reference", "Documents"],
    },
    {
      id: "3",
      name: "Meeting Minutes",
      category: "General",
      description: "Template for meeting minutes",
      fields: ["Date", "Attendees", "Agenda", "Action Items"],
    },
  ]);

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()),
  );

  const _useTemplate = (template: Template) => {
    toast(`Using template: ${template.name}`);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="mr-2 size-4" />
          Quick Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quick Templates</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="p-4 rounded-lg border bg-card hover:bg-muted transition-colors cursor-pointer"
                onClick={() => {
                  toast(`Using template: ${template.name}`);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="font-medium">{template.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.fields.map((field) => (
                    <Badge key={field} variant="secondary" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            {filteredTemplates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No templates found
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
