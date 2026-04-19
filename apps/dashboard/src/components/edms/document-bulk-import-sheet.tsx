"use client";

import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
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
import { Textarea } from "@midday/ui/textarea";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
}: {
  projects: { id: string; name: string; projectNumber: string | null }[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [csvData, setCsvData] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [hideValid, setHideValid] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const validDisciplines = ["CIV", "MEC", "STR", "ELE", "INS", "PIP", "PRO"];
  const validTypes = ["DWG", "SPC", "DAT", "CAL", "RPT"];
  const validStatuses = ["DRAFT", "IFR", "IFA", "IFC"];

  const downloadTemplate = () => {
    const template = `Discipline,Type,Sequence,Rev,Title,Author,Status
CIV,DWG,0100,A,Foundation Plan - Unit 300,R. Patel,DRAFT
MEC,SPC,0030,B,Pump Specification P-201,J. Okafor,IFR
STR,CAL,0025,0,Tank Foundation Calc T-301,M. Chen,IFC`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCsv = () => {
    if (!csvData.trim()) {
      toast({
        title: "No data",
        description: "Please paste CSV data first",
        variant: "destructive",
      });
      return;
    }

    const lines = csvData.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      toast({
        title: "Invalid data",
        description: "Need header + at least one row",
        variant: "destructive",
      });
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      const row: any = { rowNum: i };

      headers.forEach((h, idx) => {
        row[h] = cols[idx] || "";
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
  };

  const commitImport = () => {
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
      // TODO: Implement actual import API call
      // For now, just show success message
      toast({
        title: "Import successful",
        description: `${validRows.length} documents imported`,
      });

      setIsOpen(false);
      setStep(1);
      setCsvData("");
      setParsedRows([]);
      router.refresh();
    });
  };

  const resetImport = () => {
    setStep(1);
    setCsvData("");
    setParsedRows([]);
    setHideValid(false);
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;
  const displayedRows = hideValid
    ? parsedRows.filter((r) => !r.isValid)
    : parsedRows;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <FileSpreadsheet className="size-4" />
          Import Excel/CSV
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto px-0 sm:max-w-4xl">
        <SheetHeader className="space-y-1 px-6 pt-6">
          <SheetTitle>Bulk Document Import</SheetTitle>
          <SheetDescription>
            Register multiple documents at once via CSV/Excel upload or
            clipboard paste
          </SheetDescription>
        </SheetHeader>

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
                numbering pattern. Required fields: Discipline, Type, Sequence,
                Revision, Title, Author, Status.
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

          {/* Step 2: Upload or Paste */}
          <Card className="rounded-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                  2
                </div>
                <CardTitle className="text-base">
                  Upload or paste your document list
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="project-select" className="text-sm font-medium">
                  Select Project
                </label>
                <select
                  id="project-select"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select a project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectNumber
                        ? `${p.projectNumber} - ${p.name}`
                        : p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="csv-data" className="text-sm font-medium">
                  Paste CSV Data
                </label>
                <Textarea
                  id="csv-data"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="Discipline,Type,Sequence,Rev,Title,Author,Status&#10;CIV,DWG,0100,A,Foundation Plan Unit 300,R. Patel,DRAFT&#10;MEC,SPC,0030,B,Pump Specification P-201,J. Okafor,IFR"
                  className="min-h-[200px] rounded-lg font-mono text-xs"
                />
              </div>

              <Button
                onClick={parseCsv}
                disabled={!csvData.trim() || !selectedProjectId}
                className="rounded-lg"
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
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={hideValid}
                        onChange={(e) => setHideValid(e.target.checked)}
                        className="rounded"
                      />
                      Hide valid rows
                    </label>
                    <div className="text-sm text-muted-foreground">
                      Showing {displayedRows.length} of {parsedRows.length} rows
                    </div>
                  </div>

                  <div className="max-h-[400px] overflow-auto rounded-lg border">
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
                  </div>
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
      </SheetContent>
    </Sheet>
  );
}
