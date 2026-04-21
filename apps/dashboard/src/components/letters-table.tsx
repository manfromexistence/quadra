"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

interface Letter {
  id: string;
  letterNumber: string;
  subject: string;
  direction: string;
  to: string;
  from: string;
  toType: string;
  category: string;
  forInfo: boolean;
  actionRequired: boolean;
  responseRequired: string;
  date: string;
  status: string;
  attachments: number;
  ref: string;
}

interface LettersTableProps {
  letters: Letter[];
}

export function LettersTable({ letters }: LettersTableProps) {
  const columns: ColumnDef<Letter>[] = [
    {
      accessorKey: "letterNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Letter ID" />
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <Link
            href={`/letters/${row.original.id}`}
            className="font-mono text-xs font-medium hover:text-primary transition-colors"
          >
            {row.getValue("letterNumber")}
          </Link>
          <div className="font-mono text-xs text-muted-foreground">
            {row.original.ref}
          </div>
        </div>
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
            {row.original.attachments} attachment(s)
          </div>
        </div>
      ),
    },
    {
      accessorKey: "direction",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Direction" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.direction === "Outgoing" ? (
            <ArrowUpFromLine className="size-4 text-blue-600" />
          ) : (
            <ArrowDownToLine className="size-4 text-green-600" />
          )}
          <span className="text-xs">{row.getValue("direction")}</span>
        </div>
      ),
    },
    {
      accessorKey: "toFrom",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="To/From" />
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="text-xs">
            {row.original.direction === "Outgoing"
              ? row.original.to
              : row.original.from}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.original.toType}
          </div>
        </div>
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
      accessorKey: "forInfo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="INFO" />
      ),
      cell: ({ row }) => (
        <span className="text-xs">{row.original.forInfo ? "✓" : "—"}</span>
      ),
    },
    {
      accessorKey: "actionRequired",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Action" />
      ),
      cell: ({ row }) => (
        <span className="text-xs">
          {row.original.actionRequired ? "✓" : "—"}
        </span>
      ),
    },
    {
      accessorKey: "responseRequired",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Response" />
      ),
      cell: ({ row }) => (
        <span className="text-xs font-mono">
          {row.original.responseRequired || "—"}
        </span>
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

  return <DataTable columns={columns} data={letters} searchKey="subject" />;
}
