import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader } from "@midday/ui/card";
import { Input } from "@midday/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import type { Metadata } from "next";
import Link from "next/link";
import { ScrollableContent } from "@/components/scrollable-content";

export const metadata: Metadata = {
  title: "Memos | Quadra EDMS",
};

export default async function MemosPage() {
  // TODO: Fetch from database
  const memos = [
    {
      id: "MEM-AHR-0034",
      date: "2026-04-15",
      from: "Project Manager",
      to: "All Discipline Leads",
      subject: "Weekly Coordination Meeting — Action Items",
      category: "Internal",
      urgent: false,
      status: "Distributed",
    },
    {
      id: "MEM-AHR-0032",
      date: "2026-04-10",
      from: "QA/QC Manager",
      to: "Site Team",
      subject: "Updated Inspection Test Plan Requirements",
      category: "Quality",
      urgent: true,
      status: "Distributed",
    },
  ];

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          CORRESPONDENCE <span className="text-primary">/ MEMOS</span>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Internal Memos
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Internal project memorandums for team communication,
                announcements, and administrative notices.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline">↓ Export CSV</Button>
            <Button>+ New Memo</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <Input placeholder="Search memos…" className="max-w-[280px]" />
              <select className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">All Categories</option>
                <option value="Internal">Internal</option>
                <option value="Administrative">Administrative</option>
                <option value="Quality">Quality</option>
                <option value="Safety">Safety</option>
              </select>
            </div>
          </CardHeader>

          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Memo ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memos.map((memo) => (
                  <TableRow key={memo.id}>
                    <TableCell className="px-6">
                      <Link
                        href={`/memos/${memo.id}`}
                        className="font-mono text-xs font-medium hover:text-primary"
                      >
                        {memo.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="max-w-md font-medium">
                          {memo.subject}
                        </div>
                        {memo.urgent && (
                          <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                            URGENT
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{memo.from}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{memo.to}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{memo.category}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {memo.date}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{memo.status}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ScrollableContent>
  );
}
