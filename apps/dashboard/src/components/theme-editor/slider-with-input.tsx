"use client";

import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import { Slider } from "@midday/ui/slider";
import { useEffect, useState } from "react";

interface SliderWithInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
}

export function SliderWithInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  unit = "px",
}: SliderWithInputProps) {
  const [localValue, setLocalValue] = useState(value.toString());

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  return (
    <div className="flex items-center gap-3 py-0.5">
      <Label
        htmlFor={`slider-${label.replace(/\s+/g, "-").toLowerCase()}`}
        className="text-muted-foreground w-20 shrink-0 text-[11px] font-medium"
      >
        {label}
      </Label>
      <Slider
        id={`slider-${label.replace(/\s+/g, "-").toLowerCase()}`}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(values) => {
          const nextValue = values[0];
          setLocalValue(nextValue.toString());
          onChange(nextValue);
        }}
        className="min-w-0 flex-1"
      />
      <div className="flex shrink-0 items-center gap-1">
        <Input
          id={`input-${label.replace(/\s+/g, "-").toLowerCase()}`}
          type="number"
          value={localValue}
          min={min}
          max={max}
          step={step}
          onChange={(event) => {
            const rawValue = event.target.value;
            setLocalValue(rawValue);
            const parsedValue = Number.parseFloat(rawValue.replace(",", "."));
            if (!Number.isNaN(parsedValue)) {
              onChange(Math.max(min, Math.min(max, parsedValue)));
            }
          }}
          onBlur={() => setLocalValue(value.toString())}
          className="h-7 w-16 px-2 text-xs"
        />
        <span className="text-muted-foreground w-8 text-[11px]">{unit}</span>
      </div>
    </div>
  );
}
