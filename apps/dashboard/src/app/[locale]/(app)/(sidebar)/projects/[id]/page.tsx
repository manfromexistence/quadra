import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
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

  return (
    <div className="space-y-6 pt-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{data.project.name}</h1>
            <EdmsStatusBadge status={data.project.status} />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {data.project.projectNumber ? <span>{data.project.projectNumber}</span> : null}
            {data.project.location ? <span>{data.project.location}</span> : null}
            <span>Start: {data.project.startLabel}</span>
            <span>End: {data.project.endLabel}</span>
          </div>
          {data.project.description ? (
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {data.project.description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sessionUser.role === "admin" ? (
            <ProjectMemberSheet projectId={data.project.id} users={data.assignableUsers} />
          ) : null}
          <Button variant="outline" asChild>
            <Link href="/projects">Back to projects</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {data.project.metrics.map((metric) => (
          <Card key={metric.label}>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Project team</CardTitle>
            <span className="text-sm text-muted-foreground">{data.members.length} members</span>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.members.map((member) => (
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
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.activity.map((entry) => (
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
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.documents.map((document) => (
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
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.workflows.map((workflow) => (
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
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}