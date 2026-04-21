"use client";

import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader } from "@midday/ui/card";
import { AlertTriangle, FileText, HelpCircle, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { RFIsFilters } from "@/components/edms/rfis-filters";
import { RFIsTable } from "@/components/rfis-table";
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
            {filteredRFIs.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                No RFIs found matching your criteria
              </div>
            ) : (
              <RFIsTable rfis={filteredRFIs} />
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollableContent>
  );
}
