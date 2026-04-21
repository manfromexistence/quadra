"use client";

import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader } from "@midday/ui/card";
import { Input } from "@midday/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";
import { Download } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { IncomingTransmittalsTable } from "@/components/incoming-transmittals-table";
import { ScrollableContent } from "@/components/scrollable-content";
import { getFirstAccessibleProjectId } from "@/lib/edms/access";
import { getIncomingTransmittals } from "@/lib/edms/incoming-transmittals";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export default function IncomingTransmittalsPage() {
  const [isPending, startTransition] = useTransition();
  const [incomingTransmittals, setIncomingTransmittals] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);

  startTransition(async () => {
    const sessionUser = await getRequiredDashboardSessionUser();
    const pid = await getFirstAccessibleProjectId(sessionUser);
    setProjectId(pid);
    if (pid) {
      const data = await getIncomingTransmittals(pid);
      setIncomingTransmittals(data);
    }
  });

  const totalCount = incomingTransmittals.length;
  const pendingCount = incomingTransmittals.filter(
    (t) => t.responseStatus === "Pending",
  ).length;
  const overdueCount = incomingTransmittals.filter(
    (t) =>
      t.responseDue &&
      new Date(t.responseDue) < new Date() &&
      t.responseStatus !== "Responded" &&
      t.responseStatus !== "Closed",
  ).length;
  const inProgressCount = incomingTransmittals.filter(
    (t) => t.responseStatus === "In Progress",
  ).length;

  const exportCsv = () => {
    const rows = incomingTransmittals.map((tm) => ({
      "TM ID": tm.transmittalNumber,
      "Their Ref": tm.theirRef,
      Subject: tm.subject,
      "From Org": tm.fromOrg,
      From: tm.from,
      Purpose: tm.purpose,
      Priority: tm.priority,
      "Response Status": tm.responseStatus,
      "Response Due": tm.responseDue
        ? new Date(tm.responseDue).toISOString().split("T")[0]
        : "",
    }));

    const headers = Object.keys(
      rows[0] || {
        "TM ID": "",
        "Their Ref": "",
        Subject: "",
        "From Org": "",
        From: "",
        Purpose: "",
        Priority: "",
        "Response Status": "",
        "Response Due": "",
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
    link.download = "incoming-transmittals.csv";
    link.click();
    URL.revokeObjectURL(href);
  };

  if (!projectId) {
    return (
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No accessible projects found. Please contact your administrator.
            </p>
          </div>
        </div>
      </ScrollableContent>
    );
  }

  if (isPending && incomingTransmittals.length === 0) {
    return (
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ScrollableContent>
    );
  }

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Incoming Transmittals
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Track documents received from Client, Vendors, and
                Subcontractors. Manage review cycles, responses, and close-out.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={exportCsv} disabled={isPending}>
              <Download className="size-4" />
              Export CSV
            </Button>
            <Button asChild>
              <Link href="/incoming-transmittals/new">+ Register Incoming</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-lg">
            <CardHeader className="pb-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Incoming
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-3xl font-medium">
                {String(totalCount).padStart(3, "0")}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                This month: {totalCount}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader className="pb-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pending Response
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-3xl font-medium">
                {String(pendingCount).padStart(3, "0")}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {pendingCount > 0 ? "Requires action" : "All clear"}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader className="pb-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Overdue
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-3xl font-medium text-destructive">
                {String(overdueCount).padStart(3, "0")}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {overdueCount > 0 ? "Urgent action needed" : "None overdue"}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader className="pb-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                In Progress
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-3xl font-medium">
                {String(inProgressCount).padStart(3, "0")}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Under review
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <Input
                placeholder="Search incoming transmittals…"
                className="max-w-[280px]"
              />

              <Select>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Senders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Senders</SelectItem>
                  <SelectItem value="CLT">Client</SelectItem>
                  <SelectItem value="VND">Vendor</SelectItem>
                  <SelectItem value="SUB">Subcontractor</SelectItem>
                  <SelectItem value="THP">Third Party</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Purposes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Purposes</SelectItem>
                  <SelectItem value="IFR">IFR</SelectItem>
                  <SelectItem value="IFA">IFA</SelectItem>
                  <SelectItem value="IFC">IFC</SelectItem>
                  <SelectItem value="IFI">IFI</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Responded">Responded</SelectItem>
                  <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="No Response Required">
                    No Response Required
                  </SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="px-0">
            {incomingTransmittals.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                No incoming transmittals found
              </div>
            ) : (
              <IncomingTransmittalsTable
                incomingTransmittals={incomingTransmittals}
              />
            )}
          </CardContent>

          <div className="border-t px-6 py-3">
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span>
                SHOWING {incomingTransmittals.length} OF {totalCount} INCOMING
                TRANSMITTALS
              </span>
            </div>
          </div>
        </Card>
      </div>
    </ScrollableContent>
  );
}
