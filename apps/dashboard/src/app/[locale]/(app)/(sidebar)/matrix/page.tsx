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
import { ArrowRight, Grid3X3, Info } from "lucide-react";
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
  title: "Distribution Matrix | Quadra EDMS",
  description: "Document distribution matrix showing which stakeholders receive which document types and for what purpose.",
};

const STAKEHOLDERS = [
  { id: "CLT", name: "Gulf National Petroleum", role: "Client", short: "Client" },
  { id: "EPC", name: "Meridian Engineering", role: "EPC Contractor", short: "EPC" },
  { id: "SUP", name: "KBR Supervision Ltd.", role: "Supervisor", short: "Supervisor" },
  { id: "VND", name: "Siemens Energy", role: "Vendor", short: "Vendor" },
  { id: "THP", name: "Bureau Veritas", role: "Third Party", short: "3rd Party" },
];

const MATRIX_ROWS = [
  {
    key: "MEC-SPC-IFA",
    discipline: "Mechanical",
    docType: "Specification",
    purpose: "IFA",
    distribution: { CLT: "A", SUP: "R", EPC: "I", VND: null, THP: null },
  },
  {
    key: "CIV-DWG-IFC",
    discipline: "Civil",
    docType: "Drawing",
    purpose: "IFC",
    distribution: { CLT: "I", SUP: "A", EPC: "I", VND: null, THP: null },
  },
  {
    key: "STR-CAL-IFA",
    discipline: "Structural",
    docType: "Calculation",
    purpose: "IFA",
    distribution: { CLT: "A", SUP: "R", EPC: null, VND: null, THP: "R" },
  },
  {
    key: "ELE-DWG-IFR",
    discipline: "Electrical",
    docType: "Drawing",
    purpose: "IFR",
    distribution: { CLT: "I", SUP: null, EPC: "R", VND: null, THP: null },
  },
  {
    key: "INS-DAT-IFA",
    discipline: "Instrumentation",
    docType: "Datasheet",
    purpose: "IFA",
    distribution: { CLT: "R", SUP: "I", EPC: null, VND: "A", THP: null },
  },
  {
    key: "PIP-DWG-IFA",
    discipline: "Piping",
    docType: "Drawing",
    purpose: "IFA",
    distribution: { CLT: "A", SUP: "R", EPC: "I", VND: null, THP: null },
  },
  {
    key: "PRO-RPT-IFR",
    discipline: "Process",
    docType: "Report",
    purpose: "IFR",
    distribution: { CLT: "I", SUP: null, EPC: "R", VND: null, THP: null },
  },
];

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  A: { label: "Approve", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200" },
  R: { label: "Review", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200" },
  I: { label: "Info", className: "bg-muted text-muted-foreground border-border" },
};

const PURPOSE_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  IFR: "secondary",
  IFA: "default",
  IFC: "outline",
};

