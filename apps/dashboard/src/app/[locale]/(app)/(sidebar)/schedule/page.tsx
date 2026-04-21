import { Badge } from "@midday/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { LinkDocumentsButton } from "@/components/edms/link-documents-button";
import { ScheduleSyncButton } from "@/components/edms/schedule-sync-button";
import { ErrorFallback } from "@/components/error-fallback";
import { ScheduleTable } from "@/components/schedule-table";
import { ScrollableContent } from "@/components/scrollable-content";
import { getDocuments } from "@/lib/edms/documents";
import { getSchedulePageData } from "@/lib/edms/schedule";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Schedule & Progress | Quadra EDMS",
  description:
    "Integrated view of the project schedule merged with the document register.",
};

const PHASE_COLORS = {
  engineering: "bg-blue-600",
  procurement: "bg-amber-600",
  construction: "bg-emerald-700",
  commissioning: "bg-red-600",
};

const PHASE_LABELS = {
  engineering: "Engineering",
  procurement: "Procurement",
  construction: "Construction",
  commissioning: "Commissioning",
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

function calculatePosition(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const yearStart = new Date("2026-01-01");
  const totalDays = 365;

  const startDay = Math.max(
    0,
    Math.floor((start.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const endDay = Math.floor(
    (end.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  const leftPct = (startDay / totalDays) * 100;
  const widthPct = ((endDay - startDay) / totalDays) * 100;

  return { leftPct, widthPct };
}

export default async function SchedulePage() {
  const sessionUser = await getRequiredDashboardSessionUser();

  // Get the user's active project (first project for now)
  const projectId = sessionUser.activeProjectId || "PRJ-AHR-2026";

  return (
    <HydrateClient>
      <ScrollableContent>
        <ErrorBoundary errorComponent={ErrorFallback}>
          <Suspense
            fallback={
              <div className="text-sm text-muted-foreground">
                Loading schedule...
              </div>
            }
          >
            <ScheduleContent sessionUser={sessionUser} projectId={projectId} />
          </Suspense>
        </ErrorBoundary>
      </ScrollableContent>
    </HydrateClient>
  );
}

async function ScheduleContent({
  sessionUser,
  projectId,
}: {
  sessionUser: any;
  projectId: string;
}) {
  const scheduleData = await getSchedulePageData(projectId);

  const totalPlanned =
    scheduleData.activities.reduce((s, a) => s + a.planned, 0) /
    scheduleData.activities.length;
  const totalActual =
    scheduleData.activities.reduce((s, a) => s + a.actual, 0) /
    scheduleData.activities.length;
  const variance = totalActual - totalPlanned;
  const totalLinkedDocs = scheduleData.activities.reduce(
    (s, a) => s + a.linkedDocs.length,
    0,
  );

  // Prepare data for dialogs
  const activities = scheduleData.activities.map((a) => ({
    id: a.id,
    name: a.name,
    wbs: a.wbs,
  }));

  // Fetch documents from database
  const documents = await getDocuments(projectId);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-3">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Schedule & Progress
            </h1>
            <p className="text-sm leading-6 text-muted-foreground md:text-base">
              Integrated view of the project schedule merged with the document
              register. Link deliverables to WBS activities for earned-value
              tracking.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ScheduleSyncButton projectId={projectId} />
          <LinkDocumentsButton
            activities={activities}
            documents={documents}
            projectId={projectId}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 bg-border border border-border">
        <div className="bg-card p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Schedule Source
          </div>
          <div className="text-base font-mono font-medium mt-1.5">
            Primavera P6
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Last sync: {scheduleData.lastSync}
          </div>
        </div>
        <div className="bg-card p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Planned Progress
          </div>
          <div className="text-3xl font-serif font-normal">
            {totalPlanned.toFixed(1)}
            <span className="text-base">%</span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">As of today</div>
        </div>
        <div className="bg-card p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Actual Progress
          </div>
          <div className="text-3xl font-serif font-normal">
            {totalActual.toFixed(1)}
            <span className="text-base">%</span>
          </div>
          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
            <Badge
              variant={variance >= 0 ? "default" : "destructive"}
              className="font-mono text-[10px]"
            >
              {variance >= 0 ? "+" : ""}
              {variance.toFixed(1)}%
            </Badge>
            vs plan
          </div>
        </div>
        <div className="bg-card p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Linked Documents
          </div>
          <div className="text-3xl font-serif font-normal">
            {totalLinkedDocs}{" "}
            <span className="text-base text-muted-foreground">/ 50</span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Across {scheduleData.activities.length} activities
          </div>
        </div>
      </div>

      <Card className="rounded-lg border-border bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gantt Overview</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {scheduleData.projectStart} → {scheduleData.projectEnd}
              </p>
            </div>
            <div className="flex gap-2">
              {Object.entries(PHASE_LABELS).map(([key, label]) => (
                <Badge
                  key={key}
                  className={`${PHASE_COLORS[key as keyof typeof PHASE_COLORS]} text-white border-0`}
                >
                  ● {label}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-[320px_1fr] border-b border-border bg-muted">
                <div className="p-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Activity
                </div>
                <div className="relative p-3">
                  <div className="grid grid-cols-12 gap-0">
                    {MONTHS.map((month, index) => (
                      <div
                        key={`month-header-${index}`}
                        className="text-xs text-muted-foreground font-mono text-center border-r border-border last:border-r-0"
                      >
                        {month}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gantt Rows */}
              {scheduleData.activities.map((activity) => {
                const { leftPct, widthPct } = calculatePosition(
                  activity.start,
                  activity.end,
                );
                const progress =
                  activity.planned > 0
                    ? (activity.actual / activity.planned) * 100
                    : 0;

                return (
                  <div
                    key={activity.id}
                    className="grid grid-cols-[320px_1fr] border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="p-3 border-r border-border">
                      <div className="font-medium text-sm">{activity.name}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-1">
                        {activity.activityCode} · WBS {activity.wbs} ·{" "}
                        {activity.linkedDocs.length} docs linked
                      </div>
                    </div>
                    <div className="relative p-3">
                      <div className="grid grid-cols-12 gap-0 h-full">
                        {MONTHS.map((_, i) => (
                          <div
                            key={`month-grid-${activity.id}-${i}`}
                            className="border-r border-border/30 last:border-r-0"
                          />
                        ))}
                      </div>
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-5 ${PHASE_COLORS[activity.phase as keyof typeof PHASE_COLORS]} text-white text-[10px] px-2 flex items-center font-mono overflow-hidden`}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        title={`${activity.actual}% complete`}
                      >
                        <div
                          className="absolute inset-0 bg-black/25"
                          style={{
                            width: `${100 - progress}%`,
                            right: 0,
                            left: "auto",
                          }}
                        />
                        <span className="relative z-10 truncate">
                          {activity.actual}% · {activity.name.slice(0, 20)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-border bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity ↔ Document Mapping</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Documents are progress indicators for WBS activities
              </p>
            </div>
            <Badge variant="secondary" className="uppercase tracking-wider">
              WBS Linkage
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <ScheduleTable activities={scheduleData.activities} />
        </CardContent>
      </Card>
    </div>
  );
}
