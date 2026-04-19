"use client";

import { Button } from "@midday/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@midday/ui/popover";
import { Clock, ExternalLink, FileText, User } from "lucide-react";
import Link from "next/link";
import { EdmsStatusBadge, formatEdmsLabel } from "./status-badge";

interface WorkflowPreviewPopoverProps {
  workflow: {
    id: string;
    stepName: string;
    title: string;
    documentNumber: string;
    projectName: string;
    status: string;
    dueLabel: string;
    assignedRole?: string;
  };
  children: React.ReactNode;
}

export function WorkflowPreviewPopover({
  workflow,
  children,
}: WorkflowPreviewPopoverProps) {
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
                  {workflow.stepName}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {workflow.title}
                </p>
              </div>
              <EdmsStatusBadge status={workflow.status} />
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              <span className="font-mono text-sm">
                {workflow.documentNumber}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <span className="text-sm">{workflow.projectName}</span>
            </div>

            {workflow.assignedRole && (
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <span className="text-sm">
                  {formatEdmsLabel(workflow.assignedRole)}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-sm">{workflow.dueLabel}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-border p-4">
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <Link href={`/workflows/${workflow.id}`}>View Workflow</Link>
            </Button>
            <Button size="sm" className="flex-1" asChild>
              <Link href={`/documents?search=${workflow.documentNumber}`}>
                Find Document
                <ExternalLink className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
