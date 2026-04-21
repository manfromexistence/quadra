"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

interface RFI {
  id: string;
  rfiNumber: string;
  subject: string;
  raisedBy: string;
  from: string;
  category: string;
  status: string;
  priority: string;
  assignedTo: string;
}

interface RFIsTableProps {
  rfis: RFI[];
}

export function RFIsTable({ rfis }: RFIsTableProps) {
  const columns: ColumnDef<RFI>[] = [
    {
      accessorKey: "rfiNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="RFI ID" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/rfis/${row.original.id}`}
          className="font-mono text-xs font-medium hover:text-primary transition-colors"
        >
          {row.getValue("rfiNumber")}
        </Link>
      ),
    },
    {
      accessorKey: "subject",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subject" />
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="max-w-md font-medium">{row.getValue("subject")}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.raisedBy}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "from",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="From" />
      ),
      cell: ({ row }) => (
        <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
          {row.getValue("from")}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <span className="text-xs">{row.getValue("category")}</span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <span className="text-xs font-medium text-amber-600">
          {row.getValue("status")}
        </span>
      ),
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => (
        <span className="text-xs font-medium text-destructive">
          {row.getValue("priority")}
        </span>
      ),
    },
    {
      accessorKey: "assignedTo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assigned To" />
      ),
      cell: ({ row }) => (
        <span className="text-xs">{row.getValue("assignedTo")}</span>
      ),
    },
  ];

  return <DataTable columns={columns} data={rfis} searchKey="subject" />;
}
