"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useUserQuery } from "@/hooks/use-user";
import { useTRPC } from "@/trpc/client";

interface WidgetCardProps {
  label: string;
  href: string;
  value: string;
  detail?: string;
}

function WidgetCard({ label, href, value, detail }: WidgetCardProps) {
  return (
    <Link
      href={href}
      className="h-full border border-border p-5 flex flex-col justify-between transition-all duration-300 bg-card hover:bg-accent hover:shadow-sm cursor-pointer group min-h-[110px]"
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="mt-3">
        <span className="text-xl font-medium">{value}</span>
        {detail ? (
          <span className="text-xs text-muted-foreground ml-2">{detail}</span>
        ) : null}
      </div>
    </Link>
  );
}

export function WidgetCards() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.overview.summary.queryOptions());

  // Use the actual EDMS metrics from the dashboard data
  const projectsValue = data.edmsMetrics?.projects?.value ?? "0";
  const projectsDetail = data.edmsMetrics?.projects?.description ?? "Active projects";

  const documentsValue = data.edmsMetrics?.documents?.value ?? "0";
  const documentsDetail = data.edmsMetrics?.documents?.description ?? "Controlled documents";

  const workflowsValue = data.edmsMetrics?.workflows?.value ?? "0";
  const workflowsDetail = data.edmsMetrics?.workflows?.description ?? "Pending reviews";

  const transmittalsValue = data.edmsMetrics?.transmittals?.value ?? "0";
  const transmittalsDetail = data.edmsMetrics?.transmittals?.description ?? "Open transmittals";

  const notificationsValue = data.edmsMetrics?.notifications?.value ?? "0";
  const notificationsDetail = data.edmsMetrics?.notifications?.description ?? "Unread alerts";

  const inboxValue = String(data.inboxPending.count);
  const inboxDetail =
    data.inboxPending.count === 0 ? "All caught up" : "To review";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
      <WidgetCard
        label="Projects"
        href="/projects"
        value={projectsValue}
        detail={projectsDetail}
      />
      <WidgetCard
        label="Documents"
        href="/documents"
        value={documentsValue}
        detail={documentsDetail}
      />
      <WidgetCard
        label="Workflows"
        href="/workflows"
        value={workflowsValue}
        detail={workflowsDetail}
      />
      <WidgetCard
        label="Transmittals"
        href="/transmittals"
        value={transmittalsValue}
        detail={transmittalsDetail}
      />
      <WidgetCard
        label="Notifications"
        href="/notifications"
        value={notificationsValue}
        detail={notificationsDetail}
      />
      <WidgetCard
        label="Inbox"
        href="/inbox?status=pending"
        value={inboxValue}
        detail={inboxDetail}
      />
    </div>
  );
}
