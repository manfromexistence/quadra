"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@midday/ui/button";

interface PrintButtonProps {
  label?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

export function PrintButton({ label = "Print / PDF", variant = "outline", className }: PrintButtonProps) {
  return (
    <>
      <Button 
        variant={variant} 
        className={`print:hidden ${className || ""}`} 
        onClick={() => window.print()}
      >
        <Printer className="size-4 mr-2" />
        {label}
      </Button>
      <Button 
        variant={variant} 
        className={`print:hidden ${className || ""}`} 
        onClick={() => window.print()}
      >
        <Download className="size-4 mr-2" />
        Download PDF
      </Button>
    </>
  );
}
