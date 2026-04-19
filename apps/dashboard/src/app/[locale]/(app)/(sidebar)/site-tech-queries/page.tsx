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
  title: "Site Technical Queries | Quadra EDMS",
};

export default async function SiteTechQueriesPage() {
  // TODO: Fetch from database
  const siteQueries = [
    {
      id: "STQ-AHR-0008",
      date: "2026-04-15",
      raisedBy: "Site Team",
      discipline: "CIV",
      subject: "Foundation Level Discrepancy — Grid A-3",
      location: "Grid A-3, Foundation Area",
      status: "Open",
      priority: "High",
      assignedTo: "M. Chen",
      dueDate: "2026-04-17",
    },
  ];

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          QUERIES & RFIS{" "}
          <span className="text-primary">/ SITE TECHNICAL QUERIES</span>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Site Technical Queries (STQ)
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Construction-phase technical queries raised from site due to
                clashes, discrepancies, or site conditions.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline">↓ Export CSV</Button>
            <Button>+ New STQ</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <Input
                placeholder="Search site queries…"
                className="max-w-[280px]"
              />
            </div>
          </CardHeader>

          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">STQ ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {siteQueries.map((stq) => (
                  <TableRow key={stq.id}>
                    <TableCell className="px-6">
                      <Link
                        href={`/site-tech-queries/${stq.id}`}
                        className="font-mono text-xs font-medium hover:text-primary"
                      >
                        {stq.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md font-medium">{stq.subject}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {stq.location}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                        {stq.discipline}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-amber-600">
                        {stq.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-destructive">
                        {stq.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{stq.assignedTo}</span>
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
