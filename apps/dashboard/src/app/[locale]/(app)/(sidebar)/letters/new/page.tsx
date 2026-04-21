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
import { createLetter } from "@/actions/correspondence";

export default function NewLetterPage() {
  const router = useRouter();
  const [letterDate, setLetterDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      const projectId = formData.get("projectId") as string;
      const to = formData.get("to") as string;
      const toType = formData.get("toType") as string;
      const subject = formData.get("subject") as string;
      const category = formData.get("category") as string;
      const ref = formData.get("ref") as string;
      const content = formData.get("content") as string;
      const _urgent = formData.get("urgent") === "on";

      if (!projectId || !to || !toType || !subject || !category || !content) {
        setError("Please fill in all required fields.");
        setIsSubmitting(false);
        return;
      }

      // Generate letter number (simplified - in production this would use project config)
      const letterNumber = `LTR-OUT-${projectId.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`;

      const result = await createLetter({
        letterNumber,
        date: letterDate.toISOString(),
        direction: "Outgoing",
        from: "Quadra Engineering", // In production, this would come from project config
        to,
        toType,
        subject,
        category,
        ref: ref || undefined,
        forInfo: false,
        actionRequired: false,
        responseRequired: undefined,
        projectId,
      });

      if (result.success) {
        router.push("/letters");
        router.refresh();
      } else {
        setError(result.error?.message || "Failed to create letter");
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
              New Letter
            </h1>
            <p className="text-sm leading-6 text-muted-foreground md:text-base">
              Create a new formal letter for outgoing correspondence.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/letters">Cancel</Link>
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
              <CardTitle>Letter Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input type="hidden" name="projectId" value="default-project" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="letter-number">Letter Number</Label>
                  <Input
                    id="letter-number"
                    value="Auto-generated on save"
                    className="font-mono"
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-generated
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
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
                        {format(letterDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={letterDate}
                        onSelect={(date) => date && setLetterDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="from">From</Label>
                <Input id="from" value="Quadra Engineering" readOnly />
                <p className="text-xs text-muted-foreground">
                  From project configuration
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <Input
                    id="to"
                    name="to"
                    placeholder="Recipient organization"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toType">Recipient Type</Label>
                  <Select name="toType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Client">Client</SelectItem>
                      <SelectItem value="Vendor">Vendor</SelectItem>
                      <SelectItem value="Subcontractor">
                        Subcontractor
                      </SelectItem>
                      <SelectItem value="Consultant">Consultant</SelectItem>
                      <SelectItem value="Third Party">Third Party</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Letter subject"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Progress Report">
                        Progress Report
                      </SelectItem>
                      <SelectItem value="Procurement">Procurement</SelectItem>
                      <SelectItem value="Approval">Approval</SelectItem>
                      <SelectItem value="Variation">Variation</SelectItem>
                      <SelectItem value="Safety">Safety</SelectItem>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Administrative">
                        Administrative
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ref">Reference Number</Label>
                  <Input
                    id="ref"
                    name="ref"
                    placeholder="External reference (optional)"
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Letter Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Enter letter content..."
                  className="min-h-[300px]"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="urgent" name="urgent" value="on" />
                <Label htmlFor="urgent" className="font-normal">
                  Mark as urgent
                </Label>
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
                {isSubmitting ? "Creating..." : "Issue Letter →"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                asChild
              >
                <Link href="/letters">Cancel</Link>
              </Button>
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
                  No attachments added yet
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full" type="button">
                  + Link Document
                </Button>
                <p className="text-xs text-muted-foreground">
                  No documents linked yet
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
