import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";
import type { DashboardSessionUser } from "@/lib/edms/session";

interface ConfigGeneralProps {
  sessionUser: DashboardSessionUser;
}

export function ConfigGeneral({ sessionUser }: ConfigGeneralProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Project Identification</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Basic project information and identification codes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="projectCode">
            Project Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id="projectCode"
            className="font-mono"
            placeholder="PRJ-001"
            defaultValue=""
          />
          <p className="text-xs text-muted-foreground">
            Used as prefix in all document codes
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortCode">Short Code (used in doc numbering)</Label>
          <Input
            id="shortCode"
            className="font-mono"
            placeholder="AHR"
            defaultValue=""
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="projectTitle">
            Project Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="projectTitle"
            placeholder="Al Hail Residential Development"
            defaultValue=""
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client">Client</Label>
          <Input
            id="client"
            placeholder="Client Organization"
            defaultValue=""
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contractor">Main Contractor</Label>
          <Input
            id="contractor"
            placeholder="Contractor Organization"
            defaultValue=""
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" placeholder="Muscat, Oman" defaultValue="" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Contract Currency</Label>
          <Select defaultValue="usd">
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usd">USD</SelectItem>
              <SelectItem value="eur">EUR</SelectItem>
              <SelectItem value="gbp">GBP</SelectItem>
              <SelectItem value="omr">OMR</SelectItem>
              <SelectItem value="aed">AED</SelectItem>
              <SelectItem value="sar">SAR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" defaultValue="" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Target Completion</Label>
          <Input id="endDate" type="date" defaultValue="" />
        </div>
      </div>
    </div>
  );
}
