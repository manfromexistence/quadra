"use client";

import { Button } from "@midday/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@midday/ui/popover";
import { Building2, Calendar, ExternalLink, Mail, User } from "lucide-react";
import Link from "next/link";
import { EdmsStatusBadge } from "./status-badge";

interface TeamMemberPopoverProps {
  member: {
    id: string;
    name: string;
    email: string;
    role: string;
    organization?: string | null;
    assignedLabel: string;
  };
  children: React.ReactNode;
}

export function TeamMemberPopover({
  member,
  children,
}: TeamMemberPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" side="right">
        <div className="flex flex-col">
          {/* Header */}
          <div className="border-b border-border bg-muted/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold leading-tight">{member.name}</h4>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>
              <EdmsStatusBadge status={member.role} />
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <span className="text-sm capitalize">
                {member.role.replace("_", " ")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              <a
                href={`mailto:${member.email}`}
                className="text-sm text-primary hover:underline"
              >
                {member.email}
              </a>
            </div>

            {member.organization && (
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-muted-foreground" />
                <span className="text-sm">{member.organization}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm">{member.assignedLabel}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-border p-4">
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <a href={`mailto:${member.email}`}>
                Send Email
                <Mail className="size-4" />
              </a>
            </Button>
            <Button size="sm" className="flex-1" asChild>
              <Link href={`/team?member=${member.id}`}>
                View Profile
                <ExternalLink className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
