import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";

export function ConfigNumbering() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Document Numbering Scheme</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Define the pattern used to generate unique document codes. Each
          segment is populated from the values you configure below.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="numberPattern">Number Pattern Template</Label>
        <Input
          id="numberPattern"
          className="font-mono"
          defaultValue="PRJ-DISC-TYPE-SEQ"
          placeholder="PRJ-DISC-TYPE-SEQ"
        />
        <p className="text-xs text-muted-foreground">
          Supported tokens: PRJ · DISC · TYPE · SEQ · REV · YEAR
        </p>
      </div>

      <div className="border border-border bg-muted/30 p-4 space-y-3">
        <div className="text-xs font-medium text-muted-foreground">
          PATTERN PREVIEW
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-col items-center gap-1 px-3 py-2 border border-border bg-card">
            <span className="text-xs text-muted-foreground">PRJ</span>
            <span className="font-mono text-sm font-medium">AHR</span>
          </div>
          <span className="text-muted-foreground">-</span>
          <div className="flex flex-col items-center gap-1 px-3 py-2 border border-border bg-card">
            <span className="text-xs text-muted-foreground">DISC</span>
            <span className="font-mono text-sm font-medium">MEC</span>
          </div>
          <span className="text-muted-foreground">-</span>
          <div className="flex flex-col items-center gap-1 px-3 py-2 border border-border bg-card">
            <span className="text-xs text-muted-foreground">TYPE</span>
            <span className="font-mono text-sm font-medium">DWG</span>
          </div>
          <span className="text-muted-foreground">-</span>
          <div className="flex flex-col items-center gap-1 px-3 py-2 border border-border bg-card">
            <span className="text-xs text-muted-foreground">SEQ</span>
            <span className="font-mono text-sm font-medium">0001</span>
          </div>
          <span className="text-muted-foreground">/</span>
          <div className="flex flex-col items-center gap-1 px-3 py-2 border border-border bg-card">
            <span className="text-xs text-muted-foreground">REV</span>
            <span className="font-mono text-sm font-medium">A</span>
          </div>
        </div>
        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground mb-1">
            Example Output
          </div>
          <div className="font-mono text-base font-semibold">
            AHR-MEC-DWG-0001 / Rev A
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="sequencePadding">Sequence Padding</Label>
          <Select defaultValue="4">
            <SelectTrigger id="sequencePadding">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 digits (001)</SelectItem>
              <SelectItem value="4">4 digits (0001)</SelectItem>
              <SelectItem value="5">5 digits (00001)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="separator">Separator</Label>
          <Select defaultValue="hyphen">
            <SelectTrigger id="separator">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hyphen">Hyphen ( - )</SelectItem>
              <SelectItem value="underscore">Underscore ( _ )</SelectItem>
              <SelectItem value="dot">Dot ( . )</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="revisionScheme">Revision Scheme</Label>
          <Select defaultValue="alpha-numeric">
            <SelectTrigger id="revisionScheme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alpha-numeric">
                Alpha for pre-IFC (A,B,C) then numeric (0,1,2)
              </SelectItem>
              <SelectItem value="numeric">Numeric only (0,1,2,3)</SelectItem>
              <SelectItem value="alpha">Alpha only (A,B,C,D)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sequenceReset">Sequence Reset</Label>
          <Select defaultValue="continuous">
            <SelectTrigger id="sequenceReset">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="continuous">
                Continuous across project
              </SelectItem>
              <SelectItem value="discipline">Reset per discipline</SelectItem>
              <SelectItem value="year">Reset per year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
