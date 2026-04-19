import type { ThemeMode, ThemeStyles } from "./theme";

export interface ThemeEditorState {
  preset?: string;
  styles: ThemeStyles;
  currentMode: ThemeMode;
  hslAdjustments?: {
    hueShift: number;
    saturationScale: number;
    lightnessScale: number;
  };
}
