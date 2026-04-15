import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EdmsDataState } from "@/components/edms/data-state";
import { DocumentVersionSheet } from "@/components/edms/document-version-sheet";
import { EdmsPageHeader } from "@/components/edms/page-header";
import { EdmsStatusBadge, formatEdmsLabel } from "@/components/edms/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDocumentDetailData } from "@/lib/edms/document-detail";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { expandImageArray } from "@/lib/storage-utils";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  const sessionUser = await getRequiredDashboardSessionUser();
  const data = await getDocumentDetailData(documentId, sessionUser);

  if (!data) {
    notFound();
  }

  const isPdfPreview = data.document.fileType?.toLowerCase() === "pdf";
  const documentImages = expandImageArray(data.document.images);

  return (
    <div className="flex flex-1 flex-col">
      <EdmsPageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Documents", href: "/dashboard/documents" },
          { label: data.document.documentNumber },
        ]}
        title={data.document.title}
        description={
          data.document.description ??
          "Controlled document metadata, preview, version history, and comment trail."
        }
        actions={
          <>
            <Badge variant="outline" className="rounded-full font-mono">
              {data.document.documentNumber}
            </Badge>
            <EdmsStatusBadge status={data.document.status} />
            <DocumentVersionSheet
              documentId={data.document.id}
              projectId={data.document.projectId}
              currentVersion={data.document.version}
              currentRevision={data.document.revision}
              currentFileName={data.document.fileName}
              currentFileType={data.document.fileType}
              currentFileUrl={data.document.fileUrl}
            />
            <Button asChild>
              <Link href={data.document.fileUrl} target="_blank">
                Open file
                <ExternalLink className="size-4" />
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

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Card className="bg-card/95">
              <CardHeader className="space-y-1">
                <CardTitle>Document preview</CardTitle>
                <CardDescription>
                  Review the latest controlled issue directly from the EDMS.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isPdfPreview ? (
                  <iframe
                    src={data.document.fileUrl}
                    title={data.document.title}
                    className="h-[620px] w-full rounded-2xl border border-border/70"
                  />
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6">
                    <p className="font-medium">Inline preview unavailable</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      This file type opens in a separate tab. Use the file link above to inspect the
                      latest issue.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {documentImages.length > 0 ? (
              <Card className="bg-card/95">
                <CardHeader className="space-y-1">
                  <CardTitle>Document images</CardTitle>
                  <CardDescription>
                    Visual references and preview images for this document.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {documentImages.map((imageUrl, index) => (
                      <a
                        key={index}
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-square overflow-hidden rounded-xl border border-border/70 bg-muted transition-all hover:shadow-lg"
                      >
                        <Image
                          src={imageUrl}
                          alt={`${data.document.title} - Image ${index + 1}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <Card className="bg-card/95">
            <CardHeader className="space-y-1">
              <CardTitle>Document metadata</CardTitle>
              <CardDescription>Current issue metadata and classification fields.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <MetadataRow label="Project" value={data.document.projectName} />
              <MetadataRow label="Discipline" value={data.document.discipline ?? "General"} />
              <MetadataRow label="Category" value={data.document.category ?? "Uncategorized"} />
              <MetadataRow label="Version" value={data.document.version} />
              <MetadataRow label="Revision" value={data.document.revision ?? "-"} />
              <MetadataRow label="File name" value={data.document.fileName} />
              <MetadataRow label="File type" value={data.document.fileType ?? "Unknown"} />
              <MetadataRow label="Uploaded" value={data.document.uploadedLabel} />
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs font-semibold tracking-[0.16em] uppercase text-muted-foreground">
                  Tags
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.document.tags.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tags assigned.</p>
                  ) : (
                    data.document.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded-full">
                        {tag}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="bg-card/95">
            <CardHeader className="space-y-1">
              <CardTitle>Version history</CardTitle>
              <CardDescription>Tracked revisions for this controlled document.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {data.versions.map((version) => (
                <div
                  key={version.id}
                  className="rounded-2xl border border-border/70 bg-muted/25 p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium">{version.fileName}</p>
                      <p className="text-sm text-muted-foreground">{version.uploadedByName}</p>
                    </div>
                    <Badge variant="outline" className="rounded-full font-mono">
                      {version.version}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {version.changeDescription ?? "No change description provided."}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">{version.uploadedLabel}</p>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={version.fileUrl} target="_blank">
                        Open version
                        <ExternalLink className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card className="bg-card/95">
              <CardHeader className="space-y-1">
                <CardTitle>Workflow summary</CardTitle>
                <CardDescription>Latest review route linked to this document.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {data.workflow ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{data.workflow.workflowName}</p>
                        <p className="text-sm text-muted-foreground">
                          {`Current step ${data.workflow.currentStep} of ${data.workflow.totalSteps}`}
                        </p>
                      </div>
                      <EdmsStatusBadge status={data.workflow.status} />
                    </div>
                    {data.workflow.steps.map((step) => (
                      <div
                        key={step.id}
                        className="rounded-2xl border border-border/70 bg-muted/25 p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium">{step.stepName}</p>
                          <EdmsStatusBadge status={step.status} />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>{step.assignedToName}</span>
                          <span>{formatEdmsLabel(step.assignedRole)}</span>
                          <span>{step.completedLabel}</span>
                        </div>
                        {step.comments ? (
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            {step.comments}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No workflow has been created for this document yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/95">
              <CardHeader className="space-y-1">
                <CardTitle>Comment history</CardTitle>
                <CardDescription>
                  Review and approval notes recorded against this document.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {data.comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No comments recorded for this document yet.
                  </p>
                ) : (
                  data.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-2xl border border-border/70 bg-muted/25 p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{comment.authorName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatEdmsLabel(comment.commentType)}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">{comment.createdLabel}</p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {comment.comment}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
      <p className="text-xs font-semibold tracking-[0.16em] uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6">{value}</p>
    </div>
  );
}
