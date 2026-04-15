"use client";

import { ExternalLink, FileText, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { expandImageArray } from "@/lib/storage-utils";
import { EdmsStatusBadge } from "./status-badge";

interface DocumentPreviewPopoverProps {
  document: {
    id: string;
    documentNumber: string;
    title: string;
    projectName: string;
    discipline: string | null;
    revision: string | null;
    status: string;
    fileUrl: string;
    fileType: string | null;
    images: string | null;
  };
  children: React.ReactNode;
}

export function DocumentPreviewPopover({ document, children }: DocumentPreviewPopoverProps) {
  const images = expandImageArray(document.images);
  const isPdf = document.fileType?.toLowerCase() === "application/pdf";

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start" side="right">
        <div className="flex flex-col">
          {/* Header */}
          <div className="border-b border-border/70 bg-muted/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold leading-tight">{document.title}</h4>
                <p className="font-mono text-xs text-muted-foreground">{document.documentNumber}</p>
              </div>
              <EdmsStatusBadge status={document.status} />
            </div>
          </div>

          {/* Preview Section */}
          <div className="p-4">
            {images.length > 0 ? (
              <div className="space-y-3">
                {/* Main Image */}
                <div className="relative aspect-video overflow-hidden rounded-lg border border-border/70 bg-muted">
                  <Image
                    src={images[0]}
                    alt={document.title}
                    fill
                    className="object-cover"
                    sizes="384px"
                  />
                </div>

                {/* Additional Images */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(1, 5).map((imageUrl, index) => (
                      <a
                        key={index}
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-square overflow-hidden rounded-md border border-border/70 bg-muted transition-all hover:shadow-md"
                      >
                        <Image
                          src={imageUrl}
                          alt={`${document.title} - Image ${index + 2}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="80px"
                        />
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ImageIcon className="size-3" />
                  <span>
                    {images.length} image{images.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            ) : isPdf ? (
              <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/20">
                <div className="flex flex-col items-center gap-2 text-center">
                  <FileText className="size-8 text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground">PDF Document</p>
                </div>
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/20">
                <div className="flex flex-col items-center gap-2 text-center">
                  <FileText className="size-8 text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground">No preview available</p>
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="border-t border-border/70 bg-muted/20 p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Project</p>
                <p className="mt-1 truncate font-medium">{document.projectName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Discipline</p>
                <p className="mt-1 font-medium">{document.discipline || "General"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Revision</p>
                <p className="mt-1 font-medium">{document.revision || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="mt-1 font-medium">
                  {document.fileType?.split("/")[1]?.toUpperCase() || "Unknown"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-border/70 p-4">
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <Link href={`/dashboard/documents/${document.id}`}>View Details</Link>
            </Button>
            <Button size="sm" className="flex-1" asChild>
              <Link href={document.fileUrl || "#"} target="_blank">
                Open File
                <ExternalLink className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
