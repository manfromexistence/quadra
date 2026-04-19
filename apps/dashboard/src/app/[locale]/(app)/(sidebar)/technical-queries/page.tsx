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
import { getTechnicalQueries } from "@/lib/edms/queries";

export const metadata: Metadata = {
  title: "Technical Queries | Quadra EDMS",
};

export default async function TechnicalQueriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    status?: string;
    priority?: string;
    discipline?: string;
  }>;
}) {
  const params = await searchParams;

  // Fetch from database
  const technicalQueries = await getTechnicalQueries("PRJ-AHR-2026");

  const totalCount = technicalQueries.length;
  const openCount = technicalQueries.filter((q) => q.status === "Open").length;
  const respondedCount = technicalQueries.filter(
    (q) => q.status === "Responded",
  ).length;
  const closedCount = technicalQueries.filter(
    (q) => q.status === "Closed",
  ).length;

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          QUERIES & RFIS{" "}
          <span className="text-primary">/ TECHNICAL QUERIES</span>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Technical Queries (TQ)
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Engineering clarifications and design questions raised during
                execution phase requiring client or consultant response.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline">↓ Export CSV</Button>
            <Button>+ New TQ</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Queries
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-3xl font-medium">
                {String(totalCount).padStart(3, "0")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Open
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-3xl font-medium text-amber-600">
                {String(openCount).padStart(3, "0")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Responded
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-3xl font-medium text-blue-600">
                {String(respondedCount).padStart(3, "0")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Closed
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-3xl font-medium text-green-600">
                {String(closedCount).padStart(3, "0")}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <Input
                name="query"
                defaultValue={params.query ?? ""}
                placeholder="Search technical queries…"
                className="max-w-[280px]"
              />

              <select
                name="discipline"
                defaultValue={params.discipline ?? ""}
                className="flex h-10 rounded-md border border-input bg-background px-3 text-sm font-mono"
              >
                <option value="">All Disciplines</option>
                <option value="CIV">CIV</option>
                <option value="STR">STR</option>
                <option value="MEC">MEC</option>
                <option value="ELE">ELE</option>
                <option value="INS">INS</option>
                <option value="PIP">PIP</option>
                <option value="PRO">PRO</option>
              </select>

              <select
                name="status"
                defaultValue={params.status ?? ""}
                className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="Responded">Responded</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                name="priority"
                defaultValue={params.priority ?? ""}
                className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </CardHeader>

          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">TQ ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Raised By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {technicalQueries.map((tq) => (
                  <TableRow key={tq.id}>
                    <TableCell className="px-6">
                      <Link
                        href={`/technical-queries/${tq.id}`}
                        className="font-mono text-xs font-medium hover:text-primary"
                      >
                        {tq.queryNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md font-medium">{tq.subject}</div>
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                        {tq.discipline}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">Admin User</span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-medium ${
                          tq.status === "Open"
                            ? "text-amber-600"
                            : tq.status === "Responded"
                              ? "text-blue-600"
                              : "text-green-600"
                        }`}
                      >
                        {tq.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-medium ${
                          tq.priority === "High"
                            ? "text-destructive"
                            : tq.priority === "Medium"
                              ? "text-amber-600"
                              : "text-muted-foreground"
                        }`}
                      >
                        {tq.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {tq.dueDate
                          ? new Date(tq.dueDate).toISOString().split("T")[0]
                          : "—"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>

          <div className="border-t px-6 py-3">
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span>
                SHOWING {technicalQueries.length} OF {totalCount} TECHNICAL
                QUERIES
              </span>
            </div>
          </div>
        </Card>
      </div>
    </ScrollableContent>
  );
}
