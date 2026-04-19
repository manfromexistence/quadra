import { Badge } from "@midday/ui/badge";
import { Button } from "@midday/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@midday/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import {
  ArrowRight,
  BarChart3,
  Clock,
  Download,
  FileBarChart,
  FilePieChart,
  FileText,
  TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import Link from "next/link";
import { Suspense } from "react";
import { CollapsibleSummary } from "@/components/collapsible-summary";
import { EdmsDataState } from "@/components/edms/data-state";
import { EdmsMetricCard } from "@/components/edms/metric-card";
import { PrintButton } from "@/components/edms/print-button";
import { EdmsStatusBadge } from "@/components/edms/status-badge";
import { ErrorFallback } from "@/components/error-fallback";
import { ScrollableContent } from "@/components/scrollable-content";
import { getEdmsDashboardData } from "@/lib/edms/dashboard";
import { getReportsPageData } from "@/lib/edms/derived-pages";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Reports | Quadra EDMS",
  description:
    "Live EDMS reporting suite for document control, workflow tracking, and compliance.",
};

const REPORT_CATALOG = [
  {
    id: "doc-status",
    icon: FileText,
    title: "Document Status Report",
    description:
      "Full register export showing current status, revision, and discipline for every controlled document in scope.",
    tag: "Document Control",
    frequency: "On demand",
    format: "XLSX / PDF",
    href: "/documents",
  },
  {
    id: "transmittal-log",
    icon: FileBarChart,
    title: "Transmittal Log",
    description:
      "Chronological list of formal issue packages with recipients, issue dates, and acknowledgement state.",
    tag: "Transmittals",
    frequency: "Weekly",
    format: "PDF",
    href: "/transmittals",
  },
  {
    id: "workflow-analytics",
    icon: TrendingUp,
    title: "Workflow Performance",
    description:
      "Review-cycle visibility across active steps, overdue actions, and approval completion.",
    tag: "Workflows",
    frequency: "Weekly",
    format: "XLSX",
    href: "/workflows",
  },
  {
    id: "discipline-summary",
    icon: FilePieChart,
    title: "Discipline Document Summary",
    description:
      "Breakdown of document counts and approval state grouped by live discipline and category data.",
    tag: "Document Control",
    frequency: "Monthly",
    format: "PDF",
    href: "/documents",
  },
  {
    id: "schedule-variance",
    icon: BarChart3,
    title: "Schedule Variance Report",
    description:
      "Planned vs. actual project progress based on active EDMS portfolio dates and approved document ratios.",
    tag: "Planning",
    frequency: "Monthly",
    format: "PDF / XLSX",
    href: "/schedule",
  },
  {
    id: "audit-summary",
    icon: Clock,
    title: "Audit Trail Export",
    description:
      "Full activity export covering project, document, workflow, and transmittal events in the visible workspace.",
    tag: "Compliance",
    frequency: "On demand",
    format: "CSV / PDF",
    href: "/audit",
  },
];

