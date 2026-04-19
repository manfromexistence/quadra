import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader } from "@midday/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import { AlertTriangle, FileText, MapPin, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteTechQueriesFilters } from "@/components/edms/site-tech-queries-filters";
import { ScrollableContent } from "@/components/scrollable-content";
import { getSiteTechQueries } from "@/lib/edms/queries";

export const metadata: Metadata = {
  title: "Site Technical Queries | Quadra EDMS",
};

export default async function SiteTechQueriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    discipline?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const siteQueries = await getSiteTechQueries("PRJ-AHR-2026");

  // Filter site queries based on search params
  const filteredQueries = siteQueries.filter((stq) => {
    const matchesQuery =
      !params.query ||
      stq.subject.toLowerCase().includes(params.query.toLowerCase()) ||
      stq.queryNumber.toLowerCase().includes(params.query.toLowerCase());

    const matchesDiscipline =
      !params.discipline ||
      params.discipline === "all" ||
      stq.discipline === params.discipline;
    const matchesStatus =
      !params.status || params.status === "all" || stq.status === params.status;

    return matchesQuery && matchesDiscipline && matchesStatus;
  });

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6 pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Site Technical Queries (STQ)
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Construction-phase technical queries raised from site due to
                clashes, discrepancies, or site conditions.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline">
              <FileText className="size-4" />
              Export CSV
            </Button>
            <Button variant="outline">
              <MapPin className="size-4" />
              Site Map
            </Button>
            <Button variant="outline">
              <UserPlus className="size-4" />
              Assign Bulk
            </Button>
            <Button>
              <AlertTriangle className="size-4" />
              New STQ
            </Button>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader>
            <SiteTechQueriesFilters />
          </CardHeader>

          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">STQ ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQueries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No site queries found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQueries.map((stq) => (
                    <TableRow
                      key={stq.id}
                      className="hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <TableCell className="px-6">
                        <Link
                          href={`/site-tech-queries/${stq.id}`}
                          className="font-mono text-xs font-medium hover:text-primary transition-colors"
                        >
                          {stq.queryNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md font-medium">
                          {stq.subject}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {stq.location}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                          {stq.discipline}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium text-amber-600">
                          {stq.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium text-destructive">
                          {stq.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{stq.assignedTo}</span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ScrollableContent>
  );
}
