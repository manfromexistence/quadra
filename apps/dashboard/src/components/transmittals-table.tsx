"use client";

import { Button } from "@midday/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { EdmsStatusBadge } from "@/components/edms/status-badge";

interface Transmittal {
  id: string;
  transmittalNumber: string;
  subject: string;
  sentLabel: string;
  documentCodes: string[] | null;
  recipientName: string;
  purpose: string | null;
  dueDate: string | null;
  status: string;
}

interface TransmittalsTableProps {
  transmittals: Transmittal[];
}

export function TransmittalsTable({ transmittals }: TransmittalsTableProps) {
  const columns: ColumnDef<Transmittal>[] = [
    {
      accessorKey: "transmittalNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Transmittal ID" />
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-mono text-xs font-medium">
            {row.getValue("transmittalNumber")}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.sentLabel.replace("Updated ", "")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "subject",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subject & Documents" />
      ),
      cell: ({ row }) => (
        <div className="space-y-2">
          <p className="font-medium">{row.getValue("subject")}</p>
          <div className="flex flex-wrap gap-1">
            {row.original.documentCodes?.map((code) => (
              <span
                key={code}
                className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px]"
              >
                {code}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "recipientName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Recipient" />
      ),
      cell: ({ row }) => row.getValue("recipientName"),
    },
    {
      accessorKey: "purpose",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Purpose" />
      ),
      cell: ({ row }) => (
        <EdmsStatusBadge status={row.original.purpose || "IFR"} />
      ),
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due Date" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-xs text-muted-foreground">
          {row.original.dueDate || "—"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue("status")}</div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/transmittals/${row.original.id}`}>View</Link>
        </Button>
      ),
    },
  ];

  return (
    <DataTable columns={columns} data={transmittals} searchKey="subject" />
  );
}
