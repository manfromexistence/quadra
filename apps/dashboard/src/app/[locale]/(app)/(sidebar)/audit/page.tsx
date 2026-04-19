import { Button } from "@midday/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@midday/ui/card";
import { Input } from "@midday/ui/input";
import { ArrowRight, History, Search } from "lucide-react";
import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import Link from "next/link";
import { Suspense } from "react";
import { CollapsibleSummary } from "@/components/collapsible-summary";
import { EdmsDataState } from "@/components/edms/data-state";
import { EdmsMetricCard } from "@/components/edms/metric-card";
import { PrintButton } from "@/components/edms/print-button";
import { ErrorFallback } from "@/components/error-fallback";
import { ScrollableContent } from "@/components/scrollable-content";
import { getAuditPageData } from "@/lib/edms/derived-pages";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Audit Trail | Quadra EDMS",
  description:
    "Live audit trail for EDMS project, document, workflow, and transmittal activity.",
};

const ACTION_COLORS: Record<string, string> = {
  project_created: "bg-emerald-500",
  project_update: "bg-blue-500",
  document_uploaded: "bg-blue-500",
  document_submitted: "bg-blue-400",
  document_approved: "bg-emerald-500",
  workflow_created: "bg-amber-500",
  workflow_assigned: "bg-amber-500",
  transmittal_sent: "bg-rose-500",
  transmittal_received: "bg-rose-400",
};

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; entityType?: string }>;
}) {
  const sessionUser = await getRequiredDashboardSessionUser();
  const params = await searchParams;
  const auditData = await getAuditPageData(sessionUser, params);

  return (
    <HydrateClient>
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          <CollapsibleSummary>
            <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              {auditData.metrics.map((metric) => (
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
                  Audit Trail
                </h1>
                <p className="text-sm leading-6 text-muted-foreground md:text-base">
                  Immutable activity stream from the live EDMS workspace. Audit
                  records are pulled from the actual activity log and filtered
                  to the current user’s project access.
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
            isUsingFallbackData={auditData.isUsingFallbackData}
            message={auditData.statusMessage}
          />

          <ErrorBoundary errorComponent={ErrorFallback}>
            <Suspense
              fallback={
                <div className="text-sm text-muted-foreground">
                  Loading audit trail...
                </div>
              }
            >
              <section className="flex flex-col gap-4">
                <Card className="border-border bg-card shadow-sm">
                  <CardContent className="pt-6">
                    <form className="flex flex-wrap gap-3">
                      <div className="relative min-w-48 flex-1">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
                        className="flex h-10 min-w-40 rounded-md border border-input bg-transparent px-3 text-sm"
                      >
                        <option value="">All event types</option>
                        <option value="project">Projects</option>
                        <option value="document">Documents</option>
                        <option value="workflow">Workflows</option>
                        <option value="transmittal">Transmittals</option>
                      </select>
                      <Button type="submit">Filter</Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="size-4" />
                      Audit log
                    </CardTitle>
                    <CardDescription>
                      {auditData.entries.length} event
                      {auditData.entries.length !== 1 ? "s" : ""} shown
                      {params.query || params.entityType ? " (filtered)" : ""} ·
                      Immutable log of all document and configuration actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {auditData.entries.length === 0 ? (
                      <div className="px-6 pb-6 pt-2 text-sm text-muted-foreground">
                        No audit entries match your filter criteria.
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {auditData.entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex gap-3 px-6 py-3 transition-colors hover:bg-accent/50"
                          >
                            <div className="min-w-[110px] shrink-0">
                              <span className="font-mono text-[10.5px] text-muted-foreground">
                                {entry.timestamp}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`size-1.5 shrink-0 rounded-full ${
                                    ACTION_COLORS[entry.action] ??
                                    "bg-muted-foreground"
                                  }`}
                                />
                                <p className="text-sm">
                                  <span className="font-medium">
                                    {entry.actor}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {" "}
                                    — {entry.actionLabel}
                                  </span>
                                </p>
                              </div>
                              <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                                {entry.detail}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle>Activity timeline</CardTitle>
                    <CardDescription>
                      Condensed chronological view of the latest visible audit
                      events.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {auditData.entries.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No timeline events available.
                      </p>
                    ) : (
                      <div className="relative">
                        <div className="absolute bottom-0 left-[11px] top-0 w-px bg-border" />
                        <div className="flex flex-col gap-0">
                          {auditData.entries.slice(0, 6).map((entry) => (
                            <div
                              key={`timeline-${entry.id}`}
                              className="relative flex gap-4 pb-5 last:pb-0"
                            >
                              <div
                                className={`relative z-10 mt-1 flex size-[22px] shrink-0 items-center justify-center rounded-full border-2 border-background ${
                                  ACTION_COLORS[entry.action] ??
                                  "bg-muted-foreground"
                                }`}
                              />
                              <div className="min-w-0 flex-1 pt-0.5">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-medium">
                                      <span>{entry.actor}</span>{" "}
                                      <span className="font-normal text-muted-foreground">
                                        {entry.actionLabel.toLowerCase()}
                                      </span>
                                    </p>
                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                      {entry.detail}
                                    </p>
                                  </div>
                                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                                    {entry.timestamp}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
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
