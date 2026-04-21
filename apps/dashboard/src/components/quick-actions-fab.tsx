"use client";

import { Button } from "@midday/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@midday/ui/dropdown-menu";
import { FilePlus, FolderPlus, Plus, Send, Upload, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export function QuickActionsFAB() {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: "New Document",
      icon: FilePlus,
      href: "/documents/new",
      shortcut: "⌘N",
    },
    {
      label: "New Project",
      icon: FolderPlus,
      href: "/projects/new",
      shortcut: "⌘P",
    },
    {
      label: "New Transmittal",
      icon: Send,
      href: "/transmittals/new",
      shortcut: "⌘T",
    },
    {
      label: "Upload Documents",
      icon: Upload,
      action: () => {
        toast("Document upload opened");
        // Trigger upload dialog
      },
      shortcut: "⌘U",
    },
    {
      label: "Create Workflow",
      icon: Zap,
      href: "/workflows/new",
      shortcut: "⌘W",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="size-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {actions.map((action) => (
            <DropdownMenuItem key={action.label} asChild>
              {action.href ? (
                <Link href={action.href} className="cursor-pointer">
                  <action.icon className="mr-2 size-4" />
                  <span>{action.label}</span>
                  <kbd className="ml-auto text-xs text-muted-foreground">
                    {action.shortcut}
                  </kbd>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    action.action?.();
                    setIsOpen(false);
                  }}
                  className="w-full cursor-pointer"
                >
                  <action.icon className="mr-2 size-4" />
                  <span>{action.label}</span>
                  <kbd className="ml-auto text-xs text-muted-foreground">
                    {action.shortcut}
                  </kbd>
                </button>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
