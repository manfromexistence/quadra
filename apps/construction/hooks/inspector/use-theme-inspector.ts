"use client";

import { useRef } from "react";
import { useInspectorMouseEvents } from "./use-inspector-mouse-events";
import { useInspectorScroll } from "./use-inspector-scroll";
import { useInspectorState } from "./use-inspector-state";

export const useThemeInspector = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  const {
    inspector,
    inspectorEnabled,
    lastElementRef,
    isOverlayHiddenRef,
    updateInspectorState,
    clearInspectorState,
    toggleInspector: baseToggleInspector,
  } = useInspectorState();

  const { debouncedInspectorUpdate, handleMouseMove, handleMouseLeave } = useInspectorMouseEvents({
    inspectorEnabled,
    rootRef,
    lastElementRef,
    updateInspectorState,
    clearInspectorState,
  });

  useInspectorScroll({
    inspectorEnabled,
    clearInspectorState,
    debouncedInspectorUpdate,
    rootRef,
    isOverlayHiddenRef,
  });

  const toggleInspector = () => {
    baseToggleInspector(() => {
      debouncedInspectorUpdate.cancel();
    });
  };

  return {
    rootRef,
    inspector,
    inspectorEnabled,
    toggleInspector,
    handleMouseMove,
    handleMouseLeave,
  } as const;
};
