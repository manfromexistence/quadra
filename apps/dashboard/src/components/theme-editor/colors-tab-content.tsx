"use client";

import { Button } from "@midday/ui/button";
import { cn } from "@midday/ui/cn";
import { ScrollArea } from "@midday/ui/scroll-area";
import type { ThemeStyleProps } from "@midday/ui/theme";
import { RefreshCw, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ColorPicker } from "./color-picker";
import { ControlSection } from "./control-section";

type ColorEntry = {
  key: keyof ThemeStyleProps;
  name: string;
  label: string;
};

type ColorGroup = {
  title: string;
  expanded?: boolean;
  colors: ColorEntry[];
};

const COLOR_GROUPS: ColorGroup[] = [
  {
    title: "Primary",
    expanded: true,
    colors: [
      { key: "primary", name: "primary", label: "Background" },
      {
        key: "primary-foreground",
        name: "primary-foreground",
        label: "Foreground",
      },
    ],
  },
  {
    title: "Secondary",
    expanded: true,
    colors: [
      { key: "secondary", name: "secondary", label: "Background" },
      {
        key: "secondary-foreground",
        name: "secondary-foreground",
        label: "Foreground",
      },
    ],
  },
  {
    title: "Accent",
    expanded: true,
    colors: [
      { key: "accent", name: "accent", label: "Background" },
      {
        key: "accent-foreground",
        name: "accent-foreground",
        label: "Foreground",
      },
    ],
  },
  {
    title: "Base",
    expanded: true,
    colors: [
      { key: "background", name: "background", label: "Background" },
      { key: "foreground", name: "foreground", label: "Foreground" },
    ],
  },
  {
    title: "Card",
    expanded: true,
    colors: [
      { key: "card", name: "card", label: "Background" },
      { key: "card-foreground", name: "card-foreground", label: "Foreground" },
    ],
  },
  {
    title: "Popover",
    expanded: true,
    colors: [
      { key: "popover", name: "popover", label: "Background" },
      {
        key: "popover-foreground",
        name: "popover-foreground",
        label: "Foreground",
      },
    ],
  },
  {
    title: "Muted",
    expanded: true,
    colors: [
      { key: "muted", name: "muted", label: "Background" },
      {
        key: "muted-foreground",
        name: "muted-foreground",
        label: "Foreground",
      },
    ],
  },
  {
    title: "Destructive",
    expanded: true,
    colors: [
      { key: "destructive", name: "destructive", label: "Background" },
      {
        key: "destructive-foreground",
        name: "destructive-foreground",
        label: "Foreground",
      },
    ],
  },
  {
    title: "Border & Input",
    expanded: true,
    colors: [
      { key: "border", name: "border", label: "Border" },
      { key: "input", name: "input", label: "Input" },
      { key: "ring", name: "ring", label: "Ring" },
    ],
  },
  {
    title: "Chart",
    expanded: true,
    colors: [
      { key: "chart-1", name: "chart-1", label: "Chart 1" },
      { key: "chart-2", name: "chart-2", label: "Chart 2" },
      { key: "chart-3", name: "chart-3", label: "Chart 3" },
      { key: "chart-4", name: "chart-4", label: "Chart 4" },
      { key: "chart-5", name: "chart-5", label: "Chart 5" },
    ],
  },
  {
    title: "Sidebar",
    expanded: true,
    colors: [
      { key: "sidebar", name: "sidebar", label: "Background" },
      {
        key: "sidebar-foreground",
        name: "sidebar-foreground",
        label: "Foreground",
      },
      { key: "sidebar-primary", name: "sidebar-primary", label: "Primary" },
      {
        key: "sidebar-primary-foreground",
        name: "sidebar-primary-foreground",
        label: "Primary FG",
      },
      { key: "sidebar-accent", name: "sidebar-accent", label: "Accent" },
      {
        key: "sidebar-accent-foreground",
        name: "sidebar-accent-foreground",
        label: "Accent FG",
      },
      { key: "sidebar-border", name: "sidebar-border", label: "Border" },
      { key: "sidebar-ring", name: "sidebar-ring", label: "Ring" },
    ],
  },
];

const SIDEBAR_SYNC_MAP: Partial<
  Record<keyof ThemeStyleProps, keyof ThemeStyleProps>
