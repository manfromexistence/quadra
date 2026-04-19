import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { Button } from "@midday/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@midday/ui/card";
import { Badge } from "@midday/ui/badge";
import { Input } from "@midday/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import { ArrowRight, Clock, History, Search } from "lucide-react";
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
  title: "Audit Trail | Quadra EDMS",
  description: "Full system audit log covering all document actions, workflow decisions, transmittal events, and user activity.",
};

const AUDIT_ENTRIES = [
  {
    id: "AU-0042",
    timestamp: "2026-04-17 09:14",
    actor: "S. Kumar",
    actorRole: "Document Controller",
    action: "created_transmittal",
    actionLabel: "Created transmittal",
    detail: "TM-AHR-0042 issued to Client (Gulf National Petroleum Co.)",
    entityType: "transmittal",
    entityCode: "TM-AHR-0042",
    projectCode: "PRJ-AHR-2026",
  },
  {
    id: "AU-0041",
    timestamp: "2026-04-17 08:42",
    actor: "R. Patel",
    actorRole: "Civil Engineer",
    action: "uploaded_revision",
    actionLabel: "Uploaded revision",
    detail: "AHR-CIV-DWG-0001 Rev B — superseded Rev A",
    entityType: "document",
    entityCode: "AHR-CIV-DWG-0001",
    projectCode: "PRJ-AHR-2026",
  },
  {
    id: "AU-0040",
    timestamp: "2026-04-16 16:28",
    actor: "M. Chen",
    actorRole: "Structural Engineer",
    action: "status_change",
    actionLabel: "Status change",
    detail: "AHR-STR-CAL-0012 status changed: IFA → IFC (Approved for Construction)",
    entityType: "document",
    entityCode: "AHR-STR-CAL-0012",
    projectCode: "PRJ-AHR-2026",
  },
  {
    id: "AU-0039",
    timestamp: "2026-04-16 11:03",
    actor: "J. Okafor",
    actorRole: "Mechanical Engineer",
    action: "uploaded_document",
    actionLabel: "Uploaded document",
    detail: "AHR-MEC-SPC-0023 Rev C — Heat Exchanger Technical Specification",
    entityType: "document",
    entityCode: "AHR-MEC-SPC-0023",
    projectCode: "PRJ-AHR-2026",
  },
  {
    id: "AU-0038",
    timestamp: "2026-04-15 14:51",
    actor: "System",
    actorRole: "Automated",
    action: "reminder_sent",
    actionLabel: "Reminder sent",
    detail: "Client review overdue: AHR-ELE-DWG-0045 — Due Apr 12, 2026",
    entityType: "workflow",
    entityCode: "AHR-ELE-DWG-0045",
    projectCode: "PRJ-AHR-2026",
  },
  {
    id: "AU-0037",
    timestamp: "2026-04-15 09:30",
    actor: "S. Kumar",
    actorRole: "Document Controller",
    action: "updated_matrix",
    actionLabel: "Updated distribution matrix",
    detail: "Added Bureau Veritas (THP) to STR-CAL-IFA distribution rule",
    entityType: "config",
    entityCode: "STR-CAL-IFA",
    projectCode: "PRJ-AHR-2026",
  },
  {
    id: "AU-0036",
    timestamp: "2026-04-14 16:02",
    actor: "L. Nakamura",
    actorRole: "Electrical Engineer",
    action: "uploaded_document",
    actionLabel: "Uploaded document",
    detail: "AHR-ELE-DWG-0045 Rev A — Main Substation Single Line Diagram",
    entityType: "document",
    entityCode: "AHR-ELE-DWG-0045",
    projectCode: "PRJ-AHR-2026",
  },
  {
    id: "AU-0035",
    timestamp: "2026-04-13 10:18",
    actor: "A. Al-Rashid",
    actorRole: "Instrumentation Engineer",
    action: "workflow_decision",
    actionLabel: "Workflow decision",
    detail: "AHR-INS-DAT-0008 approved IFC by Discipline Lead. Code 1 — No comments.",
    entityType: "workflow",
    entityCode: "AHR-INS-DAT-0008",
    projectCode: "PRJ-AHR-2026",
  },
  {
    id: "AU-0034",
    timestamp: "2026-04-12 15:44",
    actor: "D. Silva",
    actorRole: "Piping Engineer",
    action: "uploaded_revision",
    actionLabel: "Uploaded revision",
    detail: "AHR-PIP-DWG-0067 Rev B — P&ID Crude Distillation Unit. Incorporates client comments.",
    entityType: "document",
    entityCode: "AHR-PIP-DWG-0067",
    projectCode: "PRJ-AHR-2026",
  },
  {
    id: "AU-0033",
    timestamp: "2026-04-11 09:05",
    actor: "S. Kumar",
    actorRole: "Document Controller",
    action: "created_transmittal",
    actionLabel: "Created transmittal",
    detail: "TM-AHR-0041 issued to KBR Supervision — IFC Instrumentation Datasheets",
    entityType: "transmittal",
    entityCode: "TM-AHR-0041",
    projectCode: "PRJ-AHR-2026",
  },
];

const ENTITY_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  document: "default",
  transmittal: "secondary",
  workflow: "outline",
  config: "destructive",
};

