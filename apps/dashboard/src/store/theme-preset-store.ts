"use client";

import { defaultPresets, type ThemePreset } from "@midday/ui/theme";
import { create } from "zustand";
import { getThemes } from "@/actions/themes";

interface ThemePresetStore {
  presets: Record<string, ThemePreset>;
  registerPreset: (name: string, preset: ThemePreset) => void;
  unregisterPreset: (name: string) => void;
  updatePreset: (name: string, preset: ThemePreset) => void;
  getPreset: (name: string) => ThemePreset | undefined;
  getAllPresets: () => Record<string, ThemePreset>;
  loadSavedPresets: () => Promise<void>;
  unloadSavedPresets: () => void;
}

export const useThemePresetStore = create<ThemePresetStore>()((set, get) => ({
  presets: defaultPresets,
  registerPreset: (name, preset) =>
    set((state) => ({
      presets: {
        ...state.presets,
        [name]: preset,
      },
    })),
  unregisterPreset: (name) =>
    set((state) => {
      const { [name]: _removed, ...rest } = state.presets;
      return { presets: rest };
    }),
  updatePreset: (name, preset) =>
    set((state) => ({
      presets: {
        ...state.presets,
        [name]: preset,
      },
    })),
  getPreset: (name) => get().presets[name],
  getAllPresets: () => get().presets,
  loadSavedPresets: async () => {
    try {
      const themes = await getThemes();
      const savedPresets = themes.reduce<Record<string, ThemePreset>>(
        (acc, theme) => {
          acc[theme.id] = {
            label: theme.name,
            source: "SAVED",
            styles: theme.styles,
          };
          return acc;
        },
        {},
      );

      set((state) => ({
        presets: {
          ...state.presets,
          ...savedPresets,
        },
      }));
    } catch (error) {
      console.error("Failed to load saved theme presets", error);
    }
  },
  unloadSavedPresets: () => set({ presets: defaultPresets }),
}));
