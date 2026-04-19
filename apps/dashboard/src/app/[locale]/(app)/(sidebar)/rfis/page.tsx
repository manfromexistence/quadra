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
  title: "RFIs | Quadra EDMS",
};

export default async function RFIsPage() {
  // TODO: Fetch from database
  const rfis = [
    {
      id: "RFI-AHR-0024",
      date: "2026-04-14",
      raisedBy: "KBR Supervision",
      from: "SUP",
      subject: "Concrete Mix Design Approval",
      category: "Materials",
      status: "Under Review",
      priority: "High",
      assignedTo: "Jennifer",
      dueDate: "2026-04-21",
    },
  ];

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          QUERIES & RFIS <span className="text-primary">/ RFIS</span>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                RFIs (Request for Information)
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Formal information requests from stakeholders requiring
                documented responses and approvals.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline">↓ Export CSV</Button>
            <Button>+ New RFI</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <Input placeholder="Search RFIs…" className="max-w-[280px]" />
              <select className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">All Categories</option>
                <option value="Materials">Materials</option>
                <option value="Design">Design</option>
                <option value="QA/QC">QA/QC</option>
                <option value="Safety">Safety</option>
              </select>
            </div>
          </CardHeader>

          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">RFI ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfis.map((rfi) => (
                  <TableRow key={rfi.id}>
                    <TableCell className="px-6">
                      <Link
                        href={`/rfis/${rfi.id}`}
                        className="font-mono text-xs font-medium hover:text-primary"
                      >
                        {rfi.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md font-medium">{rfi.subject}</div>
                      <div className="text-xs text-muted-foreground">
                        {rfi.raisedBy}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                        {rfi.from}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{rfi.category}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-amber-600">
                        {rfi.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-destructive">
                        {rfi.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{rfi.assignedTo}</span>
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
