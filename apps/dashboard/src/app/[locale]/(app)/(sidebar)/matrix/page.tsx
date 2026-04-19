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
import { ArrowRight, Grid3X3, Info } from "lucide-react";
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
import { getMatrixPageData } from "@/lib/edms/derived-pages";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Distribution Matrix | Quadra EDMS",
  description:
    "Live distribution matrix derived from project stakeholders and transmittal issue history.",
};

function MatrixCountCell({ count }: { count: number }) {
  if (count <= 0) {
    return <span className="text-sm text-muted-foreground/40">—</span>;
  }

  return (
    <span className="inline-flex min-w-8 items-center justify-center rounded-sm border border-border bg-muted px-2 py-0.5 text-xs font-semibold">
      {count}
    </span>
  );
}

export default async function MatrixPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const matrixData = await getMatrixPageData(sessionUser);

  const totalIssuedDocuments = matrixData.rows.reduce(
    (sum, row) => sum + row.issuedDocuments,
    0,
  );

  const metrics = [
    {
      label: "Matrix entries",
      value: String(matrixData.rows.length),
      description:
        "Distinct discipline and document-type combinations found in the live EDMS register.",
      tone: "blue" as const,
      icon: "documents" as const,
    },
    {
      label: "Stakeholders",
      value: String(matrixData.stakeholders.length),
      description:
        "Project members participating in the live transmittal distribution graph.",
      tone: "emerald" as const,
      icon: "reviews" as const,
    },
    {
      label: "Issued documents",
      value: String(totalIssuedDocuments),
      description:
        "Controlled records that have been linked to outbound transmittals.",
      tone: "amber" as const,
      icon: "transmittals" as const,
    },
    {
      label: "Distribution links",
      value: String(matrixData.totalLinks),
      description:
        "Recipient hits derived from actual transmittal recipient and document mappings.",
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
                  Distribution Matrix
                </h1>
                <p className="text-sm leading-6 text-muted-foreground md:text-base">
                  Live matrix of who receives which document classes. Counts
                  represent actual issue frequency from real transmittal
                  packages, not mock approval codes.
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
            isUsingFallbackData={matrixData.isUsingFallbackData}
            message={matrixData.statusMessage}
          />

          <ErrorBoundary errorComponent={ErrorFallback}>
            <Suspense
              fallback={
                <div className="text-sm text-muted-foreground">
                  Loading distribution matrix...
                </div>
              }
            >
              <section className="flex flex-col gap-4">
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Info className="size-4" />
                      Matrix rules
                    </CardTitle>
                    <CardDescription>
                      Each cell shows how many documents of that class were
                      issued to the stakeholder through real EDMS transmittals.
                      Empty cells indicate no recorded issue.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                      {matrixData.stakeholders.map((stakeholder) => (
                        <div
                          key={stakeholder.id}
                          className="rounded-md border border-border bg-muted/30 px-3 py-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium">
                              {stakeholder.name}
                            </p>
                            <span className="font-mono text-xs text-muted-foreground">
                              {stakeholder.short}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">
                            {stakeholder.role}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {stakeholder.email}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {matrixData.rows.length === 0 ||
                matrixData.stakeholders.length === 0 ? (
                  <Card className="border-border bg-card shadow-sm">
                    <CardContent className="pt-6 text-sm text-muted-foreground">
                      No live transmittal distribution data is available for the
                      current access scope.
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card className="border-border bg-card shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Grid3X3 className="size-4" />
                          Distribution matrix
                        </CardTitle>
                        <CardDescription>
                          {matrixData.rows.length} document classes ·{" "}
                          {matrixData.totalLinks} recipient links
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="overflow-x-auto px-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="px-6">Discipline</TableHead>
                              <TableHead>Doc Type</TableHead>
                              <TableHead className="text-center">
                                Issued
                              </TableHead>
                              {matrixData.stakeholders.map((stakeholder) => (
                                <TableHead
                                  key={stakeholder.id}
                                  className="text-center"
                                >
                                  <span className="font-mono text-xs">
                                    {stakeholder.short}
                                  </span>
                                  <span className="block text-[10px] font-normal text-muted-foreground">
                                    {stakeholder.role}
                                  </span>
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {matrixData.rows.map((row) => (
                              <TableRow
                                key={row.key}
                                className="hover:bg-accent transition-colors"
                              >
                                <TableCell className="px-6 font-medium">
                                  {row.discipline}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {row.docType}
                                </TableCell>
                                <TableCell className="text-center font-mono text-xs">
                                  {row.issuedDocuments}
                                </TableCell>
                                {matrixData.stakeholders.map((stakeholder) => (
                                  <TableCell
                                    key={stakeholder.id}
                                    className="text-center"
                                  >
                                    <MatrixCountCell
                                      count={
                                        row.distribution[stakeholder.id] ?? 0
                                      }
                                    />
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm">
                      <CardHeader>
                        <CardTitle>Stakeholder summary</CardTitle>
                        <CardDescription>
                          Number of matrix classes and total issued-document
                          hits per stakeholder.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="px-6">
                                Stakeholder
                              </TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead className="text-center">
                                Active Classes
                              </TableHead>
                              <TableHead className="px-6 text-center">
                                Total Issues
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {matrixData.stakeholders.map((stakeholder) => {
                              const activeClasses = matrixData.rows.filter(
                                (row) =>
                                  (row.distribution[stakeholder.id] ?? 0) > 0,
                              ).length;
                              const totalIssuesForStakeholder =
                                matrixData.rows.reduce((sum, row) => {
                                  return (
                                    sum +
                                    (row.distribution[stakeholder.id] ?? 0)
                                  );
                                }, 0);

                              return (
                                <TableRow
                                  key={stakeholder.id}
                                  className="hover:bg-accent transition-colors"
                                >
                                  <TableCell className="px-6">
                                    <div className="space-y-0.5">
                                      <p className="font-medium">
                                        {stakeholder.name}
                                      </p>
                                      <p className="font-mono text-xs text-muted-foreground">
                                        {stakeholder.short}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-sm capitalize text-muted-foreground">
                                    {stakeholder.role}
                                  </TableCell>
                                  <TableCell className="text-center font-mono text-sm">
                                    {activeClasses}
                                  </TableCell>
                                  <TableCell className="px-6 text-center font-mono text-sm font-semibold">
                                    {totalIssuesForStakeholder}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
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
