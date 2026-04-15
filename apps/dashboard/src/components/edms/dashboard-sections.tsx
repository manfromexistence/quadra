import {
  ArrowRight,
  BellRing,
  ClipboardList,
  FolderKanban,
  History,
  Image as ImageIcon,
  Send,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type {
  DashboardActivityItem,
  DashboardDocument,
  DashboardNotification,
  DashboardProject,
  DashboardTransmittal,
  DashboardWorkflowItem,
} from "@/lib/edms/dashboard";
import { expandImageArray } from "@/lib/storage-utils";
import { Button } from "@midday/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@midday/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@midday/ui/table";
import { DocumentPreviewPopover } from "./document-preview-popover";
import { EdmsStatusBadge, formatEdmsLabel } from "./status-badge";

export function EdmsProjectList({ projects }: { projects: DashboardProject[] }) {
  return (
    <Card className="h-full bg-card/95">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Project watchlist</CardTitle>
          <CardDescription>
            Current jobs and their operating status across the portfolio.
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/projects">
            View all
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {projects.length === 0 ? (
          <EdmsEmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create the first project to start routing documents, reviews, and transmittals."
          />
        ) : (
          projects.map((project) => {
            const images = expandImageArray(project.images);
            const thumbnail = images[0];

            return (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="rounded-2xl border border-border/70 bg-muted/25 p-4 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex gap-4">
                  {thumbnail ? (
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-muted">
                      <Image
                        src={thumbnail}
                        alt={project.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ) : (
                    <div className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/50">
                      <FolderKanban className="size-8 text-muted-foreground/50" />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{project.name}</p>
                        <EdmsStatusBadge status={project.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        {project.projectNumber ? (
                          <span className="rounded-full bg-background px-2 py-1 font-mono text-xs">
                            {project.projectNumber}
                          </span>
                        ) : null}
                        <span>{project.location ?? "Location pending"}</span>
                      </div>
                      {images.length > 1 ? (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ImageIcon className="size-3" />
                          <span>{images.length} images</span>
                        </div>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{project.schedule}</p>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export function EdmsDocumentTable({ documents }: { documents: DashboardDocument[] }) {
  return (
    <Card className="bg-card/95">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Recent documents</CardTitle>
          <CardDescription>
            Latest submissions and revisions entering document control.
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/documents">
            Document control
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        {documents.length === 0 ? (
          <div className="px-6 pb-6">
            <EdmsEmptyState
              icon={ClipboardList}
              title="No controlled documents"
              description="Once documents are uploaded, the latest revisions will appear here."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Preview</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Discipline</TableHead>
                <TableHead>Revision</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="px-6">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => {
                const images = expandImageArray(document.images);
                const thumbnail = images[0];

                return (
                  <TableRow key={document.id} className="group">
                    <TableCell className="px-6">
                      <DocumentPreviewPopover document={document}>
                        <button type="button" className="cursor-pointer">
                          {thumbnail ? (
                            <div className="relative size-12 overflow-hidden rounded-lg border border-border/70 bg-muted transition-all group-hover:shadow-md">
                              <Image
                                src={thumbnail}
                                alt={document.title}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          ) : (
                            <div className="flex size-12 items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/50 transition-all group-hover:bg-muted">
                              <ClipboardList className="size-5 text-muted-foreground/50" />
                            </div>
                          )}
                        </button>
                      </DocumentPreviewPopover>
                    </TableCell>
                    <TableCell>
                      <DocumentPreviewPopover document={document}>
                        <button type="button" className="cursor-pointer text-left">
                          <div className="space-y-1">
                            <p className="font-medium hover:underline">{document.title}</p>
                            <p className="font-mono text-xs text-muted-foreground hover:underline">
                              {document.documentNumber}
                            </p>
                            {images.length > 0 ? (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <ImageIcon className="size-3" />
                                <span>{images.length}</span>
                              </div>
                            ) : null}
                          </div>
                        </button>
                      </DocumentPreviewPopover>
                    </TableCell>
                    <TableCell>{document.projectName}</TableCell>
                    <TableCell>{document.discipline ?? "General"}</TableCell>
                    <TableCell>{document.revision ?? "-"}</TableCell>
                    <TableCell>
                      <EdmsStatusBadge status={document.status} />
                    </TableCell>
                    <TableCell className="px-6 text-muted-foreground">
                      {document.uploadedLabel}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function removed - now using expandImageArray from storage-utils

export function EdmsWorkflowQueue({ items }: { items: DashboardWorkflowItem[] }) {
  return (
    <Card className="h-full bg-card/95">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Workflow queue</CardTitle>
          <CardDescription>Review steps waiting on the next construction party.</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/workflows">
            Review queue
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.length === 0 ? (
          <EdmsEmptyState
            icon={ClipboardList}
            title="No pending workflow steps"
            description="Submitted documents will surface here once they enter structured review."
          />
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border/70 bg-muted/25 p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-1">
                    <p className="font-medium">{item.stepName}</p>
                    <p className="text-sm text-muted-foreground">{item.projectName}</p>
                  </div>
                  <EdmsStatusBadge status={item.status} />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-full bg-background px-2 py-1 font-mono text-xs">
                    {item.documentNumber}
                  </span>
                  <span className="text-muted-foreground">{item.title}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                  <span>{formatEdmsLabel(item.assignedRole)}</span>
                  <span>{item.dueLabel}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function EdmsTransmittalList({ items }: { items: DashboardTransmittal[] }) {
  return (
    <Card className="h-full bg-card/95">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Transmittals</CardTitle>
          <CardDescription>Formal issue packages and acknowledgement tracking.</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/transmittals">
            Manage
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.length === 0 ? (
          <EdmsEmptyState
            icon={Send}
            title="No transmittals yet"
            description="Packages issued to project parties will appear here once the module is in use."
          />
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border/70 bg-muted/25 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <p className="font-medium">{item.subject}</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="rounded-full bg-background px-2 py-1 font-mono text-xs">
                      {item.transmittalNumber}
                    </span>
                    <span>{item.projectName}</span>
                  </div>
                </div>
                <EdmsStatusBadge status={item.status} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{item.sentLabel}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function EdmsNotificationList({ items }: { items: DashboardNotification[] }) {
  return (
    <Card className="h-full bg-card/95">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Unread approvals, transmittals, and workflow alerts.</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/notifications">
            Inbox
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.length === 0 ? (
          <EdmsEmptyState
            icon={BellRing}
            title="No notifications"
            description="System alerts will appear here when workflow and document activity starts flowing."
          />
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border/70 bg-muted/25 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.title}</p>
                    {!item.isRead ? <EdmsStatusBadge status="unread" /> : null}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{item.message}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatEdmsLabel(item.type)}</span>
                    {item.projectName ? <span>{item.projectName}</span> : null}
                  </div>
                </div>
                {item.isRead ? <EdmsStatusBadge status="completed" /> : null}
              </div>
              {item.actionUrl ? (
                <div className="mt-3 flex justify-end">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={item.actionUrl}>
                      Open alert
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              ) : null}
              <p className="mt-3 text-sm text-muted-foreground">{item.createdLabel}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function EdmsActivityFeed({ items }: { items: DashboardActivityItem[] }) {
  return (
    <Card className="h-full bg-card/95">
      <CardHeader className="space-y-1">
        <CardTitle>Activity log</CardTitle>
        <CardDescription>
          Recent audit trail across project, workflow, and document activity.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {items.length === 0 ? (
          <EdmsEmptyState
            icon={History}
            title="No activity yet"
            description="The audit trail will populate as users upload, review, and issue documents."
          />
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted/30">
                <History className="size-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm leading-6">
                  <span className="font-medium">{item.actorName}</span>{" "}
                  <span className="text-muted-foreground">{formatEdmsLabel(item.action)}</span>
                  {item.entityName ? <span className="font-medium"> {item.entityName}</span> : null}
                </p>
                {item.description ? (
                  <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatEdmsLabel(item.entityType)}</span>
                  {item.projectName ? <span>{item.projectName}</span> : null}
                  <span>{item.createdLabel}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function EdmsEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FolderKanban;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border/80 bg-muted/20 p-5">
      <div className="flex size-10 items-center justify-center rounded-2xl border border-border/70 bg-background">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}


