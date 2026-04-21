"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

interface Memo {
  id: string;
  memoNumber: string;
  subject: string;
  from: string;
  to: string;
  category: string;
  date: string;
  status: string;
  urgent: boolean;
}

interface MemosTableProps {
  memos: Memo[];
}

export function MemosTable({ memos }: MemosTableProps) {
  const columns: ColumnDef<Memo>[] = [
    {
      accessorKey: "memoNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Memo ID" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/memos/${row.original.id}`}
          className="font-mono text-xs font-medium hover:text-primary transition-colors"
        >
          {row.getValue("memoNumber")}
        </Link>
      ),
    },
    {
      accessorKey: "subject",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subject" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="max-w-md font-medium">{row.getValue("subject")}</div>
          {row.original.urgent && (
            <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              URGENT
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "from",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="From" />
      ),
      cell: ({ row }) => (
        <span className="text-xs">{row.getValue("from")}</span>
      ),
    },
    {
      accessorKey: "to",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="To" />
      ),
      cell: ({ row }) => <span className="text-xs">{row.getValue("to")}</span>,
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
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {new Date(row.original.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <span className="text-xs">{row.getValue("status")}</span>
      ),
    },
  ];

  return <DataTable columns={columns} data={memos} searchKey="subject" />;
}
