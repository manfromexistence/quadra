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
import { useState } from "react";

export default function NewMoMPage() {
  const [meetingDate, setMeetingDate] = useState<Date>(new Date());
  const [nextMeetingDate, setNextMeetingDate] = useState<Date | undefined>(
    undefined,
  );

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
                  <Select name="meeting-type" required>
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
                <Input id="title" placeholder="Meeting title" required />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="meeting-date">Meeting Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
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
                  <Checkbox id="dist-clt" defaultChecked />
                  <Label
                    htmlFor="dist-clt"
                    className="font-normal cursor-pointer"
                  >
                    Client (CLT)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="dist-sup" defaultChecked />
                  <Label
                    htmlFor="dist-sup"
                    className="font-normal cursor-pointer"
                  >
                    Supervision (SUP)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="dist-epc" defaultChecked />
                  <Label
                    htmlFor="dist-epc"
                    className="font-normal cursor-pointer"
                  >
                    EPC Contractor (EPC)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="dist-vnd" />
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
  );
}
