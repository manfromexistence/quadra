"use client";

import { Button } from "@midday/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@midday/ui/dialog";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  addWorkflowStepTemplate,
  updateWorkflowStepTemplate,
} from "@/actions/project-config";

interface WorkflowStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  workflowStep?: {
    id: string;
    stepName: string;
    actor: string;
    duration: string;
  };
}

const DURATION_OPTIONS = [
  "1 day",
  "2 days",
  "3 days",
  "5 days",
  "1 week",
  "2 weeks",
  "3 weeks",
  "1 month",
];

const ACTOR_OPTIONS = [
  "Design Lead",
  "QA Manager",
  "Project Manager",
  "Client PM",
  "PMC Lead",
  "Local Authority",
  "Project Director",
  "Technical Director",
  "Department Head",
];

export function WorkflowStepModal({
  isOpen,
  onClose,
  projectId,
  workflowStep,
}: WorkflowStepModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!workflowStep;

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const data = {
        stepName: formData.get("stepName") as string,
        actor: formData.get("actor") as string,
        duration: formData.get("duration") as string,
      };

      if (isEditing) {
        await updateWorkflowStepTemplate(workflowStep.id, data);
      } else {
        await addWorkflowStepTemplate({
          projectId,
          ...data,
        });
      }

      router.refresh();
      onClose();
    } catch (error) {
      console.error("Error saving workflow step:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Workflow Step" : "Add Workflow Step"}
          </DialogTitle>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stepName">
              Step Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="stepName"
              name="stepName"
              placeholder="Internal Review"
              defaultValue={workflowStep?.stepName ?? ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actor">
              Actor <span className="text-destructive">*</span>
            </Label>
            <Select
              name="actor"
              defaultValue={workflowStep?.actor ?? ""}
              required
            >
              <SelectTrigger id="actor">
                <SelectValue placeholder="Select actor" />
              </SelectTrigger>
              <SelectContent>
                {ACTOR_OPTIONS.map((actor) => (
                  <SelectItem key={actor} value={actor}>
                    {actor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">
              Duration <span className="text-destructive">*</span>
            </Label>
            <Select
              name="duration"
              defaultValue={workflowStep?.duration ?? ""}
              required
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((duration) => (
                  <SelectItem key={duration} value={duration}>
                    {duration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
