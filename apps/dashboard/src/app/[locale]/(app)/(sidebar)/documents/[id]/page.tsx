import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CommentPopover } from "@/components/edms/comment-popover";
import { DocumentVersionSheet } from "@/components/edms/document-version-sheet";
import { EdmsStatusBadge, formatEdmsLabel } from "@/components/edms/status-badge";
import { VersionHistoryPopover } from "@/components/edms/version-history-popover";
import { WorkflowPreviewPopover } from "@/components/edms/workflow-preview-popover";
import { getDocumentDetailData } from "@/lib/edms/document-detail";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { expandImageArray, expandStorageUrl } from "@/lib/storage-utils";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionUser = await getRequiredDashboardSessionUser();
  const data = await getDocumentDetailData(id, sessionUser);

  if (!data) {
    notFound();
  }

  const documentImages = expandImageArray(data.document.images);

  return (
    <div className="space-y-6 pt-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{data.document.title}</h1>
            <EdmsStatusBadge status={data.document.status} />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{data.document.documentNumber}</span>
            <span>{data.document.projectName}</span>
            <span>Version {data.document.version}</span>
            {data.document.revision ? <span>Rev {data.document.revision}</span> : null}
          </div>
          {data.document.description ? (
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {data.document.description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DocumentVersionSheet
            documentId={data.document.id}
            projectId={data.document.projectId}
            currentVersion={data.document.version}
            currentRevision={data.document.revision}
            currentFileName={data.document.fileName}
            currentFileType={data.document.fileType}
            currentFileUrl={data.document.fileUrl}
          />
          <Button variant="outline" asChild>
            <Link href={expandStorageUrl(data.document.fileUrl)} target="_blank">
              Open file
            </Link>
          </Button>
        </div>
      </section>

      {documentImages.length > 0 && (
        <section>
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Document images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {documentImages.map((imageUrl, index) => (
                  <div key={index} className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                    <Image
                      src={imageUrl}
                      alt={`${data.document.title} - Image ${index + 1}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100"
                    >
                      <span className="text-sm font-medium text-white">View full size</span>
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <MetadataRow label="Project" value={data.document.projectName} />
            <MetadataRow label="Discipline" value={data.document.discipline || "General"} />
            <MetadataRow label="Category" value={data.document.category || "Document"} />
            <MetadataRow label="Uploaded" value={data.document.uploadedLabel} />
            <MetadataRow label="File" value={data.document.fileName} />
            <MetadataRow
              label="Tags"
              value={data.document.tags.length > 0 ? data.document.tags.join(", ") : "No tags"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.workflow ? (
              <>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>{data.workflow.workflowName}</span>
                  <EdmsStatusBadge status={data.workflow.status} />
                  <span>
                    Step {data.workflow.currentStep} of {data.workflow.totalSteps}
                  </span>
                </div>
            {data.workflow.steps.map((step) => (
              <WorkflowPreviewPopover
                key={step.id}
                workflow={{
                  id: step.id,
                  stepName: step.stepName,
                  title: data.document.title,
                  documentNumber: data.document.documentNumber,
                  projectName: data.document.projectName,
                  status: step.status,
                  dueLabel: step.completedLabel,
                  assignedRole: step.assignedRole || undefined,
                }}
              >
                <div className="cursor-pointer border border-border bg-card p-4 transition-all hover:bg-muted/50 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{step.stepName}</p>
                      <p className="text-sm text-muted-foreground">{step.assignedToName}</p>
                    </div>
                    <EdmsStatusBadge status={step.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {step.assignedRole ? <span>{formatEdmsLabel(step.assignedRole)}</span> : null}
                    <span>{step.completedLabel}</span>
                  </div>
                  {step.comments ? (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{step.comments}</p>
                  ) : null}
                </div>
              </WorkflowPreviewPopover>
            ))}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No workflow is linked to this document yet.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Version history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.versions.map((version) => (
              <VersionHistoryPopover
                key={version.id}
                version={{
                  id: version.id,
                  version: version.version,
                  fileName: version.fileName,
                  fileUrl: version.fileUrl,
                  changeDescription: version.changeDescription,
                  uploadedByName: version.uploadedByName,
                  uploadedLabel: version.uploadedLabel,
                }}
              >
                <div className="cursor-pointer border border-border bg-card p-4 transition-all hover:bg-muted/50 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">Version {version.version}</p>
                      <p className="text-sm text-muted-foreground">{version.fileName}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={expandStorageUrl(version.fileUrl)} target="_blank">
                        Open
                      </Link>
                    </Button>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                    {version.changeDescription || "No change description provided."}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {version.uploadedByName} · {version.uploadedLabel}
                  </p>
                </div>
              </VersionHistoryPopover>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No review comments yet.</p>
            ) : (
              data.comments.map((comment) => (
                <CommentPopover
                  key={comment.id}
                  comment={{
                    id: comment.id,
                    authorName: comment.authorName,
                    commentType: comment.commentType,
                    comment: comment.comment,
                    createdLabel: comment.createdLabel,
                  }}
                >
                  <div className="cursor-pointer border border-border bg-card p-4 transition-all hover:bg-muted/50 hover:shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{comment.authorName}</p>
                        <p className="text-xs text-muted-foreground">{formatEdmsLabel(comment.commentType)}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{comment.createdLabel}</span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{comment.comment}</p>
                  </div>
                </CommentPopover>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border border-border bg-card px-4 py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}