"use client";

import { Button } from "@midday/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@midday/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@midday/ui/dropdown-menu";
import { Download, ExternalLink, Eye, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

interface DocumentPreviewProps {
  documentId: string;
  documentUrl: string;
  documentName: string;
  trigger?: React.ReactNode;
}

export function DocumentPreview({
  documentId,
  documentUrl,
  documentName,
  trigger,
}: DocumentPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <Eye className="size-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate">{documentName}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="size-4" />
              </Button>
              <span className="text-sm font-mono w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
              >
                <ZoomIn className="size-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Download className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <a
                      href={documentUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 size-4" />
                      Download
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 size-4" />
                      Open in New Tab
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto bg-muted/50 rounded-lg">
          <iframe
            src={documentUrl}
            className="w-full h-full border-0"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
            }}
            title={documentName}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
