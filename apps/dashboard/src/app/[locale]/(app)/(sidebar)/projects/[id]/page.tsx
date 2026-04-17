import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { Building2, Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ActivityEntryPopover } from "@/components/edms/activity-entry-popover";
import { DocumentPreviewPopover } from "@/components/edms/document-preview-popover";
import { ProjectMemberSheet } from "@/components/edms/project-member-sheet";
import { EdmsStatusBadge, formatEdmsLabel } from "@/components/edms/status-badge";
import { TeamMemberPopover } from "@/components/edms/team-member-popover";
import { WorkflowPreviewPopover } from "@/components/edms/workflow-preview-popover";
import { getProjectDetailData } from "@/lib/edms/projects";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { expandImageArray } from "@/lib/storage-utils";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionUser = await getRequiredDashboardSessionUser();
  const data = await getProjectDetailData(id, sessionUser);

  if (!data) {
    notFound();
  }

  const projectImages = expandImageArray(data.project.images);

  return (
    <div className="space-y-6 pt-6">
      {/* Hero Section with Project Image */}
      {projectImages.length > 0 ? (
        <section className="relative overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {/* Main Hero Image */}
          <div className="relative aspect-[21/9] w-full overflow-hidden">
            <Image
              src={projectImages[0]}
              alt={data.project.name}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            {/* Project Info Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                      {data.project.name}
                    </h1>
                    <EdmsStatusBadge status={data.project.status} />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                    {data.project.projectNumber && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-mono text-xs backdrop-blur-sm">
                        {data.project.projectNumber}
                      </span>
                    )}
                    {data.project.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-4" />
                        {data.project.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="size-4" />
                      {data.project.startLabel} - {data.project.endLabel}
                    </span>
                  </div>

                  {data.project.description && (
                    <p className="max-w-3xl text-sm leading-6 text-white/80">
                      {data.project.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {sessionUser.role === "admin" && (
                    <ProjectMemberSheet projectId={data.project.id} users={data.assignableUsers} />
                  )}
                  <Button variant="secondary" asChild>
                    <Link href="/projects">Back to projects</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Images Thumbnails */}
          {projectImages.length > 1 && (
            <div className="border-t border-border bg-muted/30 p-4">
              <div className="flex gap-3 overflow-x-auto">
                {projectImages.slice(1, 6).map((imageUrl, index) => (
                  <a
                    key={index}
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg border border-border bg-muted transition-all hover:border-primary hover:shadow-md"
                  >
                    <Image
                      src={imageUrl}
                      alt={`${data.project.name} - Image ${index + 2}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="128px"
                    />
                  </a>
                ))}
                {projectImages.length > 6 && (
                  <div className="flex aspect-video w-32 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-xs text-muted-foreground">
                    +{projectImages.length - 6} more
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      ) : (
        /* Fallback Header without Image */
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Building2 className="size-8 text-muted-foreground" />
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  {data.project.name}
                </h1>
                <EdmsStatusBadge status={data.project.status} />
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {data.project.projectNumber && (
                  <span className="rounded-full border border-border bg-muted px-3 py-1 font-mono text-xs">
                    {data.project.projectNumber}
                  </span>
                )}
                {data.project.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4" />
                    {data.project.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  {data.project.startLabel} - {data.project.endLabel}
                </span>
              </div>

              {data.project.description && (
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                  {data.project.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {sessionUser.role === "admin" && (
                <ProjectMemberSheet projectId={data.project.id} users={data.assignableUsers} />
              )}
              <Button variant="outline" asChild>
                <Link href="/projects">Back to projects</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        {data.project.metrics.map((metric) => (
          <Card key={metric.label} className="border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{metric.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Project team</CardTitle>
            <span className="text-sm text-muted-foreground">{data.members.length} members</span>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.members.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
                <Building2 className="size-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No team members assigned</p>
              </div>
            ) : (
              data.members.map((member) => (
                <TeamMemberPopover
                  key={member.id}
                  member={{
                    id: member.id,
                    name: member.name,
                    email: member.email,
                    role: member.role,
                    organization: member.organization,
                    assignedLabel: member.assignedLabel,
                  }}
                >
                  <div className="cursor-pointer border border-border bg-card p-4 transition-all hover:bg-muted/50 hover:shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      <EdmsStatusBadge status={member.role} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {member.organization ? <span>{member.organization}</span> : null}
                      <span>{member.assignedLabel}</span>
                    </div>
                  </div>
                </TeamMemberPopover>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
                <Calendar className="size-8 text-muted-foreground/50" />
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
                    entityName: entry.entityName,
                    description: entry.description,
                    createdLabel: entry.createdLabel,
                    entityType: entry.entityType,
                    projectName: entry.projectName,
                  }}
                >
                  <div className="cursor-pointer border border-border bg-card p-4 transition-all hover:bg-muted/50 hover:shadow-sm">
                    <p className="text-sm">
                      <span className="font-medium">{entry.actorName}</span>{" "}
                      <span className="text-muted-foreground">{formatEdmsLabel(entry.action)}</span>
                      {entry.entityName ? <span className="font-medium"> {entry.entityName}</span> : null}
                    </p>
                    {entry.description ? (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{entry.description}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">{entry.createdLabel}</p>
                  </div>
                </ActivityEntryPopover>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
                <Building2 className="size-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No documents yet</p>
              </div>
            ) : (
              data.documents.map((document) => (
                <DocumentPreviewPopover
                  key={document.id}
                  document={{
                    id: document.id,
                    documentNumber: document.documentNumber,
                    title: document.title,
                    projectName: data.project.name,
                    discipline: document.discipline,
                    revision: document.revision,
                    status: document.status,
                    fileUrl: document.fileUrl || "",
                    fileType: document.fileType,
                    images: document.images,
                  }}
                >
                  <div className="cursor-pointer border border-border bg-card p-4 transition-all hover:bg-muted/50 hover:shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium hover:text-primary">{document.title}</p>
                        <p className="font-mono text-xs text-muted-foreground">{document.documentNumber}</p>
                      </div>
                      <EdmsStatusBadge status={document.status} />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">{document.uploadedLabel}</p>
                  </div>
                </DocumentPreviewPopover>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Workflow queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.workflows.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
                <Building2 className="size-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No active workflows</p>
              </div>
            ) : (
              data.workflows.map((workflow) => (
                <WorkflowPreviewPopover
                  key={workflow.id}
                  workflow={{
                    id: workflow.id,
                    stepName: workflow.stepName,
                    title: workflow.title,
                    documentNumber: workflow.documentNumber,
                    projectName: data.project.name,
                    status: workflow.status,
                    dueLabel: workflow.dueLabel,
                    assignedRole: workflow.assignedRole,
                  }}
                >
                  <div className="cursor-pointer border border-border bg-card p-4 transition-all hover:bg-muted/50 hover:shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{workflow.stepName}</p>
                        <p className="text-sm text-muted-foreground">{workflow.title}</p>
                      </div>
                      <EdmsStatusBadge status={workflow.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{workflow.documentNumber}</span>
                      {workflow.assignedRole ? <span>{formatEdmsLabel(workflow.assignedRole)}</span> : null}
                      <span>{workflow.dueLabel}</span>
                    </div>
                  </div>
                </WorkflowPreviewPopover>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}