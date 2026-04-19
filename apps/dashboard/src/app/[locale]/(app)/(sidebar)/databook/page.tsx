import { Badge } from "@midday/ui/badge";
import { Button } from "@midday/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@midday/ui/card";
import { Progress } from "@midday/ui/progress";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
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
import { getDatabookPageData } from "@/lib/edms/derived-pages";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Data Book | Quadra EDMS",
  description:
    "Live data-book compilation view derived from controlled document categories and approval state.",
};

function StatusIcon({
  status,
}: {
  status: "collected" | "pending" | "missing";
}) {
  if (status === "collected") {
    return <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />;
  }

  if (status === "pending") {
    return <Clock className="size-3.5 shrink-0 text-amber-500" />;
  }

  return <XCircle className="size-3.5 shrink-0 text-rose-500" />;
}

function getCoverageColor(pct: number) {
  if (pct >= 80) {
    return "text-emerald-600";
  }

  if (pct >= 50) {
    return "text-amber-600";
  }

  return "text-rose-600";
}

export default async function DatabookPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const databookData = await getDatabookPageData(sessionUser);

  const overallPct =
    databookData.totalRequired > 0
      ? Math.round(
          (databookData.totalCollected / databookData.totalRequired) * 100,
        )
      : 0;

  const metrics = [
    {
      label: "Overall coverage",
      value: `${overallPct}%`,
      description:
        "Approved document share across the live EDMS data-book categories.",
      tone: "blue" as const,
      icon: "documents" as const,
    },
    {
      label: "Documents collected",
      value: String(databookData.totalCollected),
      description: `Of ${databookData.totalRequired} controlled records currently tracked.`,
      tone: "emerald" as const,
      icon: "reviews" as const,
    },
    {
      label: "Pending receipt",
      value: String(databookData.totalPending),
      description:
        "Submitted or under-review records that are not yet fully approved.",
      tone: "amber" as const,
      icon: "transmittals" as const,
    },
    {
      label: "Missing / draft",
      value: String(databookData.totalMissing),
      description:
        "Draft or otherwise incomplete records still blocking package closeout.",
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
                  Data Book
                </h1>
                <p className="text-sm leading-6 text-muted-foreground md:text-base">
                  Handover compilation view built from the real EDMS register.
                  Sections are grouped by live document category or discipline
                  and update as records move through review.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Default theme package: Quadra
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">
                  Target finish: {databookData.targetLabel}
                </span>
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
            isUsingFallbackData={databookData.isUsingFallbackData}
            message={databookData.statusMessage}
          />

          <ErrorBoundary errorComponent={ErrorFallback}>
            <Suspense
              fallback={
                <div className="text-sm text-muted-foreground">
                  Loading data book...
                </div>
              }
            >
              <section className="flex flex-col gap-4">
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="size-4" />
                      Overall compilation progress
                    </CardTitle>
                    <CardDescription>
                      {databookData.totalCollected} of{" "}
                      {databookData.totalRequired} tracked records are approved
                      across {databookData.sections.length} live sections.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Progress value={overallPct} className="h-3" />
                      </div>
                      <span
                        className={`text-2xl font-bold tabular-nums ${getCoverageColor(overallPct)}`}
                      >
                        {overallPct}%
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        <span className="text-muted-foreground">
                          Collected:
                        </span>
                        <span className="font-semibold tabular-nums">
                          {databookData.totalCollected}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="size-4 text-amber-500" />
                        <span className="text-muted-foreground">Pending:</span>
                        <span className="font-semibold tabular-nums">
                          {databookData.totalPending}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <XCircle className="size-4 text-rose-500" />
                        <span className="text-muted-foreground">Missing:</span>
                        <span className="font-semibold tabular-nums">
                          {databookData.totalMissing}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {databookData.sections.length === 0 ? (
                  <Card className="border-border bg-card shadow-sm">
                    <CardContent className="pt-6 text-sm text-muted-foreground">
                      No EDMS document categories are available for the current
                      access scope.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex flex-col gap-3">
                    {databookData.sections.map((section) => {
                      const pct =
                        section.required > 0
                          ? Math.round(
                              (section.collected / section.required) * 100,
                            )
                          : 0;

                      return (
                        <Card
                          key={section.code}
                          className="border-border bg-card shadow-sm"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="border border-border bg-muted px-2 py-0.5 font-mono text-xs">
                                    {section.code}
                                  </span>
                                  <CardTitle className="text-base">
                                    {section.title}
                                  </CardTitle>
                                </div>
                                <CardDescription>
                                  {section.collected} approved of{" "}
                                  {section.required} tracked records
                                </CardDescription>
                              </div>
                              <div className="flex items-center gap-2">
                                {section.pending > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="rounded-full"
                                  >
                                    {section.pending} pending
                                  </Badge>
                                )}
                                {section.missing > 0 && (
                                  <Badge
                                    variant="destructive"
                                    className="rounded-full"
                                  >
                                    {section.missing} draft/missing
                                  </Badge>
                                )}
                                <span
                                  className={`text-xl font-bold tabular-nums ${getCoverageColor(pct)}`}
                                >
                                  {pct}%
                                </span>
                              </div>
                            </div>
                            <Progress value={pct} className="mt-2 h-1.5" />
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex flex-col gap-1.5">
                              {section.docs.map((doc) => (
                                <div
                                  key={`${section.code}-${doc.code}`}
                                  className="flex items-center gap-2.5 rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm transition-colors hover:bg-muted/60"
                                >
                                  <StatusIcon status={doc.status} />
                                  <span className="w-36 shrink-0 truncate font-mono text-xs text-muted-foreground">
                                    {doc.code}
                                  </span>
                                  <span className="min-w-0 flex-1 truncate">
                                    {doc.title}
                                  </span>
                                  <span className="hidden text-xs text-muted-foreground md:block">
                                    {doc.projectName}
                                  </span>
                                  <Badge
                                    variant={
                                      doc.status === "collected"
                                        ? "secondary"
                                        : doc.status === "pending"
                                          ? "outline"
                                          : "destructive"
                                    }
                                    className="shrink-0 rounded-full text-[10px] capitalize"
                                  >
                                    {doc.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </section>
            </Suspense>
          </ErrorBoundary>
        </div>
      </ScrollableContent>
    </HydrateClient>
  );
}
