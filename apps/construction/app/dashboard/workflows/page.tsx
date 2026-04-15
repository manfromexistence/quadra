import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { EdmsActivityFeed, EdmsNotificationList } from "@/components/edms/dashboard-sections";
import { EdmsDataState } from "@/components/edms/data-state";
import { EdmsMetricCard } from "@/components/edms/metric-card";
import { EdmsPageHeader } from "@/components/edms/page-header";
import { EdmsStatusBadge, formatEdmsLabel } from "@/components/edms/status-badge";
import { WorkflowActionSheet } from "@/components/edms/workflow-action-sheet";
import { WorkflowCreateSheet } from "@/components/edms/workflow-create-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEdmsDashboardData } from "@/lib/edms/dashboard";
import { canManageEdmsContent } from "@/lib/edms/rbac";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { getWorkflowManagementData } from "@/lib/edms/workflows";

export default async function WorkflowsPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const [summaryData, data] = await Promise.all([
    getEdmsDashboardData(sessionUser),
    getWorkflowManagementData(sessionUser),
  ]);
  const [workflowMetric, pendingMetric, approvedMetric, notificationMetric] = data.metrics;
  const canCreateWorkflow = canManageEdmsContent(sessionUser.role);

  return (
    <div className="flex flex-1 flex-col">
      <EdmsPageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Workflows" }]}
        title="Review workflows"
        description="Keep multi-level approvals moving by surfacing pending steps, stakeholder responsibility, and the alerts attached to each route."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/notifications">
                Alert inbox
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            {canCreateWorkflow ? (
              <WorkflowCreateSheet documents={data.documents} assignees={data.assignees} />
            ) : null}
          </>
        }
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <EdmsDataState
          isUsingFallbackData={data.isUsingFallbackData}
          message={data.statusMessage}
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <EdmsMetricCard metric={workflowMetric} />
          <EdmsMetricCard metric={pendingMetric} />
          <EdmsMetricCard metric={approvedMetric} />
          <EdmsMetricCard metric={notificationMetric} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="bg-card/95">
            <CardHeader className="space-y-1">
              <CardTitle>Workflow steps</CardTitle>
              <CardDescription>
                Review actions move forward in sequence and update document status automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {data.steps.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5">
                  <p className="font-medium">No workflows yet</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Create a workflow to submit documents for technical review and approval.
                  </p>
                </div>
              ) : (
                data.steps.map((step) => (
                  <div
                    key={step.id}
                    className="rounded-2xl border border-border/70 bg-muted/25 p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-medium">{step.stepName}</p>
                          <p className="text-sm text-muted-foreground">{step.workflowName}</p>
                        </div>
                        <EdmsStatusBadge status={step.status} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="rounded-full bg-background px-2 py-1 font-mono text-xs">
                            {step.documentNumber}
                          </span>
                          <span>{step.title}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{step.projectName}</span>
                          <span>{step.dueLabel}</span>
                          <span>{`Step ${step.stepNumber} of ${step.totalSteps}`}</span>
                          <span>{step.assignedToName}</span>
                          <span>{formatEdmsLabel(step.assignedRole)}</span>
                        </div>
                        {step.comments ? (
                          <p className="text-sm leading-6 text-muted-foreground">{step.comments}</p>
                        ) : null}
                      </div>

                      <div className="flex items-center justify-end">
                        <WorkflowActionSheet
                          stepId={step.id}
                          title={`${step.documentNumber} - ${step.stepName}`}
                          isActionable={step.isActionable}
                          projectId={step.projectId}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <EdmsNotificationList items={summaryData.notifications} />
        </section>

        <section>
          <EdmsActivityFeed items={summaryData.activity} />
        </section>

        {!canCreateWorkflow ? (
          <section className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
            Workflow routing is limited to vendor-level roles and above. Assigned reviewers can
            still complete actionable steps from this page.
          </section>
        ) : null}
      </div>
    </div>
  );
}
