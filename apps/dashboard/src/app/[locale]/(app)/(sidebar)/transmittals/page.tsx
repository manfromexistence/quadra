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
import { EdmsStatusBadge } from "@/components/edms/status-badge";
import { TransmittalCreateSheet } from "@/components/edms/transmittal-create-sheet";
import { TransmittalPreviewPopover } from "@/components/edms/transmittal-preview-popover";
import { WorkflowPreviewPopover } from "@/components/edms/workflow-preview-popover";
import { getEdmsDashboardData } from "@/lib/edms/dashboard";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { getTransmittalManagementData } from "@/lib/edms/transmittals";

export default async function TransmittalsPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const [summaryData, data] = await Promise.all([
    getEdmsDashboardData(sessionUser),
    getTransmittalManagementData(sessionUser),
  ]);

  return (
    <div className="space-y-6 pt-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-3">
          <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-muted-foreground">
            Formal issue control
          </p>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Transmittals
            </h1>
            <p className="text-sm leading-6 text-muted-foreground md:text-base">
              Delivery-package tracking for outbound submissions and acknowledgements 
              with comprehensive transmittal management and review workflow.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <TransmittalCreateSheet
            projects={data.projects}
            members={data.members}
            documents={data.documents}
          />
          <Button variant="outline" asChild>
            <Link href="/documents">
              Open register
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/workflows">
              Review queue
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
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Issued packages</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {data.transmittals.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                No transmittals found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Package</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead className="px-6">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.transmittals.map((item) => (
                    <TransmittalPreviewPopover
                      key={item.id}
                      transmittal={{
                        id: item.id,
                        subject: item.subject,
                        transmittalNumber: item.transmittalNumber,
                        projectName: item.projectName,
                        status: item.status,
                        sentLabel: item.sentLabel,
                      }}
                    >
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="px-6">
                          <div className="space-y-1">
                            <p className="font-medium hover:text-primary">{item.subject}</p>
                            <p className="font-mono text-xs text-muted-foreground">
                              {item.transmittalNumber}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{item.projectName}</TableCell>
                        <TableCell>
                          <EdmsStatusBadge status={item.status} />
                        </TableCell>
                        <TableCell>{item.recipientName}</TableCell>
                        <TableCell>{item.documentCount}</TableCell>
                        <TableCell className="px-6 text-sm text-muted-foreground">
                          {item.sentLabel}
                        </TableCell>
                      </TableRow>
                    </TransmittalPreviewPopover>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Workflow spillover</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summaryData.workflowQueue.map((item) => (
              <WorkflowPreviewPopover
                key={item.id}
                workflow={{
                  id: item.id,
                  stepName: item.stepName,
                  title: item.title,
                  documentNumber: item.documentNumber,
                  projectName: item.projectName,
                  status: item.status,
                  dueLabel: item.dueLabel,
                  assignedRole: item.assignedRole,
                }}
              >
                <div className="cursor-pointer border border-border bg-card p-4 transition-all hover:bg-muted/50 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.stepName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.projectName}
                      </p>
                    </div>
                    <EdmsStatusBadge status={item.status} />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {item.documentNumber} · {item.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.dueLabel}
                  </p>
                </div>
              </WorkflowPreviewPopover>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}