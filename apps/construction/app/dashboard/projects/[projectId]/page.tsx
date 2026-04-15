import Image from "next/image";
import { notFound } from "next/navigation";
import {
  EdmsActivityFeed,
  EdmsDocumentTable,
  EdmsWorkflowQueue,
} from "@/components/edms/dashboard-sections";
import { EdmsDataState } from "@/components/edms/data-state";
import { EdmsPageHeader } from "@/components/edms/page-header";
import { ProjectDataBookDialog } from "@/components/edms/project-databook-dialog";
import { ProjectMemberSheet } from "@/components/edms/project-member-sheet";
import { formatEdmsLabel } from "@/components/edms/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectDetailData } from "@/lib/edms/projects";
import { normalizeEdmsRole } from "@/lib/edms/rbac";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { expandImageArray } from "@/lib/storage-utils";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const sessionUser = await getRequiredDashboardSessionUser();
  const data = await getProjectDetailData(projectId, sessionUser);
  const canManageMembers = ["admin", "client", "pmc"].includes(normalizeEdmsRole(sessionUser.role));

  if (!data) {
    notFound();
  }

  const projectImages = expandImageArray(data.project.images);

  return (
    <div className="flex flex-1 flex-col">
      <EdmsPageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Projects", href: "/dashboard/projects" },
          { label: data.project.name },
        ]}
        title={data.project.name}
        description={
          data.project.description ??
          "This project workspace coordinates membership, controlled documents, workflows, and audit activity."
        }
        actions={
          <>
            <ProjectDataBookDialog projectId={data.project.id} projectName={data.project.name} />
            {canManageMembers ? (
              <ProjectMemberSheet projectId={data.project.id} users={data.assignableUsers} />
            ) : null}
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {formatEdmsLabel(data.project.status)}
            </Badge>
            {data.project.projectNumber ? (
              <Badge variant="outline" className="rounded-full px-3 py-1 font-mono">
                {data.project.projectNumber}
              </Badge>
            ) : null}
          </>
        }
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <EdmsDataState
          isUsingFallbackData={data.isUsingFallbackData}
          message={data.statusMessage}
        />

        <section className="grid gap-4 md:grid-cols-3">
          {data.project.metrics.map((metric) => (
            <Card key={metric.label} className="bg-card/95">
              <CardHeader className="space-y-1">
                <CardDescription className="text-[11px] font-semibold tracking-[0.18em] uppercase">
                  {metric.label}
                </CardDescription>
                <CardTitle className="text-3xl">{metric.value}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm leading-6 text-muted-foreground">{metric.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {projectImages.length > 0 ? (
          <section>
            <Card className="bg-card/95">
              <CardHeader className="space-y-1">
                <CardTitle>Project gallery</CardTitle>
                <CardDescription>
                  Visual documentation and site photos for this project.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {projectImages.map((imageUrl, index) => (
                    <a
                      key={index}
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square overflow-hidden rounded-xl border border-border/70 bg-muted transition-all hover:shadow-lg"
                    >
                      <Image
                        src={imageUrl}
                        alt={`${data.project.name} - Image ${index + 1}`}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw"
                      />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="bg-card/95">
            <CardHeader className="space-y-1">
              <CardTitle>Project overview</CardTitle>
              <CardDescription>
                Baseline delivery information and scheduling context.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <OverviewField label="Location" value={data.project.location ?? "Location pending"} />
              <OverviewField
                label="Client"
                value={data.project.clientName ?? "Client not assigned"}
              />
              <OverviewField label="Start" value={data.project.startLabel} />
              <OverviewField label="Finish" value={data.project.endLabel} />
            </CardContent>
          </Card>

          <Card className="bg-card/95">
            <CardHeader className="space-y-1">
              <CardTitle>Project members</CardTitle>
              <CardDescription>
                People currently attached to this project workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {data.members.length === 0 ? (
                <p className="text-sm text-muted-foreground">No members assigned yet.</p>
              ) : (
                data.members.map((member) => (
                  <div
                    key={member.id}
                    className="rounded-2xl border border-border/70 bg-muted/25 p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.organization ?? "Organization pending"}
                        </p>
                      </div>
                      <div className="space-y-2 text-left sm:text-right">
                        <Badge variant="outline" className="rounded-full">
                          {formatEdmsLabel(member.role)}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{member.assignedLabel}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <EdmsDocumentTable documents={data.documents} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <EdmsWorkflowQueue items={data.workflows} />
          <EdmsActivityFeed items={data.activity} />
        </section>
      </div>
    </div>
  );
}

function OverviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/25 p-4">
      <p className="text-xs font-semibold tracking-[0.16em] uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6">{value}</p>
    </div>
  );
}
