import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import { Textarea } from "@midday/ui/textarea";
import type { Metadata } from "next";
import Link from "next/link";
import { ScrollableContent } from "@/components/scrollable-content";

export const metadata: Metadata = {
  title: "New Letter | Quadra EDMS",
};

export default async function NewLetterPage() {
  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          CORRESPONDENCE <span className="text-primary">/ NEW LETTER</span>
        </div>

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
            <Button>Issue Letter →</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Letter Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="letter-number">Letter Number</Label>
                    <Input
                      id="letter-number"
                      defaultValue="LTR-OUT-AHR-0157"
                      className="font-mono"
                      readOnly
                    />
                    <p className="text-xs text-muted-foreground">
                      Auto-generated
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from">From</Label>
                  <Input
                    id="from"
                    defaultValue="Quadra Demo Engineering"
                    readOnly
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="to">To</Label>
                    <Input
                      id="to"
                      placeholder="Recipient organization"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="to-type">Recipient Type</Label>
                    <select
                      id="to-type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      required
                    >
                      <option value="">Select type...</option>
                      <option value="Client">Client</option>
                      <option value="Vendor">Vendor</option>
                      <option value="Subcontractor">Subcontractor</option>
                      <option value="Consultant">Consultant</option>
                      <option value="Third Party">Third Party</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Letter subject" required />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      required
                    >
                      <option value="">Select category...</option>
                      <option value="Progress Report">Progress Report</option>
                      <option value="Procurement">Procurement</option>
                      <option value="Approval">Approval</option>
                      <option value="Variation">Variation</option>
                      <option value="Safety">Safety</option>
                      <option value="Technical">Technical</option>
                      <option value="Administrative">Administrative</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ref">Reference Number</Label>
                    <Input
                      id="ref"
                      placeholder="External reference (optional)"
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Letter Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter letter content..."
                    className="min-h-[300px]"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="urgent"
                    className="size-4 rounded border-input"
                  />
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
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full">
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
                  <Button variant="outline" className="w-full">
                    + Link Document
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    No documents linked yet
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="cc">CC (Optional)</Label>
                  <Textarea
                    id="cc"
                    placeholder="Additional recipients (one per line)"
                    className="min-h-[100px] text-xs"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ScrollableContent>
  );
}
