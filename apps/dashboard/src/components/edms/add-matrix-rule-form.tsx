"use client";

import { Button } from "@midday/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@midday/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "@/hooks/use-toast";

interface MatrixRule {
  id: string;
  discipline: string;
  docType: string;
  purpose: string;
  addedAt: Date;
}

export function AddMatrixRuleForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [discipline, setDiscipline] = useState("CIVIL");
  const [docType, setDocType] = useState("DWG");
  const [purpose, setPurpose] = useState("IFR");
  const [addedRules, setAddedRules] = useState<MatrixRule[]>([]);

  const handleAddRule = () => {
    startTransition(async () => {
      const ruleKey = `${discipline}-${docType}-${purpose}`;
      const newRule: MatrixRule = {
        id: `${Date.now()}-${ruleKey}`,
        discipline,
        docType,
        purpose,
        addedAt: new Date(),
      };

      // Add to local state
      setAddedRules((prev) => [newRule, ...prev]);

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

  const handleDeleteRule = (ruleId: string) => {
    setAddedRules((prev) => prev.filter((rule) => rule.id !== ruleId));
    toast({
      title: "Rule removed",
      description: "Distribution rule removed from the list.",
    });
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-lg border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="size-4" />
            Add distribution rule
          </CardTitle>
          <CardDescription>
            Create new distribution rules for specific discipline, document
            type, and purpose combinations.
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

      {addedRules.length > 0 && (
        <Card className="rounded-lg border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              Added Rules ({addedRules.length})
            </CardTitle>
            <CardDescription>
              Rules added in this session. These will be visible in the matrix
              above.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Key</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Added At</TableHead>
                  <TableHead className="w-[80px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {addedRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-mono text-xs font-medium">
                      {rule.discipline}-{rule.docType}-{rule.purpose}
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                        {rule.discipline}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                        {rule.docType}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-primary/10 px-2 py-1 font-mono text-xs text-primary">
                        {rule.purpose}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {rule.addedAt.toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
