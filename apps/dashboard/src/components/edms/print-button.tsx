"use client";

import { Button } from "@midday/ui/button";
import { FileDown, Printer } from "lucide-react";

interface PrintButtonProps {
  label?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
  /** "print" = Printer icon, "download" = FileDown icon (both call window.print). Default: "print" */
  icon?: "print" | "download";
}

export function PrintButton({
  label = "Export PDF",
  variant = "outline",
  className,
  icon = "print",
}: PrintButtonProps) {
  const Icon = icon === "download" ? FileDown : Printer;

  const handlePrint = () => {
    // Use window.print() which respects print CSS
    // The browser will handle the print dialog
    window.print();
  };

  return (
    <Button
      variant={variant}
      className={`print:hidden ${className || ""}`}
      onClick={handlePrint}
      id={icon === "download" ? "edms-download-pdf-btn" : "edms-print-btn"}
    >
      <Icon className="size-4 mr-2" />
      {label}
    </Button>
  );
}
