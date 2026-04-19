import { Button } from "@midday/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@midday/ui/card";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import { Textarea } from "@midday/ui/textarea";
import type { Metadata } from "next";
import { ScrollableContent } from "@/components/scrollable-content";

export const metadata: Metadata = {
  title: "Project Setup | Quadra EDMS",
};

export default async function ConfigPage() {
  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          CONFIGURATION <span className="text-primary">/ PROJECT SETUP</span>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Project Setup
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Configure project settings, document numbering, stakeholders,
                and EDMS preferences.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline">Reset to Defaults</Button>
            <Button>Save Changes</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>
                Basic project details and identification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  defaultValue="Al Hamra Refinery Expansion"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-code">Project Code</Label>
                <Input
                  id="project-code"
                  defaultValue="AHR"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Input id="client" defaultValue="Gulf National Petroleum" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" defaultValue="Oman" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Numbering</CardTitle>
              <CardDescription>
                Configure document code format and patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doc-pattern">Document Code Pattern</Label>
                <Input
                  id="doc-pattern"
                  defaultValue="[PROJECT]-[DISC]-[TYPE]-[SEQ]"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Example: AHR-CIV-DWG-0001
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seq-digits">Sequence Digits</Label>
                <Input
                  id="seq-digits"
                  type="number"
                  defaultValue="4"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tm-pattern">Transmittal Pattern</Label>
                <Input
                  id="tm-pattern"
                  defaultValue="TM-[PROJECT]-[SEQ]"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Example: TM-AHR-0042
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disciplines</CardTitle>
              <CardDescription>
                Manage engineering disciplines and codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="disciplines">Discipline Codes</Label>
                <Textarea
                  id="disciplines"
                  defaultValue={`CIV - Civil Engineering
STR - Structural Engineering
MEC - Mechanical Engineering
ELE - Electrical Engineering
INS - Instrumentation
PIP - Piping
PRO - Process Engineering`}
                  className="min-h-[200px] font-mono text-xs"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Types</CardTitle>
              <CardDescription>
                Manage document type codes and categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="doc-types">Document Type Codes</Label>
                <Textarea
                  id="doc-types"
                  defaultValue={`DWG - Drawing
SPC - Specification
DAT - Datasheet
CAL - Calculation
RPT - Report
PRO - Procedure
MAN - Manual`}
                  className="min-h-[200px] font-mono text-xs"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Stakeholders</CardTitle>
              <CardDescription>
                Configure project stakeholders for distribution matrix
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="stakeholders">Stakeholder Configuration</Label>
                <Textarea
                  id="stakeholders"
                  defaultValue={`CLT - Client - Gulf National Petroleum
SUP - Supervision - KBR Supervision Consultant
EPC - EPC Contractor - Quadra Demo Engineering
VND - Vendor - Equipment Suppliers
SUB - Subcontractor - Construction Subcontractors
THP - Third Party - Bureau Veritas (Inspection)`}
                  className="min-h-[160px] font-mono text-xs"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Workflow Settings</CardTitle>
              <CardDescription>
                Configure document review and approval workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-assign reviewers</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically assign reviewers based on discipline
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Send email alerts for workflow events
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Review deadlines</div>
                  <div className="text-sm text-muted-foreground">
                    Default review period: 14 days
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollableContent>
  );
}
