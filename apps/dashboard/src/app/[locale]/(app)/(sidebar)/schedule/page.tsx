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
import { ArrowRight, Calendar, TrendingUp } from "lucide-react";
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
import { getSchedulePageData } from "@/lib/edms/derived-pages";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Schedule & Progress | Quadra EDMS",
  description:
    "Live EDMS schedule and progress tracking derived from active project, workflow, and document data.",
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const PHASE_COLORS: Record<string, string> = {
  engineering: "bg-blue-500",
  procurement: "bg-amber-500",
  construction: "bg-emerald-600",
  commissioning: "bg-rose-500",
};

const PHASE_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  engineering: "default",
  procurement: "secondary",
  construction: "outline",
  commissioning: "destructive",
};

function getVarianceBadge(planned: number, actual: number) {
  const diff = actual - planned;

  if (planned === 0 && actual === 0) {
    return (
      <span className="font-mono text-xs text-muted-foreground">
        Not started
      </span>
    );
  }

  if (diff >= 0) {
    return <span className="font-mono text-xs text-emerald-600">On track</span>;
  }

  if (diff >= -10) {
    return <span className="font-mono text-xs text-amber-600">{diff}%</span>;
  }

  return <span className="font-mono text-xs text-rose-600">{diff}%</span>;
}

