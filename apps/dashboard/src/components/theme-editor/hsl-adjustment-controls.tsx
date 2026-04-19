"use client";

import { Button } from "@midday/ui/button";
import { type ThemeEditorState, themeCommonKeys } from "@midday/ui/theme";
import { converter, type Hsl } from "culori";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useThemeEditorStore } from "@/store/theme-editor-store";
import { SliderWithInput } from "./slider-with-input";

type HslAdjustments = NonNullable<ThemeEditorState["hslAdjustments"]>;

const HSL_PRESETS: Array<HslAdjustments & { label: string }> = [
  { label: "Hue -120", hueShift: -120, saturationScale: 1, lightnessScale: 1 },
  { label: "Hue -60", hueShift: -60, saturationScale: 1, lightnessScale: 1 },
  { label: "Hue +60", hueShift: 60, saturationScale: 1, lightnessScale: 1 },
  { label: "Hue +120", hueShift: 120, saturationScale: 1, lightnessScale: 1 },
  { label: "Invert", hueShift: 180, saturationScale: 1, lightnessScale: 1 },
  { label: "Grayscale", hueShift: 0, saturationScale: 0, lightnessScale: 1 },
  { label: "Muted", hueShift: 0, saturationScale: 0.6, lightnessScale: 1 },
  { label: "Vibrant", hueShift: 0, saturationScale: 1.4, lightnessScale: 1 },
  { label: "Dimmer", hueShift: 0, saturationScale: 1, lightnessScale: 0.8 },
  { label: "Brighter", hueShift: 0, saturationScale: 1, lightnessScale: 1.2 },
];

const DEFAULT_ADJUSTMENTS: HslAdjustments = {
  hueShift: 0,
  saturationScale: 1,
  lightnessScale: 1,
};

function formatNumber(value?: number) {
  if (value === undefined || Number.isNaN(value)) {
    return "0";
  }

  return value % 1 === 0
    ? String(value)
    : value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

function adjustColorByHsl(
  color: string,
  hueShift: number,
  saturationScale: number,
  lightnessScale: number,
) {
  const hsl = converter("hsl")(color);
  const hue = hsl?.h;
  const saturation = hsl?.s;
  const lightness = hsl?.l;

  if (
    hue === undefined ||
    saturation === undefined ||
    lightness === undefined
  ) {
    return color;
  }

  const adjustedHsl = {
    h: (((hue + hueShift) % 360) + 360) % 360,
    s: Math.min(1, Math.max(0, saturation * saturationScale)),
    l: Math.min(1, Math.max(0.1, lightness * lightnessScale)),
  };

  const adjustedOklch = converter("oklch")(adjustedHsl as Hsl);
  if (!adjustedOklch) {
    return color;
  }

  return `oklch(${formatNumber(adjustedOklch.l)} ${formatNumber(adjustedOklch.c)} ${formatNumber(adjustedOklch.h ?? 0)})`;
}

export function HslAdjustmentControls() {
  const themeState = useThemeEditorStore((state) => state.themeState);
  const themeCheckpoint = useThemeEditorStore((state) => state.themeCheckpoint);
  const setThemeState = useThemeEditorStore((state) => state.setThemeState);
  const saveThemeCheckpoint = useThemeEditorStore(
    (state) => state.saveThemeCheckpoint,
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentHslAdjustments = useMemo(
    () => themeState.hslAdjustments ?? DEFAULT_ADJUSTMENTS,
    [themeState.hslAdjustments],
  );

  const applyAdjustments = useCallback(
    (adjustments: HslAdjustments) => {
      const baseState = themeCheckpoint ?? themeState;
      const nextLightStyles = Object.keys(baseState.styles.light).reduce<
        Record<string, string | undefined>
      >((accumulator, key) => {
        if (themeCommonKeys.includes(key as (typeof themeCommonKeys)[number])) {
          accumulator[key] =
            baseState.styles.light[key as keyof typeof baseState.styles.light];
          return accumulator;
        }

        accumulator[key] = adjustColorByHsl(
          baseState.styles.light[key as keyof typeof baseState.styles.light] ??
            "",
          adjustments.hueShift,
          adjustments.saturationScale,
          adjustments.lightnessScale,
        );
        return accumulator;
      }, {});

      const nextDarkStyles = Object.keys(baseState.styles.dark).reduce<
        Record<string, string | undefined>
      >((accumulator, key) => {
        if (themeCommonKeys.includes(key as (typeof themeCommonKeys)[number])) {
          accumulator[key] =
            baseState.styles.dark[key as keyof typeof baseState.styles.dark];
          return accumulator;
        }

        accumulator[key] = adjustColorByHsl(
          baseState.styles.dark[key as keyof typeof baseState.styles.dark] ??
            "",
          adjustments.hueShift,
          adjustments.saturationScale,
          adjustments.lightnessScale,
        );
        return accumulator;
      }, {});

      setThemeState({
        ...themeState,
        hslAdjustments: adjustments,
        styles: {
          light: {
            ...baseState.styles.light,
            ...nextLightStyles,
          },
          dark: {
            ...baseState.styles.dark,
            ...nextDarkStyles,
          },
        },
      });
    },
    [setThemeState, themeCheckpoint, themeState],
  );

  const queueAdjustment = useCallback(
    (adjustments: HslAdjustments) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        applyAdjustments(adjustments);
      }, 10);
    },
    [applyAdjustments],
  );

  useEffect(() => {
    if (
      JSON.stringify(currentHslAdjustments) ===
      JSON.stringify(DEFAULT_ADJUSTMENTS)
    ) {
      saveThemeCheckpoint();
    }
  }, [currentHslAdjustments, saveThemeCheckpoint]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(isExpanded ? HSL_PRESETS : HSL_PRESETS.slice(0, 5)).map((preset) => {
          const isSelected =
            currentHslAdjustments.hueShift === preset.hueShift &&
            currentHslAdjustments.saturationScale === preset.saturationScale &&
            currentHslAdjustments.lightnessScale === preset.lightnessScale;

          return (
            <Button
              key={preset.label}
              type="button"
              variant={isSelected ? "secondary" : "outline"}
              size="sm"
              onClick={() => queueAdjustment(preset)}
              className="h-7 px-2 text-[11px]"
            >
              {preset.label}
            </Button>
          );
        })}

        {HSL_PRESETS.length > 5 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded((previous) => !previous)}
            className="h-7 px-2 text-[11px]"
          >
            {isExpanded ? "Less" : "More"}
          </Button>
        ) : null}
      </div>

      <SliderWithInput
        value={currentHslAdjustments.hueShift}
        onChange={(value) =>
          queueAdjustment({
            ...currentHslAdjustments,
            hueShift: value,
          })
        }
        min={-180}
        max={180}
        step={1}
        unit="deg"
        label="Hue"
      />
      <SliderWithInput
        value={currentHslAdjustments.saturationScale}
        onChange={(value) =>
          queueAdjustment({
            ...currentHslAdjustments,
            saturationScale: value,
          })
        }
        min={0}
        max={2}
        step={0.01}
        unit="x"
        label="Saturation"
      />
      <SliderWithInput
        value={currentHslAdjustments.lightnessScale}
        onChange={(value) =>
          queueAdjustment({
            ...currentHslAdjustments,
            lightnessScale: value,
          })
        }
        min={0.2}
        max={2}
        step={0.01}
        unit="x"
        label="Lightness"
      />
    </div>
  );
}
