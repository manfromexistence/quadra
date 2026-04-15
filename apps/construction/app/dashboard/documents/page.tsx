import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  EdmsDocumentTable,
  EdmsTransmittalList,
  EdmsWorkflowQueue,
} from "@/components/edms/dashboard-sections";
import { EdmsDataState } from "@/components/edms/data-state";
import { DocumentBulkUploadSheet } from "@/components/edms/document-bulk-upload-sheet";
import { DocumentCreateSheet } from "@/components/edms/document-create-sheet";
import { EdmsMetricCard } from "@/components/edms/metric-card";
import { EdmsPageHeader } from "@/components/edms/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEdmsDashboardData } from "@/lib/edms/dashboard";
import { getDocumentControlData } from "@/lib/edms/documents";
import { canManageEdmsContent } from "@/lib/edms/rbac";
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
  const [summaryData, dashboardData] = await Promise.all([
    getEdmsDashboardData(sessionUser),
    getDocumentControlData(sessionUser, params),
  ]);
  const [documentMetric, submittedMetric, reviewMetric, approvedMetric] = dashboardData.metrics;
  const canCreateDocument = canManageEdmsContent(sessionUser.role);

  return (
    <div className="flex flex-1 flex-col">
      <EdmsPageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Documents" }]}
        title="Document control"
        description="Monitor the latest revisions, filter the register quickly, and keep workflow and transmittal activity tied to the same controlled records."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/workflows">
                Review queue
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            {canCreateDocument ? (
              <>
                <DocumentBulkUploadSheet projects={dashboardData.projects} />
                <DocumentCreateSheet projects={dashboardData.projects} />
              </>
            ) : null}
          </>
        }
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <EdmsDataState
          isUsingFallbackData={dashboardData.isUsingFallbackData}
          message={dashboardData.statusMessage}
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <EdmsMetricCard metric={documentMetric} />
          <EdmsMetricCard metric={submittedMetric} />
          <EdmsMetricCard metric={reviewMetric} />
          <EdmsMetricCard metric={approvedMetric} />
        </section>

        <section className="rounded-3xl border border-border/70 bg-card/95 p-4 shadow-sm">
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_auto]">
            <Input
              name="query"
              defaultValue={params.query ?? ""}
              placeholder="Search by number, title, or project"
            />

            <select
              name="status"
              defaultValue={params.status ?? ""}
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
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
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
            >
              <option value="">All disciplines</option>
              {dashboardData.availableDisciplines.map((discipline) => (
                <option key={discipline} value={discipline}>
                  {discipline}
                </option>
              ))}
            </select>

            <select
              name="revision"
              defaultValue={params.revision ?? ""}
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
            >
              <option value="">All revisions</option>
              {dashboardData.availableRevisions.map((revision) => (
                <option key={revision} value={revision}>
                  {revision}
                </option>
              ))}
            </select>

            <Button type="submit">Filter</Button>
          </form>
        </section>

        <section>
          <EdmsDocumentTable documents={dashboardData.documents} />
        </section>

        {!canCreateDocument ? (
          <section className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
            Document registration is limited to vendor-level roles and above. You can still search,
            review, and inspect the controlled register from this screen.
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <EdmsWorkflowQueue items={summaryData.workflowQueue} />
          <EdmsTransmittalList items={summaryData.transmittals} />
        </section>
      </div>
    </div>
  );
}
