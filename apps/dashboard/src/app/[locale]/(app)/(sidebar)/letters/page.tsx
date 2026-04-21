"use client";

import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader } from "@midday/ui/card";
import { FileText, Mail, Send } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { LettersFilters } from "@/components/edms/letters-filters";
import { LettersTable } from "@/components/letters-table";
import { ScrollableContent } from "@/components/scrollable-content";
import { getFirstAccessibleProjectId } from "@/lib/edms/access";
import { getLetters } from "@/lib/edms/correspondence";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export default function LettersPage() {
  const [isPending, startTransition] = useTransition();
  const [letters, setLetters] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);

  startTransition(async () => {
    const sessionUser = await getRequiredDashboardSessionUser();
    const pid = await getFirstAccessibleProjectId(sessionUser);
    setProjectId(pid);
    if (pid) {
      const data = await getLetters(pid);
      setLetters(data);
    }
  });

  const filteredLetters = letters;

  const exportCsv = () => {
    const rows = filteredLetters.map((letter) => ({
      "Letter ID": letter.letterNumber,
      Subject: letter.subject,
      Direction: letter.direction,
      "To/From": letter.toFrom,
      Category: letter.category,
      INFO: letter.forInfo ? "Yes" : "No",
      Action: letter.forAction ? "Yes" : "No",
      "Response Required": letter.responseRequired ? "Yes" : "No",
      Date: letter.date
        ? new Date(letter.date).toISOString().split("T")[0]
        : "",
      Status: letter.status,
    }));

    const headers = Object.keys(
      rows[0] || {
        "Letter ID": "",
        Subject: "",
        Direction: "",
        "To/From": "",
        Category: "",
        INFO: "",
        Action: "",
        "Response Required": "",
        Date: "",
        Status: "",
      },
    );

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map(
            (header) =>
              `"${String(row[header as keyof typeof row] ?? "").replaceAll('"', '""')}"`,
          )
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const href = URL.createObjectURL(blob);
    link.href = href;
    link.download = "letters.csv";
    link.click();
    URL.revokeObjectURL(href);
  };

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

  if (isPending && letters.length === 0) {
    return (
      <ScrollableContent>
        <div className="flex flex-col gap-6 pt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ScrollableContent>
    );
  }

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
            <Button variant="outline" onClick={exportCsv} disabled={isPending}>
              <FileText className="size-4" />
              Export CSV
            </Button>
            <Button variant="outline" asChild disabled={isPending}>
              <Link href="/project-templates">
                <Mail className="size-4" />
                Templates
              </Link>
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
            {filteredLetters.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                No letters found matching your criteria
              </div>
            ) : (
              <LettersTable letters={filteredLetters} />
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollableContent>
  );
}
