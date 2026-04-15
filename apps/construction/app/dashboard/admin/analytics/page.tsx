import { BarChart3, Users2 } from "lucide-react";
import Link from "next/link";
import { EdmsDataState } from "@/components/edms/data-state";
import { EdmsPageHeader } from "@/components/edms/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminAnalyticsData } from "@/lib/edms/admin-analytics";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { AdminAnalyticsCharts } from "./admin-analytics-charts";

export default async function AdminAnalyticsPage() {
  const sessionUser = await getRequiredDashboardSessionUser();

  if (sessionUser.role !== "admin") {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 md:px-6 lg:px-8">
        <EdmsPageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Admin", href: "/dashboard/admin" },
            { label: "Analytics" },
          ]}
          title="Admin access required"
          description="Only administrators can review system analytics."
          actions={
            <Button asChild variant="outline">
              <Link href="/dashboard/admin">Back to admin dashboard</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const data = await getAdminAnalyticsData(sessionUser);

  return (
    <div className="flex flex-1 flex-col">
      <EdmsPageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admin", href: "/dashboard/admin" },
          { label: "Analytics" },
        ]}
        title="System analytics"
        description="A read-only view of EDMS activity, growth, storage, and workflow health across the workspace."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/dashboard/admin/users">
                <Users2 className="size-4" />
                Manage users
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/admin">
                <BarChart3 className="size-4" />
                Admin overview
              </Link>
            </Button>
          </>
        }
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <EdmsDataState
          isUsingFallbackData={data.isUsingFallbackData}
          message={data.statusMessage}
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {data.summaryMetrics.map((metric) => (
            <Card key={metric.label} className="border-border/70 bg-card shadow-sm">
              <CardHeader className="space-y-2">
                <CardDescription className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                  {metric.label}
                </CardDescription>
                <CardTitle className="text-3xl tracking-tight">{metric.value}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm leading-6 text-muted-foreground">{metric.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <AdminAnalyticsCharts
          documentsByMonth={data.documentsByMonth}
          userGrowthByMonth={data.userGrowthByMonth}
          workflowsByStatus={data.workflowsByStatus}
          mostActiveUsers={data.mostActiveUsers}
          mostActiveProjects={data.mostActiveProjects}
        />
      </div>
    </div>
  );
}
