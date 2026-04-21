"use client";

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
          <div
            className="h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all flex items-center justify-center cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {actions.map((action) => (
            <DropdownMenuItem key={action.label} asChild>
              {action.href ? (
                <Link href={action.href} className="cursor-pointer">
                  <action.icon className="mr-2 h-4 w-4" />
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
                  <action.icon className="mr-2 h-4 w-4" />
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
