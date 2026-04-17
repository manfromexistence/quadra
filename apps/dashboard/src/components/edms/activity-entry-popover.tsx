"use client";

import { Activity, Calendar, ExternalLink, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@midday/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@midday/ui/popover";
import { formatEdmsLabel } from "./status-badge";

interface ActivityEntryPopoverProps {
  entry: {
    id: string;
    actorName: string;
    action: string;
    entityName?: string | null;
    description?: string | null;
    createdLabel: string;
    entityType?: string;
    projectName?: string;
  };
  children: React.ReactNode;
}

export function ActivityEntryPopover({ entry, children }: ActivityEntryPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" side="right">
        <div className="flex flex-col">
          {/* Header */}
          <div className="border-b border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <Activity className="size-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold leading-tight">
                  {formatEdmsLabel(entry.action)}
                </h4>
                {entry.entityName && (
                  <p className="text-sm text-muted-foreground">{entry.entityName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">{entry.actorName}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm">{entry.createdLabel}</span>
            </div>

            {entry.entityType && (
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-muted-foreground" />
                <span className="text-sm">{formatEdmsLabel(entry.entityType)}</span>
              </div>
            )}

            {entry.description && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Details
                </p>
                <p className="text-sm leading-relaxed">{entry.description}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-border p-4">
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <Link href={`/activity?filter=${entry.actorName}`}>
                View All Activity
              </Link>
            </Button>
            {entry.entityName && (
              <Button size="sm" className="flex-1" asChild>
                <Link href={`/search?q=${entry.entityName}`}>
                  Find Related
                  <ExternalLink className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}