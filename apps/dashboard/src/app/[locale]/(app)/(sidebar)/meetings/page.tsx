"use client";

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
import { Calendar, FileText, Users } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { MeetingsFilters } from "@/components/edms/meetings-filters";
import { ScrollableContent } from "@/components/scrollable-content";
import { getFirstAccessibleProjectId } from "@/lib/edms/access";
import { getMinutesOfMeeting } from "@/lib/edms/correspondence";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export default function MeetingsPage() {
  const [isPending, startTransition] = useTransition();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);

  startTransition(async () => {
    const sessionUser = await getRequiredDashboardSessionUser();
    const pid = await getFirstAccessibleProjectId(sessionUser);
    setProjectId(pid);
    if (pid) {
      const data = await getMinutesOfMeeting(pid);
      setMeetings(data);
    }
  });

  const filteredMeetings = meetings;

  const exportCsv = () => {
    const rows = filteredMeetings.map((meeting) => ({
      "MoM ID": meeting.momNumber,
      Title: meeting.title,
      Type: meeting.meetingType,
      Date: meeting.meetingDate
        ? new Date(meeting.meetingDate).toISOString().split("T")[0]
        : "",
      Location: meeting.location || "",
      Attendees: meeting.attendees || "",
      Status: meeting.status,
    }));

    const headers = Object.keys(
      rows[0] || {
        "MoM ID": "",
        Title: "",
        Type: "",
        Date: "",
        Location: "",
        Attendees: "",
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

  if (isPending && meetings.length === 0) {
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
                Minutes of Meeting (MoM)
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Formal meeting records with attendees, decisions, and action
                items tracking.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={exportCsv} disabled={isPending}>
              <FileText className="size-4" />
              Export CSV
            </Button>
            <Button variant="outline" asChild disabled={isPending}>
              <Link href="/schedule">
                <Calendar className="size-4" />
                Schedule Meeting
              </Link>
            </Button>
            <Button asChild>
              <Link href="/meetings/new">
                <Users className="size-4" />
                New MoM
              </Link>
            </Button>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader>
            <MeetingsFilters />
          </CardHeader>

          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">MoM ID</TableHead>
                  <TableHead>Meeting Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Meeting Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Action Items</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeetings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No meetings found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMeetings.map((mom) => (
                    <TableRow
                      key={mom.id}
                      className="hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <TableCell className="px-6">
                        <Link
                          href={`/meetings/${mom.id}`}
                          className="font-mono text-xs font-medium hover:text-primary transition-colors"
                        >
                          {mom.momNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md font-medium">{mom.title}</div>
                        <div className="text-xs text-muted-foreground">
                          Chair: {mom.chairperson}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{mom.meetingType}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          {new Date(mom.meetingDate).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{mom.location}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">—</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">—</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{mom.status}</span>
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
