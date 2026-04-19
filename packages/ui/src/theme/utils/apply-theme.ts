import * as culori from "culori";
import { COMMON_STYLES } from "../config/theme";
import type { ThemeEditorState } from "../types/editor";
import type { ThemeStyleProps } from "../types/theme";

const directCssKeys = new Set([
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
]);

function formatNumber(value?: number) {
  if (value === undefined || Number.isNaN(value)) {
    return "0";
  }

  return value % 1 === 0
    ? String(value)
    : value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

function toOklchTriplet(value: string) {
  if (!value) {
    return value;
  }

  const trimmed = value.trim();
  const exactMatch = trimmed.match(/^oklch\(\s*([^)]+)\s*\)$/i);
  if (exactMatch) {
    return exactMatch[1].trim();
  }

  const parsed = culori.parse(trimmed);
  if (!parsed) {
    return trimmed;
  }

  const converted = culori.converter("oklch")(parsed);
  return `${formatNumber(converted.l)} ${formatNumber(converted.c)} ${formatNumber(converted.h ?? 0)}`;
}

function toCssVariableValue(key: keyof ThemeStyleProps, value: string) {
  if (COMMON_STYLES.includes(key as (typeof COMMON_STYLES)[number])) {
    return value;
  }

  if (directCssKeys.has(key)) {
    return value.startsWith("oklch(")
      ? value
      : `oklch(${toOklchTriplet(value)})`;
  }

  return toOklchTriplet(value);
}

export function applyThemeToElement(
  themeState: ThemeEditorState,
  rootElement: HTMLElement,
) {
  const activeStyles = themeState.styles[themeState.currentMode];

  rootElement.classList.toggle("dark", themeState.currentMode === "dark");

  for (const [key, value] of Object.entries(activeStyles) as Array<
    [keyof ThemeStyleProps, string]
  >) {
    rootElement.style.setProperty(`--${key}`, toCssVariableValue(key, value));
  }
}

export function resolvePreviewColor(key: keyof ThemeStyleProps, value: string) {
  if (!value) {
    return value;
  }

  if (COMMON_STYLES.includes(key as (typeof COMMON_STYLES)[number])) {
    return value;
  }

  if (directCssKeys.has(key)) {
    return value.startsWith("oklch(")
      ? value
      : `oklch(${toOklchTriplet(value)})`;
  }

  return `oklch(${toOklchTriplet(value)})`;
}
