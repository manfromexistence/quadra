"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

interface TechnicalQuery {
  id: string;
  queryNumber: string;
  subject: string;
  discipline: string;
  raisedBy: string;
  status: string;
  priority: string;
  dueDate: Date | null;
}

interface TechnicalQueriesTableProps {
  technicalQueries: TechnicalQuery[];
}

export function TechnicalQueriesTable({
  technicalQueries,
}: TechnicalQueriesTableProps) {
  const columns: ColumnDef<TechnicalQuery>[] = [
    {
      accessorKey: "queryNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="TQ ID" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/technical-queries/${row.original.id}`}
          className="font-mono text-xs font-medium hover:text-primary transition-colors"
        >
          {row.getValue("queryNumber")}
        </Link>
      ),
    },
    {
      accessorKey: "subject",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subject" />
      ),
      cell: ({ row }) => (
        <div className="max-w-md font-medium">{row.getValue("subject")}</div>
      ),
    },
    {
      accessorKey: "discipline",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Discipline" />
      ),
      cell: ({ row }) => (
        <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
          {row.getValue("discipline")}
        </span>
      ),
    },
    {
      accessorKey: "raisedBy",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Raised By" />
      ),
      cell: ({ row }) => <span className="text-xs">Admin User</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <span
          className={`text-xs font-medium ${
            row.original.status === "Open"
              ? "text-amber-600"
              : row.original.status === "Responded"
                ? "text-blue-600"
                : "text-green-600"
          }`}
        >
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
        <span
          className={`text-xs font-medium ${
            row.original.priority === "High"
              ? "text-destructive"
              : row.original.priority === "Medium"
                ? "text-amber-600"
                : "text-muted-foreground"
          }`}
        >
          {row.getValue("priority")}
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
  ];

  return (
    <DataTable columns={columns} data={technicalQueries} searchKey="subject" />
  );
}
