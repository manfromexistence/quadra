"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";
import { useEffect } from "react";
import { useThemeEditorStore } from "@/store/theme-editor-store";
import { useThemePresetStore } from "@/store/theme-preset-store";

export function ThemePresetSelect() {
  const preset = useThemeEditorStore(
    (state) => state.themeState.preset ?? "quadra",
  );
  const applyThemePreset = useThemeEditorStore(
    (state) => state.applyThemePreset,
  );
  const presets = useThemePresetStore((state) => state.getAllPresets());
  const loadSavedPresets = useThemePresetStore(
    (state) => state.loadSavedPresets,
  );

  useEffect(() => {
    void loadSavedPresets();
  }, [loadSavedPresets]);

  return (
    <Select value={preset} onValueChange={applyThemePreset}>
      <SelectTrigger>
        <SelectValue placeholder="Select theme preset" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(presets).map(([key, themePreset]) => (
          <SelectItem key={key} value={key}>
            {themePreset.label ?? key}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
