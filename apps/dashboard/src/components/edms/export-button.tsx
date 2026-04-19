"use client";

import { useState } from "react";
import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@midday/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@midday/ui/dropdown-menu";
import { exportToPDF, exportToExcel } from "@/lib/export-utils";

interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

interface ExportData {
  [key: string]: string | number | null | undefined;
}

interface ExportButtonProps {
  data: ExportData[];
  columns: ExportColumn[];
  title: string;
  filename?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  metadata?: { label: string; value: string }[];
}

export function ExportButton({
  data,
  columns,
  title,
  filename,
  variant = "outline",
  className,
  metadata,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      exportToPDF(data, columns, {
        title,
        filename: filename ? `${filename}.pdf` : undefined,
        orientation: "landscape",
        metadata,
      });
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      exportToExcel(data, columns, {
        title,
        filename: filename ? `${filename}.xlsx` : undefined,
        sheetName: title,
      });
    } catch (error) {
      console.error("Excel export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} className={className} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <FileDown className="size-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>
          <FileDown className="size-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel} disabled={isExporting}>
          <FileSpreadsheet className="size-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
