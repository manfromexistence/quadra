"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { EdmsStatusBadge } from "@/components/edms/status-badge";

interface IncomingTransmittal {
  id: string;
  transmittalNumber: string;
  theirRef: string;
  subject: string;
  fromOrg: string;
  from: string;
  purpose: string;
  priority: string;
  responseStatus: string;
  assignedTo: string;
}

interface IncomingTransmittalsTableProps {
  incomingTransmittals: IncomingTransmittal[];
}

export function IncomingTransmittalsTable({
  incomingTransmittals,
}: IncomingTransmittalsTableProps) {
  const columns: ColumnDef<IncomingTransmittal>[] = [
    {
      accessorKey: "transmittalNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="TM ID & Ref" />
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-mono text-xs font-medium">
            {row.original.transmittalNumber}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.original.theirRef}
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
        <div className="max-w-md space-y-1">
          <Link
            href={`/incoming-transmittals/${row.original.id}`}
            className="font-medium hover:text-primary"
          >
            {row.getValue("subject")}
          </Link>
          <div className="text-xs text-muted-foreground">
            {row.original.fromOrg}
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
      accessorKey: "purpose",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Purpose" />
      ),
      cell: ({ row }) => <EdmsStatusBadge status={row.original.purpose} />,
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
      accessorKey: "responseStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Response Status" />
      ),
      cell: ({ row }) => (
        <span className="text-xs">{row.getValue("responseStatus")}</span>
      ),
    },
    {
      accessorKey: "assignedTo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assigned To" />
      ),
      cell: ({ row }) => <span className="text-xs">Admin User</span>,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={incomingTransmittals}
      searchKey="subject"
    />
  );
}
