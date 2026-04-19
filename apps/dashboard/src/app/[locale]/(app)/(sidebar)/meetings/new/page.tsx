import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import { Textarea } from "@midday/ui/textarea";
import type { Metadata } from "next";
import Link from "next/link";
import { ScrollableContent } from "@/components/scrollable-content";

export const metadata: Metadata = {
  title: "New Minutes of Meeting | Quadra EDMS",
};

export default async function NewMoMPage() {
  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          MEETINGS{" "}
          <span className="text-primary">/ NEW MINUTES OF MEETING</span>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                New Minutes of Meeting
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Create formal meeting minutes with attendees, decisions, and
                action items.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/meetings">Cancel</Link>
            </Button>
            <Button>Issue MoM →</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Meeting Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="mom-number">MoM Number</Label>
                    <Input
                      id="mom-number"
                      defaultValue="MOM-AHR-0019"
                      className="font-mono"
                      readOnly
                    />
                    <p className="text-xs text-muted-foreground">
                      Auto-generated
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meeting-type">Meeting Type</Label>
                    <select
                      id="meeting-type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      required
                    >
                      <option value="">Select type...</option>
                      <option value="Weekly Progress">Weekly Progress</option>
                      <option value="Design Review">Design Review</option>
                      <option value="Safety">Safety</option>
                      <option value="Kickoff">Kickoff</option>
                      <option value="Closeout">Closeout</option>
                      <option value="Technical">Technical</option>
                      <option value="Coordination">Coordination</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Meeting Title</Label>
                  <Input id="title" placeholder="Meeting title" required />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="meeting-date">Meeting Date</Label>
                    <Input
                      id="meeting-date"
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Meeting location"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="chairperson">Chairperson</Label>
                    <Input
                      id="chairperson"
                      placeholder="Meeting chair"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minute-taker">Minute Taker</Label>
                    <Input
                      id="minute-taker"
                      placeholder="Person taking minutes"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="attendees">Attendees List</Label>
                  <Textarea
                    id="attendees"
                    placeholder="Enter attendees (one per line)&#10;Format: Name (Organization) - Role"
                    className="min-h-[150px] font-mono text-xs"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: Jennifer (Quadra) - Project Manager
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agenda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agenda">Meeting Agenda</Label>
                  <Textarea
                    id="agenda"
                    placeholder="Enter agenda items (one per line)"
                    className="min-h-[150px]"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Decisions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="decisions">Key Decisions</Label>
                  <Textarea
                    id="decisions"
                    placeholder="Enter key decisions made (one per line)"
                    className="min-h-[150px]"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Action Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="action-items">Action Items</Label>
                  <Textarea
                    id="action-items"
                    placeholder="Enter action items&#10;Format: Action - Assigned To - Due Date"
                    className="min-h-[200px] font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: Submit revised schedule - M. Chen - 2026-04-21
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="dist-clt"
                      className="size-4 rounded"
                      defaultChecked
                    />
                    <Label htmlFor="dist-clt" className="font-normal">
                      Client (CLT)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="dist-sup"
                      className="size-4 rounded"
                      defaultChecked
                    />
                    <Label htmlFor="dist-sup" className="font-normal">
                      Supervision (SUP)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="dist-epc"
                      className="size-4 rounded"
                      defaultChecked
                    />
                    <Label htmlFor="dist-epc" className="font-normal">
                      EPC Contractor (EPC)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="dist-vnd"
                      className="size-4 rounded"
                    />
                    <Label htmlFor="dist-vnd" className="font-normal">
                      Vendors (VND)
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Meeting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="next-meeting">Next Meeting Date</Label>
                  <Input id="next-meeting" type="date" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full">
                    + Add Attachment
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Presentations, reports, etc.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ScrollableContent>
  );
}
