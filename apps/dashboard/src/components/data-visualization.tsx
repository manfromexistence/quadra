"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function DocumentStatusChart({ data }: { data: any[] }) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <PieChart className="size-4" />
          Document Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ActivityTimelineChart({ data }: { data: any[] }) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="size-4" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="documents"
              stroke="#3b82f6"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="transmittals"
              stroke="#10b981"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DisciplineProgressChart({ data }: { data: any[] }) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="size-4" />
          Progress by Discipline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="discipline" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="completed" fill="#10b981" />
            <Bar dataKey="pending" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
