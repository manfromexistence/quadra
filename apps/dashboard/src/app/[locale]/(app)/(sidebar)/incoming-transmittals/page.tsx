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
import { getFirstAccessibleProjectId } from "@/lib/edms/access";
import { getIncomingTransmittals } from "@/lib/edms/incoming-transmittals";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

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
  const sessionUser = await getRequiredDashboardSessionUser();

  // Get the first accessible project ID
  const projectId = await getFirstAccessibleProjectId(sessionUser);

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

  // Fetch from database
  const incomingTransmittals = await getIncomingTransmittals(projectId);

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
                name="query"
                defaultValue={params.query ?? ""}
                placeholder="Search incoming transmittals…"
                className="max-w-[280px]"
              />

              <Select name="from" defaultValue={params.from ?? ""}>
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

              <Select name="purpose" defaultValue={params.purpose ?? ""}>
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

              <Select
                name="responseStatus"
                defaultValue={params.responseStatus ?? ""}
              >
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

              <Select name="priority" defaultValue={params.priority ?? ""}>
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
