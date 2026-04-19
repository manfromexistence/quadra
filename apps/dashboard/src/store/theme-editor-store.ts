"use client";

import {
  defaultThemeState,
  getPresetThemeStyles,
  THEME_EDITOR_STORAGE_KEY,
  type ThemeEditorState,
  type ThemeMode,
  type ThemeStyleProps,
  themeCommonKeys,
} from "@midday/ui/theme";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeHistoryEntry {
  state: ThemeEditorState;
  timestamp: number;
}

interface ThemeEditorStore {
  themeState: ThemeEditorState;
  themeCheckpoint: ThemeEditorState | null;
  history: ThemeHistoryEntry[];
  future: ThemeHistoryEntry[];
  setThemeState: (state: ThemeEditorState) => void;
  setCurrentMode: (mode: ThemeMode) => void;
  updateStyle: (
    key: keyof ThemeStyleProps,
    value: string,
    mode?: ThemeMode,
  ) => void;
  applyThemePreset: (preset: string) => void;
  saveThemeCheckpoint: () => void;
  restoreThemeCheckpoint: () => void;
  resetToDefault: () => void;
}

export const useThemeEditorStore = create<ThemeEditorStore>()(
  persist(
    (set, get) => ({
      themeState: defaultThemeState,
      themeCheckpoint: defaultThemeState,
      history: [],
      future: [],
      setThemeState: (newState) => {
        const currentState = get().themeState;

        if (JSON.stringify(currentState) === JSON.stringify(newState)) {
          return;
        }

        set((state) => ({
          themeState: newState,
          history: [
            ...state.history.slice(-29),
            { state: currentState, timestamp: Date.now() },
          ],
          future: [],
        }));
      },
      setCurrentMode: (mode) => {
        const currentState = get().themeState;
        if (currentState.currentMode === mode) {
          return;
        }

        set({
          themeState: {
            ...currentState,
            currentMode: mode,
          },
        });
      },
      updateStyle: (key, value, mode) => {
        const currentState = get().themeState;
        const activeMode = mode ?? currentState.currentMode;
        const isCommonKey = themeCommonKeys.includes(
          key as (typeof themeCommonKeys)[number],
        );

        get().setThemeState({
          ...currentState,
          styles: {
            ...currentState.styles,
            ...(isCommonKey
              ? {
                  light: {
                    ...currentState.styles.light,
                    [key]: value,
                  },
                  dark: {
                    ...currentState.styles.dark,
                    [key]: value,
                  },
                }
              : {
                  [activeMode]: {
                    ...currentState.styles[activeMode],
                    [key]: value,
                  },
                }),
          },
        });
      },
      applyThemePreset: (preset) => {
        const currentState = get().themeState;
        const presetStyles = getPresetThemeStyles(preset);

        get().setThemeState({
          ...currentState,
          preset,
          styles: presetStyles,
          hslAdjustments: defaultThemeState.hslAdjustments,
        });
        set({
          themeCheckpoint: {
            ...currentState,
            preset,
            styles: presetStyles,
            hslAdjustments: defaultThemeState.hslAdjustments,
          },
        });
      },
      saveThemeCheckpoint: () => set({ themeCheckpoint: get().themeState }),
      restoreThemeCheckpoint: () => {
        const checkpoint = get().themeCheckpoint;
        if (!checkpoint) {
          return;
        }

        get().setThemeState({
          ...checkpoint,
          currentMode: get().themeState.currentMode,
        });
      },
      resetToDefault: () => {
        set({
          themeState: defaultThemeState,
          themeCheckpoint: defaultThemeState,
          history: [],
          future: [],
        });
      },
    }),
    {
      name: THEME_EDITOR_STORAGE_KEY,
    },
  ),
);
