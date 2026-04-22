"use client";

import { Button } from "@midday/ui/button";
import { FileText } from "lucide-react";

interface Props {
  meetings: any[];
}

export function MeetingsPageActions({ meetings }: Props) {
  const exportCsv = () => {
    const rows = meetings.map((meeting: any) => ({
      "MoM ID": meeting.momNumber,
      Title: meeting.title,
      Type: meeting.meetingType,
      Date: meeting.meetingDate
        ? new Date(meeting.meetingDate).toISOString().split("T")[0]
        : "",
      Location: meeting.location || "",
      Status: meeting.status,
    }));

    const headers = Object.keys(
      rows[0] || {
        "MoM ID": "",
        Title: "",
        Type: "",
        Date: "",
        Location: "",
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
    link.download = "meetings.csv";
    link.click();
    URL.revokeObjectURL(href);
  };

  return (
    <Button variant="outline" onClick={exportCsv}>
      <FileText className="size-4" />
      Export CSV
    </Button>
  );
}
