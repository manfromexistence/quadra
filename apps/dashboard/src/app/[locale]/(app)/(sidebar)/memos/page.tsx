"use client";

import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader } from "@midday/ui/card";
import { AlertCircle, FileText, Send } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { MemosFilters } from "@/components/edms/memos-filters";
import { MemosTable } from "@/components/memos-table";
import { ScrollableContent } from "@/components/scrollable-content";
import { getFirstAccessibleProjectId } from "@/lib/edms/access";
import { getMemos } from "@/lib/edms/correspondence";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export default function MemosPage() {
  const [isPending, startTransition] = useTransition();
  const [memos, setMemos] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);

  startTransition(async () => {
    const sessionUser = await getRequiredDashboardSessionUser();
    const pid = await getFirstAccessibleProjectId(sessionUser);
    setProjectId(pid);
    if (pid) {
      const data = await getMemos(pid);
      setMemos(data);
    }
  });

  const filteredMemos = memos;

  const exportCsv = () => {
    const rows = filteredMemos.map((memo) => ({
      "Memo ID": memo.memoNumber,
      Subject: memo.subject,
      From: memo.from,
      To: memo.to,
      Category: memo.category,
      Date: memo.date ? new Date(memo.date).toISOString().split("T")[0] : "",
      Status: memo.status,
      Urgent: memo.urgent ? "Yes" : "No",
    }));

    const headers = Object.keys(
      rows[0] || {
        "Memo ID": "",
        Subject: "",
        From: "",
        To: "",
        Category: "",
        Date: "",
        Status: "",
        Urgent: "",
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
    link.download = "memos.csv";
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

  if (isPending && memos.length === 0) {
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
                Internal Memos
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Internal project memorandums for team communication,
                announcements, and administrative notices.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={exportCsv} disabled={isPending}>
              <FileText className="size-4" />
              Export CSV
            </Button>
            <Button variant="outline" disabled={isPending}>
              <AlertCircle className="size-4" />
              Mark Urgent
            </Button>
            <Button asChild>
              <Link href="/memos/new">
                <Send className="size-4" />
                New Memo
              </Link>
            </Button>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader>
            <MemosFilters />
          </CardHeader>

          <CardContent className="px-0">
            {filteredMemos.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                No memos found matching your criteria
              </div>
            ) : (
              <MemosTable memos={filteredMemos} />
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollableContent>
  );
}
