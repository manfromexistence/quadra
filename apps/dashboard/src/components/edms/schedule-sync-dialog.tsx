"use client";

import { Button } from "@midday/ui/button";
import { Checkbox } from "@midday/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@midday/ui/dialog";
import { Label } from "@midday/ui/label";
import { ScrollArea } from "@midday/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";
import { useState } from "react";

interface ScheduleSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleSyncDialog({
  open,
  onOpenChange,
}: ScheduleSyncDialogProps) {
  const [preserveLinks, setPreserveLinks] = useState(true);
  const [updateDates, setUpdateDates] = useState(true);
  const [recalculateEV, setRecalculateEV] = useState(true);
  const [autoCreate, setAutoCreate] = useState(false);

  const handleSync = () => {
    // TODO: Implement sync logic
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Planning
          </div>
          <DialogTitle>Sync Project Schedule</DialogTitle>
          <DialogDescription>
            Merge the latest project schedule from your planning tool into EDMS.
            Document linkages are preserved by Activity ID.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pr-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Source System</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Primavera P6" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="p6">Primavera P6</SelectItem>
                    <SelectItem value="msproject">MS Project</SelectItem>
                    <SelectItem value="asta">Asta Powerproject</SelectItem>
                    <SelectItem value="smartsheet">Smartsheet</SelectItem>
                    <SelectItem value="csv">CSV Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Baseline</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Current — Baseline 3" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baseline3">
                      Current — Baseline 3
                    </SelectItem>
                    <SelectItem value="baseline2">
                      Baseline 2 (approved)
                    </SelectItem>
                    <SelectItem value="baseline1">
                      Baseline 1 (original)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Schedule File</Label>
              <div className="border-2 border-dashed border-border rounded-md p-8 text-center bg-muted/30">
                <div className="text-sm font-medium">
                  ↑ Drop .xer / .mpp / .xlsx file
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Or connect via API — configured in admin
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Merge Options</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="preserve-links"
                    checked={preserveLinks}
                    onCheckedChange={(checked) =>
                      setPreserveLinks(checked === true)
                    }
                  />
                  <Label
                    htmlFor="preserve-links"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Preserve existing document linkages
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="update-dates"
                    checked={updateDates}
                    onCheckedChange={(checked) =>
                      setUpdateDates(checked === true)
                    }
                  />
                  <Label
                    htmlFor="update-dates"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Update activity dates (start / finish)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="recalculate-ev"
                    checked={recalculateEV}
                    onCheckedChange={(checked) =>
                      setRecalculateEV(checked === true)
                    }
                  />
                  <Label
                    htmlFor="recalculate-ev"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Recalculate earned-value from document status
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="auto-create"
                    checked={autoCreate}
                    onCheckedChange={(checked) =>
                      setAutoCreate(checked === true)
                    }
                  />
                  <Label
                    htmlFor="auto-create"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Auto-create activities for unlinked WBS nodes
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSync}>Run Sync</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
