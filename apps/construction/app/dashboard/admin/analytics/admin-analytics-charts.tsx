"use client";

import { BarChart3, PieChartIcon, TrendingUp, Users2 } from "lucide-react";
import type { ReactNode } from "react";
import { Bar, BarChart, Label, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

interface AdminAnalyticsChartsProps {
  documentsByMonth: { label: string; value: number }[];
  userGrowthByMonth: { label: string; value: number }[];
  workflowsByStatus: { status: string; count: number }[];
  mostActiveUsers: { id: string; label: string; value: number; subtitle: string | null }[];
  mostActiveProjects: { id: string; label: string; value: number; subtitle: string | null }[];
}

const documentChartConfig = {
  value: {
    label: "Documents uploaded",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const userGrowthChartConfig = {
  value: {
    label: "Users created",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const workflowStatusChartConfig = {
  pending: {
    label: "Pending",
    color: "var(--chart-1)",
  },
  in_progress: {
    label: "In progress",
    color: "var(--chart-2)",
  },
  approved: {
    label: "Approved",
    color: "var(--chart-3)",
  },
  rejected: {
    label: "Rejected",
    color: "var(--chart-4)",
  },
  cancelled: {
    label: "Cancelled",
    color: "var(--chart-5)",
  },
  unknown: {
    label: "Unknown",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

const activeUserChartConfig = {
  value: {
    label: "Activity score",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const activeProjectChartConfig = {
  value: {
    label: "Activity score",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function AdminAnalyticsCharts({
  documentsByMonth,
  userGrowthByMonth,
  workflowsByStatus,
  mostActiveUsers,
  mostActiveProjects,
}: AdminAnalyticsChartsProps) {
  const workflowTotal = workflowsByStatus.reduce((total, item) => total + item.count, 0);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <AnalyticsCard
        title="Documents uploaded over time"
        description="Latest document intake by month across the EDMS workspace."
        icon={<TrendingUp className="size-4" />}
      >
        <ChartContainer config={documentChartConfig} className="h-[280px] w-full">
          <LineChart data={documentsByMonth} margin={{ left: 8, right: 8, top: 12, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={1}
              className="text-xs"
            />
            <YAxis hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Line
              dataKey="value"
              type="monotone"
              stroke="var(--color-value)"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </AnalyticsCard>

      <AnalyticsCard
        title="Workflows by status"
        description="Current distribution of workflow states across the project portfolio."
        icon={<PieChartIcon className="size-4" />}
      >
        <ChartContainer config={workflowStatusChartConfig} className="mx-auto h-[280px] w-full">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={workflowsByStatus.map((item) => ({
                ...item,
                fill: `var(--color-${item.status})`,
              }))}
              dataKey="count"
              nameKey="status"
              innerRadius={72}
              outerRadius={108}
              strokeWidth={4}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-semibold"
                        >
                          {workflowTotal.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 22}
                          className="fill-muted-foreground text-xs"
                        >
                          workflows
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <ChartLegend content={<ChartLegendContent hideIcon />} />
          </PieChart>
        </ChartContainer>
      </AnalyticsCard>

      <AnalyticsCard
        title="User growth over time"
        description="New user registrations captured in the workspace directory."
        icon={<Users2 className="size-4" />}
      >
        <ChartContainer config={userGrowthChartConfig} className="h-[280px] w-full">
          <LineChart data={userGrowthByMonth} margin={{ left: 8, right: 8, top: 12, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={1}
              className="text-xs"
            />
            <YAxis hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Line
              dataKey="value"
              type="monotone"
              stroke="var(--color-value)"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ChartContainer>
      </AnalyticsCard>

      <AnalyticsCard
        title="Most active users"
        description="Ranked by a blended activity score from uploads, workflows, and log entries."
        icon={<BarChart3 className="size-4" />}
      >
        <ChartContainer config={activeUserChartConfig} className="h-[320px] w-full">
          <BarChart
            data={mostActiveUsers}
            layout="vertical"
            margin={{ left: 8, right: 8, top: 4, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={140}
              className="text-xs"
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="value" radius={6} fill="var(--color-value)" />
          </BarChart>
        </ChartContainer>
      </AnalyticsCard>

      <AnalyticsCard
        title="Most active projects"
        description="Ranked by upload, workflow, and activity volume across each project."
        icon={<TrendingUp className="size-4" />}
        className="xl:col-span-2"
      >
        <ChartContainer config={activeProjectChartConfig} className="h-[320px] w-full">
          <BarChart
            data={mostActiveProjects}
            layout="vertical"
            margin={{ left: 8, right: 8, top: 4, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={180}
              className="text-xs"
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="value" radius={6} fill="var(--color-value)" />
          </BarChart>
        </ChartContainer>
      </AnalyticsCard>
    </div>
  );
}

function AnalyticsCard({
  title,
  description,
  icon,
  children,
  className,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden border-border/70 bg-card shadow-sm", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b bg-muted/10">
        <div className="space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="max-w-xl text-sm leading-6">{description}</CardDescription>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted text-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
}
