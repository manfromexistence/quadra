"use client";

import { Calendar, Download, ExternalLink, FileText, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@midday/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@midday/ui/popover";

interface VersionHistoryPopoverProps {
  version: {
    id: string;
    version: string;
    fileName: string;
    fileUrl: string;
    changeDescription?: string | null;
    uploadedByName: string;
    uploadedLabel: string;
  };
  children: React.ReactNode;
}

export function VersionHistoryPopover({ version, children }: VersionHistoryPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" side="right">
        <div className="flex flex-col">
          {/* Header */}
          <div className="border-b border-border bg-muted/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold leading-tight">Version {version.version}</h4>
                <p className="text-sm text-muted-foreground">{version.fileName}</p>
              </div>
              <FileText className="size-5 text-muted-foreground" />
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <span className="text-sm">{version.uploadedByName}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm">{version.uploadedLabel}</span>
            </div>

            {version.changeDescription && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Change Description
                </p>
                <p className="text-sm leading-relaxed">{version.changeDescription}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-border p-4">
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <Link href={version.fileUrl} target="_blank">
                Preview
                <ExternalLink className="size-4" />
              </Link>
            </Button>
            <Button size="sm" className="flex-1" asChild>
              <a href={version.fileUrl} download={version.fileName}>
                Download
                <Download className="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}