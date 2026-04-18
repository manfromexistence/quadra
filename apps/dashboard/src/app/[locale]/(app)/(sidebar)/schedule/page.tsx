import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { Button } from "@midday/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@midday/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import { Badge } from "@midday/ui/badge";
import { ArrowRight, Calendar, Clock, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import { CollapsibleSummary } from "@/components/collapsible-summary";
import { EdmsDataState } from "@/components/edms/data-state";
import { EdmsMetricCard } from "@/components/edms/metric-card";
import { ErrorFallback } from "@/components/error-fallback";
import { ScrollableContent } from "@/components/scrollable-content";
import { getEdmsDashboardData } from "@/lib/edms/dashboard";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Schedule & Progress | Quadra EDMS",
  description: "Engineering document schedule, Gantt progress tracking, and delivery milestones.",
};

// Static schedule data mirroring the HTML reference (real app would pull from P6/DB)
const SCHEDULE_ACTIVITIES = [
  {
    id: "A1000",
    wbs: "1.1",
    name: "Front-End Engineering Design",
    phase: "engineering",
    startLabel: "Jan 15 2026",
    endLabel: "Mar 31 2026",
    planned: 100,
    actual: 100,
    linkedDocs: 1,
    startPct: 0,
    widthPct: 25,
  },
  {
    id: "A1010",
    wbs: "1.2",
    name: "Civil & Structural Design",
    phase: "engineering",
    startLabel: "Feb 01 2026",
    endLabel: "May 30 2026",
    planned: 72,
    actual: 68,
    linkedDocs: 3,
    startPct: 3,
    widthPct: 36,
  },
  {
    id: "A1020",
    wbs: "1.3",
    name: "Mechanical & Piping Design",
    phase: "engineering",
    startLabel: "Feb 15 2026",
    endLabel: "Jun 30 2026",
    planned: 60,
    actual: 55,
    linkedDocs: 2,
    startPct: 5,
    widthPct: 42,
  },
  {
    id: "A1030",
    wbs: "1.4",
    name: "Electrical & Instrumentation",
    phase: "engineering",
    startLabel: "Mar 01 2026",
    endLabel: "Jul 15 2026",
    planned: 45,
    actual: 38,
    linkedDocs: 2,
    startPct: 8,
    widthPct: 47,
  },
  {
    id: "A2000",
    wbs: "2.1",
    name: "Long-Lead Equipment Procurement",
    phase: "procurement",
    startLabel: "Mar 15 2026",
    endLabel: "Aug 30 2026",
    planned: 35,
    actual: 32,
    linkedDocs: 0,
    startPct: 11,
    widthPct: 53,
  },
  {
    id: "A2010",
    wbs: "2.2",
    name: "Bulk Material Procurement",
    phase: "procurement",
    startLabel: "May 01 2026",
    endLabel: "Sep 30 2026",
    planned: 10,
    actual: 8,
    linkedDocs: 0,
    startPct: 25,
    widthPct: 50,
  },
  {
    id: "A3000",
    wbs: "3.1",
    name: "Site Preparation & Grading",
    phase: "construction",
    startLabel: "Apr 15 2026",
    endLabel: "Jul 30 2026",
    planned: 25,
    actual: 18,
    linkedDocs: 1,
    startPct: 19,
    widthPct: 36,
  },
  {
    id: "A3010",
    wbs: "3.2",
    name: "Civil & Foundation Works",
    phase: "construction",
    startLabel: "Jun 01 2026",
    endLabel: "Oct 30 2026",
    planned: 5,
    actual: 3,
    linkedDocs: 0,
    startPct: 33,
    widthPct: 50,
  },
  {
    id: "A4000",
    wbs: "4.1",
    name: "Pre-Commissioning",
    phase: "commissioning",
    startLabel: "Oct 15 2026",
    endLabel: "Nov 30 2026",
    planned: 0,
    actual: 0,
    linkedDocs: 0,
    startPct: 72,
    widthPct: 14,
  },
  {
    id: "A4010",
    wbs: "4.2",
    name: "Commissioning & Handover",
    phase: "commissioning",
    startLabel: "Nov 15 2026",
    endLabel: "Dec 31 2026",
    planned: 0,
    actual: 0,
    linkedDocs: 0,
    startPct: 81,
    widthPct: 19,
  },
];

