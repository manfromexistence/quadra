import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
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
import { getExtensionOfTimeRequests } from "@/lib/edms/extension-of-time";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export const metadata: Metadata = {
  title: "Extension of Time | Quadra EDMS",
};

export default async function ExtensionOfTimePage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const projectId = await getFirstAccessibleProjectId(sessionUser);

  if (!projectId) {
    return (
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Extension of Time
          </h1>
          <p className="text-sm text-muted-foreground">
            No accessible projects found. Please contact your administrator.
          </p>
        </div>
      </ScrollableContent>
    );
  }

  const eotRequests = await getExtensionOfTimeRequests(projectId);

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Extension of Time
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Track EOT requests, approval workflows, and schedule impacts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/extension-of-time/new">+ New EOT Request</Link>
            </Button>
          </div>
        </div>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>EOT Register</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {eotRequests.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                No EOT requests found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">EOT #</TableHead>
                    <TableHead>Requested Days</TableHead>
                    <TableHead>Approved Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="px-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eotRequests.map((eot) => (
                    <TableRow
                      key={eot.id}
                      className="group transition-colors hover:bg-accent"
                    >
                      <TableCell className="px-6">
                        <div className="font-mono text-xs font-medium">
                          {eot.eotNumber}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {eot.requestedDays}
                      </TableCell>
                      <TableCell className="text-sm">
                        {eot.approvedDays ?? "—"}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{eot.reason}</p>
                      </TableCell>
                      <TableCell>
                        <EdmsStatusBadge status={eot.approvalStatus} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(eot.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-6">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/extension-of-time/${eot.id}`}>
                            Open
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollableContent>
  );
}
