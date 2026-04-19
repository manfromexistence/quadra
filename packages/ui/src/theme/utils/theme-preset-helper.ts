import {
  defaultDarkThemeStyles,
  defaultLightThemeStyles,
} from "../config/theme";
import type { ThemeStyles } from "../types/theme";
import { defaultPresets } from "./theme-presets";

export function getPresetThemeStyles(name = "quadra"): ThemeStyles {
  const preset = defaultPresets[name] ?? defaultPresets.quadra;

  return {
    light: {
      ...defaultLightThemeStyles,
      ...preset.styles.light,
    },
    dark: {
      ...defaultDarkThemeStyles,
      ...preset.styles.dark,
    },
  };
}
