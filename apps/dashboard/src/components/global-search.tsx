"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useKeyboardShortcuts();

  useEffect(() => {
    const handleOpenSearch = () => setOpen(true);
    document.addEventListener("open-global-search", handleOpenSearch);
    return () =>
      document.removeEventListener("open-global-search", handleOpenSearch);
  }, []);

  const searchItems = [
    {
      id: "documents",
      label: "Documents",
      icon: "📄",
      href: "/documents",
      shortcut: "D",
    },
    {
      id: "projects",
      label: "Projects",
      icon: "📁",
      href: "/projects",
      shortcut: "P",
    },
    {
      id: "transmittals",
      label: "Transmittals",
      icon: "✉️",
      href: "/transmittals",
      shortcut: "T",
    },
    {
      id: "workflows",
      label: "Workflows",
      icon: "⚡",
      href: "/workflows",
      shortcut: "W",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: "🔔",
      href: "/notifications",
      shortcut: "N",
    },
    {
      id: "reports",
      label: "Reports",
      icon: "📊",
      href: "/reports",
      shortcut: "R",
    },
    {
      id: "schedule",
      label: "Schedule",
      icon: "📅",
      href: "/schedule",
      shortcut: "S",
    },
    {
      id: "databook",
      label: "Data Book",
      icon: "📚",
      href: "/databook",
      shortcut: "B",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙️",
      href: "/settings",
      shortcut: ",",
    },
  ];

  const filteredItems = searchItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Search className="size-4" />
        <span>Search...</span>
        <kbd className="hidden ml-auto flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type a command or search..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {filteredItems.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => {
                  router.push(item.href);
                  setOpen(false);
                  toast(`Navigated to ${item.label}`);
                }}
              >
                <span className="mr-2">{item.icon}</span>
                <span>{item.label}</span>
                <kbd className="ml-auto flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                  {item.shortcut}
                </kbd>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
