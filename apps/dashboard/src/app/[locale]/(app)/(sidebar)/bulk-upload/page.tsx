import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader } from "@midday/ui/card";
import { FileSpreadsheet, Upload } from "lucide-react";
import type { Metadata } from "next";
import { DocumentBulkImportSheet } from "@/components/edms/document-bulk-import-sheet";
import { DocumentBulkUploadSheet } from "@/components/edms/document-bulk-upload-sheet";
import { ScrollableContent } from "@/components/scrollable-content";

export const metadata: Metadata = {
  title: "Bulk Upload | Quadra EDMS",
};

export default async function BulkUploadPage() {
  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Bulk Upload
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Upload multiple documents at once using file upload or CSV/Excel
                import.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">File Upload</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload multiple files at once
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Select multiple PDF, DWG, DOC, DOCX, XLS, or XLSX files and
                upload them simultaneously. Each file will be processed and
                added to the document register.
              </p>
              <DocumentBulkUploadSheet>
                <Button className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Start File Upload
                </Button>
              </DocumentBulkUploadSheet>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileSpreadsheet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">CSV/Excel Import</h3>
                  <p className="text-sm text-muted-foreground">
                    Import document metadata from spreadsheet
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Download the CSV template, fill in document details, and paste
                the data to import multiple document records. Includes
                validation and error checking.
              </p>
              <DocumentBulkImportSheet>
                <Button variant="outline" className="w-full">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Start CSV Import
                </Button>
              </DocumentBulkImportSheet>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Upload Guidelines</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium">File Upload</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Supported formats: PDF, DWG, DOC, DOCX, XLS, XLSX</li>
                <li>Maximum file size: 50MB per file</li>
                <li>Maximum files per upload: 20 files</li>
                <li>Files are uploaded concurrently for faster processing</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 font-medium">CSV/Excel Import</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Download the template to ensure correct column format</li>
                <li>
                  Required fields: Project, Discipline, Type, Sequence, Title,
                  Author
                </li>
                <li>
                  Validation checks: Discipline codes, document types, sequence
                  format, status codes
                </li>
                <li>Preview shows validation results before importing</li>
                <li>Only valid rows will be imported</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 font-medium">Document Code Format</h4>
              <p className="text-sm text-muted-foreground">
                Documents follow the format:{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                  PROJECT-DISCIPLINE-TYPE-SEQUENCE
                </code>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Example:{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                  AHR-CIV-DWG-0001
                </code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollableContent>
  );
}
