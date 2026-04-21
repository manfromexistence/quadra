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
import { AlertTriangle, FileText, HelpCircle, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { RFIsFilters } from "@/components/edms/rfis-filters";
import { ScrollableContent } from "@/components/scrollable-content";
import { getFirstAccessibleProjectId } from "@/lib/edms/access";
import { getRFIs } from "@/lib/edms/queries";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export default function RFIsPage() {
  const [isPending, startTransition] = useTransition();
  const [rfis, setRfis] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);

  startTransition(async () => {
    const sessionUser = await getRequiredDashboardSessionUser();
    const pid = await getFirstAccessibleProjectId(sessionUser);
    setProjectId(pid);
    if (pid) {
      const data = await getRFIs(pid);
      setRfis(data);
    }
  });

  const filteredRFIs = rfis;

  const exportCsv = () => {
    const rows = filteredRFIs.map((rfi) => ({
      "RFI ID": rfi.rfiNumber,
      Subject: rfi.subject,
      "Raised By": rfi.raisedBy,
      From: rfi.from,
      Category: rfi.category,
      Status: rfi.status,
      Priority: rfi.priority,
      "Assigned To": rfi.assignedTo,
    }));

    const headers = Object.keys(
      rows[0] || {
        "RFI ID": "",
        Subject: "",
        "Raised By": "",
        From: "",
        Category: "",
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
    link.download = "rfis.csv";
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

  if (isPending && rfis.length === 0) {
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
                RFIs (Request for Information)
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Formal information requests from stakeholders requiring
                documented responses and approvals.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={exportCsv} disabled={isPending}>
              <FileText className="size-4" />
              Export CSV
            </Button>
            <Button variant="outline" disabled={isPending}>
              <UserPlus className="size-4" />
              Assign Bulk
            </Button>
            <Button variant="outline" disabled={isPending}>
              <AlertTriangle className="size-4" />
              Overdue RFIs
            </Button>
            <Button asChild>
              <Link href="/rfis/new">
                <HelpCircle className="size-4" />
                New RFI
              </Link>
            </Button>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader>
            <RFIsFilters />
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
                {filteredRFIs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No RFIs found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRFIs.map((rfi) => (
                    <TableRow
                      key={rfi.id}
                      className="hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <TableCell className="px-6">
                        <Link
                          href={`/rfis/${rfi.id}`}
                          className="font-mono text-xs font-medium hover:text-primary transition-colors"
                        >
                          {rfi.rfiNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md font-medium">
                          {rfi.subject}
                        </div>
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
