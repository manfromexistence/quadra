"use client";

import { Button } from "@midday/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@midday/ui/popover";
import { Calendar, ExternalLink, Send, User } from "lucide-react";
import Link from "next/link";
import { EdmsStatusBadge } from "./status-badge";

interface TransmittalPreviewPopoverProps {
  transmittal: {
    id: string;
    subject: string;
    transmittalNumber: string;
    projectName: string;
    status: string;
    sentLabel: string;
  };
  children: React.ReactNode;
}

export function TransmittalPreviewPopover({
  transmittal,
  children,
}: TransmittalPreviewPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" side="right">
        <div className="flex flex-col">
          {/* Header */}
          <div className="border-b border-border bg-muted/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold leading-tight">
                  {transmittal.subject}
                </h4>
                <p className="font-mono text-xs text-muted-foreground">
                  {transmittal.transmittalNumber}
                </p>
              </div>
              <EdmsStatusBadge status={transmittal.status} />
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <span className="text-sm">{transmittal.projectName}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm">{transmittal.sentLabel}</span>
            </div>

            <div className="flex items-center gap-2">
              <Send className="size-4 text-muted-foreground" />
              <span className="text-sm capitalize">
                {transmittal.status.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-border p-4">
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <Link href={`/transmittals/${transmittal.id}`}>View Details</Link>
            </Button>
            <Button size="sm" className="flex-1" asChild>
              <Link href={`/transmittals?project=${transmittal.projectName}`}>
                Project Transmittals
                <ExternalLink className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
