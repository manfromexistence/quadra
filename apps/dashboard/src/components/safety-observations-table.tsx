"use client";

import { Button } from "@midday/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { EdmsStatusBadge } from "@/components/edms/status-badge";

interface SafetyObservation {
  id: string;
  observationNumber: string;
  type: string;
  severity: string;
  location: string;
  status: string;
  createdAt: string;
}

interface SafetyObservationsTableProps {
  observations: SafetyObservation[];
}

export function SafetyObservationsTable({
  observations,
}: SafetyObservationsTableProps) {
  const columns: ColumnDef<SafetyObservation>[] = [
    {
      accessorKey: "observationNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Observation #" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-xs font-medium">
          {row.getValue("observationNumber")}
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
      accessorKey: "severity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Severity" />
      ),
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("severity")}</div>
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
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => <EdmsStatusBadge status={row.getValue("status")} />,
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
          <Link href={`/safety-observations/${row.original.id}`}>Open</Link>
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={observations} searchKey="type" />;
}
