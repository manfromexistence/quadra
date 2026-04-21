import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import { Download, FileText, Upload } from "lucide-react";
import type { Metadata } from "next";
import { ProjectTemplateUploadSheet } from "@/components/edms/project-template-upload-sheet";
import { ScrollableContent } from "@/components/scrollable-content";

export const metadata: Metadata = {
  title: "Project Templates | Quadra EDMS",
};

const TEMPLATES = [
  {
    id: "1",
    name: "Standard Letter Template",
    type: "letter",
    category: "Correspondence",
    description: "Standard letter format for official correspondence",
    fileName: "standard_letter.docx",
    fileSize: "45 KB",
    fileType: "DOCX",
    uploadedBy: "Admin",
    downloadCount: 12,
    createdAt: "2026-04-15",
  },
  {
    id: "2",
    name: "Internal Memo Template",
    type: "memo",
    category: "Correspondence",
    description: "Internal memo format for team communication",
    fileName: "internal_memo.docx",
    fileSize: "38 KB",
    fileType: "DOCX",
    uploadedBy: "Admin",
    downloadCount: 8,
    createdAt: "2026-04-14",
  },
  {
    id: "3",
    name: "Minutes of Meeting Template",
    type: "mom",
    category: "Correspondence",
    description: "MoM format for meeting documentation",
    fileName: "mom_template.docx",
    fileSize: "52 KB",
    fileType: "DOCX",
    uploadedBy: "Admin",
    downloadCount: 15,
    createdAt: "2026-04-13",
  },
  {
    id: "4",
    name: "Commercial Request Sheet",
    type: "crs",
    category: "Commercial",
    description: "CRS format for commercial document requests",
    fileName: "crs_template.xlsx",
    fileSize: "125 KB",
    fileType: "XLSX",
    uploadedBy: "Admin",
    downloadCount: 6,
    createdAt: "2026-04-12",
  },
];

export default function ProjectTemplatesPage() {
  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Project Templates
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Upload and manage project document templates including letters,
                memos, CRS, MoM, and other standard formats.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ProjectTemplateUploadSheet />
          </div>
        </div>

        <Card className="rounded-lg border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Template Library</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Template Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TEMPLATES.map((template) => (
                  <TableRow
                    key={template.id}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <TableCell className="px-6">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {template.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-muted px-2 py-1 font-mono text-xs uppercase">
                        {template.type}
                      </span>
                    </TableCell>
                    <TableCell>{template.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-muted-foreground" />
                        <span className="text-sm">{template.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {template.fileSize}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {template.downloadCount}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {template.createdAt}
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Download className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ScrollableContent>
  );
}
