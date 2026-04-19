import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader } from "@midday/ui/card";
import { Input } from "@midday/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ScrollableContent } from "@/components/scrollable-content";

export const metadata: Metadata = {
  title: "Letters Register | Quadra EDMS",
};

export default async function LettersPage() {
  // TODO: Fetch from database
  const letters = [
    {
      id: "LTR-OUT-AHR-0156",
      date: "2026-04-16",
      direction: "Outgoing",
      from: "Quadra Demo Engineering",
      to: "Gulf National Petroleum",
      toType: "Client",
      subject: "Monthly Progress Report — March 2026",
      category: "Progress Report",
      ref: "PRJ-AHR-2026/MPR/003",
      author: "Jennifer",
      attachments: 3,
      status: "Sent",
      urgent: false,
    },
    {
      id: "LTR-IN-AHR-0089",
      date: "2026-04-14",
      direction: "Incoming",
      from: "Gulf National Petroleum",
      to: "Quadra Demo Engineering",
      toType: "Client",
      subject: "Approval of Design Basis Document Rev B",
      category: "Approval",
      ref: "GNPC/AHR/2026/124",
      author: "Ahmed Al-Wahaibi",
      attachments: 2,
      status: "Received",
      urgent: false,
    },
  ];

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          CORRESPONDENCE{" "}
          <span className="text-primary">/ LETTERS REGISTER</span>
        </div>

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
            <Button variant="outline">↓ Export CSV</Button>
            <Button asChild>
              <Link href="/letters/new">+ New Letter</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <Input placeholder="Search letters…" className="max-w-[280px]" />
              <select className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">All Directions</option>
                <option value="Outgoing">Outgoing</option>
                <option value="Incoming">Incoming</option>
              </select>
              <select className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">All Categories</option>
                <option value="Progress Report">Progress Report</option>
                <option value="Procurement">Procurement</option>
                <option value="Approval">Approval</option>
                <option value="Variation">Variation</option>
                <option value="Safety">Safety</option>
              </select>
            </div>
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
                {letters.map((letter) => (
                  <TableRow key={letter.id}>
                    <TableCell className="px-6">
                      <Link
                        href={`/letters/${letter.id}`}
                        className="font-mono text-xs font-medium hover:text-primary"
                      >
                        {letter.id}
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
                        {letter.date}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{letter.status}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ScrollableContent>
  );
}
