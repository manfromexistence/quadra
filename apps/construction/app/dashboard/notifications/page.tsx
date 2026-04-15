import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { EdmsActivityFeed, EdmsWorkflowQueue } from "@/components/edms/dashboard-sections";
import { EdmsDataState } from "@/components/edms/data-state";
import { EdmsMetricCard } from "@/components/edms/metric-card";
import {
  MarkAllNotificationsReadButton,
  MarkNotificationReadButton,
} from "@/components/edms/notification-actions";
import { EdmsPageHeader } from "@/components/edms/page-header";
import { EdmsStatusBadge, formatEdmsLabel } from "@/components/edms/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEdmsDashboardData } from "@/lib/edms/dashboard";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export default async function NotificationsPage() {
  const sessionUser = await getRequiredDashboardSessionUser();
  const data = await getEdmsDashboardData(sessionUser);
  const [, , workflowMetric, , notificationMetric] = data.metrics;
  const unreadCount = data.notifications.filter((notification) => !notification.isRead).length;

  return (
    <div className="flex flex-1 flex-col">
      <EdmsPageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Notifications" }]}
        title="Notification inbox"
        description="Centralize unread approvals, review requests, and formal package updates so the project team can respond without context switching."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/workflows">
                Pending workflows
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <MarkAllNotificationsReadButton disabled={unreadCount === 0} />
          </>
        }
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <EdmsDataState
          isUsingFallbackData={data.isUsingFallbackData}
          message={data.statusMessage}
        />

        <section className="grid gap-4 md:grid-cols-2">
          <EdmsMetricCard metric={notificationMetric} />
          <EdmsMetricCard metric={workflowMetric} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="bg-card/95">
            <CardHeader className="space-y-1">
              <CardTitle>Notification inbox</CardTitle>
              <CardDescription>
                Read and clear workflow, approval, and transmittal alerts from one surface.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {data.notifications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5">
                  <p className="font-medium">No notifications</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Alerts will appear here as workflows, documents, and transmittals move.
                  </p>
                </div>
              ) : (
                data.notifications.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border/70 bg-muted/25 p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{item.title}</p>
                            {!item.isRead ? <EdmsStatusBadge status="unread" /> : null}
                          </div>
                          <p className="text-sm leading-6 text-muted-foreground">{item.message}</p>
                        </div>
                        {item.isRead ? <EdmsStatusBadge status="completed" /> : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatEdmsLabel(item.type)}</span>
                        {item.projectName ? <span>{item.projectName}</span> : null}
                        <span>{item.createdLabel}</span>
                      </div>

                      <div className="flex items-center justify-end">
                        <div className="flex flex-wrap items-center gap-2">
                          {item.actionUrl ? (
                            <Button size="sm" variant="outline" asChild>
                              <Link href={item.actionUrl}>
                                Open
                                <ExternalLink className="size-4" />
                              </Link>
                            </Button>
                          ) : null}
                          <MarkNotificationReadButton
                            notificationId={item.id}
                            disabled={item.isRead}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <EdmsWorkflowQueue items={data.workflowQueue} />
        </section>

        <section>
          <EdmsActivityFeed items={data.activity} />
        </section>
      </div>
    </div>
  );
}
