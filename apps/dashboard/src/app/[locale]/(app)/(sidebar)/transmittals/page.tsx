import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
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
import { CollapsibleSummary } from "@/components/collapsible-summary";
import { EdmsDataState } from "@/components/edms/data-state";
import { EdmsMetricCard } from "@/components/edms/metric-card";
import { EdmsStatusBadge } from "@/components/edms/status-badge";
import { ErrorFallback } from "@/components/error-fallback";
import { ScrollableContent } from "@/components/scrollable-content";
import { ExportButton } from "@/components/edms/export-button";
import { PrintButton } from "@/components/edms/print-button";
import { TransmittalCreateSheet } from "@/components/edms/transmittal-create-sheet";
import { getEdmsDashboardData } from "@/lib/edms/dashboard";
import { canManageEdmsContent } from "@/lib/edms/rbac";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { getTransmittalManagementData } from "@/lib/edms/transmittals";
import { HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Transmittals | Quadra EDMS",
};

export default async function TransmittalsPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const [summaryData, data] = await Promise.all([
    getEdmsDashboardData(sessionUser),
    getTransmittalManagementData(sessionUser),
  ]);
  const canManageContent = canManageEdmsContent(sessionUser.role);

  // Prepare export data
  const exportData = data.transmittals.map((t) => ({
    transmittalNumber: t.transmittalNumber,
    subject: t.subject,
    projectName: t.projectName,
    status: t.status,
    recipientName: t.recipientName,
    documentCount: t.documentCount,
    sentDate: t.sentLabel,
  }));

  const exportColumns = [
    { header: "Transmittal No.", key: "transmittalNumber", width: 25 },
    { header: "Subject", key: "subject", width: 40 },
    { header: "Project", key: "projectName", width: 30 },
    { header: "Status", key: "status", width: 15 },
    { header: "Recipient", key: "recipientName", width: 25 },
    { header: "Documents", key: "documentCount", width: 12 },
    { header: "Sent Date", key: "sentDate", width: 20 },
  ];

  return (
    <HydrateClient>
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          <CollapsibleSummary>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
              {data.metrics.map((metric, index) => {
                const links = ["/transmittals", "/documents", "/workflows", "/notifications"];
                return (
                  <Link key={metric.label} href={links[index] || "/transmittals"} className="block h-full">
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
                  Transmittals
                </h1>
                <p className="text-sm leading-6 text-muted-foreground md:text-base">
                  Delivery-package tracking for outbound submissions and acknowledgements 
                  with comprehensive transmittal management and review workflow.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ExportButton
                data={exportData}
                columns={exportColumns}
                title="Transmittals"
                filename="transmittals_export"
                variant="secondary"
                metadata={[
                  { label: "Generated", value: new Date().toLocaleDateString() },
                  { label: "Total Records", value: String(data.transmittals.length) },
                ]}
              />
              <PrintButton label="Print" variant="outline" icon="print" />
              {canManageContent ? (
                <>
                  <Button asChild>
                    <Link href="/transmittals/new">
                      New Transmittal
                    </Link>
                  </Button>
                  <TransmittalCreateSheet
                    projects={data.projects}
                    members={data.members}
                    documents={data.documents}
                  />
                </>
              ) : null}
              <Button variant="outline" asChild>
                <Link href="/documents">
                  Open register
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/workflows">
                  Review queue
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <EdmsDataState
            isUsingFallbackData={data.isUsingFallbackData}
            message={data.statusMessage}
          />

          <ErrorBoundary errorComponent={ErrorFallback}>
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading transmittals...</div>}>
              <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Issued packages</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {data.transmittals.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                No transmittals found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Package</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead className="px-6">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.transmittals.map((item) => (
                    <TableRow key={item.id} className="group cursor-pointer transition-colors hover:bg-accent">
                      <TableCell className="px-6">
                        <Link href={`/transmittals/${item.id}`} className="block">
                          <div className="space-y-1">
                            <p className="font-medium group-hover:text-primary">{item.subject}</p>
                            <p className="font-mono text-xs text-muted-foreground">
                              {item.transmittalNumber}
                            </p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>{item.projectName}</TableCell>
                      <TableCell>
                        <EdmsStatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>{item.recipientName}</TableCell>
                      <TableCell>{item.documentCount}</TableCell>
                      <TableCell className="px-6 text-sm text-muted-foreground">
                        {item.sentLabel}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Workflow spillover</CardTitle>
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
              </section>
            </Suspense>
          </ErrorBoundary>
        </div>
      </ScrollableContent>
    </HydrateClient>
  );
}
