"use client";

import { Button } from "@midday/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { EdmsStatusBadge } from "@/components/edms/status-badge";

interface CommissioningChecklist {
  id: string;
  checklistNumber: string;
  system: string;
  description: string;
  status: string;
  completedAt: string | null;
}

interface CommissioningTableProps {
  checklists: CommissioningChecklist[];
}

export function CommissioningTable({ checklists }: CommissioningTableProps) {
  const columns: ColumnDef<CommissioningChecklist>[] = [
    {
      accessorKey: "checklistNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Checklist #" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-xs font-medium">
          {row.getValue("checklistNumber")}
        </div>
      ),
    },
    {
      accessorKey: "system",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="System" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("system")}</span>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => (
        <p className="font-medium">{row.getValue("description")}</p>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => <EdmsStatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "completedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Completed" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.completedAt
            ? new Date(row.original.completedAt).toLocaleDateString()
            : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/commissioning/${row.original.id}`}>Open</Link>
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={checklists} searchKey="system" />;
}
