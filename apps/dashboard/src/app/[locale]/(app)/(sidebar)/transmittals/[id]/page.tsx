import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DocumentPreviewPopover } from "@/components/edms/document-preview-popover";
import { ReviewTransmittalForm } from "@/components/edms/review-transmittal-form";
import { TransmittalAcknowledgeButton } from "@/components/edms/transmittal-acknowledge-button";
import { EdmsStatusBadge } from "@/components/edms/status-badge";
import { getClientApprovalOptionByCode } from "@/lib/edms/client-approval-codes";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { getTransmittalDetailData } from "@/lib/edms/transmittal-detail";
import { expandStorageUrl } from "@/lib/storage-utils";

export default async function TransmittalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionUser = await getRequiredDashboardSessionUser();
  const data = await getTransmittalDetailData(id, sessionUser);

  if (!data) {
    notFound();
  }

  const reviewApprovalOption = getClientApprovalOptionByCode(data.transmittal.review?.approvalCode);

  return (
    <div className="space-y-6 pt-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{data.transmittal.subject}</h1>
            <EdmsStatusBadge status={data.transmittal.status} />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{data.transmittal.transmittalNumber}</span>
            <span>{data.transmittal.projectName}</span>
            <span>From: {data.transmittal.senderName}</span>
            <span>{data.transmittal.sentLabel}</span>
          </div>
          {data.transmittal.description ? (
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {data.transmittal.description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {data.isSender ? (
            <TransmittalAcknowledgeButton
              transmittalId={data.transmittal.id}
              isActionable={data.transmittal.status === "reviewed"}
            />
          ) : null}
          <Button variant="outline" asChild>
            <Link href="/transmittals">Back to transmittals</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Attached documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.documents.map((document) => (
              <DocumentPreviewPopover
                key={document.id}
                document={{
                  id: document.id,
                  documentNumber: document.documentNumber,
                  title: document.title,
                  projectName: data.transmittal.projectName,
                  discipline: document.discipline,
                  revision: document.revision,
                  status: document.status,
                  fileUrl: document.fileUrl || "",
                  fileType: document.fileType,
                  images: null,
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
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {document.discipline ? <span>{document.discipline}</span> : null}
                    {document.revision ? <span>Rev {document.revision}</span> : null}
                    <Link
                      href={expandStorageUrl(document.fileUrl)}
                      target="_blank"
                      className="text-primary hover:underline"
                    >
                      View file
                    </Link>
                  </div>
                </div>
              </DocumentPreviewPopover>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review and acknowledgement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.transmittal.review ? (
              <div className="border border-border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">Review status</span>
                  <EdmsStatusBadge status={data.transmittal.review.reviewStatus || "reviewed"} />
                </div>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {data.transmittal.review.comments ? (
                    <p>{data.transmittal.review.comments}</p>
                  ) : null}
                  {data.transmittal.review.approvalCode ? (
                    <p>
                      Approval code:{" "}
                      <span className="font-mono text-foreground">
                        {reviewApprovalOption?.label ?? data.transmittal.review.approvalCode}
                      </span>
                    </p>
                  ) : null}
                  {data.transmittal.review.attachmentUrl ? (
                    <p>
                      CSR attachment:{" "}
                      <Link
                        href={expandStorageUrl(data.transmittal.review.attachmentUrl)}
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        {data.transmittal.review.attachmentFileName ?? "Open attachment"}
                      </Link>
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {data.isRecipient && data.activeWorkflowStep?.isActionable && data.transmittal.status === "sent" ? (
              <ReviewTransmittalForm
                transmittalId={data.transmittal.id}
                projectId={data.transmittal.projectId}
              />
            ) : null}

            {data.isSender && data.transmittal.status === "reviewed" ? (
              <div className="border border-dashed border-border bg-muted/10 p-4 text-sm text-muted-foreground">
                Review has been returned. Acknowledge the package to close this cycle and continue
                with the next revision.
              </div>
            ) : null}

            {!data.isRecipient && !data.isSender ? (
              <p className="text-sm text-muted-foreground">
                You can view this package, but only the sender or recipient can act on it.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}