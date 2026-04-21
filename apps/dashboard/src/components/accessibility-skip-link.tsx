"use client";

import { Button } from "@midday/ui/button";
import { useState } from "react";

export function AccessibilitySkipLink() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className={`
          fixed top-4 left-4 z-[9999]
          opacity-0 pointer-events-none
          transition-opacity
          ${isFocused ? "opacity-100 pointer-events-auto" : ""}
          focus:opacity-100 focus:pointer-events-auto
        `}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onClick={() => {
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to main content
      </Button>
      <div id="main-content" tabIndex={-1} />
    </>
  );
}
