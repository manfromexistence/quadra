import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import type { Metadata } from "next";
import Link from "next/link";
import { ScrollableContent } from "@/components/scrollable-content";
import { SubmittalsTable } from "@/components/submittals-table";
import { getFirstAccessibleProjectId } from "@/lib/edms/access";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { getSubmittals } from "@/lib/edms/submittals";

export const metadata: Metadata = {
  title: "Submittals | Quadra EDMS",
};

export default async function SubmittalsPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const projectId = await getFirstAccessibleProjectId(sessionUser);

  if (!projectId) {
    return (
      <ScrollableContent>
        <div className="flex flex-col gap-6 pt-6">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Submittals
          </h1>
          <p className="text-sm text-muted-foreground">
            No accessible projects found. Please contact your administrator.
          </p>
        </div>
      </ScrollableContent>
    );
  }

  const submittals = await getSubmittals(projectId);

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6 pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Submittals
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Shop drawings, material submittals, and equipment submittals
                with review tracking.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/submittals/new">+ New Submittal</Link>
            </Button>
          </div>
        </div>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Submittal Register</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {submittals.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                No submittals found.
              </div>
            ) : (
              <SubmittalsTable submittals={submittals} />
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollableContent>
  );
}
