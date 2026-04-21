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
import { ScrollableContent } from "@/components/scrollable-content";
import { getFirstAccessibleProjectId } from "@/lib/edms/access";
import { getDailyReports } from "@/lib/edms/daily-reports";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export const metadata: Metadata = {
  title: "Daily Reports | Quadra EDMS",
};

export default async function DailyReportsPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const projectId = await getFirstAccessibleProjectId(sessionUser);

  if (!projectId) {
    return (
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Daily Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            No accessible projects found. Please contact your administrator.
          </p>
        </div>
      </ScrollableContent>
    );
  }

  const reports = await getDailyReports(projectId);

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Daily Reports
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Track daily site activities, manpower, equipment, and issues.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/daily-reports/new">+ New Daily Report</Link>
            </Button>
          </div>
        </div>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Daily Report Register</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {reports.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                No daily reports found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Report Date</TableHead>
                    <TableHead>Weather</TableHead>
                    <TableHead>Activities</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="px-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow
                      key={report.id}
                      className="group transition-colors hover:bg-accent"
                    >
                      <TableCell className="px-6">
                        <div className="text-sm font-medium">
                          {new Date(report.reportDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {report.weather || "—"}
                      </TableCell>
                      <TableCell>
                        <p className="line-clamp-2 text-sm">
                          {report.activitiesCompleted || "—"}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-6">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/daily-reports/${report.id}`}>Open</Link>
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
