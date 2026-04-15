import { count } from "drizzle-orm";
import Link from "next/link";
import { EdmsMetricCard } from "@/components/edms/metric-card";
import { EdmsPageHeader } from "@/components/edms/page-header";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { documents } from "@/db/schema/documents";
import { notifications } from "@/db/schema/notifications";
import { projects } from "@/db/schema/projects";
import type { DashboardMetric } from "@/lib/edms/dashboard";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export default async function AdminDashboardPage() {
  const sessionUser = await getRequiredDashboardSessionUser();

  if (sessionUser.role !== "admin") {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 md:px-6 lg:px-8">
        <EdmsPageHeader
          breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Admin" }]}
          title="Admin access required"
          description="This route is available to administrators only."
          actions={
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const [projectCount, documentCount, userCount, notificationCount] = await Promise.all([
    db.select({ value: count() }).from(projects),
    db.select({ value: count() }).from(documents),
    db.select({ value: count() }).from(userTable),
    db.select({ value: count() }).from(notifications),
  ]);

  const metrics: DashboardMetric[] = [
    {
      label: "Projects",
      value: String(projectCount[0]?.value ?? 0),
      description: "Registered construction workspaces",
      tone: "slate",
      icon: "projects",
    },
    {
      label: "Documents",
      value: String(documentCount[0]?.value ?? 0),
      description: "Controlled document records",
      tone: "blue",
      icon: "documents",
    },
    {
      label: "Users",
      value: String(userCount[0]?.value ?? 0),
      description: "Workspace users in the system",
      tone: "amber",
      icon: "reviews",
    },
    {
      label: "Notifications",
      value: String(notificationCount[0]?.value ?? 0),
      description: "Generated in-app notifications",
      tone: "rose",
      icon: "notifications",
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <EdmsPageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Admin" }]}
        title="Admin dashboard"
        description="System-level oversight for the live QUADRA workspace."
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <EdmsMetricCard key={metric.label} metric={metric} />
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border bg-card p-6">
            <h2 className="text-lg font-semibold">User management</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Review every user in the workspace, confirm role assignments, and validate the EDMS
              onboarding data that controls dashboard access.
            </p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/dashboard/admin/users">Open user directory</Link>
            </Button>
          </div>
          <div className="rounded-3xl border bg-card p-6">
            <h2 className="text-lg font-semibold">Analytics and oversight</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Review system activity trends, user growth, project momentum, and document flow from
              the analytics dashboard.
            </p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/dashboard/admin/analytics">Open analytics</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
