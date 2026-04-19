import {
  defaultDarkThemeStyles,
  defaultLightThemeStyles,
} from "../config/theme";

export const THEME_EDITOR_STORAGE_KEY = "dashboard-theme-editor";

export function createThemeInitializationScript(
  storageKey = THEME_EDITOR_STORAGE_KEY,
) {
  return `
    (() => {
      const root = document.documentElement;
      const directCssKeys = new Set([
        "sidebar",
        "sidebar-foreground",
        "sidebar-primary",
        "sidebar-primary-foreground",
        "sidebar-accent",
        "sidebar-accent-foreground",
        "sidebar-border",
        "sidebar-ring"
      ]);
      const commonKeys = new Set(${JSON.stringify(["font-sans", "font-serif", "font-mono", "radius", "shadow-opacity", "shadow-blur", "shadow-spread", "shadow-offset-x", "shadow-offset-y", "letter-spacing", "spacing"])});
      const lightStyles = ${JSON.stringify(defaultLightThemeStyles)};
      const darkStyles = ${JSON.stringify(defaultDarkThemeStyles)};

      const normalize = (key, value) => {
        if (!value || commonKeys.has(key)) return value;
        const trimmed = String(value).trim();
        if (directCssKeys.has(key)) {
          if (trimmed.startsWith("oklch(")) return trimmed;
          return "oklch(" + trimmed.replace(/^oklch\\(|\\)$/g, "") + ")";
        }
        if (trimmed.startsWith("oklch(") && trimmed.endsWith(")")) {
          return trimmed.slice(6, -1).trim();
        }
        return trimmed;
      };

      try {
        const stored = localStorage.getItem(${JSON.stringify(storageKey)});
        const parsed = stored ? JSON.parse(stored) : null;
        const themeState = parsed?.state?.themeState;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const currentMode = themeState?.currentMode ?? (prefersDark ? "dark" : "light");
        const styles = currentMode === "dark"
          ? { ...darkStyles, ...(themeState?.styles?.dark ?? {}) }
          : { ...lightStyles, ...(themeState?.styles?.light ?? {}) };

        root.classList.toggle("dark", currentMode === "dark");

        for (const [key, value] of Object.entries(styles)) {
          root.style.setProperty("--" + key, normalize(key, value));
        }
      } catch (error) {
        root.classList.toggle("dark", window.matchMedia("(prefers-color-scheme: dark)").matches);
      }
    })();
  `;
}
