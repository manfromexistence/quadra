import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { EdmsNotificationList, EdmsWorkflowQueue } from "@/components/edms/dashboard-sections";
import { EdmsDataState } from "@/components/edms/data-state";
import { EdmsMetricCard } from "@/components/edms/metric-card";
import { EdmsPageHeader } from "@/components/edms/page-header";
import { EdmsStatusBadge } from "@/components/edms/status-badge";
import { TransmittalAcknowledgeButton } from "@/components/edms/transmittal-acknowledge-button";
import { TransmittalCreateSheet } from "@/components/edms/transmittal-create-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEdmsDashboardData } from "@/lib/edms/dashboard";
import { canManageEdmsContent } from "@/lib/edms/rbac";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";
import { getTransmittalManagementData } from "@/lib/edms/transmittals";

export default async function TransmittalsPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const [summaryData, data] = await Promise.all([
    getEdmsDashboardData(sessionUser),
    getTransmittalManagementData(sessionUser),
  ]);
  const [transmittalMetric, sentMetric, acknowledgedMetric, notificationMetric] = data.metrics;
  const canCreateTransmittal = canManageEdmsContent(sessionUser.role);

  return (
    <div className="flex flex-1 flex-col">
      <EdmsPageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Transmittals" }]}
        title="Transmittal control"
        description="Track formal issue packages, map them back to live documents, and keep acknowledgement visibility in the same operating surface."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/documents">
                Source documents
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            {canCreateTransmittal ? (
              <TransmittalCreateSheet
                projects={data.projects}
                members={data.members}
                documents={data.documents}
              />
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
          <EdmsMetricCard metric={transmittalMetric} />
          <EdmsMetricCard metric={sentMetric} />
          <EdmsMetricCard metric={acknowledgedMetric} />
          <EdmsMetricCard metric={notificationMetric} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card className="bg-card/95">
            <CardHeader className="space-y-1">
              <CardTitle>Issued transmittals</CardTitle>
              <CardDescription>
                Formal issue packages linked to project documents and recipient acknowledgement.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {data.transmittals.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5">
                  <p className="font-medium">No transmittals yet</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Send a package to start formal issue and acknowledgement tracking.
                  </p>
                </div>
              ) : (
                data.transmittals.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border/70 bg-muted/25 p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-medium">{item.subject}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {item.transmittalNumber}
                          </p>
                        </div>
                        <EdmsStatusBadge status={item.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.projectName}</span>
                        <span>{item.sentLabel}</span>
                        <span>{`${item.documentCount} documents`}</span>
                        <span>{`Recipient: ${item.recipientName}`}</span>
                      </div>

                      <div className="flex items-center justify-end">
                        <TransmittalAcknowledgeButton
                          transmittalId={item.id}
                          isActionable={item.isActionable}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <EdmsWorkflowQueue items={summaryData.workflowQueue} />
        </section>

        <section>
          <EdmsNotificationList items={summaryData.notifications} />
        </section>

        {!canCreateTransmittal ? (
          <section className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
            Transmittal issue is limited to vendor-level roles and above. Listed recipients can
            still acknowledge packages that are addressed to them.
          </section>
        ) : null}
      </div>
    </div>
  );
}
