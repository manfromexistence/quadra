"use client";

import { Button } from "@midday/ui/button";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import { ScrollArea } from "@midday/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@midday/ui/tabs";
import type { ThemeMode, ThemeStyleProps } from "@midday/ui/theme";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState, useTransition } from "react";
import { createTheme, updateTheme } from "@/actions/themes";
import { useThemeEditorStore } from "@/store/theme-editor-store";
import { useThemePresetStore } from "@/store/theme-preset-store";
import { ColorsTabContent } from "./colors-tab-content";
import { ControlSection } from "./control-section";
import { HslAdjustmentControls } from "./hsl-adjustment-controls";
import { ShadowControl } from "./shadow-control";
import { SliderWithInput } from "./slider-with-input";
import { ThemePresetSelect } from "./theme-preset-select";

export function ThemeControlPanel() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const [themeName, setThemeName] = useState("Quadra");
  const themeState = useThemeEditorStore((state) => state.themeState);
  const setThemeState = useThemeEditorStore((state) => state.setThemeState);
  const updateStyle = useThemeEditorStore((state) => state.updateStyle);
  const restoreThemeCheckpoint = useThemeEditorStore(
    (state) => state.restoreThemeCheckpoint,
  );
  const resetToDefault = useThemeEditorStore((state) => state.resetToDefault);
  const saveThemeCheckpoint = useThemeEditorStore(
    (state) => state.saveThemeCheckpoint,
  );
  const currentPreset = useThemePresetStore((state) =>
    state.getPreset(themeState.preset ?? "quadra"),
  );
  const registerPreset = useThemePresetStore((state) => state.registerPreset);

  const currentMode = (
    resolvedTheme === "dark" ? "dark" : "light"
  ) as ThemeMode;
  const currentStyles = useMemo(
    () => themeState.styles[currentMode],
    [currentMode, themeState.styles],
  );

  useEffect(() => {
    const label = currentPreset?.label;
    if (label) {
      setThemeName(label);
      return;
    }

    if ((themeState.preset ?? "quadra") === "quadra") {
      setThemeName("Quadra");
    }
  }, [currentPreset?.label, themeState.preset]);

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

  const handleSave = () => {
    startTransition(async () => {
      const presetId = themeState.preset;
      const isSavedTheme = currentPreset?.source === "SAVED" && presetId;

      const result = isSavedTheme
        ? await updateTheme({
            id: presetId,
            name: themeName,
            styles: themeState.styles,
          })
        : await createTheme({
            name: themeName,
            styles: themeState.styles,
          });

      registerPreset(result.id, {
        label: result.name,
        source: "SAVED",
        styles: result.styles,
      });

      setThemeState({
        ...themeState,
        preset: result.id,
        styles: result.styles,
      });
      setThemeName(result.name);
      saveThemeCheckpoint();
    });
  };

  return (
    <div className="flex h-full min-h-[70vh] flex-col overflow-hidden border border-border bg-card">
      <div className="space-y-4 border-b border-border p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Theme Editor
          </p>
          <h2 className="text-lg font-semibold">Quadra</h2>
          <p className="text-sm text-muted-foreground">
            This is the dashboard copy of the construction theme editor, backed
            by the shared `@midday/ui` theme tokens and applied live to the
            current shell.
          </p>
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          <div className="space-y-2">
            <Label>Preset</Label>
            <ThemePresetSelect />
          </div>
          <div className="space-y-2">
            <Label>Theme Name</Label>
            <Input
              value={themeName}
              onChange={(event) => setThemeName(event.target.value)}
            />
          </div>
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
            Reset Quadra
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending || !themeName.trim()}
          >
            {isPending
              ? "Saving..."
              : currentPreset?.source === "SAVED"
                ? "Update Theme"
                : "Save Theme"}
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
                These controls are ported from the construction editor and now
                normalize the result back into OKLCH values for the dashboard
                theme store.
              </p>
              <HslAdjustmentControls />
            </ControlSection>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
