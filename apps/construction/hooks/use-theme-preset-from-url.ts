"use client";

import { useQueryState } from "nuqs";
import React from "react";
import { useEditorStore } from "@/store/editor-store";

export const useThemePresetFromUrl = () => {
  const [preset, setPreset] = useQueryState("theme");
  const applyThemePreset = useEditorStore((state) => state.applyThemePreset);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Apply theme preset if it exists in URL and remove it
  React.useEffect(() => {
    if (isMounted && preset) {
      applyThemePreset(preset);
      setPreset(null); // Remove the preset from URL
    }
  }, [isMounted, preset, setPreset, applyThemePreset]);
};
