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
import { EdmsStatusBadge } from "@/components/edms/status-badge";
import { ScrollableContent } from "@/components/scrollable-content";
import { getIncomingTransmittals } from "@/lib/edms/incoming-transmittals";

export const metadata: Metadata = {
  title: "Incoming Transmittals | Quadra EDMS",
};

export default async function IncomingTransmittalsPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    from?: string;
    purpose?: string;
    responseStatus?: string;
    priority?: string;
  }>;
}) {
  const params = await searchParams;

  // Fetch from database
  const incomingTransmittals = await getIncomingTransmittals("PRJ-AHR-2026");

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
            <Button variant="outline">↓ Export CSV</Button>
            <Button>+ Register Incoming</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
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

          <Card>
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

          <Card>
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

          <Card>
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
                name="query"
                defaultValue={params.query ?? ""}
                placeholder="Search incoming transmittals…"
                className="max-w-[280px]"
              />

              <select
                name="from"
                defaultValue={params.from ?? ""}
                className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All Senders</option>
                <option value="CLT">Client</option>
                <option value="VND">Vendor</option>
                <option value="SUB">Subcontractor</option>
                <option value="THP">Third Party</option>
              </select>

              <select
                name="purpose"
                defaultValue={params.purpose ?? ""}
                className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All Purposes</option>
                <option value="IFR">IFR</option>
                <option value="IFA">IFA</option>
                <option value="IFC">IFC</option>
                <option value="IFI">IFI</option>
              </select>

              <select
                name="responseStatus"
                defaultValue={params.responseStatus ?? ""}
                className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Responded">Responded</option>
                <option value="Acknowledged">Acknowledged</option>
                <option value="No Response Required">
                  No Response Required
                </option>
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
                  <TableHead className="px-6">TM ID & Ref</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Response Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomingTransmittals.map((tm) => (
                  <TableRow key={tm.id}>
                    <TableCell className="px-6">
                      <div className="font-mono text-xs font-medium">
                        {tm.transmittalNumber}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {tm.theirRef}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <Link
                          href={`/incoming-transmittals/${tm.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {tm.subject}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {tm.fromOrg}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                        {tm.from}
                      </span>
                    </TableCell>
                    <TableCell>
                      <EdmsStatusBadge status={tm.purpose} />
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-medium ${
                          tm.priority === "High"
                            ? "text-destructive"
                            : tm.priority === "Medium"
                              ? "text-amber-600"
                              : "text-muted-foreground"
                        }`}
                      >
                        {tm.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{tm.responseStatus}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">Admin User</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
