"use client";

import { Button } from "@midday/ui/button";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import { ScrollArea } from "@midday/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@midday/ui/tabs";
import type { ThemeMode, ThemeStyleProps } from "@midday/ui/theme";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { useThemeEditorStore } from "@/store/theme-editor-store";
import { ColorsTabContent } from "./colors-tab-content";
import { ControlSection } from "./control-section";
import { HslAdjustmentControls } from "./hsl-adjustment-controls";
import { ShadowControl } from "./shadow-control";
import { SliderWithInput } from "./slider-with-input";
import { ThemePresetSelect } from "./theme-preset-select";

export function ThemeControlPanel() {
  const { resolvedTheme, setTheme } = useTheme();
  const themeState = useThemeEditorStore((state) => state.themeState);
  const updateStyle = useThemeEditorStore((state) => state.updateStyle);
  const restoreThemeCheckpoint = useThemeEditorStore(
    (state) => state.restoreThemeCheckpoint,
  );
  const resetToDefault = useThemeEditorStore((state) => state.resetToDefault);

  const currentMode = (
    resolvedTheme === "dark" ? "dark" : "light"
  ) as ThemeMode;
  const currentStyles = useMemo(
    () => themeState.styles[currentMode],
    [currentMode, themeState.styles],
  );

  const setThemeState = useThemeEditorStore((state) => state.setThemeState);

  const updateStyles = (updates: Partial<ThemeStyleProps>) => {
    setThemeState({
      ...themeState,
      styles: {
        ...themeState.styles,
        [currentMode]: {
          ...currentStyles,
          ...updates,
        },
      },
    });
  };

  return (
    <div className="flex h-full min-h-[70vh] flex-col overflow-hidden border border-border bg-card">
      <div className="space-y-4 border-b border-border p-4">
        <div>
          <h2 className="text-lg font-semibold">Customizes</h2>
          <p className="text-sm text-muted-foreground">
            Adjust colors, fonts, and layout to create your perfect workspace.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Theme Preset</Label>
          <ThemePresetSelect />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={currentMode === "light" ? "default" : "outline"}
            onClick={() => setTheme("light")}
          >
            Light
          </Button>
          <Button
            type="button"
            variant={currentMode === "dark" ? "default" : "outline"}
            onClick={() => setTheme("dark")}
          >
            Dark
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={restoreThemeCheckpoint}
          >
            Restore
          </Button>
          <Button type="button" variant="outline" onClick={resetToDefault}>
            Reset to Default
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border px-4 py-3">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="colors" className="mt-0 min-h-0 flex-1">
          <ColorsTabContent
            currentStyles={currentStyles}
            updateStyle={updateStyle}
            updateStyles={updateStyles}
          />
        </TabsContent>

        <TabsContent value="typography" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full px-4 py-3">
            <ControlSection title="Fonts" expanded>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="theme-font-sans">Sans</Label>
                  <Input
                    id="theme-font-sans"
                    value={currentStyles["font-sans"] ?? ""}
                    onChange={(event) =>
                      updateStyle("font-sans", event.target.value, currentMode)
                    }
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme-font-serif">Serif</Label>
                  <Input
                    id="theme-font-serif"
                    value={currentStyles["font-serif"] ?? ""}
                    onChange={(event) =>
                      updateStyle("font-serif", event.target.value, currentMode)
                    }
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme-font-mono">Mono</Label>
                  <Input
                    id="theme-font-mono"
                    value={currentStyles["font-mono"] ?? ""}
                    onChange={(event) =>
                      updateStyle("font-mono", event.target.value, currentMode)
                    }
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </ControlSection>

            <ControlSection title="Tracking" expanded>
              <SliderWithInput
                value={Number.parseFloat(
                  currentStyles["letter-spacing"]?.replace("em", "") || "0",
                )}
                onChange={(value) =>
                  updateStyle("letter-spacing", `${value}em`, currentMode)
                }
                min={-0.5}
                max={0.5}
                step={0.025}
                unit="em"
                label="Letter"
              />
            </ControlSection>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="layout" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full px-4 py-3">
            <ControlSection title="Radius" expanded>
              <SliderWithInput
                value={Number.parseFloat(
                  currentStyles.radius?.replace("rem", "") || "0.625",
                )}
                onChange={(value) =>
                  updateStyle("radius", `${value}rem`, currentMode)
                }
                min={0}
                max={4}
                step={0.025}
                unit="rem"
                label="Radius"
              />
            </ControlSection>

            <ControlSection title="Spacing" expanded>
              <SliderWithInput
                value={Number.parseFloat(
                  currentStyles.spacing?.replace("rem", "") || "0.25",
                )}
                onChange={(value) =>
                  updateStyle("spacing", `${value}rem`, currentMode)
                }
                min={0.15}
                max={0.5}
                step={0.01}
                unit="rem"
                label="Spacing"
              />
            </ControlSection>

            <ControlSection title="Shadow" expanded>
              <ShadowControl
                shadowColor={currentStyles["shadow-color"] ?? "oklch(0 0 0)"}
                shadowOpacity={Number.parseFloat(
                  currentStyles["shadow-opacity"] ?? "0.1",
                )}
                shadowBlur={Number.parseFloat(
                  currentStyles["shadow-blur"]?.replace("px", "") || "3",
                )}
                shadowSpread={Number.parseFloat(
                  currentStyles["shadow-spread"]?.replace("px", "") || "0",
                )}
                shadowOffsetX={Number.parseFloat(
                  currentStyles["shadow-offset-x"]?.replace("px", "") || "0",
                )}
                shadowOffsetY={Number.parseFloat(
                  currentStyles["shadow-offset-y"]?.replace("px", "") || "1",
                )}
                onChange={(key, value) => {
                  if (key === "shadow-color" || key === "shadow-opacity") {
                    updateStyle(
                      key as keyof ThemeStyleProps,
                      String(value),
                      currentMode,
                    );
                    return;
                  }

                  updateStyle(
                    key as keyof ThemeStyleProps,
                    `${value}px`,
                    currentMode,
                  );
                }}
              />
            </ControlSection>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="adjustments" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full px-4 py-3">
            <ControlSection title="HSL Adjustments" expanded>
              <p className="pb-3 text-sm text-muted-foreground">
                Fine-tune hue, saturation, and lightness for precise color control.
              </p>
              <HslAdjustmentControls />
            </ControlSection>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