function RoleCell({ role }: { role: string | null }) {
  if (!role) {
    return <span className="text-muted-foreground/30 text-sm">—</span>;
  }
  const config = ROLE_CONFIG[role];
  if (!config) return null;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold border rounded-sm ${config.className}`}
    >
      {role}
    </span>
  );
}

export default async function MatrixPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const data = await getEdmsDashboardData(sessionUser);

  const totalRoles = MATRIX_ROWS.reduce((sum, row) => {
    return sum + Object.values(row.distribution).filter(Boolean).length;
  }, 0);
  const approvalRoles = MATRIX_ROWS.reduce((sum, row) => {
    return sum + Object.values(row.distribution).filter((v) => v === "A").length;
  }, 0);
  const reviewRoles = MATRIX_ROWS.reduce((sum, row) => {
    return sum + Object.values(row.distribution).filter((v) => v === "R").length;
  }, 0);

  const metrics = [
    {
      label: "Matrix entries",
      value: String(MATRIX_ROWS.length),
      description: "Discipline / doc-type / purpose combinations configured in the distribution matrix.",
      tone: "blue" as const,
      icon: "documents" as const,
    },
    {
      label: "Stakeholders",
      value: String(STAKEHOLDERS.length),
      description: "Project parties included in the distribution matrix.",
      tone: "emerald" as const,
      icon: "reviews" as const,
    },
    {
      label: "Approval roles",
      value: String(approvalRoles),
      description: "Stakeholder assignments requiring formal approval decisions.",
      tone: "amber" as const,
      icon: "transmittals" as const,
    },
    {
      label: "Review roles",
      value: String(reviewRoles),
      description: "Stakeholder assignments for technical or compliance review.",
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
                  Distribution Matrix
                </h1>
                <p className="text-sm leading-6 text-muted-foreground md:text-base">
                  Defines which stakeholders receive which document types and at what purpose code.
                  Role codes: <strong>A</strong> = Approve · <strong>R</strong> = Review · <strong>I</strong> = Information only.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PrintButton label="Export to PDF" variant="secondary" />
              <Button variant="outline" asChild>
                <Link href="/transmittals">
                  Transmittals
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
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
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading distribution matrix...</div>}>
              <section className="flex flex-col gap-4">

                {/* Stakeholder legend */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Info className="size-4" />
                      Project stakeholders
                    </CardTitle>
                    <CardDescription>
                      Parties included in the distribution matrix. Column headers in the matrix use the short codes below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                      {STAKEHOLDERS.map((stakeholder) => (
                        <div
                          key={stakeholder.id}
                          className="rounded-md border border-border bg-muted/30 px-3 py-2"
                        >
                          <p className="font-mono text-xs font-semibold">{stakeholder.id}</p>
                          <p className="text-sm font-medium truncate">{stakeholder.name}</p>
                          <p className="text-xs text-muted-foreground">{stakeholder.role}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Role code legend */}
                <div className="flex flex-wrap gap-3">
                  {Object.entries(ROLE_CONFIG).map(([code, config]) => (
                    <div key={code} className="flex items-center gap-2 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold border rounded-sm ${config.className}`}>
                        {code}
                      </span>
                      <span className="text-muted-foreground">{config.label}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground/30 text-sm w-8 text-center">—</span>
                    <span className="text-muted-foreground">Not distributed</span>
                  </div>
                </div>

                {/* Main matrix table */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Grid3X3 className="size-4" />
                      Distribution matrix
                    </CardTitle>
                    <CardDescription>
                      {MATRIX_ROWS.length} document class configurations · {totalRoles} total stakeholder assignments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-6">Discipline</TableHead>
                          <TableHead>Doc Type</TableHead>
                          <TableHead>Purpose</TableHead>
                          {STAKEHOLDERS.map((s) => (
                            <TableHead key={s.id} className="text-center">
                              <span className="font-mono text-xs">{s.id}</span>
                              <span className="block text-[10px] font-normal text-muted-foreground">
                                {s.short}
                              </span>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {MATRIX_ROWS.map((row) => (
                          <TableRow key={row.key} className="hover:bg-accent transition-colors">
                            <TableCell className="px-6">
                              <span className="font-medium">{row.discipline}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">{row.docType}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={PURPOSE_VARIANT[row.purpose] ?? "secondary"} className="rounded-full font-mono text-xs">
                                {row.purpose}
                              </Badge>
                            </TableCell>
                            {STAKEHOLDERS.map((s) => (
                              <TableCell key={s.id} className="text-center">
                                <RoleCell role={row.distribution[s.id as keyof typeof row.distribution]} />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Summary by stakeholder */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle>Stakeholder summary</CardTitle>
                    <CardDescription>
                      Number of document classes each stakeholder is assigned as approver, reviewer, or information recipient.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-6">Stakeholder</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-center">Approve (A)</TableHead>
                          <TableHead className="text-center">Review (R)</TableHead>
                          <TableHead className="text-center px-6">Info (I)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {STAKEHOLDERS.map((stakeholder) => {
                          const a = MATRIX_ROWS.filter(
                            (r) => r.distribution[stakeholder.id as keyof typeof r.distribution] === "A"
                          ).length;
                          const r = MATRIX_ROWS.filter(
                            (row) => row.distribution[stakeholder.id as keyof typeof row.distribution] === "R"
                          ).length;
                          const i = MATRIX_ROWS.filter(
                            (row) => row.distribution[stakeholder.id as keyof typeof row.distribution] === "I"
                          ).length;

                          return (
                            <TableRow key={stakeholder.id} className="hover:bg-accent transition-colors">
                              <TableCell className="px-6">
                                <div className="space-y-0.5">
                                  <p className="font-medium">{stakeholder.name}</p>
                                  <p className="font-mono text-xs text-muted-foreground">{stakeholder.id}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">{stakeholder.role}</span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="font-mono text-sm font-semibold text-emerald-600">{a}</span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="font-mono text-sm font-semibold text-blue-600">{r}</span>
                              </TableCell>
                              <TableCell className="text-center px-6">
                                <span className="font-mono text-sm text-muted-foreground">{i}</span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
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
