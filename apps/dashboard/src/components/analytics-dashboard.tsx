"use client";

import { Badge } from "@midday/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Users,
} from "lucide-react";
import {
  ActivityTimelineChart,
  DisciplineProgressChart,
  DocumentStatusChart,
} from "./data-visualization";

export function AnalyticsDashboard() {
  const documentData = [
    { name: "Approved", value: 45 },
    { name: "Pending", value: 30 },
    { name: "Draft", value: 15 },
    { name: "Rejected", value: 10 },
  ];

  const activityData = [
    { date: "Jan", documents: 65, transmittals: 28 },
    { date: "Feb", documents: 59, transmittals: 48 },
    { date: "Mar", documents: 80, transmittals: 40 },
    { date: "Apr", documents: 81, transmittals: 56 },
    { date: "May", documents: 56, transmittals: 55 },
    { date: "Jun", documents: 55, transmittals: 40 },
  ];

  const disciplineData = [
    { discipline: "Structural", completed: 45, pending: 15 },
    { discipline: "Mechanical", completed: 38, pending: 22 },
    { discipline: "Electrical", completed: 52, pending: 18 },
    { discipline: "Civil", completed: 40, pending: 30 },
  ];

  const metrics = [
    {
      label: "Total Documents",
      value: "1,234",
      change: "+12%",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      label: "Active Users",
      value: "45",
      change: "+5%",
      icon: Users,
      color: "text-green-600",
    },
    {
      label: "Pending Reviews",
      value: "23",
      change: "-8%",
      icon: Clock,
      color: "text-amber-600",
    },
    {
      label: "On Track",
      value: "89%",
      change: "+2%",
      icon: CheckCircle,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
        <Badge variant="outline">Last 30 days</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.label}
              className="border-border bg-card shadow-sm"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className={`size-5 ${metric.color}`} />
                  <Badge
                    variant={
                      metric.change.startsWith("+") ? "default" : "destructive"
                    }
                    className="text-xs"
                  >
                    {metric.change}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="text-sm text-muted-foreground">
                  {metric.label}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DocumentStatusChart data={documentData} />
        <ActivityTimelineChart data={activityData} />
      </div>

      <DisciplineProgressChart data={disciplineData} />

      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600" />
            Bottlenecks & Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950">
              <div>
                <div className="font-medium">Structural Review Backlog</div>
                <div className="text-sm text-muted-foreground">
                  15 documents pending for over 7 days
                </div>
              </div>
              <Badge variant="destructive">High Priority</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
              <div>
                <div className="font-medium">Transmittal Delays</div>
                <div className="text-sm text-muted-foreground">
                  3 transmittals overdue by 14+ days
                </div>
              </div>
              <Badge variant="secondary">Medium Priority</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
