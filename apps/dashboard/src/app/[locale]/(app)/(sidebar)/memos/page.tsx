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
import { AlertCircle, FileText, Send } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { MemosFilters } from "@/components/edms/memos-filters";
import { ScrollableContent } from "@/components/scrollable-content";
import { getFirstAccessibleProjectId } from "@/lib/edms/access";
import { getMemos } from "@/lib/edms/correspondence";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export const metadata: Metadata = {
  title: "Memos | Quadra EDMS",
};

export default async function MemosPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    category?: string;
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

  // Fetch from database
  const memos = await getMemos(projectId);

  // Filter memos based on search params
  const filteredMemos = memos.filter((memo) => {
    const matchesQuery =
      !params.query ||
      memo.subject.toLowerCase().includes(params.query.toLowerCase()) ||
      memo.memoNumber.toLowerCase().includes(params.query.toLowerCase());

    const matchesCategory =
      !params.category ||
      params.category === "all" ||
      memo.category === params.category;

    return matchesQuery && matchesCategory;
  });

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6 pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Internal Memos
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Internal project memorandums for team communication,
                announcements, and administrative notices.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline">
              <FileText className="size-4" />
              Export CSV
            </Button>
            <Button variant="outline">
              <AlertCircle className="size-4" />
              Mark Urgent
            </Button>
            <Button>
              <Send className="size-4" />
              New Memo
            </Button>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader>
            <MemosFilters />
          </CardHeader>

          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Memo ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMemos.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No memos found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMemos.map((memo) => (
                    <TableRow
                      key={memo.id}
                      className="hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <TableCell className="px-6">
                        <Link
                          href={`/memos/${memo.id}`}
                          className="font-mono text-xs font-medium hover:text-primary transition-colors"
                        >
                          {memo.memoNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="max-w-md font-medium">
                            {memo.subject}
                          </div>
                          {memo.urgent && (
                            <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                              URGENT
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{memo.from}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{memo.to}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{memo.category}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          {new Date(memo.date).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{memo.status}</span>
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
