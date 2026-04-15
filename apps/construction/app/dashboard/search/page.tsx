import Link from "next/link";
import { EdmsDataState } from "@/components/edms/data-state";
import { EdmsPageHeader } from "@/components/edms/page-header";
import { SearchToolbar } from "@/components/edms/search/search-toolbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type GlobalSearchFilters,
  type GlobalSearchQueryInput,
  getGlobalSearchData,
  normalizeGlobalSearchFilters,
} from "@/lib/edms/search";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sessionUser = await getRequiredDashboardSessionUser();
  const params = await searchParams;
  const filters = normalizeGlobalSearchFilters(params as unknown as GlobalSearchQueryInput);
  const data = await getGlobalSearchData(sessionUser, filters);
  const categoryCounts = data.results.reduce(
    (acc, result) => {
      acc[result.category] += 1;
      return acc;
    },
    {
      project: 0,
      document: 0,
      workflow: 0,
      transmittal: 0,
      notification: 0,
    }
  );

  return (
    <div className="flex flex-1 flex-col">
      <EdmsPageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Search" }]}
        title="Global search"
        description="Find projects, documents, workflows, transmittals, and alerts from one EDMS search surface."
      />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <EdmsDataState
          isUsingFallbackData={data.isUsingFallbackData}
          message={data.statusMessage}
        />

        <SearchToolbar
          initialFilters={data.filters}
          projects={data.availableProjects}
          uploaders={data.availableUploaders}
        />

        <Card className="bg-card/95">
          <CardHeader className="space-y-1">
            <CardTitle>Results</CardTitle>
            <CardDescription>
              {data.query.trim().length === 0 && !hasActiveFilters(data.filters)
                ? "Enter a term to search the current EDMS workspace."
                : `${data.results.length} result${data.results.length === 1 ? "" : "s"} for "${data.query}"`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-3 md:grid-cols-5">
              <ResultStat label="Projects" value={categoryCounts.project} />
              <ResultStat label="Documents" value={categoryCounts.document} />
              <ResultStat label="Workflows" value={categoryCounts.workflow} />
              <ResultStat label="Transmittals" value={categoryCounts.transmittal} />
              <ResultStat label="Notifications" value={categoryCounts.notification} />
            </div>

            {data.query.trim().length === 0 && !hasActiveFilters(data.filters) ? (
              <EmptySearchState message="Search results will appear here once you enter a query or apply a filter." />
            ) : data.results.length === 0 ? (
              <EmptySearchState message="No matching EDMS records were found for the current search criteria." />
            ) : (
              data.results.map((result) => (
                <Link
                  key={`${result.category}-${result.id}`}
                  href={result.href}
                  className="rounded-2xl border border-border/70 bg-muted/25 p-4 shadow-sm transition-colors hover:bg-muted/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{result.title}</p>
                        <Badge variant="outline" className="rounded-full">
                          {result.category}
                        </Badge>
                        <Badge variant="secondary" className="rounded-full">
                          {result.source}
                        </Badge>
                        {result.status ? (
                          <Badge variant="outline" className="rounded-full">
                            {result.status}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="font-mono text-xs text-muted-foreground">{result.subtitle}</p>
                      <p className="text-sm leading-6 text-muted-foreground">{result.meta}</p>
                    </div>
                    <span className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-foreground">
                      Open
                    </span>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptySearchState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5">
      <p className="font-medium">Nothing to show yet</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{message}</p>
    </div>
  );
}

function ResultStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function hasActiveFilters(filters: GlobalSearchFilters) {
  return (
    filters.categories.length < 5 ||
    filters.status.length > 0 ||
    filters.projectId.length > 0 ||
    filters.uploaderId.length > 0 ||
    filters.fromDate.length > 0 ||
    filters.toDate.length > 0
  );
}
