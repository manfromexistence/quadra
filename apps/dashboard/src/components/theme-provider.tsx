"use client";

import { applyThemeToElement } from "@midday/ui/theme";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useThemeEditorStore } from "@/store/theme-editor-store";

type ThemeProviderProps = Parameters<typeof NextThemesProvider>[0];

function ThemeEditorSync({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const themeState = useThemeEditorStore((state) => state.themeState);
  const setCurrentMode = useThemeEditorStore((state) => state.setCurrentMode);

  const currentMode = resolvedTheme === "dark" ? "dark" : "light";

  useEffect(() => {
    setCurrentMode(currentMode);
  }, [currentMode, setCurrentMode]);

  useEffect(() => {
    applyThemeToElement(
      {
        ...themeState,
        currentMode,
      },
      document.documentElement,
    );
  }, [currentMode, themeState]);

  return <>{children}</>;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeEditorSync>{children}</ThemeEditorSync>
    </NextThemesProvider>
  );
}
