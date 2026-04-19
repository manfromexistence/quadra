import { z } from "zod";

export const themeColorKeys = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
  "shadow-color",
] as const;

export const themeCommonKeys = [
  "font-sans",
  "font-serif",
  "font-mono",
  "radius",
  "shadow-opacity",
  "shadow-blur",
  "shadow-spread",
  "shadow-offset-x",
  "shadow-offset-y",
  "letter-spacing",
  "spacing",
] as const;

export const themeStylePropsSchema = z.object({
  background: z.string(),
  foreground: z.string(),
  card: z.string(),
  "card-foreground": z.string(),
  popover: z.string(),
  "popover-foreground": z.string(),
  primary: z.string(),
  "primary-foreground": z.string(),
  secondary: z.string(),
  "secondary-foreground": z.string(),
  muted: z.string(),
  "muted-foreground": z.string(),
  accent: z.string(),
  "accent-foreground": z.string(),
  destructive: z.string(),
  "destructive-foreground": z.string(),
  border: z.string(),
  input: z.string(),
  ring: z.string(),
  "chart-1": z.string(),
  "chart-2": z.string(),
  "chart-3": z.string(),
  "chart-4": z.string(),
  "chart-5": z.string(),
  sidebar: z.string(),
  "sidebar-foreground": z.string(),
  "sidebar-primary": z.string(),
  "sidebar-primary-foreground": z.string(),
  "sidebar-accent": z.string(),
  "sidebar-accent-foreground": z.string(),
  "sidebar-border": z.string(),
  "sidebar-ring": z.string(),
  "font-sans": z.string(),
  "font-serif": z.string(),
  "font-mono": z.string(),
  radius: z.string(),
  "shadow-color": z.string(),
  "shadow-opacity": z.string(),
  "shadow-blur": z.string(),
  "shadow-spread": z.string(),
  "shadow-offset-x": z.string(),
  "shadow-offset-y": z.string(),
  "letter-spacing": z.string(),
  spacing: z.string().optional(),
});

export const themeStylesSchema = z.object({
  light: themeStylePropsSchema,
  dark: themeStylePropsSchema,
});

export type ThemeMode = "light" | "dark";
export type ThemeStyleProps = z.infer<typeof themeStylePropsSchema>;
export type ThemeStyles = z.infer<typeof themeStylesSchema>;

export type ThemePreset = {
  source?: "SAVED" | "BUILT_IN";
  createdAt?: string;
  label?: string;
  styles: {
    light: Partial<ThemeStyleProps>;
    dark: Partial<ThemeStyleProps>;
  };
};

export interface Theme {
  id: string;
  userId?: string;
  name: string;
  styles: ThemeStyles;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  isPublished?: boolean;
}
