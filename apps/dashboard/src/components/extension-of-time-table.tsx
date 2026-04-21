"use client";

import { Button } from "@midday/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { EdmsStatusBadge } from "@/components/edms/status-badge";

interface EOTRequest {
  id: string;
  eotNumber: string;
  requestedDays: number;
  approvedDays: number | null;
  reason: string;
  approvalStatus: string;
  createdAt: string;
}

interface ExtensionOfTimeTableProps {
  eotRequests: EOTRequest[];
}

export function ExtensionOfTimeTable({
  eotRequests,
}: ExtensionOfTimeTableProps) {
  const columns: ColumnDef<EOTRequest>[] = [
    {
      accessorKey: "eotNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="EOT #" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-xs font-medium">
          {row.getValue("eotNumber")}
        </div>
      ),
    },
    {
      accessorKey: "requestedDays",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Requested Days" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("requestedDays")}</span>
      ),
    },
    {
      accessorKey: "approvedDays",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Approved Days" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.approvedDays ?? "—"}</span>
      ),
    },
    {
      accessorKey: "reason",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reason" />
      ),
      cell: ({ row }) => (
        <p className="font-medium">{row.getValue("reason")}</p>
      ),
    },
    {
      accessorKey: "approvalStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <EdmsStatusBadge status={row.getValue("approvalStatus")} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/extension-of-time/${row.original.id}`}>Open</Link>
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={eotRequests} searchKey="reason" />;
}
