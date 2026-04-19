"use client";

import { Button } from "@midday/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@midday/ui/card";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "@/hooks/use-toast";

export function AddMatrixRuleForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [discipline, setDiscipline] = useState("CIVIL");
  const [docType, setDocType] = useState("DWG");
  const [purpose, setPurpose] = useState("IFR");

  const handleAddRule = () => {
    startTransition(async () => {
      // TODO: Implement actual API call to add matrix rule
      // For now, just show success message
      const ruleKey = `${discipline}-${docType}-${purpose}`;

      toast({
        title: "Rule added",
        description: `Distribution rule ${ruleKey} added successfully. Click cells to assign roles.`,
      });

      // Reset form
      setDiscipline("CIVIL");
      setDocType("DWG");
      setPurpose("IFR");

      // Refresh the page to show the new rule
      router.refresh();
    });
  };

  return (
    <Card className="rounded-lg border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="size-4" />
          Add distribution rule
        </CardTitle>
        <CardDescription>
          Create new distribution rules for specific discipline, document type,
          and purpose combinations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label
              htmlFor="discipline-select"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Discipline
            </label>
            <select
              id="discipline-select"
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
            >
              <option value="CIVIL">CIVIL — Civil Engineering</option>
              <option value="ELEC">ELEC — Electrical</option>
              <option value="MECH">MECH — Mechanical</option>
              <option value="PROC">PROC — Process</option>
              <option value="INST">INST — Instrumentation</option>
              <option value="PIPING">PIPING — Piping</option>
              <option value="STRUCT">STRUCT — Structural</option>
            </select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="doctype-select"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Document Type
            </label>
            <select
              id="doctype-select"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
            >
              <option value="DWG">DWG — Drawing</option>
              <option value="SPEC">SPEC — Specification</option>
              <option value="CALC">CALC — Calculation</option>
              <option value="RPT">RPT — Report</option>
              <option value="DATA">DATA — Datasheet</option>
              <option value="PROC">PROC — Procedure</option>
            </select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="purpose-select"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Purpose Code
            </label>
            <select
              id="purpose-select"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
            >
              <option value="IFR">IFR — Issued for Review</option>
              <option value="IFA">IFA — Issued for Approval</option>
              <option value="IFC">IFC — Issued for Construction</option>
              <option value="IFI">IFI — Issued for Information</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleAddRule}
              disabled={isPending}
              className="w-full rounded-lg"
            >
              <Plus className="size-4" />
              {isPending ? "Adding..." : "Add Rule"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
