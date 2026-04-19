import { createThemeInitializationScript } from "@midday/ui/theme";

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: createThemeInitializationScript() }}
      suppressHydrationWarning
    />
  );
}
