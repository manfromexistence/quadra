import { Button } from "@midday/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@midday/ui/card";
import { ArrowRight, Grid3X3, Info } from "lucide-react";
import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import Link from "next/link";
import { Suspense } from "react";
import { CollapsibleSummary } from "@/components/collapsible-summary";
import { AddMatrixRuleForm } from "@/components/edms/add-matrix-rule-form";
import { EdmsDataState } from "@/components/edms/data-state";
import { DistributionMatrixTable } from "@/components/edms/distribution-matrix-table";
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

  // Convert matrix data to interactive format
  const interactiveRows = matrixData.rows.map((row) => ({
    key: row.key,
    discipline: row.discipline,
    docType: row.docType,
    purpose: "IFC", // Default purpose for demo
    distribution: Object.fromEntries(
      matrixData.stakeholders.map((s) => [
        s.id,
        row.distribution[s.id] > 0 ? "I" : "",
      ]),
    ) as Record<string, "A" | "R" | "I" | "">,
  }));

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
                      Click cells to cycle through roles: — → I (Information) →
                      R (Review) → A (Approve) → —
                      <br />
                      Define who receives which documents and in what role based
                      on discipline, document type, and purpose code.
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
                          Interactive distribution matrix
                        </CardTitle>
                        <CardDescription>
                          {matrixData.rows.length} document classes · Click
                          cells to assign roles (A/R/I)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <DistributionMatrixTable
                          stakeholders={matrixData.stakeholders}
                          rows={interactiveRows}
                        />
                      </CardContent>
                    </Card>

                    <AddMatrixRuleForm />
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
