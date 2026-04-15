"use client";

import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";

const TABS = ["colors", "typography", "other" /* , "ai" */] as const;
export const DEFAULT_TAB = TABS[0];
export type ControlTab = (typeof TABS)[number];

export const useControlsTabFromUrl = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [tab, setTab] = useQueryState("tab", {
    defaultValue: DEFAULT_TAB,
    history: "push",
    shallow: false,
    parse: (value: string) => {
      // Synchronously validate the tab value, and if it's invalid, fallback to the default tab
      if (!TABS.includes(value as ControlTab)) {
        console.warn(`Invalid tab value: ${value}. Falling back to default.`);
        return DEFAULT_TAB;
      }
      return value as ControlTab;
    },
  });

  const handleSetTab = (tab: ControlTab) => {
    if (!isClient) return;

    // If the incoming tab is invalid, fallback to the default tab
    if (!TABS.includes(tab)) {
      console.warn(`Invalid tab value: ${tab}. Falling back to default.`);
      setTab(DEFAULT_TAB);
      return;
    }

    setTab(tab);
  };

  return { tab: tab ?? DEFAULT_TAB, handleSetTab };
};
