import {
  defaultDarkThemeStyles,
  defaultLightThemeStyles,
} from "../config/theme";
import type { ThemePreset } from "../types/theme";

export const defaultPresets: Record<string, ThemePreset> = {
  quadra: {
    label: "Quadra",
    source: "BUILT_IN",
    styles: {
      light: defaultLightThemeStyles,
      dark: defaultDarkThemeStyles,
    },
  },
};
