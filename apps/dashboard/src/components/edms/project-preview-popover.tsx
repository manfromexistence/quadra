"use client";

import { Building2, Calendar, ExternalLink, Image as ImageIcon, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { expandImageArray } from "@/lib/storage-utils";
import { Button } from "@midday/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@midday/ui/popover";
import { EdmsStatusBadge } from "./status-badge";

interface ProjectPreviewPopoverProps {
  project: {
    id: string;
    name: string;
    projectNumber: string | null;
    location: string | null;
    status: string;
    description: string | null;
    startDate: string | null;
    endDate: string | null;
    images: string | null;
  };
  children: React.ReactNode;
}

export function ProjectPreviewPopover({ project, children }: ProjectPreviewPopoverProps) {
  const images = expandImageArray(project.images);

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start" side="right">
        <div className="flex flex-col">
          {/* Header */}
          <div className="border-b border-border bg-muted/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold leading-tight">{project.name}</h4>
                {project.projectNumber && (
                  <p className="font-mono text-xs text-muted-foreground">{project.projectNumber}</p>
                )}
              </div>
              <EdmsStatusBadge status={project.status} />
            </div>
          </div>

          {/* Preview Section */}
          <div className="p-4">
            {images.length > 0 ? (
              <div className="space-y-3">
                {/* Main Image */}
                <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                  <Image
                    src={images[0]}
                    alt={project.name}
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
                        className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted transition-all hover:shadow-md"
                      >
                        <Image
                          src={imageUrl}
                          alt={`${project.name} - Image ${index + 2}`}
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
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-border bg-card">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Building2 className="size-8 text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground">No project images</p>
                </div>
              </div>
            )}

            {/* Description */}
            {project.description && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="border-t border-border bg-card p-4">
            <div className="space-y-3">
              {project.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{project.location}</span>
                </div>
              )}
              
              {(project.startDate || project.endDate) && (
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="text-sm">
                    {project.startDate && project.endDate
                      ? `${new Date(project.startDate).toLocaleDateString()} - ${new Date(project.endDate).toLocaleDateString()}`
                      : project.startDate
                      ? `Started ${new Date(project.startDate).toLocaleDateString()}`
                      : project.endDate
                      ? `Due ${new Date(project.endDate).toLocaleDateString()}`
                      : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-border p-4">
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <Link href={`/projects/${project.id}`}>View Details</Link>
            </Button>
            <Button size="sm" className="flex-1" asChild>
              <Link href={`/documents?project=${project.id}`}>
                View Documents
                <ExternalLink className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}