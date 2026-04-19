"use client";

import { cn } from "@midday/ui/cn";
import { Input } from "@midday/ui/input";
import { converter, formatHex, parse } from "culori";
import { useEffect, useMemo, useState } from "react";

interface ColorPickerProps {
  color: string;
  onChange: (value: string) => void;
  label: string;
  name?: string;
}

function formatNumber(value?: number) {
  if (value === undefined || Number.isNaN(value)) {
    return "0";
  }

  return value % 1 === 0
    ? String(value)
    : value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

function toOklchString(value: string) {
  const parsed = parse(value);
  if (!parsed) {
    return value;
  }

  const converted = converter("oklch")(parsed);
  if (!converted) {
    return value;
  }

  return `oklch(${formatNumber(converted.l)} ${formatNumber(converted.c)} ${formatNumber(converted.h ?? 0)})`;
}

function toHexColor(value: string) {
  const parsed = parse(value);
  return parsed ? formatHex(parsed) : "#000000";
}

export function ColorPicker({
  color,
  onChange,
  label,
  name,
}: ColorPickerProps) {
  const [textValue, setTextValue] = useState(color);
  const hexValue = useMemo(() => toHexColor(color), [color]);

  useEffect(() => {
    setTextValue(color);
  }, [color]);

  const commitTextValue = () => {
    const trimmed = textValue.trim();
    if (!trimmed) {
      return;
    }

    const normalizedValue =
      trimmed.startsWith("oklch(") || trimmed.startsWith("var(")
        ? trimmed
        : toOklchString(trimmed);
    onChange(normalizedValue);
    setTextValue(normalizedValue);
  };

  return (
    <div
      data-color-name={name}
      className={cn(
        "group hover:bg-muted/50 -mx-1 flex items-center gap-3 rounded-lg px-2 py-1 transition-colors",
      )}
    >
      <label className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border shadow-sm">
        <span className="absolute inset-0" style={{ backgroundColor: color }} />
        <input
          type="color"
          value={hexValue}
          onChange={(event) => onChange(toOklchString(event.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label={`${label} color`}
        />
      </label>

      <span className="text-foreground min-w-0 shrink-0 text-[13px] font-medium">
        {label}
      </span>

      <Input
        value={textValue}
        onChange={(event) => setTextValue(event.target.value)}
        onBlur={commitTextValue}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commitTextValue();
          }
        }}
        className="h-8 min-w-0 flex-1 font-mono text-xs"
        placeholder="oklch(...)"
      />
    </div>
  );
}
