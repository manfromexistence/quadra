"use client";

import { Button } from "@midday/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@midday/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import { Download, Printer } from "lucide-react";
import { EdmsStatusBadge } from "./status-badge";

interface ReportData {
  id: string;
  title: string;
  description: string;
  data: Array<Record<string, string>>;
  columns: Array<{ key: string; label: string }>;
}

interface ReportModalProps {
  report: ReportData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportModal({ report, open, onOpenChange }: ReportModalProps) {
  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExport = (format: "pdf" | "excel") => {
    // TODO: Implement actual export logic
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-normal">
            {report.title}
          </DialogTitle>
          <DialogDescription>{report.description}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 border-t border-b py-3">
          <div className="flex-1 text-sm text-muted-foreground">
            <span className="font-medium">Project:</span> Al Hamra Refinery
            Expansion
            <span className="mx-2">·</span>
            <span className="font-medium">Period:</span> YTD 2026
            <span className="mx-2">·</span>
            <span className="font-medium">Generated:</span>{" "}
            {new Date().toLocaleDateString()}
          </div>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="size-4 mr-2" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("excel")}
          >
            <Download className="size-4 mr-2" />
            Excel
          </Button>
          <Button size="sm" onClick={() => handleExport("pdf")}>
            <Download className="size-4 mr-2" />
            PDF
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="bg-white p-8 text-black">
            <div className="border-b-2 border-black pb-4 mb-6">
              <h2 className="text-3xl font-serif font-normal">
                {report.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Al Hamra Refinery Expansion · PRJ-AHR-2026
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                  Project
                </div>
                <div>PRJ-AHR-2026</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                  Period
                </div>
                <div>YTD 2026</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                  Total Records
                </div>
                <div>{report.data.length}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                  Generated
                </div>
                <div>{new Date().toLocaleDateString()}</div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  {report.columns.map((col) => (
                    <TableHead key={col.key} className="bg-gray-100 text-black">
                      {col.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.data.map((row, index) => (
                  <TableRow key={index} className="border-gray-200">
                    {report.columns.map((col) => (
                      <TableCell key={col.key} className="text-sm">
                        {col.key === "status" ? (
                          <EdmsStatusBadge status={row[col.key]} />
                        ) : col.key.includes("code") ||
                          col.key.includes("number") ? (
                          <span className="font-mono text-xs">
                            {row[col.key]}
                          </span>
                        ) : (
                          row[col.key]
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
