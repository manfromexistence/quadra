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
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  FileText,
  Mail,
  Send,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LettersFilters } from "@/components/edms/letters-filters";
import { ScrollableContent } from "@/components/scrollable-content";
import { getLetters } from "@/lib/edms/correspondence";

export const metadata: Metadata = {
  title: "Letters Register | Quadra EDMS",
};

export default async function LettersPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    direction?: string;
    category?: string;
  }>;
}) {
  const params = await searchParams;
  const letters = await getLetters("PRJ-AHR-2026");

  // Filter letters based on search params
  const filteredLetters = letters.filter((letter) => {
    const matchesQuery =
      !params.query ||
      letter.subject.toLowerCase().includes(params.query.toLowerCase()) ||
      letter.letterNumber.toLowerCase().includes(params.query.toLowerCase());

    const matchesDirection =
      !params.direction ||
      params.direction === "all" ||
      letter.direction === params.direction;
    const matchesCategory =
      !params.category ||
      params.category === "all" ||
      letter.category === params.category;

    return matchesQuery && matchesDirection && matchesCategory;
  });

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6 pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Letters Register
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Formal correspondence register tracking all incoming and
                outgoing letters with stakeholders.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline">
              <FileText className="size-4" />
              Export CSV
            </Button>
            <Button variant="outline">
              <Mail className="size-4" />
              Templates
            </Button>
            <Button asChild>
              <Link href="/letters/new">
                <Send className="size-4" />
                New Letter
              </Link>
            </Button>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader>
            <LettersFilters />
          </CardHeader>

          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Letter ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>To/From</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLetters.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No letters found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLetters.map((letter) => (
                    <TableRow
                      key={letter.id}
                      className="hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <TableCell className="px-6">
                        <Link
                          href={`/letters/${letter.id}`}
                          className="font-mono text-xs font-medium hover:text-primary transition-colors"
                        >
                          {letter.letterNumber}
                        </Link>
                        <div className="font-mono text-xs text-muted-foreground">
                          {letter.ref}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md font-medium">
                          {letter.subject}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {letter.attachments} attachment(s)
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {letter.direction === "Outgoing" ? (
                            <ArrowUpFromLine className="size-4 text-blue-600" />
                          ) : (
                            <ArrowDownToLine className="size-4 text-green-600" />
                          )}
                          <span className="text-xs">{letter.direction}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {letter.direction === "Outgoing"
                            ? letter.to
                            : letter.from}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {letter.toType}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{letter.category}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          {new Date(letter.date).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{letter.status}</span>
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
