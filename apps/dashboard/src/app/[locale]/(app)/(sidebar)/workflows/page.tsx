import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { EdmsDataState } from "@/components/edms/data-state";
import { EdmsMetricCard } from "@/components/edms/metric-card";
import {
  EdmsStatusBadge,
  formatEdmsLabel,
} from "@/components/edms/status-badge";
import { WorkflowActionSheet } from "@/components/edms/workflow-action-sheet";
import { WorkflowCreateSheet } from "@/components/edms/workflow-create-sheet";
import { getEdmsDashboardData } from "@/lib/edms/dashboard";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { getWorkflowManagementData } from "@/lib/edms/workflows";

export default async function WorkflowsPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const [summaryData, data] = await Promise.all([
    getEdmsDashboardData(sessionUser),
    getWorkflowManagementData(sessionUser),
  ]);

  return (
    <div className="space-y-6 pt-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-3">
          <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-muted-foreground">
            Review routing
          </p>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Workflow queue
            </h1>
            <p className="text-sm leading-6 text-muted-foreground md:text-base">
              Multi-step review visibility for PMC, client, and vendor actions,
              with safe sample data fallback until the live EDMS workflow tables
              are present.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <WorkflowCreateSheet documents={data.documents} assignees={data.assignees} />
          <Button variant="outline" asChild>
            <Link href="/documents">
              Source documents
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/transmittals">
              Transmittals
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <EdmsDataState
        isUsingFallbackData={data.isUsingFallbackData}
        message={data.statusMessage}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <EdmsMetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border bg-background/90 shadow-sm">
          <CardHeader>
            <CardTitle>Workflow steps</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {data.steps.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                No workflow steps found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Step</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead className="px-6">Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.steps.map((step) => (
                    <TableRow key={step.id}>
                      <TableCell className="px-6">
                        <div className="space-y-1">
                          <Link href={`/workflows/${step.workflowId}`} className="font-medium hover:underline">
                            {step.stepName}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {step.workflowName} · Step {step.stepNumber} of{" "}
                            {step.totalSteps}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p>{step.title}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {step.documentNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{step.projectName}</TableCell>
                      <TableCell>
                        <EdmsStatusBadge status={step.status} />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p>{step.assignedToName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatEdmsLabel(step.assignedRole)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm text-muted-foreground">{step.dueLabel}</span>
                          <WorkflowActionSheet
                            stepId={step.id}
                            title={`${step.documentNumber} - ${step.title}`}
                            isActionable={step.isActionable}
                            projectId={step.projectId}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-background/90 shadow-sm">
          <CardHeader>
            <CardTitle>Alert stream</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summaryData.notifications.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-muted/30 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.message}
                    </p>
                  </div>
                  {!item.isRead ? <EdmsStatusBadge status="unread" /> : null}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatEdmsLabel(item.type)}</span>
                  {item.projectName ? <span>{item.projectName}</span> : null}
                  <span>{item.createdLabel}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}