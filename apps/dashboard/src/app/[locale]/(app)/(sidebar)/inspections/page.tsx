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
import { getInspections } from "@/lib/edms/inspections";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export const metadata: Metadata = {
  title: "Inspections | Quadra EDMS",
};

export default async function InspectionsPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const projectId = await getFirstAccessibleProjectId(sessionUser);

  if (!projectId) {
    return (
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Inspections
          </h1>
          <p className="text-sm text-muted-foreground">
            No accessible projects found. Please contact your administrator.
          </p>
        </div>
      </ScrollableContent>
    );
  }

  const inspections = await getInspections(projectId);

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Inspections
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Track inspection schedules, results, and deficiencies across the
                project.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/inspections/new">+ New Inspection</Link>
            </Button>
          </div>
        </div>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Inspection Register</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {inspections.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                No inspections found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Inspection #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Results</TableHead>
                    <TableHead className="px-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inspections.map((inspection) => (
                    <TableRow
                      key={inspection.id}
                      className="group transition-colors hover:bg-accent"
                    >
                      <TableCell className="px-6">
                        <div className="font-mono text-xs font-medium">
                          {inspection.inspectionNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="capitalize">
                          {inspection.type.replace(/_/g, " ")}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {inspection.location}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(
                          inspection.scheduledDate,
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {inspection.inspector || "—"}
                      </TableCell>
                      <TableCell>
                        <EdmsStatusBadge status={inspection.results} />
                      </TableCell>
                      <TableCell className="px-6">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/inspections/${inspection.id}`}>
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
