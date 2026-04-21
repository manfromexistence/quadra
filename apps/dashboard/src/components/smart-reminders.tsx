"use client";

import { Badge } from "@midday/ui/badge";
import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { AlertTriangle, Bell, Clock, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Reminder {
  id: string;
  type: "deadline" | "overdue" | "review";
  title: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
}

export function SmartReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "1",
      type: "deadline",
      title: "Document Review Deadline",
      dueDate: "2026-04-25",
      priority: "high",
    },
    {
      id: "2",
      type: "overdue",
      title: "Transmittal TM-001 Response",
      dueDate: "2026-04-15",
      priority: "high",
    },
    {
      id: "3",
      type: "review",
      title: "Weekly Project Review",
      dueDate: "2026-04-22",
      priority: "medium",
    },
  ]);

  const dismissReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
    toast("Reminder dismissed");
  };

  const snoozeReminder = (id: string) => {
    toast("Reminder snoozed for 1 hour");
  };

  const typeIcons = {
    deadline: Clock,
    overdue: AlertTriangle,
    review: Bell,
  };

  const priorityColors = {
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="size-4" />
            Smart Reminders
          </div>
          <Badge variant="outline">{reminders.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.map((reminder) => {
          const Icon = typeIcons[reminder.type];
          return (
            <div
              key={reminder.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <Icon className="size-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{reminder.title}</span>
                  <Badge
                    className={`text-xs ${priorityColors[reminder.priority]}`}
                  >
                    {reminder.priority}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Due: {reminder.dueDate}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => snoozeReminder(reminder.id)}
                >
                  <Clock className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => dismissReminder(reminder.id)}
                >
                  <X className="size-3" />
                </Button>
              </div>
            </div>
          );
        })}
        {reminders.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No reminders at this time
          </div>
        )}
      </CardContent>
    </Card>
  );
}
