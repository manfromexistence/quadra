"use client";

import { ThemeControlPanel } from "./theme-control-panel";
import { ThemePreviewPanel } from "./theme-preview-panel";

export function ThemeEditor() {
  return (
    <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
      <ThemeControlPanel />
      <ThemePreviewPanel />
    </div>
  );
}