> = {
  sidebar: "background",
  "sidebar-foreground": "foreground",
  "sidebar-primary": "primary",
  "sidebar-primary-foreground": "primary-foreground",
  "sidebar-accent": "accent",
  "sidebar-accent-foreground": "accent-foreground",
  "sidebar-border": "border",
  "sidebar-ring": "ring",
};

const BASE_TO_SIDEBAR_MAP = Object.fromEntries(
  Object.entries(SIDEBAR_SYNC_MAP).map(([sidebarKey, baseKey]) => [
    baseKey,
    sidebarKey,
  ]),
) as Partial<Record<keyof ThemeStyleProps, keyof ThemeStyleProps>>;

interface ColorsTabContentProps {
  currentStyles: ThemeStyleProps;
  updateStyle: <K extends keyof ThemeStyleProps>(
    key: K,
    value: ThemeStyleProps[K],
  ) => void;
  updateStyles: (updates: Partial<ThemeStyleProps>) => void;
}

export function ColorsTabContent({
  currentStyles,
  updateStyle,
  updateStyles,
}: ColorsTabContentProps) {
  const [search, setSearch] = useState("");
  const [sidebarSyncEnabled, setSidebarSyncEnabled] = useState(false);

  const syncSidebarToBase = useCallback(() => {
    const updates: Partial<ThemeStyleProps> = {};

    for (const [sidebarKey, baseKey] of Object.entries(SIDEBAR_SYNC_MAP)) {
      const baseValue = currentStyles[baseKey as keyof ThemeStyleProps];
      if (baseValue !== undefined) {
        (updates as Record<string, string>)[sidebarKey] = baseValue;
      }
    }

    updateStyles(updates);
  }, [currentStyles, updateStyles]);

  useEffect(() => {
    if (sidebarSyncEnabled) {
      syncSidebarToBase();
    }
  }, [sidebarSyncEnabled, syncSidebarToBase]);

  const wrappedUpdateStyle = useCallback(
    <K extends keyof ThemeStyleProps>(key: K, value: ThemeStyleProps[K]) => {
      if (sidebarSyncEnabled && key in BASE_TO_SIDEBAR_MAP) {
        const sidebarKey = BASE_TO_SIDEBAR_MAP[key];
        if (sidebarKey) {
          updateStyles({
            [key]: value,
            [sidebarKey]: value,
          } as Partial<ThemeStyleProps>);
          return;
        }
      }

      updateStyle(key, value);
    },
    [sidebarSyncEnabled, updateStyle, updateStyles],
  );

  const filteredGroups = useMemo(() => {
    if (!search.trim()) {
      return COLOR_GROUPS;
    }

    const query = search.toLowerCase();
    return COLOR_GROUPS.map((group) => ({
      ...group,
      expanded: true,
      colors: group.colors.filter(
        (color) =>
          color.label.toLowerCase().includes(query) ||
          color.name.toLowerCase().includes(query) ||
          group.title.toLowerCase().includes(query),
      ),
    })).filter((group) => group.colors.length > 0);
  }, [search]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-4 py-3">
        <div className="bg-muted/50 flex items-center gap-2.5 rounded-lg border px-3">
          <Search className="text-muted-foreground size-4 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search colors..."
            className="text-foreground placeholder:text-muted-foreground h-9 min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
              aria-label="Clear color search"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-4">
        {filteredGroups.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-xs">
            No matching theme colors.
          </p>
        ) : null}

        {filteredGroups.map((group) => (
          <ControlSection
            key={group.title}
            title={group.title}
            expanded={group.expanded}
            headerAction={
              group.title === "Sidebar" ? (
                <Button
                  type="button"
                  variant={sidebarSyncEnabled ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSidebarSyncEnabled((previous) => !previous)}
                  className={cn(
                    "h-6 px-2 text-[11px] uppercase tracking-wider",
                  )}
                >
                  <RefreshCw className="mr-1 size-3" />
                  {sidebarSyncEnabled ? "Sync On" : "Sync"}
                </Button>
              ) : undefined
            }
          >
            {group.colors.map((color) => (
              <ColorPicker
                key={color.name}
                name={color.name}
                color={currentStyles[color.key] as string}
                onChange={(value) =>
                  wrappedUpdateStyle(
                    color.key,
                    value as ThemeStyleProps[typeof color.key],
                  )
                }
                label={color.label}
              />
            ))}
          </ControlSection>
        ))}
      </ScrollArea>
    </div>
  );
}
