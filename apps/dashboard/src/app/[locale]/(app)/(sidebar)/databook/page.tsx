import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { Button } from "@midday/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@midday/ui/card";
import { Badge } from "@midday/ui/badge";
import { Progress } from "@midday/ui/progress";
import { ArrowRight, BookOpen, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { CollapsibleSummary } from "@/components/collapsible-summary";
import { EdmsDataState } from "@/components/edms/data-state";
import { EdmsMetricCard } from "@/components/edms/metric-card";
import { ErrorFallback } from "@/components/error-fallback";
import { ScrollableContent } from "@/components/scrollable-content";
import { getEdmsDashboardData } from "@/lib/edms/dashboard";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { HydrateClient } from "@/trpc/server";
import { PrintButton } from "@/components/edms/print-button";

export const metadata: Metadata = {
  title: "Data Book | Quadra EDMS",
  description: "Final project data book compilation tracker with section coverage and missing document alerts.",
};

const DATABOOK_SECTIONS = [
  {
    code: "SEC-01",
    title: "Project Overview & General Arrangement",
    required: 8,
    collected: 6,
    docs: [
      { code: "AHR-PRO-RPT-0003", title: "Process Simulation Report", status: "collected" },
      { code: "AHR-CIV-DWG-0001", title: "Site Grading Plan", status: "collected" },
      { code: "AHR-GEN-DWG-0001", title: "Overall Plot Plan", status: "missing" },
      { code: "AHR-GEN-DWG-0002", title: "Block Flow Diagram", status: "collected" },
    ],
  },
  {
    code: "SEC-02",
    title: "Engineering Design Documents",
    required: 24,
    collected: 18,
    docs: [
      { code: "AHR-STR-CAL-0012", title: "Primary Steel Structure Calculation", status: "collected" },
      { code: "AHR-MEC-SPC-0023", title: "Heat Exchanger Technical Specification", status: "collected" },
      { code: "AHR-PIP-DWG-0067", title: "P&ID — Crude Distillation Unit", status: "collected" },
      { code: "AHR-ELE-DWG-0045", title: "Main Substation SLD", status: "pending" },
    ],
  },
  {
    code: "SEC-03",
    title: "Vendor Data & Technical Submittals",
    required: 42,
    collected: 28,
    docs: [
      { code: "VND-SIE-001", title: "Transformer — Factory Test Certificate", status: "collected" },
      { code: "VND-SIE-002", title: "Switchgear — GA Drawings", status: "collected" },
      { code: "VND-FLO-001", title: "Control Valve — Datasheet Package", status: "pending" },
    ],
  },
  {
    code: "SEC-04",
    title: "Inspection & Test Reports (ITRs)",
    required: 36,
    collected: 22,
    docs: [
      { code: "ITR-CIV-001", title: "Concrete Cube Test — Foundation F-101", status: "collected" },
      { code: "ITR-WLD-012", title: "Weld NDT Report — Spool SP-2301", status: "collected" },
      { code: "ITR-PRE-005", title: "Hydrotest Certificate — Line 24-P-101", status: "missing" },
    ],
  },
  {
    code: "SEC-05",
    title: "Material Certificates & Traceability",
    required: 58,
    collected: 41,
    docs: [
      { code: "MTC-ST-2301", title: "Mill Test Certificate — Pipe Spool SP-2301", status: "collected" },
      { code: "MTC-ST-2302", title: "Mill Test Certificate — Pipe Spool SP-2302", status: "collected" },
    ],
  },
  {
    code: "SEC-06",
    title: "Commissioning & Handover Records",
    required: 18,
    collected: 0,
    docs: [
      { code: "COM-MCC-001", title: "Mechanical Completion Certificate", status: "missing" },
      { code: "COM-PTW-001", title: "Pre-commissioning Punch List", status: "missing" },
    ],
  },
  {
    code: "SEC-07",
    title: "As-Built Drawings",
    required: 34,
    collected: 0,
    docs: [{ code: "AB-CIV-0001", title: "As-Built Site Grading", status: "missing" }],
  },
  {
    code: "SEC-08",
    title: "O&M Manuals & Spare Parts Lists",
    required: 22,
    collected: 3,
    docs: [{ code: "OM-HTX-001", title: "Heat Exchanger O&M Manual", status: "collected" }],
  },
];

const TOTAL_REQUIRED = DATABOOK_SECTIONS.reduce((s, sec) => s + sec.required, 0);
const TOTAL_COLLECTED = DATABOOK_SECTIONS.reduce((s, sec) => s + sec.collected, 0);
const TOTAL_MISSING = DATABOOK_SECTIONS.reduce(
  (s, sec) => s + sec.docs.filter((d) => d.status === "missing").length,
  0
);
const TOTAL_PENDING = DATABOOK_SECTIONS.reduce(
  (s, sec) => s + sec.docs.filter((d) => d.status === "pending").length,
  0
);

function StatusIcon({ status }: { status: string }) {
  if (status === "collected") return <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />;
  if (status === "pending") return <Clock className="size-3.5 text-amber-500 shrink-0" />;
  return <XCircle className="size-3.5 text-rose-500 shrink-0" />;
}

function getCoverageColor(pct: number) {
  if (pct >= 80) return "text-emerald-600";
  if (pct >= 50) return "text-amber-600";
  return "text-rose-600";
}

export default async function DatabookPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const data = await getEdmsDashboardData(sessionUser);
  const overallPct = Math.round((TOTAL_COLLECTED / TOTAL_REQUIRED) * 100);

  const metrics = [
    {
      label: "Overall coverage",
      value: `${overallPct}%`,
      description: "Percentage of required data book documents that have been collected.",
      tone: "blue" as const,
      icon: "documents" as const,
    },
    {
      label: "Documents collected",
      value: String(TOTAL_COLLECTED),
      description: `Of ${TOTAL_REQUIRED} total required across all sections.`,
      tone: "emerald" as const,
      icon: "reviews" as const,
    },
    {
      label: "Pending receipt",
      value: String(TOTAL_PENDING),
      description: "Documents expected but not yet received from vendors or site.",
      tone: "amber" as const,
      icon: "transmittals" as const,
    },
    {
      label: "Missing documents",
      value: String(TOTAL_MISSING),
      description: "Required documents not yet submitted or tracked in the register.",
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
                  Data Book
                </h1>
                <p className="text-sm leading-6 text-muted-foreground md:text-base">
                  Final project data book compilation tracker. Monitor section coverage, identify
                  missing documents, and track receipt status across all handover deliverables.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Title: Final Project Data Book — Revision DRAFT 02</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">Target: Dec 15, 2026</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PrintButton label="Export to PDF" variant="secondary" />
              <Button variant="outline" asChild>
                <Link href="/documents">
                  Document register
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
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading data book...</div>}>
              <section className="flex flex-col gap-4">

                {/* Overall coverage card */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="size-4" />
                      Overall compilation progress
                    </CardTitle>
                    <CardDescription>
                      {TOTAL_COLLECTED} of {TOTAL_REQUIRED} required documents collected across {DATABOOK_SECTIONS.length} sections.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Progress value={overallPct} className="h-3" />
                      </div>
                      <span className={`text-2xl font-bold tabular-nums ${getCoverageColor(overallPct)}`}>
                        {overallPct}%
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        <span className="text-muted-foreground">Collected:</span>
                        <span className="font-semibold tabular-nums">{TOTAL_COLLECTED}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="size-4 text-amber-500" />
                        <span className="text-muted-foreground">Pending:</span>
                        <span className="font-semibold tabular-nums">{TOTAL_PENDING}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <XCircle className="size-4 text-rose-500" />
                        <span className="text-muted-foreground">Missing:</span>
                        <span className="font-semibold tabular-nums">{TOTAL_MISSING}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sections */}
                <div className="flex flex-col gap-3">
                  {DATABOOK_SECTIONS.map((section) => {
                    const pct = section.required > 0
                      ? Math.round((section.collected / section.required) * 100)
                      : 0;
                    const missingCount = section.docs.filter((d) => d.status === "missing").length;

                    return (
                      <Card key={section.code} className="border-border bg-card shadow-sm">
                        <CardHeader className="pb-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs border border-border bg-muted px-2 py-0.5">
                                  {section.code}
                                </span>
                                <CardTitle className="text-base">{section.title}</CardTitle>
                              </div>
                              <CardDescription>
                                {section.collected} of {section.required} documents collected
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              {missingCount > 0 && (
                                <Badge variant="destructive" className="gap-1 rounded-full">
                                  <AlertTriangle className="size-3" />
                                  {missingCount} missing
                                </Badge>
                              )}
                              <span className={`text-xl font-bold tabular-nums ${getCoverageColor(pct)}`}>
                                {pct}%
                              </span>
                            </div>
                          </div>
                          <Progress value={pct} className="h-1.5 mt-2" />
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-col gap-1.5">
                            {section.docs.map((doc) => (
                              <div
                                key={doc.code}
                                className="flex items-center gap-2.5 rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm hover:bg-muted/60 transition-colors"
                              >
                                <StatusIcon status={doc.status} />
                                <span className="font-mono text-xs text-muted-foreground shrink-0 w-32 truncate">
                                  {doc.code}
                                </span>
                                <span className="flex-1 truncate">{doc.title}</span>
                                <Badge
                                  variant={
                                    doc.status === "collected"
                                      ? "secondary"
                                      : doc.status === "pending"
                                      ? "outline"
                                      : "destructive"
                                  }
                                  className="rounded-full text-[10px] capitalize shrink-0"
                                >
                                  {doc.status}
                                </Badge>
                              </div>
                            ))}
                            {section.required > section.docs.length && (
                              <p className="text-xs text-muted-foreground pl-1 pt-1">
                                + {section.required - section.docs.length} more documents in this section
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

              </section>
            </Suspense>
          </ErrorBoundary>
        </div>
      </ScrollableContent>
    </HydrateClient>
  );
}
