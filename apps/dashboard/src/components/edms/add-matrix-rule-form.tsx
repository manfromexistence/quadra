"use client";

import { Button } from "@midday/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@midday/ui/card";
import { Label } from "@midday/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";
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
              <Label
                htmlFor="discipline-select"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Discipline
              </Label>
              <Select value={discipline} onValueChange={setDiscipline}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CIVIL">
                    CIVIL — Civil Engineering
                  </SelectItem>
                  <SelectItem value="ELEC">ELEC — Electrical</SelectItem>
                  <SelectItem value="MECH">MECH — Mechanical</SelectItem>
                  <SelectItem value="PROC">PROC — Process</SelectItem>
                  <SelectItem value="INST">INST — Instrumentation</SelectItem>
                  <SelectItem value="PIPING">PIPING — Piping</SelectItem>
                  <SelectItem value="STRUCT">STRUCT — Structural</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="doctype-select"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Document Type
              </Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DWG">DWG — Drawing</SelectItem>
                  <SelectItem value="SPEC">SPEC — Specification</SelectItem>
                  <SelectItem value="CALC">CALC — Calculation</SelectItem>
                  <SelectItem value="RPT">RPT — Report</SelectItem>
                  <SelectItem value="DATA">DATA — Datasheet</SelectItem>
                  <SelectItem value="PROC">PROC — Procedure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="purpose-select"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Purpose Code
              </Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IFR">IFR — Issued for Review</SelectItem>
                  <SelectItem value="IFA">IFA — Issued for Approval</SelectItem>
                  <SelectItem value="IFC">
                    IFC — Issued for Construction
                  </SelectItem>
                  <SelectItem value="IFI">
                    IFI — Issued for Information
                  </SelectItem>
                </SelectContent>
              </Select>
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
