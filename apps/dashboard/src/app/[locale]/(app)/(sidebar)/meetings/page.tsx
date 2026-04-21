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
import type { Metadata } from "next";
import Link from "next/link";
import { MeetingsFilters } from "@/components/edms/meetings-filters";
import { ScrollableContent } from "@/components/scrollable-content";
import { getFirstAccessibleProjectId } from "@/lib/edms/access";
import { getMinutesOfMeeting } from "@/lib/edms/correspondence";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export const metadata: Metadata = {
  title: "Minutes of Meeting | Quadra EDMS",
};

export default async function MeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    type?: string;
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
  const meetings = await getMinutesOfMeeting(projectId);

  // Filter meetings based on search params
  const filteredMeetings = meetings.filter((meeting) => {
    const matchesQuery =
      !params.query ||
      meeting.title.toLowerCase().includes(params.query.toLowerCase()) ||
      meeting.momNumber.toLowerCase().includes(params.query.toLowerCase());

    const matchesType =
      !params.type ||
      params.type === "all" ||
      meeting.meetingType === params.type;

    return matchesQuery && matchesType;
  });

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
            <Button variant="outline">
              <FileText className="size-4" />
              Export CSV
            </Button>
            <Button variant="outline">
              <Calendar className="size-4" />
              Schedule Meeting
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
