"use client";

import { Button } from "@midday/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { EdmsStatusBadge } from "@/components/edms/status-badge";

interface Submittal {
  id: string;
  submittalNumber: string;
  type: string;
  specificationSection: string;
  revision: string;
  reviewStatus: string;
  submittedAt: string;
  dueDate: string;
}

interface SubmittalsTableProps {
  submittals: Submittal[];
}

export function SubmittalsTable({ submittals }: SubmittalsTableProps) {
  const columns: ColumnDef<Submittal>[] = [
    {
      accessorKey: "submittalNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Submittal #" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-xs font-medium">
          {row.getValue("submittalNumber")}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <div className="capitalize">{row.original.type.replace(/_/g, " ")}</div>
      ),
    },
    {
      accessorKey: "specificationSection",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Spec Section" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.original.specificationSection || "—"}
        </span>
      ),
    },
    {
      accessorKey: "revision",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rev" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.getValue("revision")}</span>
      ),
    },
    {
      accessorKey: "reviewStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <EdmsStatusBadge status={row.getValue("reviewStatus")} />
      ),
    },
    {
      accessorKey: "submittedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Submitted" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.submittedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due Date" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.dueDate
            ? new Date(row.original.dueDate).toLocaleDateString()
            : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/submittals/${row.original.id}`}>Open</Link>
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={submittals} searchKey="type" />;
}
