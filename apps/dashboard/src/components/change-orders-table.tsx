"use client";

import { Button } from "@midday/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { EdmsStatusBadge } from "@/components/edms/status-badge";

interface ChangeOrder {
  id: string;
  changeOrderNumber: string;
  reason: string;
  originalContractValue: number;
  changeValue: number;
  approvalStatus: string;
  createdAt: string;
}

interface ChangeOrdersTableProps {
  changeOrders: ChangeOrder[];
}

export function ChangeOrdersTable({ changeOrders }: ChangeOrdersTableProps) {
  const columns: ColumnDef<ChangeOrder>[] = [
    {
      accessorKey: "changeOrderNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="CO #" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-xs font-medium">
          {row.getValue("changeOrderNumber")}
        </div>
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
      accessorKey: "originalContractValue",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Original Value" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.originalContractValue
            ? `$${(Number(row.original.originalContractValue) / 100).toLocaleString()}`
            : "—"}
        </span>
      ),
    },
    {
      accessorKey: "changeValue",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Change Value" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          ${Number(row.original.changeValue / 100).toLocaleString()}
        </span>
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
          <Link href={`/change-orders/${row.original.id}`}>Open</Link>
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={changeOrders} searchKey="reason" />;
}
