"use client";

import { Button } from "@midday/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

interface Discipline {
  id: string;
  code: string;
  name: string;
  color: string;
  docCount: number;
}

interface DisciplinesTableProps {
  disciplines: Discipline[];
  onEdit: (discipline: Discipline) => void;
  onDelete: (id: string) => void;
}

export function DisciplinesTable({
  disciplines,
  onEdit,
  onDelete,
}: DisciplinesTableProps) {
  const columns: ColumnDef<Discipline>[] = [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div
            className="size-3 rounded-sm"
            style={{ backgroundColor: row.original.color }}
          />
          <span className="font-mono text-sm font-medium">
            {row.getValue("code")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => <span>{row.getValue("name")}</span>,
    },
    {
      accessorKey: "docCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Usage" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.docCount} docs
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.original)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row.original.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={disciplines} searchKey="name" />;
}
