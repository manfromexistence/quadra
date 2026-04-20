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
import { ArrowRight } from "lucide-react";

const WORKFLOW_STEPS = [
  { step: "Internal Review", actor: "Design Lead", duration: "3 days" },
  { step: "QA/QC Check", actor: "QA Manager", duration: "2 days" },
  { step: "Client Review", actor: "Client PM", duration: "10 days" },
  { step: "PMC Review", actor: "PMC Lead", duration: "7 days" },
  { step: "Authority Approval", actor: "Local Authority", duration: "14 days" },
  { step: "Final Approval", actor: "Project Director", duration: "2 days" },
];

export function ConfigWorkflow() {
  return (
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
          <Button size="sm">Edit Sequence</Button>
        </div>

        <div className="border border-border bg-muted/30 p-6">
          <div className="flex flex-wrap items-center gap-3">
            {WORKFLOW_STEPS.map((step, index) => (
              <div key={step.step} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-2 px-4 py-3 border border-border bg-card min-w-[140px]">
                  <div className="font-semibold text-sm text-center">
                    {step.step}
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    {step.actor}
                  </div>
                  <div className="font-mono text-xs text-primary mt-1">
                    {step.duration}
                  </div>
                </div>
                {index < WORKFLOW_STEPS.length - 1 && (
                  <ArrowRight className="size-5 text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">SLA & Escalation Rules</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="reviewSla">Default Review SLA</Label>
            <Input
              id="reviewSla"
              defaultValue="10 working days"
              placeholder="10 working days"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminderBefore">Reminder Before Due</Label>
            <Select defaultValue="3">
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
            <Select defaultValue="pm">
              <SelectTrigger id="escalation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pm">Escalate to Project Manager</SelectItem>
                <SelectItem value="client">Escalate to Client PM</SelectItem>
                <SelectItem value="none">No escalation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="autoClose">Auto-close After</Label>
            <Input
              id="autoClose"
              defaultValue="30 days of inactivity"
              placeholder="30 days of inactivity"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
