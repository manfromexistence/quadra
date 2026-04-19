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
import type { Metadata } from "next";
import Link from "next/link";
import { ScrollableContent } from "@/components/scrollable-content";

export const metadata: Metadata = {
  title: "Minutes of Meeting | Quadra EDMS",
};

export default async function MeetingsPage() {
  // TODO: Fetch from database
  const meetings = [
    {
      id: "MOM-AHR-0018",
      meetingDate: "2026-04-14",
      issuedDate: "2026-04-15",
      meetingType: "Weekly Progress",
      title: "Weekly Project Coordination Meeting",
      location: "Site Office",
      chairperson: "Jennifer",
      attendees: 5,
      actionItems: 2,
      status: "Issued",
    },
    {
      id: "MOM-AHR-0017",
      meetingDate: "2026-04-10",
      issuedDate: "2026-04-11",
      meetingType: "Design Review",
      title: "Electrical Design Review Meeting",
      location: "Client Office",
      chairperson: "Ahmed Al-Wahaibi",
      attendees: 4,
      actionItems: 1,
      status: "Issued",
    },
  ];

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          MEETINGS <span className="text-primary">/ MINUTES OF MEETING</span>
        </div>

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
            <Button variant="outline">↓ Export CSV</Button>
            <Button asChild>
              <Link href="/meetings/new">+ New MoM</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <Input placeholder="Search meetings…" className="max-w-[280px]" />
              <select className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">All Meeting Types</option>
                <option value="Weekly Progress">Weekly Progress</option>
                <option value="Design Review">Design Review</option>
                <option value="Safety">Safety</option>
                <option value="Kickoff">Kickoff</option>
                <option value="Closeout">Closeout</option>
              </select>
            </div>
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
                {meetings.map((mom) => (
                  <TableRow key={mom.id}>
                    <TableCell className="px-6">
                      <Link
                        href={`/meetings/${mom.id}`}
                        className="font-mono text-xs font-medium hover:text-primary"
                      >
                        {mom.id}
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
                        {mom.meetingDate}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{mom.location}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{mom.attendees}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">
                        {mom.actionItems}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{mom.status}</span>
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
