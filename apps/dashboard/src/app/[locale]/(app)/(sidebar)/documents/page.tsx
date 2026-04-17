import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { Input } from "@midday/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { EdmsDataState } from "@/components/edms/data-state";
import { DocumentBulkUploadSheet } from "@/components/edms/document-bulk-upload-sheet";
import { DocumentCreateSheet } from "@/components/edms/document-create-sheet";
import { DocumentPreviewPopover } from "@/components/edms/document-preview-popover";
import { EdmsMetricCard } from "@/components/edms/metric-card";
import { EdmsQuickUpload } from "@/components/edms/quick-upload";
import { EdmsStatusBadge } from "@/components/edms/status-badge";
import { TransmittalPreviewPopover } from "@/components/edms/transmittal-preview-popover";
import { WorkflowPreviewPopover } from "@/components/edms/workflow-preview-popover";
import { getEdmsDashboardData } from "@/lib/edms/dashboard";
import { getDocumentControlData } from "@/lib/edms/documents";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    status?: string;
    discipline?: string;
    revision?: string;
  }>;
}) {
  const sessionUser = await getRequiredDashboardSessionUser();
  const params = await searchParams;
  const [summaryData, data] = await Promise.all([
    getEdmsDashboardData(sessionUser),
    getDocumentControlData(sessionUser, params),
  ]);

  return (
    <div className="space-y-6 pt-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-3">
          <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-muted-foreground">
            Quadra EDMS
          </p>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Document control
            </h1>
            <p className="text-sm leading-6 text-muted-foreground md:text-base">
              Centralized document management with controlled revisions and 
              workflow tracking for all project documentation.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DocumentCreateSheet projects={data.projects} />
          <DocumentBulkUploadSheet projects={data.projects} />
          <Button variant="outline" asChild>
            <Link href="/workflows">
              Review queue
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/transmittals">
              Transmittals
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <EdmsDataState
        isUsingFallbackData={data.isUsingFallbackData}
        message={data.statusMessage}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <EdmsMetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <EdmsQuickUpload projects={data.projects} />

      <Card className="border-border bg-background/90 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="space-y-1">
            <CardTitle>Document register</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Search by number, title, discipline, or revision to find 
              project documents and track their status.
            </p>
          </div>

          <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_auto]">
            <Input
              name="query"
              defaultValue={params.query ?? ""}
              placeholder="Search documents"
            />

            <select
              name="status"
              defaultValue={params.status ?? ""}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="superseded">Superseded</option>
            </select>

            <select
              name="discipline"
              defaultValue={params.discipline ?? ""}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">All disciplines</option>
              {data.availableDisciplines.map((discipline) => (
                <option key={discipline} value={discipline}>
                  {discipline}
                </option>
              ))}
            </select>

            <select
              name="revision"
              defaultValue={params.revision ?? ""}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">All revisions</option>
              {data.availableRevisions.map((revision) => (
                <option key={revision} value={revision}>
                  {revision}
                </option>
              ))}
            </select>

            <Button type="submit">Filter</Button>
          </form>
        </CardHeader>

        <CardContent className="px-0">
          {data.documents.length === 0 ? (
            <div className="px-6 pb-6 text-sm text-muted-foreground">
              No documents found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Document</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Revision</TableHead>
                  <TableHead className="px-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="px-6">
                      <div className="space-y-1">
                        <DocumentPreviewPopover document={document}>
                          <Link href={`/documents/${document.id}`} className="font-medium hover:underline">
                            {document.title}
                          </Link>
                        </DocumentPreviewPopover>
                        <p className="font-mono text-xs text-muted-foreground">
                          {document.documentNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {document.uploadedLabel}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{document.projectName}</TableCell>
                    <TableCell>{document.discipline ?? "General"}</TableCell>
                    <TableCell>{document.revision ?? "-"}</TableCell>
                    <TableCell className="px-6">
                      <EdmsStatusBadge status={document.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border bg-background/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Workflow watchlist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summaryData.workflowQueue.map((item) => (
              <WorkflowPreviewPopover
                key={item.id}
                workflow={{
                  id: item.id,
                  stepName: item.stepName,
                  title: item.title,
                  documentNumber: item.documentNumber,
                  projectName: item.projectName,
                  status: item.status,
                  dueLabel: item.dueLabel,
                  assignedRole: item.assignedRole,
                }}
              >
                <div className="cursor-pointer rounded-lg border border-border bg-muted/30 p-4 transition-all hover:bg-muted/50 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.stepName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.projectName}
                      </p>
                    </div>
                    <EdmsStatusBadge status={item.status} />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {item.documentNumber} · {item.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.dueLabel}
                  </p>
                </div>
              </WorkflowPreviewPopover>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-background/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent transmittals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summaryData.transmittals.map((item) => (
              <TransmittalPreviewPopover
                key={item.id}
                transmittal={{
                  id: item.id,
                  subject: item.subject,
                  transmittalNumber: item.transmittalNumber,
                  projectName: item.projectName,
                  status: item.status,
                  sentLabel: item.sentLabel,
                }}
              >
                <div className="cursor-pointer rounded-lg border border-border bg-muted/30 p-4 transition-all hover:bg-muted/50 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.projectName}
                      </p>
                    </div>
                    <EdmsStatusBadge status={item.status} />
                  </div>
                  <p className="mt-3 font-mono text-xs text-muted-foreground">
                    {item.transmittalNumber}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.sentLabel}
                  </p>
                </div>
              </TransmittalPreviewPopover>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}