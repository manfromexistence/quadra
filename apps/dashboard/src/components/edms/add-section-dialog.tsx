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
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import { useState } from "react";

interface AddSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddSectionDialog({
  open,
  onOpenChange,
}: AddSectionDialogProps) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [count, setCount] = useState("");
  const [rule, setRule] = useState("");

  const handleAdd = () => {
    // TODO: Implement add section logic
    onOpenChange(false);
    setCode("");
    setTitle("");
    setCount("");
    setRule("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Data Book
          </div>
          <DialogTitle>Add Data Book Section</DialogTitle>
          <DialogDescription>
            Create a new section in the data book structure for organizing
            deliverables.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Section Code</Label>
            <Input
              className="font-mono"
              placeholder="SEC-09"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Expected Document Count</Label>
            <Input
              type="number"
              placeholder="12"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Section Title</Label>
            <Input
              placeholder="e.g. HSE Records & Permits"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Auto-Populate Rule</Label>
            <Input
              className="font-mono"
              placeholder="e.g. *-HSE-* OR status=IFC"
              value={rule}
              onChange={(e) => setRule(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Documents matching this pattern will auto-file to this section
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!code || !title}>
            Add Section
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