export default async function SchedulePage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const scheduleData = await getSchedulePageData(sessionUser);

  return (
    <HydrateClient>
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          <CollapsibleSummary>
            <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              {scheduleData.metrics.map((metric) => (
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
                  Schedule & Progress
                </h1>
                <p className="text-sm leading-6 text-muted-foreground md:text-base">
                  Live delivery schedule derived from project dates,
                  controlled-document progress, open workflow actions, and
                  transmittal activity across the EDMS portfolio.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PrintButton label="Export to PDF" variant="secondary" />
              <Button variant="outline" asChild>
                <Link href="/projects">
                  Projects
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/workflows">
                  Workflow queue
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <EdmsDataState
            isUsingFallbackData={scheduleData.isUsingFallbackData}
            message={scheduleData.statusMessage}
          />

          <ErrorBoundary errorComponent={ErrorFallback}>
            <Suspense
              fallback={
                <div className="text-sm text-muted-foreground">
                  Loading schedule...
                </div>
              }
            >
              <section className="flex flex-col gap-4">
                {scheduleData.activities.length === 0 ? (
                  <Card className="border-border bg-card shadow-sm">
                    <CardContent className="pt-6 text-sm text-muted-foreground">
                      No scheduled EDMS projects are available for the current
                      access scope.
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card className="border-border bg-card shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="size-4" />
                          Live portfolio timeline
                        </CardTitle>
                        <CardDescription>
                          Timeline positions come from project start and finish
                          dates. Planned progress follows elapsed time; actual
                          progress follows approved document completion.
                        </CardDescription>
                        <div className="flex flex-wrap gap-3 pt-2">
                          {Object.entries(PHASE_COLORS).map(
                            ([phase, color]) => (
                              <div
                                key={phase}
                                className="flex items-center gap-1.5 text-xs text-muted-foreground"
                              >
                                <div
                                  className={`size-2.5 rounded-sm ${color}`}
                                />
                                <span className="capitalize">{phase}</span>
                              </div>
                            ),
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="px-0 pb-0">
                        <div className="overflow-x-auto">
                          <div className="min-w-[960px]">
                            <div
                              className="grid border-b border-border"
                              style={{ gridTemplateColumns: "320px 1fr" }}
                            >
                              <div className="border-r border-border bg-muted/50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Project
                              </div>
                              <div className="grid grid-cols-12 bg-muted/50">
                                {MONTHS.map((month) => (
                                  <div
                                    key={month}
                                    className="border-r border-border px-1 py-2 text-center text-[10px] font-mono text-muted-foreground last:border-r-0"
                                  >
                                    {month}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {scheduleData.activities.map((activity) => (
                              <div
                                key={activity.id}
                                className="grid border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                                style={{ gridTemplateColumns: "320px 1fr" }}
                              >
                                <div className="flex flex-col justify-center gap-1 border-r border-border px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] text-muted-foreground">
                                      {activity.code}
                                    </span>
                                    <span className="truncate text-sm font-medium">
                                      {activity.name}
                                    </span>
                                  </div>
                                  <div className="ml-7 flex flex-wrap items-center gap-2">
                                    <Badge
                                      variant={
                                        PHASE_BADGE_VARIANT[activity.phase]
                                      }
                                      className="rounded-full text-[9px] px-1.5 py-0 capitalize"
                                    >
                                      {activity.phase}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground">
                                      {activity.linkedDocs} docs
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {activity.openWorkflowItems} open actions
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {activity.transmittals} packages
                                    </span>
                                  </div>
                                </div>

                                <div className="relative px-0 py-3">
                                  <div className="pointer-events-none absolute inset-0 grid grid-cols-12">
                                    {MONTHS.map((month) => (
                                      <div
                                        key={month}
                                        className="border-r border-border/40 last:border-r-0"
                                      />
                                    ))}
                                  </div>

                                  <div
                                    className={`absolute top-3 h-4 ${PHASE_COLORS[activity.phase]} rounded-sm opacity-25`}
                                    style={{
                                      left: `${activity.startPct}%`,
                                      width: `${activity.widthPct}%`,
                                    }}
                                  />

                                  <div
                                    className={`absolute top-3 flex h-4 items-center rounded-sm px-1.5 ${PHASE_COLORS[activity.phase]}`}
                                    style={{
                                      left: `${activity.startPct}%`,
                                      width: `${Math.max((activity.widthPct * activity.actual) / 100, 2)}%`,
                                    }}
                                  >
                                    {activity.actual >= 15 && (
                                      <span className="truncate text-[9px] font-mono font-semibold text-white">
                                        {activity.actual}%
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="size-4" />
                          Progress summary
                        </CardTitle>
                        <CardDescription>
                          Planned time progress vs. actual approved-document
                          completion by project.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="px-6">Code</TableHead>
                              <TableHead>Project</TableHead>
                              <TableHead>Phase</TableHead>
                              <TableHead>Start</TableHead>
                              <TableHead>Finish</TableHead>
                              <TableHead className="text-center">
                                Docs
                              </TableHead>
                              <TableHead className="text-center">
                                Open WF
                              </TableHead>
                              <TableHead>Planned %</TableHead>
                              <TableHead>Actual %</TableHead>
                              <TableHead className="px-6">Variance</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {scheduleData.activities.map((activity) => (
                              <TableRow
                                key={activity.id}
                                className="hover:bg-accent transition-colors"
                              >
                                <TableCell className="px-6">
                                  <span className="font-mono text-xs text-muted-foreground">
                                    {activity.code}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <p className="font-medium">
                                      {activity.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground capitalize">
                                      {activity.status}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      PHASE_BADGE_VARIANT[activity.phase]
                                    }
                                    className="rounded-full capitalize"
                                  >
                                    {activity.phase}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {activity.startLabel}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {activity.endLabel}
                                </TableCell>
                                <TableCell className="text-center font-mono text-xs">
                                  {activity.linkedDocs}
                                </TableCell>
                                <TableCell className="text-center font-mono text-xs">
                                  {activity.openWorkflowItems}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                      <div
                                        className={`h-full rounded-full ${PHASE_COLORS[activity.phase]}`}
                                        style={{
                                          width: `${activity.planned}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="font-mono text-xs">
                                      {activity.planned}%
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                      <div
                                        className={`h-full rounded-full ${
                                          activity.actual >= activity.planned
                                            ? "bg-emerald-500"
                                            : activity.planned -
                                                  activity.actual >
                                                10
                                              ? "bg-rose-500"
                                              : "bg-amber-500"
                                        }`}
                                        style={{ width: `${activity.actual}%` }}
                                      />
                                    </div>
                                    <span className="font-mono text-xs">
                                      {activity.actual}%
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-6">
                                  {getVarianceBadge(
                                    activity.planned,
                                    activity.actual,
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {scheduleData.phaseSummaries.map((summary) => (
                        <Card
                          key={summary.phase}
                          className="border-border bg-card shadow-sm"
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                              {summary.phase}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-3xl font-bold tabular-nums">
                              {summary.actualAverage}
                              <span className="text-lg font-normal text-muted-foreground">
                                %
                              </span>
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Average actual vs. {summary.plannedAverage}%
                              planned
                            </p>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full ${PHASE_COLORS[summary.phase]}`}
                                style={{ width: `${summary.actualAverage}%` }}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </section>
            </Suspense>
          </ErrorBoundary>
        </div>
      </ScrollableContent>
    </HydrateClient>
  );
}
