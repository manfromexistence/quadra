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

interface LinkDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activities: Array<{ id: string; name: string; wbs: string }>;
  documents: Array<{ code: string; title: string; rev: string }>;
}

export function LinkDocumentsDialog({
  open,
  onOpenChange,
  activities,
  documents,
}: LinkDocumentsDialogProps) {
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

  const toggleDoc = (code: string) => {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const handleLink = () => {
    // TODO: Implement link logic
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Link
          </div>
          <DialogTitle>Link Documents to Activity</DialogTitle>
          <DialogDescription>
            Select documents to associate with a schedule activity for progress
            tracking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Target Activity</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
              {activities.slice(0, 10).map((activity) => (
                <option key={activity.id}>
                  {activity.id} — {activity.name} (WBS {activity.wbs})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider">
              Select Documents to Link
            </Label>
            <div className="border border-border rounded-md max-h-[280px] overflow-y-auto">
              {documents.slice(0, 6).map((doc) => (
                <label
                  key={doc.code}
                  className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-accent/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedDocs.has(doc.code)}
                    onChange={() => toggleDoc(doc.code)}
                    className="size-4"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs font-medium">
                      {doc.code}
                    </div>
                    <div className="text-sm truncate">{doc.title}</div>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    Rev {doc.rev}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleLink} disabled={selectedDocs.size === 0}>
            Link {selectedDocs.size > 0 ? `${selectedDocs.size} ` : ""}Documents
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
