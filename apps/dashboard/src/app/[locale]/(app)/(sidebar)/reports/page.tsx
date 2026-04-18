import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { Button } from "@midday/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@midday/ui/card";
import { Badge } from "@midday/ui/badge";
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
  FileBarChart,
  FilePieChart,
  FileText,
  Download,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { CollapsibleSummary } from "@/components/collapsible-summary";
import { EdmsDataState } from "@/components/edms/data-state";
import { EdmsMetricCard } from "@/components/edms/metric-card";
import { EdmsStatusBadge } from "@/components/edms/status-badge";
import { ErrorFallback } from "@/components/error-fallback";
import { ScrollableContent } from "@/components/scrollable-content";
import { getEdmsDashboardData } from "@/lib/edms/dashboard";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { PrintButton } from "@/components/edms/print-button";
import { HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Reports | Quadra EDMS",
  description: "EDMS reporting suite including document status, transmittal logs, workflow analytics, and compliance summaries.",
};

const REPORT_CATALOG = [
  {
    id: "doc-status",
    icon: FileText,
    title: "Document Status Report",
    description:
      "Full register export showing current status, revision, and discipline for every controlled document in the project.",
    tag: "Document Control",
    frequency: "On demand",
    lastGenerated: "Apr 17, 2026",
    format: "XLSX / PDF",
    href: "/documents",
  },
  {
    id: "transmittal-log",
    icon: FileBarChart,
    title: "Transmittal Log",
    description:
      "Chronological list of all formal issue packages with recipient, purpose code, issue date, and acknowledgement status.",
    tag: "Transmittals",
    frequency: "Weekly",
    lastGenerated: "Apr 14, 2026",
    format: "PDF",
    href: "/transmittals",
  },
  {
    id: "workflow-analytics",
    icon: TrendingUp,
    title: "Workflow Performance",
    description:
      "Review cycle times, overdue steps, and approval rate breakdown across all active and completed workflows.",
    tag: "Workflows",
    frequency: "Weekly",
    lastGenerated: "Apr 14, 2026",
    format: "XLSX",
    href: "/workflows",
  },
  {
    id: "discipline-summary",
    icon: FilePieChart,
    title: "Discipline Document Summary",
    description:
      "Breakdown of document counts, IFR/IFA/IFC distribution, and outstanding reviews grouped by engineering discipline.",
    tag: "Document Control",
    frequency: "Monthly",
    lastGenerated: "Apr 01, 2026",
    format: "PDF",
    href: "/documents",
  },
  {
    id: "schedule-variance",
    icon: BarChart3,
    title: "Schedule Variance Report",
    description:
      "Planned vs. actual progress for all project activities with earned value indicators and critical path flags.",
    tag: "Planning",
    frequency: "Monthly",
    lastGenerated: "Apr 01, 2026",
    format: "PDF / XLSX",
    href: "/schedule",
  },
  {
    id: "databook-coverage",
    icon: FileText,
    title: "Data Book Coverage Report",
    description:
      "Section-by-section compilation progress showing collected, pending, and missing documents against the target register.",
    tag: "Handover",
    frequency: "Monthly",
    lastGenerated: "Apr 01, 2026",
    format: "PDF",
    href: "/databook",
  },
  {
    id: "audit-summary",
    icon: Clock,
    title: "Audit Trail Export",
    description:
      "Full audit log of all system actions, document revisions, workflow decisions, and user activity over a selected period.",
    tag: "Compliance",
    frequency: "On demand",
    lastGenerated: "Apr 17, 2026",
    format: "CSV / PDF",
    href: "/audit",
  },
];

const PREVIEW_ROWS = [
  { code: "AHR-CIV-DWG-0001", title: "Site Grading Plan — Phase 1", discipline: "Civil", rev: "B", status: "under_review" },
  { code: "AHR-STR-CAL-0012", title: "Primary Steel Structure Calculation", discipline: "Structural", rev: "0", status: "approved" },
  { code: "AHR-MEC-SPC-0023", title: "Heat Exchanger Technical Specification", discipline: "Mechanical", rev: "C", status: "submitted" },
  { code: "AHR-ELE-DWG-0045", title: "Main Substation Single Line Diagram", discipline: "Electrical", rev: "A", status: "under_review" },
  { code: "AHR-INS-DAT-0008", title: "Control Valve Datasheet — Unit 100", discipline: "Instrumentation", rev: "1", status: "approved" },
];

