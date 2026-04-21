"use client";

import { Badge } from "@midday/ui/badge";
import { Button } from "@midday/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@midday/ui/dialog";
import { Switch } from "@midday/ui/switch";
import { Calendar, FileText, Mail, Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Integration {
  id: string;
  name: string;
  icon: any;
  status: "connected" | "disconnected";
  description: string;
  lastSync?: string;
}

export function IntegrationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "email",
      name: "Email Notifications",
      icon: Mail,
      status: "connected",
      description: "Send email notifications for document updates",
      lastSync: "5 min ago",
    },
    {
      id: "calendar",
      name: "Calendar Sync",
      icon: Calendar,
      status: "disconnected",
      description: "Sync deadlines with your calendar",
    },
    {
      id: "cad",
      name: "CAD Software",
      icon: FileText,
      status: "connected",
      description: "AutoCAD integration for drawing uploads",
      lastSync: "1 hour ago",
    },
  ]);

  const toggleIntegration = (id: string) => {
    setIntegrations(
      integrations.map((int) =>
        int.id === id
          ? {
              ...int,
              status:
                int.status === "connected"
                  ? "disconnected"
                  : ("connected" as any),
            }
          : int,
      ),
    );
    toast(
      `Integration ${integrations.find((i) => i.id === id)?.name} ${integrations.find((i) => i.id === id)?.status === "connected" ? "disconnected" : "connected"}`,
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 size-4" />
          Integrations
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Integrations</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <div
                key={integration.id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card"
              >
                <div className="p-2 rounded-lg bg-muted">
                  <Icon className="size-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{integration.name}</span>
                    <Badge
                      variant={
                        integration.status === "connected"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {integration.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {integration.description}
                  </div>
                  {integration.lastSync && (
                    <div className="text-xs text-muted-foreground">
                      Last sync: {integration.lastSync}
                    </div>
                  )}
                </div>
                <Switch
                  checked={integration.status === "connected"}
                  onCheckedChange={() => toggleIntegration(integration.id)}
                />
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
