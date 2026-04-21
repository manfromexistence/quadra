"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

interface Meeting {
  id: string;
  momNumber: string;
  title: string;
  meetingType: string;
  meetingDate: string;
  location: string;
  attendees: string;
  status: string;
  chairperson: string;
}

interface MeetingsTableProps {
  meetings: Meeting[];
}

export function MeetingsTable({ meetings }: MeetingsTableProps) {
  const columns: ColumnDef<Meeting>[] = [
    {
      accessorKey: "momNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="MoM ID" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/meetings/${row.original.id}`}
          className="font-mono text-xs font-medium hover:text-primary transition-colors"
        >
          {row.getValue("momNumber")}
        </Link>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Meeting Title" />
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="max-w-md font-medium">{row.getValue("title")}</div>
          <div className="text-xs text-muted-foreground">
            Chair: {row.original.chairperson}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "meetingType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <span className="text-xs">{row.getValue("meetingType")}</span>
      ),
    },
    {
      accessorKey: "meetingDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Meeting Date" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {new Date(row.original.meetingDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => (
        <span className="text-xs">{row.getValue("location")}</span>
      ),
    },
    {
      accessorKey: "attendees",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Attendees" />
      ),
      cell: ({ row }) => <span className="font-mono text-xs">—</span>,
    },
    {
      accessorKey: "actionItems",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Action Items" />
      ),
      cell: ({ row }) => <span className="font-mono text-xs">—</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <span className="text-xs">{row.getValue("status")}</span>
      ),
    },
  ];

  return <DataTable columns={columns} data={meetings} searchKey="title" />;
}
