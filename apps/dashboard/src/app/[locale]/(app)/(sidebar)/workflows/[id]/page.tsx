import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { WorkflowActionSheet } from "@/components/edms/workflow-action-sheet";
import { EdmsStatusBadge, formatEdmsLabel } from "@/components/edms/status-badge";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { getWorkflowDetailData } from "@/lib/edms/workflow-detail";

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionUser = await getRequiredDashboardSessionUser();
  const data = await getWorkflowDetailData(id, sessionUser);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6 pt-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{data.workflow.workflowName}</h1>
            <EdmsStatusBadge status={data.workflow.status} />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{data.workflow.documentNumber}</span>
            <span>{data.workflow.documentTitle}</span>
            <span>{data.workflow.projectName}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{data.workflow.startedLabel}</span>
            <span>{data.workflow.completedLabel}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/documents/${data.workflow.documentId}`}>Open document</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/workflows">Back to workflows</Link>
          </Button>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.steps.map((step) => (
            <div key={step.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      Step {step.stepNumber}: {step.stepName}
                    </p>
                    <EdmsStatusBadge status={step.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>{step.assignedToName}</span>
                    {step.assignedRole ? <span>{formatEdmsLabel(step.assignedRole)}</span> : null}
                    <span>{step.dueLabel}</span>
                    <span>{step.completedLabel}</span>
                  </div>
                  {step.comments ? (
                    <p className="text-sm text-muted-foreground">{step.comments}</p>
                  ) : null}
                </div>

                <WorkflowActionSheet
                  stepId={step.id}
                  title={`${data.workflow.documentNumber} - ${step.stepName}`}
                  isActionable={step.isActionable}
                  projectId={data.workflow.projectId}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}