"use client";

import { Button } from "@midday/ui/button";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";
import { ArrowRight, Trash2, Workflow } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  deleteWorkflowStepTemplate,
  updateProjectConfig,
} from "@/actions/project-config";
import { WorkflowStepModal } from "@/components/modals/workflow-step-modal";

interface ConfigWorkflowProps {
  projectId: string;
  workflowSteps: Array<{
    id: string;
    stepName: string;
    actor: string;
    duration: string;
  }>;
  config: {
    projectCode: string;
    shortCode: string;
    client: string | null;
    contractor: string | null;
    currency: string | null;
    numberingPattern: string;
    sequencePadding: number;
    separator: string;
    revisionScheme: string;
    sequenceReset: string;
    defaultReviewSla: string | null;
    reminderBeforeDue: number | null;
    overdueEscalation: string | null;
    autoCloseAfter: string | null;
  } | null;
}

export function ConfigWorkflow({
  projectId,
  workflowSteps,
  config,
}: ConfigWorkflowProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<
    (typeof workflowSteps)[0] | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);

  function openAddModal() {
    setEditingStep(undefined);
    setIsModalOpen(true);
  }

  function openEditModal(step: (typeof workflowSteps)[0]) {
    setEditingStep(step);
    setIsModalOpen(true);
  }

  async function handleDeleteStep(id: string) {
    if (confirm("Are you sure you want to delete this workflow step?")) {
      try {
        await deleteWorkflowStepTemplate(id);
        router.refresh();
      } catch (error) {
        console.error("Error deleting workflow step:", error);
      }
    }
  }

  async function onSubmitSLA(formData: FormData) {
    setIsLoading(true);
    try {
      await updateProjectConfig({
        projectId,
        projectCode: config?.projectCode ?? "PRJ-001",
        shortCode: config?.shortCode ?? "PRJ",
        client: config?.client,
        contractor: config?.contractor,
        currency: config?.currency ?? "usd",
        numberingPattern: config?.numberingPattern ?? "PRJ-DISC-TYPE-SEQ",
        sequencePadding: config?.sequencePadding ?? 4,
        separator: config?.separator ?? "hyphen",
        revisionScheme: config?.revisionScheme ?? "alpha-numeric",
        sequenceReset: config?.sequenceReset ?? "continuous",
        defaultReviewSla: formData.get("reviewSla") as string,
        reminderBeforeDue: Number(formData.get("reminderBefore")),
        overdueEscalation: formData.get("escalation") as string,
        autoCloseAfter: formData.get("autoClose") as string,
      });
      router.refresh();
    } catch (error) {
      console.error("Error updating SLA config:", error);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <>
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Approval Workflow</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Default review & approval sequence for all documents. Individual
                disciplines may override.
              </p>
            </div>
            <Button size="sm" onClick={openAddModal}>
              + Add Step
            </Button>
          </div>

          {workflowSteps.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-border bg-muted/30 p-12 text-center">
              <Workflow className="size-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">
                No workflow steps yet
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get started by defining your approval workflow
              </p>
              <div className="mt-4">
                <Button size="sm" onClick={openAddModal}>
                  + Add Step
                </Button>
              </div>
            </div>
          ) : (
            <div className="border border-border bg-muted/30 p-6">
              <div className="flex flex-wrap items-center gap-3">
                {workflowSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className="relative group">
                      <div className="flex flex-col items-center gap-2 px-4 py-3 border border-border bg-card min-w-[140px]">
                        <div className="font-semibold text-sm text-center">
                          {step.stepName}
                        </div>
                        <div className="text-xs text-muted-foreground text-center">
                          {step.actor}
                        </div>
                        <div className="font-mono text-xs text-primary mt-1">
                          {step.duration}
                        </div>
                      </div>
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => openEditModal(step)}
                          >
                            ✏️
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteStep(step.id)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <ArrowRight className="size-5 text-muted-foreground shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <form action={onSubmitSLA} className="space-y-6">
          <h3 className="text-lg font-semibold">SLA & Escalation Rules</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="reviewSla">Default Review SLA</Label>
              <Input
                id="reviewSla"
                name="reviewSla"
                defaultValue={config?.defaultReviewSla ?? "10 working days"}
                placeholder="10 working days"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminderBefore">Reminder Before Due</Label>
              <Select
                name="reminderBefore"
                defaultValue={String(config?.reminderBeforeDue ?? 3)}
              >
                <SelectTrigger id="reminderBefore">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day before</SelectItem>
                  <SelectItem value="2">2 days before</SelectItem>
                  <SelectItem value="3">3 days before</SelectItem>
                  <SelectItem value="5">5 days before</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="escalation">Overdue Escalation</Label>
              <Select
                name="escalation"
                defaultValue={config?.overdueEscalation ?? "pm"}
              >
                <SelectTrigger id="escalation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pm">
                    Escalate to Project Manager
                  </SelectItem>
                  <SelectItem value="client">Escalate to Client PM</SelectItem>
                  <SelectItem value="none">No escalation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="autoClose">Auto-close After</Label>
              <Input
                id="autoClose"
                name="autoClose"
                defaultValue={config?.autoCloseAfter ?? "30 days of inactivity"}
                placeholder="30 days of inactivity"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save SLA Settings"}
            </Button>
          </div>
        </form>
      </div>

      <WorkflowStepModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        workflowStep={editingStep}
      />
    </>
  );
}
