import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { EdmsActivityFeed, EdmsProjectList } from "@/components/edms/dashboard-sections";
import { EdmsDataState } from "@/components/edms/data-state";
import { EdmsMetricCard } from "@/components/edms/metric-card";
import { EdmsPageHeader } from "@/components/edms/page-header";
import { ProjectCreateSheet } from "@/components/edms/project-create-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEdmsDashboardData } from "@/lib/edms/dashboard";
import { hasEdmsRoleAtLeast } from "@/lib/edms/rbac";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export default async function ProjectsPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const data = await getEdmsDashboardData(sessionUser);
  const [projectMetric, , , , notificationMetric] = data.metrics;
  const canCreateProject = hasEdmsRoleAtLeast(sessionUser.role, "pmc");

  return (
    <div className="flex flex-1 flex-col">
      <EdmsPageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Projects" }]}
        title="Project portfolio"
        description="Set up project containers, assign delivery teams, and keep execution status visible before deeper project forms land."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                Back to overview
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            {canCreateProject ? <ProjectCreateSheet /> : null}
          </>
        }
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <EdmsDataState
          isUsingFallbackData={data.isUsingFallbackData}
          message={data.statusMessage}
        />

        <section className="grid gap-4 md:grid-cols-2">
          <EdmsMetricCard metric={projectMetric} />
          <EdmsMetricCard metric={notificationMetric} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <EdmsProjectList projects={data.projects} />
          <Card className="bg-card/95">
            <CardHeader className="space-y-1">
              <CardTitle>Project module coverage</CardTitle>
              <CardDescription>
                The first core EDMS module is now wired into the dashboard shell.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                Project creation now writes a real record and lands directly on{" "}
                <span className="font-mono text-foreground">/dashboard/projects/[projectId]</span>.
              </p>
              <p>
                Every new project automatically attaches the creator as the initial admin member so
                delivery ownership has a clean starting point.
              </p>
              <p>
                Detail pages now expose project metadata, members, documents, workflows, and
                activity in one place.
              </p>
            </CardContent>
          </Card>
        </section>

        {!canCreateProject ? (
          <section className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
            Project creation is limited to PMC, client, and admin roles. Your current role can still
            browse the portfolio and project records.
          </section>
        ) : null}

        <section>
          <EdmsActivityFeed items={data.activity} />
        </section>
      </div>
    </div>
  );
}
