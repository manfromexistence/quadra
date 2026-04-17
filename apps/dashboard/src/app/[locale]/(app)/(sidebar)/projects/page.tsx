import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

  return (
    <div className="space-y-6 pt-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-3">
          <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-muted-foreground">
            Portfolio
          </p>
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.metrics.slice(0, 3).map((metric) => (
          <EdmsMetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border bg-background/90 shadow-sm">
          <CardHeader>
            <CardTitle>Project watchlist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.projects.map((project) => {
              const projectImages = expandImageArray(project.images);
              return (
              <ProjectPreviewPopover
                key={project.id}
                project={{
                  id: project.id,
                  name: project.name,
                  projectNumber: project.projectNumber,
                  location: project.location,
                  status: project.status,
                  description: project.description,
                  startDate: project.startDate,
                  endDate: project.endDate,
                  images: project.images,
                }}
              >
                <div className="cursor-pointer rounded-lg border border-border bg-muted/30 p-5 transition-all hover:bg-muted/50 hover:shadow-sm">
                  {projectImages.length > 0 && (
                    <div className="relative mb-4 aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                      <Image
                        src={projectImages[0]}
                        alt={project.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-medium">{project.name}</p>
                        <EdmsStatusBadge status={project.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {project.projectNumber ? (
                          <span className="rounded-full bg-background px-2 py-1 font-mono text-xs">
                            {project.projectNumber}
                          </span>
                        ) : null}
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {project.location ?? "Location pending"}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {project.schedule}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/projects/${project.id}`}>
                        Open project
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </ProjectPreviewPopover>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-border bg-background/90 shadow-sm">
          <CardHeader>
            <CardTitle>Activity log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.activity.map((entry) => (
              <div key={entry.id} className="flex gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40">
                  <Building2 className="size-4" />
                </div>
                <div className="space-y-1">
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
                    <p className="text-sm leading-6 text-muted-foreground">
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
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}