export default async function ReportsPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const dashboardData = await getEdmsDashboardData(sessionUser);
  const reportsData = await getReportsPageData(sessionUser);

  const metrics = [
    {
      label: "Report types",
      value: String(REPORT_CATALOG.length),
      description:
        "Available EDMS report surfaces connected to live dashboard modules.",
      tone: "blue" as const,
      icon: "documents" as const,
    },
    {
      label: "Documents tracked",
      value: dashboardData.metrics[1]?.value ?? "—",
      description:
        "Controlled documents contributing to the register and status reports.",
      tone: "emerald" as const,
      icon: "reviews" as const,
    },
    {
      label: "Open workflows",
      value: dashboardData.metrics[2]?.value ?? "—",
      description:
        "Pending review steps reflected in workflow analytics and audit exports.",
      tone: "amber" as const,
      icon: "transmittals" as const,
    },
    {
      label: "Open transmittals",
      value: dashboardData.metrics[3]?.value ?? "—",
      description:
        "Issue packages reflected in transmittal and compliance reporting.",
      tone: "rose" as const,
      icon: "notifications" as const,
    },
  ];

  return (
    <HydrateClient>
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          <CollapsibleSummary>
            <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              {metrics.map((metric) => (
                <div key={metric.label}>
                  <EdmsMetricCard metric={metric} />
                </div>
              ))}
            </div>
          </CollapsibleSummary>

          <div className="flex flex-col gap-4 print:hidden md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Reports & Analytics
                </h1>
                <p className="text-sm leading-6 text-muted-foreground md:text-base">
                  Reporting surfaces connected to the live EDMS dataset. Catalog
                  entries route into the underlying modules and the preview
                  below reflects the real document register.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PrintButton label="Export to PDF" variant="secondary" />
              <Button variant="outline" asChild>
                <Link href="/audit">
                  <Clock className="size-4" />
                  Full Audit Trail
                </Link>
              </Button>
            </div>
          </div>

          <EdmsDataState
            isUsingFallbackData={reportsData.isUsingFallbackData}
            message={reportsData.statusMessage}
          />

          <ErrorBoundary errorComponent={ErrorFallback}>
            <Suspense
              fallback={
                <div className="text-sm text-muted-foreground">
                  Loading reports...
                </div>
              }
            >
              <section className="flex flex-col gap-6">
                <div>
                  <h2 className="mb-4 text-lg font-semibold">Report catalog</h2>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {REPORT_CATALOG.map((report) => (
                      <Link
                        key={report.id}
                        href={report.href}
                        className="block"
                      >
                        <Card className="group h-full cursor-pointer border-border bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex size-10 items-center justify-center border border-border bg-muted">
                                <report.icon className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                              </div>
                              <Badge
                                variant="secondary"
                                className="shrink-0 rounded-full text-xs"
                              >
                                {report.tag}
                              </Badge>
                            </div>
                            <CardTitle className="text-base transition-colors group-hover:text-primary">
                              {report.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-3">
                              {report.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-3">
                                <span>
                                  <span className="font-medium text-foreground">
                                    Format:
                                  </span>{" "}
                                  {report.format}
                                </span>
                                <span>
                                  <span className="font-medium text-foreground">
                                    Cadence:
                                  </span>{" "}
                                  {report.frequency}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Download className="size-3" />
                                <span>
                                  Last: {reportsData.lastGeneratedLabel}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>

                <Card className="border-border bg-card shadow-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle>
                          Document Status Report — Live Preview
                        </CardTitle>
                        <CardDescription>
                          Snapshot from the live document register. Last
                          generated from the workspace on{" "}
                          {reportsData.lastGeneratedLabel}.
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/documents">
                          Full register
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-0">
                    {reportsData.previewRows.length === 0 ? (
                      <div className="px-6 pb-6 text-sm text-muted-foreground">
                        No controlled documents are available for preview in the
                        current access scope.
                      </div>
                    ) : (
                      <>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="px-6">
                                Document No.
                              </TableHead>
                              <TableHead>Title</TableHead>
                              <TableHead>Discipline</TableHead>
                              <TableHead>Rev</TableHead>
                              <TableHead className="px-6">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportsData.previewRows.map((row) => (
                              <TableRow
                                key={row.code}
                                className="transition-colors hover:bg-accent"
                              >
                                <TableCell className="px-6">
                                  <span className="font-mono text-xs font-medium">
                                    {row.code}
                                  </span>
                                </TableCell>
                                <TableCell>{row.title}</TableCell>
                                <TableCell>
                                  <span className="text-sm text-muted-foreground">
                                    {row.discipline}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="font-mono text-xs">
                                    {row.rev}
                                  </span>
                                </TableCell>
                                <TableCell className="px-6">
                                  <EdmsStatusBadge status={row.status} />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <div className="border-t border-border px-6 py-3">
                          <p className="text-xs text-muted-foreground">
                            Showing {reportsData.previewRows.length} of{" "}
                            {dashboardData.metrics[1]?.value ?? "—"} controlled
                            documents.{" "}
                            <Link
                              href="/documents"
                              className="underline transition-colors hover:text-foreground"
                            >
                              View full register →
                            </Link>
                          </p>
                        </div>
                      </>
                    )}
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
