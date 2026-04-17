import { Button } from "@midday/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@midday/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@midday/ui/tabs";
import { ArrowRight, Building2, Calendar, FileText, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ActivityEntryPopover } from "@/components/edms/activity-entry-popover";
import { EdmsDataState } from "@/components/edms/data-state";
import { EdmsMetricCard } from "@/components/edms/metric-card";
import { ProjectCreateSheet } from "@/components/edms/project-create-sheet";
import { ProjectPreviewPopover } from "@/components/edms/project-preview-popover";
import {
  EdmsStatusBadge,
  formatEdmsLabel,
} from "@/components/edms/status-badge";
import { getEdmsDashboardData } from "@/lib/edms/dashboard";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { expandImageArray } from "@/lib/storage-utils";

export default async function ProjectsPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const data = await getEdmsDashboardData(sessionUser);

  // Filter projects by status
  const activeProjects = data.projects.filter(p => p.status === "active");
  const onHoldProjects = data.projects.filter(p => p.status === "on-hold");
  const completedProjects = data.projects.filter(p => p.status === "completed");
  const allProjects = data.projects;

  return (
    <div className="space-y-6 pt-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-3">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Project workspace
            </h1>
            <p className="text-sm leading-6 text-muted-foreground md:text-base">
              Portfolio-level oversight for active construction jobs with 
              comprehensive project management and workflow tracking.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sessionUser.role === "admin" ? <ProjectCreateSheet /> : null}
          <Button variant="outline" asChild>
            <Link href="/documents">
              Open register
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              Return to overview
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <EdmsDataState
        isUsingFallbackData={data.isUsingFallbackData}
        message={data.statusMessage}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
        {data.metrics[0] && (
          <Link href="/projects" className="block h-full">
            <div className="group cursor-pointer transition-all hover:scale-[1.02] h-full">
              <EdmsMetricCard metric={data.metrics[0]} />
            </div>
          </Link>
        )}
        {data.metrics[1] && (
          <Link href="/documents" className="block h-full">
            <div className="group cursor-pointer transition-all hover:scale-[1.02] h-full">
              <EdmsMetricCard metric={data.metrics[1]} />
            </div>
          </Link>
        )}
        {data.metrics[2] && (
          <Link href="/workflows" className="block h-full">
            <div className="group cursor-pointer transition-all hover:scale-[1.02] h-full">
              <EdmsMetricCard metric={data.metrics[2]} />
            </div>
          </Link>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Project watchlist</CardTitle>
            <CardDescription>
              {data.projects.length} {data.projects.length === 1 ? "project" : "projects"} in your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center border border-dashed border-border bg-muted/30 p-12 text-center">
                <Building2 className="size-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get started by creating your first project
                </p>
                {sessionUser.role === "admin" && (
                  <div className="mt-4">
                    <ProjectCreateSheet />
                  </div>
                )}
              </div>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">
                    All ({allProjects.length})
                  </TabsTrigger>
                  <TabsTrigger value="active">
                    Active ({activeProjects.length})
                  </TabsTrigger>
                  <TabsTrigger value="on-hold">
                    On Hold ({onHoldProjects.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    Completed ({completedProjects.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6 space-y-4">
                  {allProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </TabsContent>

                <TabsContent value="active" className="mt-6 space-y-4">
                  {activeProjects.length === 0 ? (
                    <EmptyState status="active" />
                  ) : (
                    activeProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="on-hold" className="mt-6 space-y-4">
                  {onHoldProjects.length === 0 ? (
                    <EmptyState status="on-hold" />
                  ) : (
                    onHoldProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="completed" className="mt-6 space-y-4">
                  {completedProjects.length === 0 ? (
                    <EmptyState status="completed" />
                  ) : (
                    completedProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Activity log</CardTitle>
            <CardDescription>Recent project updates and actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center border border-dashed border-border bg-muted/30 p-8 text-center">
                <FileText className="size-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              data.activity.map((entry) => (
                <ActivityEntryPopover
                  key={entry.id}
                  entry={{
                    id: entry.id,
                    actorName: entry.actorName,
                    action: entry.action,
                    entityName: entry.entityName || undefined,
                    description: entry.description || undefined,
                    createdLabel: entry.createdLabel,
                    entityType: entry.entityType,
                    projectName: entry.projectName || undefined,
                  }}
                >
                  <div className="cursor-pointer border border-border bg-card p-4 transition-all hover:bg-accent hover:shadow-md">
                    <div className="flex gap-3">
                      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center border border-border bg-muted">
                        <Building2 className="size-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-sm leading-6">
                          <span className="font-medium">{entry.actorName}</span>{" "}
                          <span className="text-muted-foreground">
                            {formatEdmsLabel(entry.action)}
                          </span>
                          {entry.entityName ? (
                            <span className="font-medium"> {entry.entityName}</span>
                          ) : null}
                        </p>
                        {entry.description ? (
                          <p className="text-sm leading-6 text-muted-foreground line-clamp-2">
                            {entry.description}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatEdmsLabel(entry.entityType)}</span>
                          {entry.projectName ? (
                            <span>{entry.projectName}</span>
                          ) : null}
                          <span>{entry.createdLabel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ActivityEntryPopover>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
  const projectImages = expandImageArray(project.images);
  const firstImage = projectImages[0];

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <div className="group cursor-pointer border border-border bg-card p-5 transition-all hover:bg-accent hover:shadow-md">
        <div className="flex gap-4">
          {/* Project Image */}
          {firstImage ? (
            <div className="relative size-24 shrink-0 overflow-hidden border border-border bg-muted">
              <Image
                src={firstImage}
                alt={project.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="96px"
              />
            </div>
          ) : (
            <div className="flex size-24 shrink-0 items-center justify-center border border-border bg-muted">
              <Building2 className="size-8 text-muted-foreground/50" />
            </div>
          )}

          {/* Project Info */}
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold group-hover:text-primary">
                    {project.name}
                  </h3>
                  <EdmsStatusBadge status={project.status} />
                </div>
                {project.projectNumber && (
                  <p className="font-mono text-xs text-muted-foreground">
                    {project.projectNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {project.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {project.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                {project.schedule}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                <span>View team & documents</span>
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ status }: { status: string }) {
  const messages = {
    active: "No active projects",
    "on-hold": "No projects on hold",
    completed: "No completed projects",
  };

  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-border bg-muted/30 p-8 text-center">
      <Building2 className="size-8 text-muted-foreground/50" />
      <p className="mt-2 text-sm text-muted-foreground">
        {messages[status as keyof typeof messages] || "No projects"}
      </p>
    </div>
  );
}