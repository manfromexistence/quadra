"use client";

import { Button } from "@midday/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, FileText } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  fileName: string;
  fileSize: number;
  downloadCount: number;
  createdAt: string;
}

interface ProjectTemplatesTableProps {
  templates: ProjectTemplate[];
  formatFileSize: (bytes: number) => string;
}

export function ProjectTemplatesTable({
  templates,
  formatFileSize,
}: ProjectTemplatesTableProps) {
  const columns: ColumnDef<ProjectTemplate>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Template Name" />
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.getValue("name")}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.description || "—"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <span className="rounded bg-muted px-2 py-1 font-mono text-xs uppercase">
          {row.getValue("type")}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => <span>{row.getValue("category")}</span>,
    },
    {
      accessorKey: "fileName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="File" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          <span className="text-sm">{row.original.fileName}</span>
        </div>
      ),
    },
    {
      accessorKey: "fileSize",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Size" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {formatFileSize(row.original.fileSize)}
        </span>
      ),
    },
    {
      accessorKey: "downloadCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Downloads" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.getValue("downloadCount")}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Uploaded" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString()
            : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: () => (
        <Button variant="ghost" size="sm">
          <Download className="size-4" />
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={templates} searchKey="name" />;
}
