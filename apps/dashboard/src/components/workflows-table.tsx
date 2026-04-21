"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  EdmsStatusBadge,
  formatEdmsLabel,
} from "@/components/edms/status-badge";
import { WorkflowActionSheet } from "@/components/edms/workflow-action-sheet";

interface WorkflowStep {
  id: string;
  workflowId: string;
  stepName: string;
  workflowName: string;
  stepNumber: number;
  totalSteps: number;
  title: string;
  documentNumber: string;
  projectName: string;
  status: string;
  assignedToName: string;
  assignedRole: string;
  dueLabel: string;
  isActionable: boolean;
  projectId: string;
}

interface WorkflowsTableProps {
  steps: WorkflowStep[];
}

export function WorkflowsTable({ steps }: WorkflowsTableProps) {
  const columns: ColumnDef<WorkflowStep>[] = [
    {
      accessorKey: "stepName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Step" />
      ),
      cell: ({ row }) => (
        <Link href={`/workflows/${row.original.workflowId}`} className="block">
          <div className="space-y-1">
            <p className="font-medium hover:text-primary">
              {row.getValue("stepName")}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.original.workflowName} · Step {row.original.stepNumber} of{" "}
              {row.original.totalSteps}
            </p>
          </div>
        </Link>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Document" />
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <p>{row.getValue("title")}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {row.original.documentNumber}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "projectName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Project" />
      ),
      cell: ({ row }) => row.getValue("projectName"),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => <EdmsStatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "assignedToName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assignee" />
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <p>{row.original.assignedToName}</p>
          <p className="text-xs text-muted-foreground">
            {formatEdmsLabel(row.original.assignedRole)}
          </p>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Due",
      cell: ({ row }) => (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {row.original.dueLabel}
          </span>
          <WorkflowActionSheet
            stepId={row.original.id}
            title={`${row.original.documentNumber} - ${row.original.title}`}
            isActionable={row.original.isActionable}
            projectId={row.original.projectId}
          />
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={steps} searchKey="stepName" />;
}
