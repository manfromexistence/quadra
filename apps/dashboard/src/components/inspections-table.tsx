"use client";

import { Button } from "@midday/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { EdmsStatusBadge } from "@/components/edms/status-badge";

interface Inspection {
  id: string;
  inspectionNumber: string;
  type: string;
  location: string;
  scheduledDate: string;
  inspector: string;
  results: string;
}

interface InspectionsTableProps {
  inspections: Inspection[];
}

export function InspectionsTable({ inspections }: InspectionsTableProps) {
  const columns: ColumnDef<Inspection>[] = [
    {
      accessorKey: "inspectionNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Inspection #" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-xs font-medium">
          {row.getValue("inspectionNumber")}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <div className="capitalize">{row.original.type.replace(/_/g, " ")}</div>
      ),
    },
    {
      accessorKey: "location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("location")}</span>
      ),
    },
    {
      accessorKey: "scheduledDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Scheduled Date" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.scheduledDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "inspector",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Inspector" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.inspector || "—"}
        </span>
      ),
    },
    {
      accessorKey: "results",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Results" />
      ),
      cell: ({ row }) => <EdmsStatusBadge status={row.getValue("results")} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/inspections/${row.original.id}`}>Open</Link>
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={inspections} searchKey="type" />;
}