const PHASE_COLORS: Record<string, string> = {
  engineering: "bg-blue-500",
  procurement: "bg-amber-500",
  construction: "bg-emerald-600",
  commissioning: "bg-rose-500",
};

const PHASE_BADGE_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  engineering: "default",
  procurement: "secondary",
  construction: "outline",
  commissioning: "destructive",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getVarianceBadge(planned: number, actual: number) {
  const diff = actual - planned;
  if (planned === 0 && actual === 0) return null;
  if (diff >= 0) return <span className="font-mono text-xs text-emerald-600">On track</span>;
  if (diff >= -5) return <span className="font-mono text-xs text-amber-600">{diff}%</span>;
  return <span className="font-mono text-xs text-rose-600">{diff}%</span>;
}

export default async function SchedulePage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const data = await getEdmsDashboardData(sessionUser);

  const totalActivities = SCHEDULE_ACTIVITIES.length;
  const completedActivities = SCHEDULE_ACTIVITIES.filter((a) => a.actual >= 100).length;
  const inProgressActivities = SCHEDULE_ACTIVITIES.filter((a) => a.actual > 0 && a.actual < 100).length;
  const behindActivities = SCHEDULE_ACTIVITIES.filter((a) => a.actual < a.planned && a.planned > 0).length;

  const metrics = [
    {
      label: "Total activities",
      value: String(totalActivities),
      description: "Engineering, procurement, construction, and commissioning activities.",
      tone: "blue" as const,
      icon: "documents" as const,
    },
    {
      label: "Completed",
      value: String(completedActivities),
      description: "Activities that have reached 100% actual progress.",
      tone: "emerald" as const,
      icon: "reviews" as const,
    },
    {
      label: "In progress",
      value: String(inProgressActivities),
      description: "Currently active activities with partial progress recorded.",
      tone: "amber" as const,
      icon: "transmittals" as const,
    },
    {
      label: "Behind schedule",
      value: String(behindActivities),
      description: "Activities where actual progress lags behind the baseline plan.",
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

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Schedule & Progress
                </h1>
                <p className="text-sm leading-6 text-muted-foreground md:text-base">
                  Baseline vs. actual progress for all engineering, procurement, construction, and
                  commissioning activities linked to controlled documents.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/documents">
                  Document register
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/projects">
                  Projects
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
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading schedule...</div>}>
              <section className="flex flex-col gap-4">

                {/* Gantt Chart Card */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      Gantt — Project Timeline 2026
                    </CardTitle>
                    <CardDescription>
                      Source: Primavera P6 — Master Schedule v12 · Last sync: Apr 14, 2026 08:00
                    </CardDescription>
                    {/* Phase legend */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      {Object.entries(PHASE_COLORS).map(([phase, color]) => (
                        <div key={phase} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <div className={`size-2.5 rounded-sm ${color}`} />
                          <span className="capitalize">{phase}</span>
                        </div>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    {/* Month header row */}
                    <div className="overflow-x-auto">
                      <div className="min-w-[860px]">
                        {/* Month labels */}
                        <div className="grid border-b border-border" style={{ gridTemplateColumns: "280px 1fr" }}>
                          <div className="border-r border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50">
                            Activity
                          </div>
                          <div className="grid grid-cols-12 bg-muted/50">
                            {MONTHS.map((m) => (
                              <div
                                key={m}
                                className="border-r border-border px-1 py-2 text-center text-[10px] font-mono text-muted-foreground last:border-r-0"
                              >
                                {m}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Activity rows */}
                        {SCHEDULE_ACTIVITIES.map((activity) => (
                          <div
                            key={activity.id}
                            className="grid border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                            style={{ gridTemplateColumns: "280px 1fr" }}
                          >
                            {/* Label */}
                            <div className="border-r border-border px-4 py-3 flex flex-col justify-center gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                                  {activity.wbs}
                                </span>
                                <span className="text-sm font-medium truncate">{activity.name}</span>
                              </div>
                              <div className="flex items-center gap-2 ml-7">
                                <Badge
                                  variant={PHASE_BADGE_VARIANT[activity.phase]}
                                  className="rounded-full text-[9px] px-1.5 py-0"
                                >
                                  {activity.phase}
                                </Badge>
                                {activity.linkedDocs > 0 && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {activity.linkedDocs} doc{activity.linkedDocs !== 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Gantt bar */}
                            <div className="relative py-3 px-0">
                              {/* Month grid lines */}
                              <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                                {MONTHS.map((m) => (
                                  <div key={m} className="border-r border-border/40 last:border-r-0" />
                                ))}
                              </div>

                              {/* Planned bar */}
                              <div
                                className={`absolute top-3 h-4 ${PHASE_COLORS[activity.phase]} opacity-30 rounded-sm`}
                                style={{
                                  left: `${activity.startPct}%`,
                                  width: `${activity.widthPct}%`,
                                }}
                              />

                              {/* Actual progress bar */}
                              {activity.actual > 0 && (
                                <div
                                  className={`absolute top-3 h-4 ${PHASE_COLORS[activity.phase]} rounded-sm flex items-center px-1.5`}
                                  style={{
                                    left: `${activity.startPct}%`,
                                    width: `${(activity.widthPct * activity.actual) / 100}%`,
                                    minWidth: "2px",
                                  }}
                                >
                                  {activity.actual >= 20 && (
                                    <span className="text-[9px] font-mono text-white font-semibold truncate">
                                      {activity.actual}%
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Not started indicator */}
                              {activity.planned === 0 && activity.actual === 0 && (
                                <div
                                  className={`absolute top-3 h-4 border-2 ${PHASE_COLORS[activity.phase].replace("bg-", "border-")} rounded-sm`}
                                  style={{
                                    left: `${activity.startPct}%`,
                                    width: `${activity.widthPct}%`,
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Detail Table */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="size-4" />
                      Progress summary
                    </CardTitle>
                    <CardDescription>
                      Planned vs. actual progress percentages and variance flags for all activities.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-6">WBS</TableHead>
                          <TableHead>Activity</TableHead>
                          <TableHead>Phase</TableHead>
                          <TableHead>Start</TableHead>
                          <TableHead>Finish</TableHead>
                          <TableHead>Planned %</TableHead>
                          <TableHead>Actual %</TableHead>
                          <TableHead className="px-6">Variance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {SCHEDULE_ACTIVITIES.map((activity) => (
                          <TableRow key={activity.id} className="group hover:bg-accent transition-colors">
                            <TableCell className="px-6">
                              <span className="font-mono text-xs text-muted-foreground">{activity.wbs}</span>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-medium">{activity.name}</p>
                                <p className="font-mono text-xs text-muted-foreground">{activity.id}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={PHASE_BADGE_VARIANT[activity.phase]}
                                className="rounded-full capitalize"
                              >
                                {activity.phase}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{activity.startLabel}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{activity.endLabel}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${PHASE_COLORS[activity.phase]}`}
                                    style={{ width: `${activity.planned}%` }}
                                  />
                                </div>
                                <span className="font-mono text-xs">{activity.planned}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      activity.actual >= activity.planned
                                        ? "bg-emerald-500"
                                        : activity.planned - activity.actual > 5
                                        ? "bg-rose-500"
                                        : "bg-amber-500"
                                    }`}
                                    style={{ width: `${activity.actual}%` }}
                                  />
                                </div>
                                <span className="font-mono text-xs">{activity.actual}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-6">
                              {getVarianceBadge(activity.planned, activity.actual)}
                              {activity.planned === 0 && activity.actual === 0 && (
                                <span className="font-mono text-xs text-muted-foreground">Not started</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Milestone summary */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Engineering
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold tabular-nums">69<span className="text-lg font-normal text-muted-foreground">%</span></p>
                      <p className="text-sm text-muted-foreground mt-1">Average actual vs. 69% planned</p>
                      <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: "69%" }} />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Procurement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold tabular-nums">20<span className="text-lg font-normal text-muted-foreground">%</span></p>
                      <p className="text-sm text-muted-foreground mt-1">Average actual vs. 23% planned</p>
                      <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-amber-500" style={{ width: "20%" }} />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Construction
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold tabular-nums">11<span className="text-lg font-normal text-muted-foreground">%</span></p>
                      <p className="text-sm text-muted-foreground mt-1">Average actual vs. 15% planned</p>
                      <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-600" style={{ width: "11%" }} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

              </section>
            </Suspense>
          </ErrorBoundary>
        </div>
      </ScrollableContent>
    </HydrateClient>
  );
}
