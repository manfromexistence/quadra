"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

interface AutoPopulateRule {
  pattern: string;
  section: string;
  trigger: string;
}

interface DatabookTableProps {
  rules: AutoPopulateRule[];
}

export function DatabookTable({ rules }: DatabookTableProps) {
  const columns: ColumnDef<AutoPopulateRule>[] = [
    {
      accessorKey: "pattern",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="When document matches" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.getValue("pattern")}</span>
      ),
    },
    {
      accessorKey: "section",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Auto-file to Section" />
      ),
      cell: ({ row }) => <span>{row.getValue("section")}</span>,
    },
    {
      accessorKey: "trigger",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trigger" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("trigger")}
        </span>
      ),
    },
  ];

  return <DataTable columns={columns} data={rules} searchKey="pattern" />;
}
