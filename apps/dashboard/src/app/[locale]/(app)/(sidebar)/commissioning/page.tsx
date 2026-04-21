import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import type { Metadata } from "next";
import Link from "next/link";
import { CommissioningTable } from "@/components/commissioning-table";
import { ScrollableContent } from "@/components/scrollable-content";
import { getFirstAccessibleProjectId } from "@/lib/edms/access";
import { getCommissioningChecklists } from "@/lib/edms/commissioning";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export const metadata: Metadata = {
  title: "Commissioning | Quadra EDMS",
};

export default async function CommissioningPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const projectId = await getFirstAccessibleProjectId(sessionUser);

  if (!projectId) {
    return (
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Commissioning
          </h1>
          <p className="text-sm text-muted-foreground">
            No accessible projects found. Please contact your administrator.
          </p>
        </div>
      </ScrollableContent>
    );
  }

  const checklists = await getCommissioningChecklists(projectId);

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Commissioning
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                System commissioning checklists and testing records.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/commissioning/new">+ New Checklist</Link>
            </Button>
          </div>
        </div>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Commissioning Checklists</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {checklists.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                No commissioning checklists found.
              </div>
            ) : (
              <CommissioningTable checklists={checklists} />
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollableContent>
  );
}
