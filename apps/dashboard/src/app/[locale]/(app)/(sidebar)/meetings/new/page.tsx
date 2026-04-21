"use client";

import { Button } from "@midday/ui/button";
import { Calendar } from "@midday/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { Checkbox } from "@midday/ui/checkbox";
import { cn } from "@midday/ui/cn";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@midday/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";
import { Textarea } from "@midday/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createMinutesOfMeeting } from "@/actions/correspondence";

export default function NewMoMPage() {
  const router = useRouter();
  const [meetingDate, setMeetingDate] = useState<Date>(new Date());
  const [nextMeetingDate, setNextMeetingDate] = useState<Date | undefined>(
    undefined,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      const projectId = formData.get("projectId") as string;
      const meetingType = formData.get("meetingType") as string;
      const title = formData.get("title") as string;
      const location = formData.get("location") as string;
      const chairperson = formData.get("chairperson") as string;
      const attendeesText = formData.get("attendees") as string;
      const agendaText = formData.get("agenda") as string;
      const decisionsText = formData.get("decisions") as string;
      const actionItemsText = formData.get("actionItems") as string;
      const distClt = formData.get("dist-clt") === "on";
      const distSup = formData.get("dist-sup") === "on";
      const distEpc = formData.get("dist-epc") === "on";
      const distVnd = formData.get("dist-vnd") === "on";

      if (!projectId || !meetingType || !title || !location || !chairperson) {
        setError("Please fill in all required fields.");
        setIsSubmitting(false);
        return;
      }

      // Parse attendees from text format: "Name (Organization) - Role"
      const attendees = attendeesText
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          const match = line.match(/(.+?)\s*\((.+?)\)\s*(?:-\s*(.+))?/);
          if (match) {
            return {
              name: match[1].trim(),
              organization: match[2].trim(),
              role: match[3]?.trim() || undefined,
            };
          }
          return null;
        })
        .filter((a): a is NonNullable<typeof a> => a !== null);

      // Parse action items from text format: "Action - Assigned To - Due Date"
      const actionItems = actionItemsText
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          const parts = line.split("-").map((p) => p.trim());
          if (parts.length >= 2) {
            return {
              item: parts[0],
              assignedTo: parts[1],
              dueDate: parts[2] || undefined,
            };
          }
          return null;
        })
        .filter((a): a is NonNullable<typeof a> => a !== null);

      // Build distribution array
      const distribution: string[] = [];
      if (distClt) distribution.push("CLT");
      if (distSup) distribution.push("SUP");
      if (distEpc) distribution.push("EPC");
      if (distVnd) distribution.push("VND");

      // Generate MoM number (simplified - in production this would use project config)
      const momNumber = `MOM-${projectId.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`;

      const result = await createMinutesOfMeeting({
        momNumber,
        meetingDate: meetingDate.toISOString(),
        meetingType,
        title,
        location,
        chairperson,
        minuteTaker: "", // Will be set from session user in action
        agenda: agendaText,
        decisions: decisionsText,
        nextMeeting: nextMeetingDate?.toISOString(),
        distribution,
        attendees: attendees.length > 0 ? attendees : undefined,
        actionItems: actionItems.length > 0 ? actionItems : undefined,
        projectId,
      });

      if (result.success) {
        router.push("/meetings");
        router.refresh();
      } else {
        setError(
          result.error?.message || "Failed to create minutes of meeting",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 pt-6">
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
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input type="hidden" name="projectId" value="default-project" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mom-number">MoM Number</Label>
                  <Input
                    id="mom-number"
                    value="Auto-generated on save"
                    className="font-mono"
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-generated
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting-type">Meeting Type</Label>
                  <Select name="meetingType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Weekly Progress">
                        Weekly Progress
                      </SelectItem>
                      <SelectItem value="Design Review">
                        Design Review
                      </SelectItem>
                      <SelectItem value="Safety">Safety</SelectItem>
                      <SelectItem value="Kickoff">Kickoff</SelectItem>
                      <SelectItem value="Closeout">Closeout</SelectItem>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Coordination">Coordination</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Meeting Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Meeting title"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="meeting-date">Meeting Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(meetingDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={meetingDate}
                        onSelect={(date) => date && setMeetingDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
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
                    name="chairperson"
                    placeholder="Meeting chair"
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
                  name="attendees"
                  placeholder="Enter attendees (one per line)&#10;Format: Name (Organization) - Role"
                  className="min-h-[150px] font-mono text-xs"
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
                  name="agenda"
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
                  name="decisions"
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
                  name="action-items"
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
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Issue MoM →"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                asChild
              >
                <Link href="/meetings">Cancel</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="dist-clt"
                    name="dist-clt"
                    value="on"
                    defaultChecked
                  />
                  <Label
                    htmlFor="dist-clt"
                    className="font-normal cursor-pointer"
                  >
                    Client (CLT)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="dist-sup"
                    name="dist-sup"
                    value="on"
                    defaultChecked
                  />
                  <Label
                    htmlFor="dist-sup"
                    className="font-normal cursor-pointer"
                  >
                    Supervision (SUP)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="dist-epc"
                    name="dist-epc"
                    value="on"
                    defaultChecked
                  />
                  <Label
                    htmlFor="dist-epc"
                    className="font-normal cursor-pointer"
                  >
                    EPC Contractor (EPC)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="dist-vnd" name="dist-vnd" value="on" />
                  <Label
                    htmlFor="dist-vnd"
                    className="font-normal cursor-pointer"
                  >
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !nextMeetingDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {nextMeetingDate
                        ? format(nextMeetingDate, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={nextMeetingDate}
                      onSelect={setNextMeetingDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full" type="button">
                  + Add Attachment
                </Button>
                <p className="text-xs text-muted-foreground">
                  Presentations, reports, etc.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
