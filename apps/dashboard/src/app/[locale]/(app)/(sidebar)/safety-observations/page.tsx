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
import { getSafetyObservations } from "@/lib/edms/safety-observations";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export const metadata: Metadata = {
  title: "Safety Observations | Quadra EDMS",
};

export default async function SafetyObservationsPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const projectId = await getFirstAccessibleProjectId(sessionUser);

  if (!projectId) {
    return (
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Safety Observations
          </h1>
          <p className="text-sm text-muted-foreground">
            No accessible projects found. Please contact your administrator.
          </p>
        </div>
      </ScrollableContent>
    );
  }

  const observations = await getSafetyObservations(projectId);

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Safety Observations
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Track unsafe conditions, acts, near misses, and corrective
                actions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/safety-observations/new">+ New Observation</Link>
            </Button>
          </div>
        </div>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Safety Register</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {observations.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                No safety observations found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Observation #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="px-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {observations.map((observation) => (
                    <TableRow
                      key={observation.id}
                      className="group transition-colors hover:bg-accent"
                    >
                      <TableCell className="px-6">
                        <div className="font-mono text-xs font-medium">
                          {observation.observationNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="capitalize">
                          {observation.type.replace(/_/g, " ")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="capitalize">{observation.severity}</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {observation.location}
                      </TableCell>
                      <TableCell>
                        <EdmsStatusBadge status={observation.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(observation.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-6">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/safety-observations/${observation.id}`}>
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
