"use client";

import { Button } from "@midday/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@midday/ui/dialog";
import { Label } from "@midday/ui/label";
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Planning
          </div>
          <DialogTitle>Sync Project Schedule</DialogTitle>
          <DialogDescription>
            Merge the latest project schedule from your planning tool into EDMS.
            Document linkages are preserved by Activity ID.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Source System</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                <option>Primavera P6</option>
                <option>MS Project</option>
                <option>Asta Powerproject</option>
                <option>Smartsheet</option>
                <option>CSV Upload</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Baseline</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                <option>Current — Baseline 3</option>
                <option>Baseline 2 (approved)</option>
                <option>Baseline 1 (original)</option>
              </select>
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
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={preserveLinks}
                  onChange={(e) => setPreserveLinks(e.target.checked)}
                  className="size-4"
                />
                Preserve existing document linkages
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={updateDates}
                  onChange={(e) => setUpdateDates(e.target.checked)}
                  className="size-4"
                />
                Update activity dates (start / finish)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={recalculateEV}
                  onChange={(e) => setRecalculateEV(e.target.checked)}
                  className="size-4"
                />
                Recalculate earned-value from document status
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoCreate}
                  onChange={(e) => setAutoCreate(e.target.checked)}
                  className="size-4"
                />
                Auto-create activities for unlinked WBS nodes
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSync}>Run Sync</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
