"use client";

import { Badge } from "@midday/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

interface ScheduleActivity {
  id: string;
  name: string;
  activityCode: string;
  wbs: string;
  phase: string;
  planned: number;
  actual: number;
  linkedDocs: string[];
  start: string;
  end: string;
}

interface ScheduleTableProps {
  activities: ScheduleActivity[];
}

const PHASE_COLORS = {
  engineering: "bg-blue-600",
  procurement: "bg-amber-600",
  construction: "bg-emerald-700",
  commissioning: "bg-red-600",
};

export function ScheduleTable({ activities }: ScheduleTableProps) {
  const columns: ColumnDef<ScheduleActivity>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Activity" />
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium text-sm">{row.getValue("name")}</div>
          <div className="text-xs text-muted-foreground font-mono">
            {row.original.activityCode} · {row.original.start} →{" "}
            {row.original.end}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "wbs",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="WBS" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.getValue("wbs")}</span>
      ),
    },
    {
      accessorKey: "phase",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phase" />
      ),
      cell: ({ row }) => (
        <Badge
          className={`${
            PHASE_COLORS[row.original.phase as keyof typeof PHASE_COLORS]
          } text-white border-0 text-[10px] uppercase tracking-wider`}
        >
          {row.getValue("phase")}
        </Badge>
      ),
    },
    {
      accessorKey: "planned",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Planned %" />
      ),
      cell: ({ row }) => (
        <span className="font-mono">{row.getValue("planned")}%</span>
      ),
    },
    {
      accessorKey: "actual",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actual %" />
      ),
      cell: ({ row }) => {
        const activity = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-border relative overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 ${
                  activity.actual < activity.planned - 5
                    ? "bg-red-600"
                    : activity.actual < activity.planned
                      ? "bg-amber-600"
                      : "bg-emerald-600"
                }`}
                style={{ width: `${activity.actual}%` }}
              />
            </div>
            <span className="font-mono text-xs">{activity.actual}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "variance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Variance" />
      ),
      cell: ({ row }) => {
        const activity = row.original;
        const variance = activity.actual - activity.planned;
        return (
          <Badge
            variant={variance >= 0 ? "default" : "destructive"}
            className="font-mono text-[10px]"
          >
            {variance >= 0 ? "+" : ""}
            {variance}%
          </Badge>
        );
      },
    },
    {
      accessorKey: "linkedDocs",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Linked Docs" />
      ),
      cell: ({ row }) => (
        <div>
          {row.original.linkedDocs.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.original.linkedDocs.slice(0, 2).map((doc) => (
                <Badge
                  key={doc}
                  variant="outline"
                  className="font-mono text-[10px]"
                >
                  {doc}
                </Badge>
              ))}
              {row.original.linkedDocs.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{row.original.linkedDocs.length - 2}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              — none linked —
            </span>
          )}
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={activities} searchKey="name" />;
}
