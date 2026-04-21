"use client";

import { Button } from "@midday/ui/button";
import { Checkbox } from "@midday/ui/checkbox";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { EdmsStatusBadge } from "@/components/edms/status-badge";

interface Document {
  id: string;
  documentNumber: string;
  title: string;
  discipline: string | null;
  category: string | null;
  fileSize: string | null;
  revision: string | null;
  status: string;
  author: string | null;
  uploadedLabel: string;
}

interface DocumentsTableProps {
  documents: Document[];
  canManageContent: boolean;
}

export function DocumentsTable({
  documents,
  canManageContent,
}: DocumentsTableProps) {
  const columns: ColumnDef<Document>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "documentNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Document Code" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-xs font-medium">
          {row.getValue("documentNumber")}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        const discipline = row.original.discipline ?? "General";
        const category = row.original.category ?? "Document";
        const fileSize = row.original.fileSize
          ? `${Math.round(Number(row.original.fileSize) / 1024)} KB`
          : "—";

        return (
          <div className="space-y-1">
            <p className="font-medium">{row.getValue("title")}</p>
            <p className="text-xs text-muted-foreground">
              {discipline} · {category} · {fileSize}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "revision",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rev" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-xs">
          {row.getValue("revision") ?? "0"}
        </div>
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
      accessorKey: "author",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Author" />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.getValue("author") ?? "—"}
        </div>
      ),
    },
    {
      accessorKey: "uploadedLabel",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Modified" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-xs text-muted-foreground">
          {row.getValue("uploadedLabel").replace("Uploaded ", "")}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/documents/${row.original.id}`}>Open</Link>
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={documents} searchKey="title" />;
}
