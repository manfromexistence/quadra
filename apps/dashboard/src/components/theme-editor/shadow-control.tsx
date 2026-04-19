"use client";

import { ColorPicker } from "./color-picker";
import { SliderWithInput } from "./slider-with-input";

interface ShadowControlProps {
  shadowColor: string;
  shadowOpacity: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  onChange: (key: string, value: string | number) => void;
}

export function ShadowControl({
  shadowColor,
  shadowOpacity,
  shadowBlur,
  shadowSpread,
  shadowOffsetX,
  shadowOffsetY,
  onChange,
}: ShadowControlProps) {
  return (
    <div className="space-y-1">
      <ColorPicker
        color={shadowColor}
        onChange={(color) => onChange("shadow-color", color)}
        label="Color"
      />
      <SliderWithInput
        value={shadowOpacity}
        onChange={(value) => onChange("shadow-opacity", value)}
        min={0}
        max={1}
        step={0.01}
        unit=""
        label="Opacity"
      />
      <SliderWithInput
        value={shadowBlur}
        onChange={(value) => onChange("shadow-blur", value)}
        min={0}
        max={50}
        step={0.5}
        unit="px"
        label="Blur"
      />
      <SliderWithInput
        value={shadowSpread}
        onChange={(value) => onChange("shadow-spread", value)}
        min={-50}
        max={50}
        step={0.5}
        unit="px"
        label="Spread"
      />
      <SliderWithInput
        value={shadowOffsetX}
        onChange={(value) => onChange("shadow-offset-x", value)}
        min={-50}
        max={50}
        step={0.5}
        unit="px"
        label="Offset X"
      />
      <SliderWithInput
        value={shadowOffsetY}
        onChange={(value) => onChange("shadow-offset-y", value)}
        min={-50}
        max={50}
        step={0.5}
        unit="px"
        label="Offset Y"
      />
    </div>
  );
}