export default async function ReportsPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const data = await getEdmsDashboardData(sessionUser);

  const metrics = [
    {
      label: "Report types",
      value: String(REPORT_CATALOG.length),
      description: "Available report templates covering document control, workflows, and compliance.",
      tone: "blue" as const,
      icon: "documents" as const,
    },
    {
      label: "Documents tracked",
      value: data.metrics[1]?.value ?? "—",
      description: "Controlled documents contributing to all status and register reports.",
      tone: "emerald" as const,
      icon: "reviews" as const,
    },
    {
      label: "Open workflows",
      value: data.metrics[2]?.value ?? "—",
      description: "Active workflow steps reflected in performance and analytics reports.",
      tone: "amber" as const,
      icon: "transmittals" as const,
    },
    {
      label: "Transmittals issued",
      value: data.metrics[3]?.value ?? "—",
      description: "Formal packages included in transmittal log and compliance reports.",
      tone: "rose" as const,
      icon: "notifications" as const,
    },
  ];

  return (
    <HydrateClient>
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          <CollapsibleSummary>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
              {metrics.map((metric) => (
                <div key={metric.label}>
                  <EdmsMetricCard metric={metric} />
                </div>
              ))}
            </div>
          </CollapsibleSummary>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between print:hidden">
            <div className="max-w-3xl space-y-3">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Reports & Analytics
                </h1>
                <p className="text-sm leading-6 text-muted-foreground md:text-base">
                  Comprehensive reporting suite for document control, workflow tracking,
                  and compliance auditing across all EDMS modules.
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
            isUsingFallbackData={data.isUsingFallbackData}
            message={data.statusMessage}
          />

          <ErrorBoundary errorComponent={ErrorFallback}>
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading reports...</div>}>
              <section className="flex flex-col gap-6">

                {/* Report catalog */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Report catalog</h2>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {REPORT_CATALOG.map((report) => (
                      <Link key={report.id} href={report.href} className="block">
                        <Card className="h-full border-border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/40 cursor-pointer group">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex size-10 items-center justify-center border border-border bg-muted">
                                <report.icon className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                              <Badge variant="secondary" className="rounded-full text-xs shrink-0">
                                {report.tag}
                              </Badge>
                            </div>
                            <CardTitle className="text-base group-hover:text-primary transition-colors">
                              {report.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-3">
                              {report.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground border-t border-border pt-3">
                              <div className="flex items-center gap-3">
                                <span>
                                  <span className="font-medium text-foreground">Format:</span>{" "}
                                  {report.format}
                                </span>
                                <span>
                                  <span className="font-medium text-foreground">Cadence:</span>{" "}
                                  {report.frequency}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Download className="size-3" />
                                <span>Last: {report.lastGenerated}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Document Status Preview */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle>Document Status Report — Live Preview</CardTitle>
                        <CardDescription>
                          Snapshot from the live document register. Reflects current status, revision, and discipline for the project portfolio.
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
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-6">Document No.</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Discipline</TableHead>
                          <TableHead>Rev</TableHead>
                          <TableHead className="px-6">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {PREVIEW_ROWS.map((row) => (
                          <TableRow key={row.code} className="hover:bg-accent transition-colors">
                            <TableCell className="px-6">
                              <span className="font-mono text-xs font-medium">{row.code}</span>
                            </TableCell>
                            <TableCell>{row.title}</TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">{row.discipline}</span>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-xs">{row.rev}</span>
                            </TableCell>
                            <TableCell className="px-6">
                              <EdmsStatusBadge status={row.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="px-6 py-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Showing 5 of {data.metrics[1]?.value ?? "—"} controlled documents.{" "}
                        <Link href="/documents" className="underline hover:text-foreground transition-colors">
                          View full register →
                        </Link>
                      </p>
                    </div>
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
