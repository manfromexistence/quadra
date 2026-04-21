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
import { Download, Filter, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
}

export function AuditTrail({ resourceId }: { resourceId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, _setLogs] = useState<AuditLog[]>([
    {
      id: "1",
      user: "John Doe",
      action: "VIEW",
      resource: "Document A",
      timestamp: "2026-04-21 10:30:00",
      ipAddress: "192.168.1.100",
    },
    {
      id: "2",
      user: "Jane Smith",
      action: "EDIT",
      resource: "Document A",
      timestamp: "2026-04-21 09:15:00",
      ipAddress: "192.168.1.101",
    },
    {
      id: "3",
      user: "John Doe",
      action: "CREATE",
      resource: "Document A",
      timestamp: "2026-04-20 14:00:00",
      ipAddress: "192.168.1.100",
    },
  ]);

  const handleExport = () => {
    toast("Audit trail exported successfully");
  };

  const actionColors = {
    VIEW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    EDIT: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    CREATE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Shield className="mr-2 size-4" />
          Audit Trail
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Audit Trail</DialogTitle>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 size-4" />
              Export
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Filter by action type
            </span>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-4 p-3 rounded-lg border bg-card"
              >
                <Badge
                  className={
                    actionColors[log.action as keyof typeof actionColors]
                  }
                >
                  {log.action}
                </Badge>
                <div className="flex-1">
                  <div className="font-medium">{log.user}</div>
                  <div className="text-sm text-muted-foreground">
                    {log.action} {log.resource}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>{log.timestamp}</div>
                  <div className="text-xs">{log.ipAddress}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
