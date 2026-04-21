"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

interface SiteTechQuery {
  id: string;
  queryNumber: string;
  subject: string;
  location: string;
  discipline: string;
  status: string;
  priority: string;
  assignedTo: string;
}

interface SiteTechQueriesTableProps {
  siteQueries: SiteTechQuery[];
}

export function SiteTechQueriesTable({
  siteQueries,
}: SiteTechQueriesTableProps) {
  const columns: ColumnDef<SiteTechQuery>[] = [
    {
      accessorKey: "queryNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="STQ ID" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/site-tech-queries/${row.original.id}`}
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
      accessorKey: "location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.location}
        </span>
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

  return <DataTable columns={columns} data={siteQueries} searchKey="subject" />;
}
