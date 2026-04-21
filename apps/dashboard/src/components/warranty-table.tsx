"use client";

import { Button } from "@midday/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { EdmsStatusBadge } from "@/components/edms/status-badge";

interface Warranty {
  id: string;
  warrantyNumber: string;
  item: string;
  warrantyType: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface WarrantyTableProps {
  warranties: Warranty[];
}

export function WarrantyTable({ warranties }: WarrantyTableProps) {
  const columns: ColumnDef<Warranty>[] = [
    {
      accessorKey: "warrantyNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Warranty #" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-xs font-medium">
          {row.getValue("warrantyNumber")}
        </div>
      ),
    },
    {
      accessorKey: "item",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Item" />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.getValue("item")}</span>
      ),
    },
    {
      accessorKey: "warrantyType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <div className="capitalize text-sm">
          {row.original.warrantyType.replace(/_/g, " ")}
        </div>
      ),
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Start Date" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.startDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="End Date" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.endDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => <EdmsStatusBadge status={row.getValue("status")} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/warranty/${row.original.id}`}>Open</Link>
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={warranties} searchKey="item" />;
}
