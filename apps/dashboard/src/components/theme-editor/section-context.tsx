"use client";

import { createContext } from "react";

interface SectionContextValue {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  toggleExpanded: () => void;
}

export const SectionContext = createContext<SectionContextValue | null>(null);
