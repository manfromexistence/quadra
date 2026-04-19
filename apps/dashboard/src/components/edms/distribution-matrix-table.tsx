"use client";

import { Badge } from "@midday/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import { useState } from "react";

interface Stakeholder {
  id: string;
  name: string;
  short: string;
  role: string;
}

interface MatrixRow {
  key: string;
  discipline: string;
  docType: string;
  purpose: string;
  distribution: Record<string, "A" | "R" | "I" | "">;
}

interface DistributionMatrixTableProps {
  stakeholders: Stakeholder[];
  rows: MatrixRow[];
}

const ROLE_COLORS = {
  A: "text-rose-600 dark:text-rose-400",
  R: "text-blue-600 dark:text-blue-400",
  I: "text-muted-foreground",
  "": "text-muted-foreground/30",
};

const ROLE_LABELS = {
  A: "Approve",
  R: "Review",
  I: "Information",
};

export function DistributionMatrixTable({
  stakeholders,
  rows,
}: DistributionMatrixTableProps) {
  const [matrix, setMatrix] = useState<
    Record<string, Record<string, "A" | "R" | "I" | "">>
  >(() => {
    const initial: Record<string, Record<string, "A" | "R" | "I" | "">> = {};
    for (const row of rows) {
      initial[row.key] = { ...row.distribution };
    }
    return initial;
  });

  function cycleRole(rowKey: string, stakeholderId: string) {
    setMatrix((prev) => {
      const current = prev[rowKey]?.[stakeholderId] || "";
      const next =
        current === ""
          ? "I"
          : current === "I"
            ? "R"
            : current === "R"
              ? "A"
              : "";

      return {
        ...prev,
        [rowKey]: {
          ...prev[rowKey],
          [stakeholderId]: next,
        },
      };
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-muted/30 px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Legend:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400">
            A
          </span>
          <span className="text-xs text-muted-foreground">Approve</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
            R
          </span>
          <span className="text-xs text-muted-foreground">Review</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-sm font-bold text-muted-foreground">
            I
          </span>
          <span className="text-xs text-muted-foreground">Information</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Category</TableHead>
              <TableHead className="min-w-[100px]">Purpose</TableHead>
              {stakeholders.map((stakeholder) => (
                <TableHead
                  key={stakeholder.id}
                  className="min-w-[80px] text-center"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-mono text-xs font-semibold">
                      {stakeholder.short}
                    </span>
                    <span className="text-[10px] font-normal capitalize text-muted-foreground">
                      {stakeholder.role}
                    </span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key} className="hover:bg-accent/50">
                <TableCell className="font-medium">
                  <div className="space-y-0.5">
                    <p className="text-sm">{row.discipline}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.docType}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      row.purpose === "IFR"
                        ? "warning"
                        : row.purpose === "IFA"
                          ? "default"
                          : row.purpose === "IFC"
                            ? "success"
                            : "secondary"
                    }
                    className="font-mono text-[10px]"
                  >
                    {row.purpose}
                  </Badge>
                </TableCell>
                {stakeholders.map((stakeholder) => {
                  const role = matrix[row.key]?.[stakeholder.id] || "";
                  return (
                    <TableCell key={stakeholder.id} className="text-center">
                      <button
                        type="button"
                        onClick={() => cycleRole(row.key, stakeholder.id)}
                        className={`inline-flex size-8 items-center justify-center rounded-sm border border-border font-mono text-sm font-bold transition-colors hover:bg-accent ${ROLE_COLORS[role]}`}
                        title={role ? ROLE_LABELS[role] : "Click to set role"}
                      >
                        {role || "—"}
                      </button>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
