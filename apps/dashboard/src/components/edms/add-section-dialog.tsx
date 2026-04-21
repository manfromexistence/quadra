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
import { ScrollArea } from "@midday/ui/scroll-area";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "@/hooks/use-toast";

interface AddSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}

export function AddSectionDialog({
  open,
  onOpenChange,
  projectId,
}: AddSectionDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [count, setCount] = useState("");
  const [rule, setRule] = useState("");

  const handleAdd = () => {
    if (!code || !title) {
      toast({
        title: "Missing required fields",
        description: "Section code and title are required",
        variant: "destructive",
      });
      return;
    }

    if (!projectId) {
      toast({
        title: "Project not available",
        description: "Cannot add section without project context",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const { nanoid } = await import("nanoid");
        const { db } = await import("@/db");
        const { databookSections } = await import("@/db/schema/databook");

        // Insert new section
        await db.insert(databookSections).values({
          id: nanoid(),
          projectId,
          code,
          title,
          requiredCount: count ? parseInt(count, 10) : 0,
          collectedCount: 0,
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        toast({
          title: "Section added",
          description: `Section ${code} has been created`,
        });

        onOpenChange(false);
        setCode("");
        setTitle("");
        setCount("");
        setRule("");
        router.refresh();
      } catch (error) {
        console.error("Failed to add section:", error);
        toast({
          title: "Failed to add section",
          description: "An error occurred while creating the section",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Data Book
          </div>
          <DialogTitle>Add Data Book Section</DialogTitle>
          <DialogDescription>
            Create a new section in the data book structure for organizing
            deliverables.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="grid gap-4 sm:grid-cols-2 pr-4 py-4">
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
        </ScrollArea>

        <DialogFooter className="px-6 pb-6">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!code || !title || isPending}>
            {isPending ? "Adding..." : "Add Section"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
