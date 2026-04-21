"use client";

import { Badge } from "@midday/ui/badge";
import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { Clock, FileText, Send, TrendingUp, Users } from "lucide-react";

interface DashboardWidgetProps {
  type: "documents" | "transmittals" | "workflows" | "notifications";
  data?: any;
}

export function DashboardWidget({ type, data }: DashboardWidgetProps) {
  const widgets = {
    documents: {
      title: "Document Overview",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      stats: [
        { label: "Total", value: data?.total || 0 },
        {
          label: "Pending",
          value: data?.pending || 0,
          color: "text-amber-600",
        },
        {
          label: "Approved",
          value: data?.approved || 0,
          color: "text-green-600",
        },
      ],
    },
    transmittals: {
      title: "Transmittal Status",
      icon: Send,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      stats: [
        { label: "Sent", value: data?.sent || 0 },
        { label: "Received", value: data?.received || 0 },
        {
          label: "Pending",
          value: data?.pending || 0,
          color: "text-amber-600",
        },
      ],
    },
    workflows: {
      title: "Workflow Progress",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      stats: [
        { label: "Active", value: data?.active || 0 },
        {
          label: "Completed",
          value: data?.completed || 0,
          color: "text-green-600",
        },
        { label: "Overdue", value: data?.overdue || 0, color: "text-red-600" },
      ],
    },
    notifications: {
      title: "Recent Activity",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      stats: [
        { label: "Unread", value: data?.unread || 0, color: "text-blue-600" },
        { label: "Today", value: data?.today || 0 },
        { label: "This Week", value: data?.week || 0 },
      ],
    },
  };

  const widget = widgets[type];
  const Icon = widget.icon;

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${widget.bgColor}`}>
              <Icon className={`size-5 ${widget.color}`} />
            </div>
            <CardTitle className="text-base">{widget.title}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {widget.stats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {stat.label}
              </span>
              <span
                className={`text-sm font-semibold ${stat.color || "text-foreground"}`}
              >
                {stat.value}
              </span>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="w-full mt-2">
            <TrendingUp className="mr-2 size-4" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardWidgetsGrid({
  widgets,
}: {
  widgets: Array<{ type: any; data?: any }>;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {widgets.map((widget) => (
        <DashboardWidget
          key={widget.type}
          type={widget.type}
          data={widget.data}
        />
      ))}
    </div>
  );
}
