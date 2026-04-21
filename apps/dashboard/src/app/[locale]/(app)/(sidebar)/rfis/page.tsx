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
import { AlertTriangle, FileText, HelpCircle, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { RFIsFilters } from "@/components/edms/rfis-filters";
import { ScrollableContent } from "@/components/scrollable-content";
import { getFirstAccessibleProjectId } from "@/lib/edms/access";
import { getRFIs } from "@/lib/edms/queries";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export const metadata: Metadata = {
  title: "RFIs | Quadra EDMS",
};

export default async function RFIsPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    category?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const sessionUser = await getRequiredDashboardSessionUser();

  // Get the first accessible project ID
  const projectId = await getFirstAccessibleProjectId(sessionUser);

  if (!projectId) {
    return (
      <ScrollableContent>
        <div className="flex flex-col gap-6 pt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No accessible projects found. Please contact your administrator.
            </p>
          </div>
        </div>
      </ScrollableContent>
    );
  }

  const rfis = await getRFIs(projectId);

  // Filter RFIs based on search params
  const filteredRFIs = rfis.filter((rfi) => {
    const matchesQuery =
      !params.query ||
      rfi.subject.toLowerCase().includes(params.query.toLowerCase()) ||
      rfi.rfiNumber.toLowerCase().includes(params.query.toLowerCase());

    const matchesCategory =
      !params.category ||
      params.category === "all" ||
      rfi.category === params.category;
    const matchesStatus =
      !params.status || params.status === "all" || rfi.status === params.status;

    return matchesQuery && matchesCategory && matchesStatus;
  });

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6 pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                RFIs (Request for Information)
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Formal information requests from stakeholders requiring
                documented responses and approvals.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline">
              <FileText className="size-4" />
              Export CSV
            </Button>
            <Button variant="outline">
              <UserPlus className="size-4" />
              Assign Bulk
            </Button>
            <Button variant="outline">
              <AlertTriangle className="size-4" />
              Overdue RFIs
            </Button>
            <Button>
              <HelpCircle className="size-4" />
              New RFI
            </Button>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader>
            <RFIsFilters />
          </CardHeader>

          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">RFI ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRFIs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No RFIs found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRFIs.map((rfi) => (
                    <TableRow
                      key={rfi.id}
                      className="hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <TableCell className="px-6">
                        <Link
                          href={`/rfis/${rfi.id}`}
                          className="font-mono text-xs font-medium hover:text-primary transition-colors"
                        >
                          {rfi.rfiNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md font-medium">
                          {rfi.subject}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {rfi.raisedBy}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                          {rfi.from}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{rfi.category}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium text-amber-600">
                          {rfi.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium text-destructive">
                          {rfi.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{rfi.assignedTo}</span>
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
