"use client";

import { Button } from "@midday/ui/button";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateProjectConfig } from "@/actions/project-config";

interface ConfigNumberingProps {
  projectId: string;
  config: {
    projectCode: string;
    shortCode: string;
    client: string | null;
    contractor: string | null;
    currency: string | null;
    numberingPattern: string;
    sequencePadding: number;
    separator: string;
    revisionScheme: string;
    sequenceReset: string;
  } | null;
}

export function ConfigNumbering({ projectId, config }: ConfigNumberingProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const pattern = config?.numberingPattern ?? "PRJ-DISC-TYPE-SEQ";
  const padding = config?.sequencePadding ?? 4;
  const separator = config?.separator ?? "hyphen";
  const revisionScheme = config?.revisionScheme ?? "alpha-numeric";
  const sequenceReset = config?.sequenceReset ?? "continuous";

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      await updateProjectConfig({
        projectId,
        projectCode: config?.projectCode ?? "PRJ-001",
        shortCode: config?.shortCode ?? "PRJ",
        client: config?.client,
        contractor: config?.contractor,
        currency: config?.currency ?? "usd",
        numberingPattern: formData.get("numberingPattern") as string,
        sequencePadding: Number(formData.get("sequencePadding")),
        separator: formData.get("separator") as string,
        revisionScheme: formData.get("revisionScheme") as string,
        sequenceReset: formData.get("sequenceReset") as string,
      });
      router.refresh();
    } catch (error) {
      console.error("Error updating numbering config:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Document Numbering Scheme</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Define the pattern used to generate unique document codes. Each
          segment is populated from the values you configure below.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="numberPattern">Number Pattern Template</Label>
        <Input
          id="numberPattern"
          name="numberingPattern"
          className="font-mono"
          defaultValue={pattern}
          placeholder="PRJ-DISC-TYPE-SEQ"
          required
        />
        <p className="text-xs text-muted-foreground">
          Supported tokens: PRJ · DISC · TYPE · SEQ · REV · YEAR
        </p>
      </div>

      <div className="border border-border bg-muted/30 p-4 space-y-3">
        <div className="text-xs font-medium text-muted-foreground">
          PATTERN PREVIEW
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-col items-center gap-1 px-3 py-2 border border-border bg-card">
            <span className="text-xs text-muted-foreground">PRJ</span>
            <span className="font-mono text-sm font-medium">AHR</span>
          </div>
          <span className="text-muted-foreground">-</span>
          <div className="flex flex-col items-center gap-1 px-3 py-2 border border-border bg-card">
            <span className="text-xs text-muted-foreground">DISC</span>
            <span className="font-mono text-sm font-medium">MEC</span>
          </div>
          <span className="text-muted-foreground">-</span>
          <div className="flex flex-col items-center gap-1 px-3 py-2 border border-border bg-card">
            <span className="text-xs text-muted-foreground">TYPE</span>
            <span className="font-mono text-sm font-medium">DWG</span>
          </div>
          <span className="text-muted-foreground">-</span>
          <div className="flex flex-col items-center gap-1 px-3 py-2 border border-border bg-card">
            <span className="text-xs text-muted-foreground">SEQ</span>
            <span className="font-mono text-sm font-medium">
              {"0".repeat(padding - 1)}1
            </span>
          </div>
          <span className="text-muted-foreground">/</span>
          <div className="flex flex-col items-center gap-1 px-3 py-2 border border-border bg-card">
            <span className="text-xs text-muted-foreground">REV</span>
            <span className="font-mono text-sm font-medium">A</span>
          </div>
        </div>
        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground mb-1">
            Example Output
          </div>
          <div className="font-mono text-base font-semibold">
            AHR-MEC-DWG-{"0".repeat(padding - 1)}1 / Rev A
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="sequencePadding">Sequence Padding</Label>
          <Select name="sequencePadding" defaultValue={String(padding)}>
            <SelectTrigger id="sequencePadding">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 digits (001)</SelectItem>
              <SelectItem value="4">4 digits (0001)</SelectItem>
              <SelectItem value="5">5 digits (00001)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="separator">Separator</Label>
          <Select name="separator" defaultValue={separator}>
            <SelectTrigger id="separator">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hyphen">Hyphen ( - )</SelectItem>
              <SelectItem value="underscore">Underscore ( _ )</SelectItem>
              <SelectItem value="dot">Dot ( . )</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="revisionScheme">Revision Scheme</Label>
          <Select name="revisionScheme" defaultValue={revisionScheme}>
            <SelectTrigger id="revisionScheme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alpha-numeric">
                Alpha for pre-IFC (A,B,C) then numeric (0,1,2)
              </SelectItem>
              <SelectItem value="numeric">Numeric only (0,1,2,3)</SelectItem>
              <SelectItem value="alpha">Alpha only (A,B,C,D)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sequenceReset">Sequence Reset</Label>
          <Select name="sequenceReset" defaultValue={sequenceReset}>
            <SelectTrigger id="sequenceReset">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="continuous">
                Continuous across project
              </SelectItem>
              <SelectItem value="discipline">Reset per discipline</SelectItem>
              <SelectItem value="year">Reset per year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Numbering Settings"}
        </Button>
      </div>
    </form>
  );
}
