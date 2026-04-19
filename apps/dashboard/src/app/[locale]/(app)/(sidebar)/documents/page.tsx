import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
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
import Image from "next/image";
import Link from "next/link";
import { CollapsibleSummary } from "@/components/collapsible-summary";
import { EdmsDataState } from "@/components/edms/data-state";
import { DocumentBulkUploadSheet } from "@/components/edms/document-bulk-upload-sheet";
import { DocumentCreateSheet } from "@/components/edms/document-create-sheet";
import { EdmsMetricCard } from "@/components/edms/metric-card";
import { EdmsQuickUpload } from "@/components/edms/quick-upload";
import { ErrorFallback } from "@/components/error-fallback";
import { ExportButton } from "@/components/edms/export-button";
import { PrintButton } from "@/components/edms/print-button";
import { ScrollableContent } from "@/components/scrollable-content";
import { EdmsStatusBadge } from "@/components/edms/status-badge";
import { getEdmsDashboardData } from "@/lib/edms/dashboard";
import { canManageEdmsContent } from "@/lib/edms/rbac";
import { getDocumentControlData } from "@/lib/edms/documents";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { expandImageArray } from "@/lib/storage-utils";
import { HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Documents | Quadra EDMS",
};

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
  const canManageContent = canManageEdmsContent(sessionUser.role);

  // Prepare export data
  const exportData = data.documents.map((doc) => ({
    documentNumber: doc.documentNumber,
    title: doc.title,
    projectName: doc.projectName,
    discipline: doc.discipline,
    status: doc.status,
    revision: doc.revision,
    issueDate: doc.issueDateLabel,
  }));

  const exportColumns = [
    { header: "Document No.", key: "documentNumber", width: 30 },
    { header: "Title", key: "title", width: 50 },
    { header: "Project", key: "projectName", width: 30 },
    { header: "Discipline", key: "discipline", width: 20 },
    { header: "Status", key: "status", width: 15 },
    { header: "Rev", key: "revision", width: 10 },
    { header: "Issue Date", key: "issueDate", width: 20 },
  ];

  return (
    <HydrateClient>
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          <CollapsibleSummary>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
              {data.metrics.map((metric, index) => {
                const links = ["/documents", "/workflows", "/transmittals", "/notifications"];
                return (
                  <Link key={metric.label} href={links[index] || "/documents"} className="block h-full">
                    <div className="group cursor-pointer transition-all hover:scale-[1.02] h-full">
                      <EdmsMetricCard metric={metric} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CollapsibleSummary>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-3">
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
              <ExportButton
                data={exportData}
                columns={exportColumns}
                title="Documents"
                filename="documents_export"
                variant="secondary"
                metadata={[
                  { label: "Generated", value: new Date().toLocaleDateString() },
                  { label: "Total Records", value: String(data.documents.length) },
                  ...(params.query ? [{ label: "Search Query", value: params.query }] : []),
                  ...(params.status ? [{ label: "Status Filter", value: params.status }] : []),
                ]}
              />
              <PrintButton label="Print" variant="outline" icon="print" />
              {canManageContent ? <DocumentCreateSheet projects={data.projects} /> : null}
              {canManageContent ? <DocumentBulkUploadSheet projects={data.projects} /> : null}
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
          </div>

          <EdmsDataState
            isUsingFallbackData={data.isUsingFallbackData}
            message={data.statusMessage}
          />

          {canManageContent ? <EdmsQuickUpload projects={data.projects} /> : null}

          <ErrorBoundary errorComponent={ErrorFallback}>
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading documents...</div>}>
              <Card className="border-border bg-card shadow-sm">
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
                {data.documents.map((document) => {
                  const documentImages = expandImageArray(document.images);
                  const firstImage = documentImages[0];
                  return (
                  <TableRow key={document.id} className="group cursor-pointer transition-colors hover:bg-accent">
                    <TableCell className="px-6">
                      <Link href={`/documents/${document.id}`} className="flex items-center gap-3">
                        {firstImage && (
                          <div className="relative size-12 shrink-0 overflow-hidden rounded border border-border bg-muted">
                            <Image
                              src={firstImage}
                              alt={document.title}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                              sizes="48px"
                            />
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="font-medium group-hover:text-primary">
                            {document.title}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {document.documentNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {document.uploadedLabel}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>{document.projectName}</TableCell>
                    <TableCell>{document.discipline ?? "General"}</TableCell>
                    <TableCell>{document.revision ?? "-"}</TableCell>
                    <TableCell className="px-6">
                      <EdmsStatusBadge status={document.status} />
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
                </CardContent>
              </Card>

              <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Workflow watchlist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summaryData.workflowQueue.map((item) => (
              <Link key={item.id} href={`/workflows/${item.id}`} className="block">
                <div className="group cursor-pointer border border-border bg-card p-4 transition-all hover:bg-accent hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium group-hover:text-primary">{item.stepName}</p>
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
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent transmittals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summaryData.transmittals.map((item) => (
              <Link key={item.id} href={`/transmittals/${item.id}`} className="block">
                <div className="group cursor-pointer border border-border bg-card p-4 transition-all hover:bg-accent hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium group-hover:text-primary">{item.subject}</p>
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
              </Link>
            ))}
                  </CardContent>
                </Card>
              </section>
            </Suspense>
          </ErrorBoundary>
        </div>
      </ScrollableContent>
    </HydrateClient>
  );
}