const ACTION_COLORS: Record<string, string> = {
  created_transmittal: "bg-emerald-500",
  uploaded_revision: "bg-blue-500",
  uploaded_document: "bg-blue-400",
  status_change: "bg-amber-500",
  reminder_sent: "bg-rose-400",
  updated_matrix: "bg-purple-500",
  workflow_decision: "bg-teal-500",
};

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; entityType?: string }>;
}) {
  const sessionUser = await getRequiredDashboardSessionUser();
  const data = await getEdmsDashboardData(sessionUser);
  const params = await searchParams;

  const filtered = AUDIT_ENTRIES.filter((entry) => {
    const q = params.query?.toLowerCase();
    const matchesQuery =
      !q ||
      entry.actor.toLowerCase().includes(q) ||
      entry.actionLabel.toLowerCase().includes(q) ||
      entry.detail.toLowerCase().includes(q) ||
      entry.entityCode.toLowerCase().includes(q);
    const matchesType = !params.entityType || entry.entityType === params.entityType;
    return matchesQuery && matchesType;
  });

  const totalEntries = AUDIT_ENTRIES.length;
  const documentEntries = AUDIT_ENTRIES.filter((e) => e.entityType === "document").length;
  const workflowEntries = AUDIT_ENTRIES.filter((e) => e.entityType === "workflow").length;
  const transmittalEntries = AUDIT_ENTRIES.filter((e) => e.entityType === "transmittal").length;

  const metrics = [
    {
      label: "Total events",
      value: String(totalEntries),
      description: "All audited system events in the displayed time window.",
      tone: "blue" as const,
      icon: "documents" as const,
    },
    {
      label: "Document events",
      value: String(documentEntries),
      description: "Uploads, revisions, and status changes on controlled documents.",
      tone: "emerald" as const,
      icon: "reviews" as const,
    },
    {
      label: "Workflow events",
      value: String(workflowEntries),
      description: "Review decisions, assignments, and overdue reminders.",
      tone: "amber" as const,
      icon: "transmittals" as const,
    },
    {
      label: "Transmittal events",
      value: String(transmittalEntries),
      description: "Formal issue package creation and acknowledgement events.",
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
                  Audit Trail
                </h1>
                <p className="text-sm leading-6 text-muted-foreground md:text-base">
                  Immutable log of all system actions — document uploads, revisions, workflow decisions,
                  transmittal events, and configuration changes. Full traceability for compliance and handover.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PrintButton label="Export to PDF" variant="secondary" />
              <Button variant="outline" asChild>
                <Link href="/workflows">
                  Workflow queue
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/reports">
                  Reports
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
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading audit trail...</div>}>
              <section className="flex flex-col gap-4">

                {/* Filters */}
                <Card className="border-border bg-card shadow-sm">
                  <CardContent className="pt-6">
                    <form className="flex flex-wrap gap-3">
                      <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          name="query"
                          defaultValue={params.query ?? ""}
                          placeholder="Search actor, action, document code..."
                          className="pl-9"
                        />
                      </div>
                      <select
                        name="entityType"
                        defaultValue={params.entityType ?? ""}
                        className="flex h-10 rounded-md border border-input bg-transparent px-3 text-sm min-w-40"
                      >
                        <option value="">All event types</option>
                        <option value="document">Documents</option>
                        <option value="transmittal">Transmittals</option>
                        <option value="workflow">Workflows</option>
                        <option value="config">Configuration</option>
                      </select>
                      <Button type="submit">Filter</Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Audit log table */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="size-4" />
                      System event log
                    </CardTitle>
                    <CardDescription>
                      {filtered.length} event{filtered.length !== 1 ? "s" : ""} shown
                      {params.query || params.entityType ? " (filtered)" : ""} · Most recent first
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    {filtered.length === 0 ? (
                      <div className="px-6 pb-6 text-sm text-muted-foreground">
                        No audit entries match your filter criteria.
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="px-6">
                              <span className="flex items-center gap-1.5">
                                <Clock className="size-3" />
                                Timestamp
                              </span>
                            </TableHead>
                            <TableHead>Actor</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Entity</TableHead>
                            <TableHead className="px-6">Detail</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filtered.map((entry) => (
                            <TableRow key={entry.id} className="group hover:bg-accent transition-colors align-top">
                              <TableCell className="px-6 py-4">
                                <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                                  {entry.timestamp}
                                </span>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`size-2 rounded-full shrink-0 ${ACTION_COLORS[entry.action] ?? "bg-muted-foreground"}`}
                                  />
                                  <div>
                                    <p className="font-medium text-sm">{entry.actor}</p>
                                    <p className="text-xs text-muted-foreground">{entry.actorRole}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <span className="text-sm">{entry.actionLabel}</span>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="space-y-1">
                                  <Badge
                                    variant={ENTITY_BADGE[entry.entityType] ?? "secondary"}
                                    className="rounded-full text-[10px] capitalize"
                                  >
                                    {entry.entityType}
                                  </Badge>
                                  <p className="font-mono text-xs text-muted-foreground">
                                    {entry.entityCode}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {entry.detail}
                                </p>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Timeline view */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle>Activity timeline</CardTitle>
                    <CardDescription>
                      Condensed chronological view of the most recent system events.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border" />

                      <div className="flex flex-col gap-0">
                        {AUDIT_ENTRIES.slice(0, 6).map((entry) => (
                          <div key={entry.id} className="relative flex gap-4 pb-5 last:pb-0">
                            {/* Dot */}
                            <div
                              className={`relative z-10 mt-1 size-[22px] shrink-0 rounded-full border-2 border-background ${ACTION_COLORS[entry.action] ?? "bg-muted-foreground"} flex items-center justify-center`}
                            />
                            {/* Content */}
                            <div className="min-w-0 flex-1 pt-0.5">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-medium">
                                    <span>{entry.actor}</span>{" "}
                                    <span className="font-normal text-muted-foreground">{entry.actionLabel.toLowerCase()}</span>
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-0.5">{entry.detail}</p>
                                </div>
                                <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                                  {entry.timestamp}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
