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
import { useState, useTransition } from "react";
import { toast } from "@/hooks/use-toast";

interface LinkDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activities: Array<{ id: string; name: string; wbs: string }>;
  documents: Array<{ code: string; title: string; rev: string }>;
  projectId: string;
}

export function LinkDocumentsDialog({
  open,
  onOpenChange,
  activities,
  documents,
  projectId,
}: LinkDocumentsDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
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
    if (!selectedActivityId) {
      toast({
        title: "No activity selected",
        description: "Please select an activity to link documents to",
        variant: "destructive",
      });
      return;
    }

    if (selectedDocs.size === 0) {
      toast({
        title: "No documents selected",
        description: "Please select at least one document to link",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const { eq } = await import("drizzle-orm");
        const { db } = await import("@/db");
        const { scheduleActivities } = await import("@/db/schema/schedule");

        // Get current activity
        const activities = await db
          .select()
          .from(scheduleActivities)
          .where(eq(scheduleActivities.id, selectedActivityId));

        if (activities.length === 0) {
          toast({
            title: "Activity not found",
            description: "The selected activity could not be found",
            variant: "destructive",
          });
          return;
        }

        const activity = activities[0];
        if (!activity) {
          toast({
            title: "Activity not found",
            description: "The selected activity could not be found",
            variant: "destructive",
          });
          return;
        }

        const currentLinkedDocs = activity.linkedDocuments
          ? JSON.parse(activity.linkedDocuments)
          : [];

        // Add new document codes
        const updatedLinkedDocs = [
          ...currentLinkedDocs,
          ...Array.from(selectedDocs),
        ];

        // Update activity
        await db
          .update(scheduleActivities)
          .set({
            linkedDocuments: JSON.stringify(updatedLinkedDocs),
            updatedAt: new Date(),
          })
          .where(eq(scheduleActivities.id, selectedActivityId));

        toast({
          title: "Documents linked",
          description: `${selectedDocs.size} document(s) linked to activity`,
        });

        onOpenChange(false);
        setSelectedActivityId("");
        setSelectedDocs(new Set());
      } catch (error) {
        console.error("Failed to link documents:", error);
        toast({
          title: "Failed to link documents",
          description: "An error occurred while linking documents",
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
            Link
          </div>
          <DialogTitle>Link Documents to Activity</DialogTitle>
          <DialogDescription>
            Select documents to associate with a schedule activity for progress
            tracking.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pr-4 py-4">
            <div className="space-y-2">
              <Label>Target Activity</Label>
              <Select
                value={selectedActivityId}
                onValueChange={setSelectedActivityId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an activity..." />
                </SelectTrigger>
                <SelectContent>
                  {activities.slice(0, 10).map((activity) => (
                    <SelectItem key={activity.id} value={activity.id}>
                      {activity.id} — {activity.name} (WBS {activity.wbs})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider">
                Select Documents to Link
              </Label>
              <div className="border border-border rounded-md">
                {documents.slice(0, 6).map((doc) => (
                  <label
                    key={doc.code}
                    htmlFor={`doc-${doc.code}`}
                    className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-accent/50 cursor-pointer"
                  >
                    <Checkbox
                      id={`doc-${doc.code}`}
                      checked={selectedDocs.has(doc.code)}
                      onCheckedChange={() => toggleDoc(doc.code)}
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
        </ScrollArea>

        <DialogFooter className="px-6 pb-6">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleLink}
            disabled={selectedDocs.size === 0 || isPending}
          >
            {isPending
              ? "Linking..."
              : `Link ${selectedDocs.size > 0 ? `${selectedDocs.size} ` : ""}Documents`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
