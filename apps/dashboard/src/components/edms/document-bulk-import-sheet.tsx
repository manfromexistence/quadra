"use client";

import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { Checkbox } from "@midday/ui/checkbox";
import { Label } from "@midday/ui/label";
import { ScrollArea } from "@midday/ui/scroll-area";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import { FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "@/hooks/use-toast";

interface ParsedRow {
  rowNum: number;
  discipline: string;
  type: string;
  sequence: string;
  revision: string;
  title: string;
  author: string;
  status: string;
  errors: string[];
  isValid: boolean;
}

export function DocumentBulkImportSheet({
  projects,
  children,
}: {
  projects: { id: string; name: string; projectNumber: string | null }[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [hideValid, setHideValid] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const validDisciplines = ["CIV", "MEC", "STR", "ELE", "INS", "PIP", "PRO"];
  const validTypes = ["DWG", "SPC", "DAT", "CAL", "RPT"];
  const validStatuses = ["DRAFT", "IFR", "IFA", "IFC"];

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ["Discipline", "Type", "Sequence", "Rev", "Title", "Author", "Status"],
      [
        "CIV",
        "DWG",
        "0100",
        "A",
        "Foundation Plan - Unit 300",
        "R. Patel",
        "DRAFT",
      ],
      [
        "MEC",
        "SPC",
        "0030",
        "B",
        "Pump Specification P-201",
        "J. Okafor",
        "IFR",
      ],
      [
        "STR",
        "CAL",
        "0025",
        "0",
        "Tank Foundation Calc T-301",
        "M. Chen",
        "IFC",
      ],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws["!cols"] = [
      { wch: 12 },
      { wch: 8 },
      { wch: 10 },
      { wch: 6 },
      { wch: 40 },
      { wch: 15 },
      { wch: 10 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Documents");
    XLSX.writeFile(wb, "bulk_import_template.xlsx");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = [".xlsx", ".xls"];
    const fileExtension = file.name
      .toLowerCase()
      .slice(file.name.lastIndexOf("."));

    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const parseExcel = async () => {
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please upload an Excel file first",
        variant: "destructive",
      });
      return;
    }

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
        header: 1,
      }) as string[][];

      if (jsonData.length < 2) {
        toast({
          title: "Invalid data",
          description:
            "Excel file must contain header row and at least one data row",
          variant: "destructive",
        });
        return;
      }

      const headers = jsonData[0].map((h) => String(h).trim().toLowerCase());
      const rows: ParsedRow[] = [];

      for (let i = 1; i < jsonData.length; i++) {
        const cols = jsonData[i];
        if (!cols || cols.every((c) => !c)) continue; // Skip empty rows

        const row: any = { rowNum: i };

        headers.forEach((h, idx) => {
          row[h] = cols[idx] ? String(cols[idx]).trim() : "";
        });

        const errors: string[] = [];

        // Validate discipline
        if (!validDisciplines.includes(row.discipline?.toUpperCase())) {
          errors.push(`Invalid discipline: ${row.discipline}`);
        }

        // Validate type
        if (!validTypes.includes(row.type?.toUpperCase())) {
          errors.push(`Invalid type: ${row.type}`);
        }

        // Validate sequence
        if (!/^\d{4}$/.test(row.sequence)) {
          errors.push("Sequence must be 4 digits");
        }

        // Validate status
        if (!validStatuses.includes(row.status?.toUpperCase())) {
          errors.push(`Invalid status: ${row.status}`);
        }

        // Validate required fields
        if (!row.title) errors.push("Title is required");
        if (!row.author) errors.push("Author is required");

        rows.push({
          rowNum: i,
          discipline: row.discipline?.toUpperCase() || "",
          type: row.type?.toUpperCase() || "",
          sequence: row.sequence || "",
          revision: row.rev || row.revision || "0",
          title: row.title || "",
          author: row.author || "",
          status: row.status?.toUpperCase() || "",
          errors,
          isValid: errors.length === 0,
        });
      }

      setParsedRows(rows);
      setStep(3);

      const validCount = rows.filter((r) => r.isValid).length;
      const invalidCount = rows.length - validCount;

      toast({
        title: "Validation complete",
        description: `${validCount} valid, ${invalidCount} invalid rows`,
      });
    } catch (error) {
      console.log({ error });
      toast({
        title: "Parse error",
        description:
          "Failed to parse Excel file. Please check the file format.",
        variant: "destructive",
      });
    }
  };

  const commitImport = async () => {
    if (!selectedProjectId) {
      toast({
        title: "No project selected",
        description: "Please select a project first",
        variant: "destructive",
      });
      return;
    }

    const validRows = parsedRows.filter((r) => r.isValid);

    if (validRows.length === 0) {
      toast({
        title: "No valid rows",
        description: "Fix validation errors before importing",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const { createDocument } = await import("@/actions/documents");

        let successCount = 0;
        let errorCount = 0;

        for (const row of validRows) {
          try {
            await createDocument({
              projectId: selectedProjectId,
              documentNumber: `${row.discipline}-${row.type}-${row.sequence}`,
              title: row.title,
              discipline: row.discipline,
              category: row.type,
              revision: row.revision,
              status: row.status === "IFC" ? "approved" : "draft",
              version: "1.0",
              fileName: `${row.discipline}-${row.type}-${row.sequence}.pdf`,
              fileUrl: "", // File upload would be handled separately
              fileSize: 0,
            });
            successCount++;
          } catch (error) {
            console.error(
              `Failed to import document ${row.discipline}-${row.type}-${row.sequence}:`,
              error,
            );
            errorCount++;
          }
        }

        toast({
          title: "Import complete",
          description: `${successCount} documents imported${errorCount > 0 ? `, ${errorCount} failed` : ""}`,
        });

        setIsOpen(false);
        setStep(1);
        setUploadedFile(null);
        setParsedRows([]);
        router.refresh();
      } catch (error) {
        console.error("Import failed:", error);
        toast({
          title: "Import failed",
          description: "An error occurred during import",
          variant: "destructive",
        });
      }
    });
  };

  const resetImport = () => {
    setStep(1);
    setUploadedFile(null);
    setParsedRows([]);
    setHideValid(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;
  const displayedRows = hideValid
    ? parsedRows.filter((r) => !r.isValid)
    : parsedRows;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full px-0 sm:max-w-4xl">
        <SheetHeader className="space-y-1 px-6 pt-6">
          <SheetTitle>Bulk Document Import</SheetTitle>
          <SheetDescription>
            Register multiple documents at once via Excel file upload.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="mt-8 space-y-6 px-6 pb-6">
            {/* Step 1: Download Template */}
            <Card className="rounded-lg border-2 border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    1
                  </div>
                  <CardTitle className="text-base">
                    Download the import template
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted-foreground">
                  Use the CSV template to ensure columns match the project
                  numbering pattern. Required fields: Discipline, Type,
                  Sequence, Revision, Title, Author, Status.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={downloadTemplate}
                  className="rounded-lg"
                >
                  ↓ Download Template
                </Button>
              </CardContent>
            </Card>

            {/* Step 2: Upload Excel File */}
            <Card className="rounded-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    2
                  </div>
                  <CardTitle className="text-base">
                    Upload your Excel file
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-select">Select Project</Label>
                  <Select
                    value={selectedProjectId}
                    onValueChange={setSelectedProjectId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.projectNumber
                            ? `${p.projectNumber} - ${p.name}`
                            : p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excel-file">Upload Excel File</Label>
                  <input
                    ref={fileInputRef}
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {uploadedFile ? (
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-4">
                      <FileSpreadsheet className="h-8 w-8 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-lg border-dashed"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Excel File
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Supported formats: .xlsx, .xls
                  </p>
                </div>

                <Button
                  onClick={parseExcel}
                  disabled={!uploadedFile || !selectedProjectId}
                  className="w-full rounded-lg"
                >
                  Parse & Validate →
                </Button>
              </CardContent>
            </Card>

            {/* Step 3: Review & Import */}
            {step === 3 && parsedRows.length > 0 && (
              <>
                <Card className="rounded-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                        3
                      </div>
                      <CardTitle className="text-base">
                        Review & fix validation issues
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex items-center gap-4 rounded-lg bg-muted p-4">
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {validCount} valid rows
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Ready to import
                        </div>
                      </div>
                      {invalidCount > 0 && (
                        <div className="flex-1">
                          <div className="text-sm font-medium text-destructive">
                            {invalidCount} invalid rows
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Fix errors or skip
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="hide-valid"
                          checked={hideValid}
                          onCheckedChange={(checked) =>
                            setHideValid(checked === true)
                          }
                        />
                        <Label
                          htmlFor="hide-valid"
                          className="text-sm font-normal cursor-pointer"
                        >
                          Hide valid rows
                        </Label>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Showing {displayedRows.length} of {parsedRows.length}{" "}
                        rows
                      </div>
                    </div>

                    <ScrollArea className="h-[400px] rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Discipline</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Seq</TableHead>
                            <TableHead>Rev</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Validation</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {displayedRows.map((row) => (
                            <TableRow
                              key={row.rowNum}
                              className={row.isValid ? "" : "bg-destructive/5"}
                            >
                              <TableCell className="font-mono text-xs">
                                {row.rowNum}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {row.discipline}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {row.type}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {row.sequence}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {row.revision}
                              </TableCell>
                              <TableCell className="text-xs">
                                {row.title}
                              </TableCell>
                              <TableCell className="text-xs">
                                {row.author}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {row.status}
                              </TableCell>
                              <TableCell>
                                {row.isValid ? (
                                  <span className="text-xs text-green-600">
                                    ✓ Valid
                                  </span>
                                ) : (
                                  <div className="space-y-1">
                                    {row.errors.map((err, i) => (
                                      <div
                                        key={i}
                                        className="text-xs text-destructive"
                                      >
                                        {err}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between border-t pt-6">
                  <div className="text-sm text-muted-foreground">
                    {validCount > 0
                      ? `${validCount} document(s) will be imported`
                      : "No valid rows to import"}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={resetImport}>
                      Cancel
                    </Button>
                    <Button
                      onClick={commitImport}
                      disabled={isPending || validCount === 0}
                      className="rounded-lg"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>Import {validCount} Valid Rows →</>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
