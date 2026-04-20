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
import type { DashboardSessionUser } from "@/lib/edms/session";

interface ConfigGeneralProps {
  sessionUser: DashboardSessionUser;
  projectId: string;
  config: {
    id: string;
    projectId: string;
    projectCode: string;
    shortCode: string;
    client: string | null;
    contractor: string | null;
    currency: string | null;
  } | null;
}

export function ConfigGeneral({
  sessionUser,
  projectId,
  config,
}: ConfigGeneralProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      await updateProjectConfig({
        projectId,
        projectCode: formData.get("projectCode") as string,
        shortCode: formData.get("shortCode") as string,
        client: (formData.get("client") as string) || null,
        contractor: (formData.get("contractor") as string) || null,
        currency: formData.get("currency") as string,
        // These are required but will use defaults from the action
        numberingPattern: config?.numberingPattern ?? "PRJ-DISC-TYPE-SEQ",
        sequencePadding: config?.sequencePadding ?? 4,
        separator: config?.separator ?? "hyphen",
        revisionScheme: config?.revisionScheme ?? "alpha-numeric",
        sequenceReset: config?.sequenceReset ?? "continuous",
      });
      router.refresh();
    } catch (error) {
      console.error("Error updating project config:", error);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <form action={onSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Project Identification</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Basic project information and identification codes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="projectCode">
            Project Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id="projectCode"
            name="projectCode"
            className="font-mono"
            placeholder="PRJ-001"
            defaultValue={config?.projectCode ?? ""}
            required
          />
          <p className="text-xs text-muted-foreground">
            Used as prefix in all document codes
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortCode">Short Code (used in doc numbering)</Label>
          <Input
            id="shortCode"
            name="shortCode"
            className="font-mono"
            placeholder="AHR"
            defaultValue={config?.shortCode ?? ""}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="projectNote">Project Title</Label>
          <div className="text-sm text-muted-foreground p-3 border border-border bg-muted/30 rounded-md">
            Project title and description are managed in the main Projects
            section. This configuration focuses on document numbering and
            workflow settings.
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="client">Client</Label>
          <Input
            id="client"
            name="client"
            placeholder="Client Organization"
            defaultValue={config?.client ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contractor">Main Contractor</Label>
          <Input
            id="contractor"
            name="contractor"
            placeholder="Contractor Organization"
            defaultValue={config?.contractor ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Contract Currency</Label>
          <Select name="currency" defaultValue={config?.currency ?? "usd"}>
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usd">USD</SelectItem>
              <SelectItem value="eur">EUR</SelectItem>
              <SelectItem value="gbp">GBP</SelectItem>
              <SelectItem value="omr">OMR</SelectItem>
              <SelectItem value="aed">AED</SelectItem>
              <SelectItem value="sar">SAR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save General Settings"}
        </Button>
      </div>
    </form>
  );
}
