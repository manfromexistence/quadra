import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import type { Metadata } from "next";
import Link from "next/link";
import { InspectionsTable } from "@/components/inspections-table";
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
        <div className="flex flex-col gap-6 pt-8">
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
      <div className="flex flex-col gap-6 pt-8">
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
              <InspectionsTable inspections={inspections} />
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollableContent>
  );
}
