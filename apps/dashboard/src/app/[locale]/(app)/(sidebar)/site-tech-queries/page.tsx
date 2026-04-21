"use client";

import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader } from "@midday/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import { AlertTriangle, FileText, MapPin, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { SiteTechQueriesFilters } from "@/components/edms/site-tech-queries-filters";
import { ScrollableContent } from "@/components/scrollable-content";
import { getFirstAccessibleProjectId } from "@/lib/edms/access";
import { getSiteTechQueries } from "@/lib/edms/queries";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export default function SiteTechQueriesPage() {
  const [isPending, startTransition] = useTransition();
  const [siteQueries, setSiteQueries] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);

  startTransition(async () => {
    const sessionUser = await getRequiredDashboardSessionUser();
    const pid = await getFirstAccessibleProjectId(sessionUser);
    setProjectId(pid);
    if (pid) {
      const data = await getSiteTechQueries(pid);
      setSiteQueries(data);
    }
  });

  const filteredQueries = siteQueries;

  const exportCsv = () => {
    const rows = filteredQueries.map((stq) => ({
      "STQ ID": stq.queryNumber,
      Subject: stq.subject,
      Location: stq.location,
      Discipline: stq.discipline,
      Status: stq.status,
      Priority: stq.priority,
      "Assigned To": stq.assignedTo,
    }));

    const headers = Object.keys(
      rows[0] || {
        "STQ ID": "",
        Subject: "",
        Location: "",
        Discipline: "",
        Status: "",
        Priority: "",
        "Assigned To": "",
      },
    );

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map(
            (header) =>
              `"${String(row[header as keyof typeof row] ?? "").replaceAll('"', '""')}"`,
          )
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const href = URL.createObjectURL(blob);
    link.href = href;
    link.download = "site-tech-queries.csv";
    link.click();
    URL.revokeObjectURL(href);
  };

  if (!projectId) {
    return (
      <ScrollableContent>
        <div className="flex flex-col gap-6 pt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No accessible projects found. Please contact your administrator.
            </p>
          </div>
        </div>
      </ScrollableContent>
    );
  }

  if (isPending && siteQueries.length === 0) {
    return (
      <ScrollableContent>
        <div className="flex flex-col gap-6 pt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ScrollableContent>
    );
  }

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6 pt-6">
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
            <Button variant="outline" onClick={exportCsv} disabled={isPending}>
              <FileText className="size-4" />
              Export CSV
            </Button>
            <Button variant="outline" disabled={isPending}>
              <MapPin className="size-4" />
              Site Map
            </Button>
            <Button variant="outline" disabled={isPending}>
              <UserPlus className="size-4" />
              Assign Bulk
            </Button>
            <Button asChild>
              <Link href="/site-tech-queries/new">
                <AlertTriangle className="size-4" />
                New STQ
              </Link>
            </Button>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader>
            <SiteTechQueriesFilters />
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
                {filteredQueries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No site queries found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQueries.map((stq) => (
                    <TableRow
                      key={stq.id}
                      className="hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <TableCell className="px-6">
                        <Link
                          href={`/site-tech-queries/${stq.id}`}
                          className="font-mono text-xs font-medium hover:text-primary transition-colors"
                        >
                          {stq.queryNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md font-medium">
                          {stq.subject}
                        </div>
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
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ScrollableContent>
  );
}
