import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader } from "@midday/ui/card";
import { AlertTriangle, HelpCircle, UserPlus } from "lucide-react";
import Link from "next/link";
import { TechnicalQueriesFilters } from "@/components/edms/technical-queries-filters";
import { ScrollableContent } from "@/components/scrollable-content";
import { TechnicalQueriesTable } from "@/components/technical-queries-table";
import { getFirstAccessibleProjectId } from "@/lib/edms/access";
import { getTechnicalQueries } from "@/lib/edms/queries";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export default async function TechnicalQueriesPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const projectId = await getFirstAccessibleProjectId(sessionUser);
  const technicalQueries = projectId
    ? await getTechnicalQueries(projectId)
    : [];
  const totalCount = technicalQueries.length;
  const openCount = technicalQueries.filter((q) => q.status === "Open").length;
  const respondedCount = technicalQueries.filter(
    (q) => q.status === "Responded",
  ).length;
  const closedCount = technicalQueries.filter(
    (q) => q.status === "Closed",
  ).length;

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

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6 pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Technical Queries (TQ)
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Technical queries raised during design phase for clarification,
                discrepancies, or design conflicts.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline">
              <HelpCircle className="size-4" />
              Guidelines
            </Button>
            <Button variant="outline">
              <UserPlus className="size-4" />
              Assign Bulk
            </Button>
            <Button asChild>
              <Link href="/technical-queries/new">
                <AlertTriangle className="size-4" />
                New TQ
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-lg">
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

          <Card className="rounded-lg">
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

          <Card className="rounded-lg">
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

          <Card className="rounded-lg">
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

        <Card className="border-border">
          <CardHeader>
            <TechnicalQueriesFilters />
          </CardHeader>

          <CardContent className="px-0">
            {technicalQueries.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                No technical queries found
              </div>
            ) : (
              <TechnicalQueriesTable technicalQueries={technicalQueries} />
            )}
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
