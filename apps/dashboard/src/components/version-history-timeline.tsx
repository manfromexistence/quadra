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
import { Clock, FileText, GitBranch, User } from "lucide-react";
import { useState } from "react";

interface Version {
  id: string;
  version: string;
  author: string;
  date: string;
  changes: string;
  status: "draft" | "published" | "archived";
}

interface VersionHistoryTimelineProps {
  versions: Version[];
  currentVersion: string;
  onRestore?: (versionId: string) => void;
  onCompare?: (versionId1: string, versionId2: string) => void;
}

export function VersionHistoryTimeline({
  versions,
  currentVersion,
  onRestore,
  onCompare,
}: VersionHistoryTimelineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  const statusColors = {
    draft: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    published:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    archived: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <GitBranch className="mr-2 size-4" />
          Version History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Document Version History</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="compare"
              checked={selectedVersions.length === 2}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedVersions(versions.slice(0, 2).map((v) => v.id));
                } else {
                  setSelectedVersions([]);
                }
              }}
              disabled={versions.length < 2}
            />
            <label htmlFor="compare" className="text-sm">
              Compare versions
            </label>
            {selectedVersions.length === 2 && onCompare && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onCompare(selectedVersions[0], selectedVersions[1]);
                  setIsOpen(false);
                }}
              >
                Compare
              </Button>
            )}
          </div>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-6 pl-10">
              {versions.map((version, index) => (
                <div key={version.id} className="relative">
                  <div className="absolute left-[-32px] top-1 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                    <FileText className="size-3" />
                  </div>
                  <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          Rev {version.version}
                        </span>
                        {version.version === currentVersion && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                        <Badge
                          className={`text-xs ${statusColors[version.status]}`}
                        >
                          {version.status}
                        </Badge>
                      </div>
                      {onRestore && version.version !== currentVersion && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onRestore(version.id);
                            setIsOpen(false);
                          }}
                        >
                          Restore
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="size-3" />
                        <span>{version.author}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="size-3" />
                        <span>{version.date}</span>
                      </div>
                      <p className="text-muted-foreground">{version.changes}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
