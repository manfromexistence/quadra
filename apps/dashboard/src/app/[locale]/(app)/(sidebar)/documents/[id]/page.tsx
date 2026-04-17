import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DocumentVersionSheet } from "@/components/edms/document-version-sheet";
import { EdmsStatusBadge, formatEdmsLabel } from "@/components/edms/status-badge";
import { getDocumentDetailData } from "@/lib/edms/document-detail";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { expandStorageUrl } from "@/lib/storage-utils";

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
                  <div key={step.id} className="border border-border bg-background p-4">
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
                      <p className="mt-3 text-sm text-muted-foreground">{step.comments}</p>
                    ) : null}
                  </div>
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
              <div key={version.id} className="border border-border bg-background p-4">
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
                <p className="mt-3 text-sm text-muted-foreground">
                  {version.changeDescription || "No change description provided."}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {version.uploadedByName} · {version.uploadedLabel}
                </p>
              </div>
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
                <div key={comment.id} className="border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{comment.authorName}</p>
                      <p className="text-xs text-muted-foreground">{formatEdmsLabel(comment.commentType)}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{comment.createdLabel}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{comment.comment}</p>
                </div>
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
    <div className="flex items-start justify-between gap-3 border border-border bg-background px-4 py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}