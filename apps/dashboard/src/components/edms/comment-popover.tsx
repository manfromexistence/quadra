"use client";

import { Calendar, MessageSquare, User } from "lucide-react";
import { Button } from "@midday/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@midday/ui/popover";
import { formatEdmsLabel } from "./status-badge";

interface CommentPopoverProps {
  comment: {
    id: string;
    authorName: string;
    commentType: string;
    comment: string;
    createdLabel: string;
  };
  children: React.ReactNode;
}

export function CommentPopover({ comment, children }: CommentPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" side="right">
        <div className="flex flex-col">
          {/* Header */}
          <div className="border-b border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="size-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold leading-tight">{comment.authorName}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatEdmsLabel(comment.commentType)}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm">{comment.createdLabel}</span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Comment
              </p>
              <p className="text-sm leading-relaxed">{comment.comment}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-border p-4">
            <Button size="sm" variant="outline" className="flex-1">
              Reply
            </Button>
            <Button size="sm" className="flex-1">
              Mark Resolved
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}