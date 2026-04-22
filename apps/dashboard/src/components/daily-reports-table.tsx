"use client";

import { Button } from "@midday/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

interface DailyReport {
  id: string;
  reportDate: Date;
  weather: string | null;
  activitiesCompleted: string | null;
  issues: string | null;
  projectId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DailyReportsTableProps {
  reports: DailyReport[];
}

export function DailyReportsTable({ reports }: DailyReportsTableProps) {
  const columns: ColumnDef<DailyReport>[] = [
    {
      accessorKey: "reportDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Report Date" />
      ),
      cell: ({ row }) => (
        <div className="text-sm font-medium">
          {row.original.reportDate instanceof Date
            ? row.original.reportDate.toLocaleDateString()
            : new Date(row.original.reportDate).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "weather",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Weather" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.weather || "—"}</span>
      ),
    },
    {
      accessorKey: "activitiesCompleted",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Activities" />
      ),
      cell: ({ row }) => (
        <p className="line-clamp-2 text-sm">
          {row.original.activitiesCompleted || "—"}
        </p>
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
          <Link href={`/daily-reports/${row.original.id}`}>Open</Link>
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={reports}
      searchKey="activitiesCompleted"
    />
  );
}
