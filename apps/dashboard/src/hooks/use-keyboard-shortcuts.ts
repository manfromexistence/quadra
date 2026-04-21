"use client";

import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";

export function useKeyboardShortcuts() {
  // Global search: Cmd/Ctrl + K
  useHotkeys("cmd+k, ctrl+k", (e) => {
    e.preventDefault();
    // Trigger global search
    document.dispatchEvent(new CustomEvent("open-global-search"));
  });

  // New document: Cmd/Ctrl + N
  useHotkeys("cmd+n, ctrl+n", (e) => {
    e.preventDefault();
    window.location.href = "/documents/new";
  });

  // Dashboard: Cmd/Ctrl + D
  useHotkeys("cmd+d, ctrl+d", (e) => {
    e.preventDefault();
    window.location.href = "/projects";
  });

  // Help: ?
  useHotkeys("?", (e) => {
    e.preventDefault();
    toast("Keyboard shortcuts opened", {
      description: "Press Cmd+K for search, Cmd+N for new document",
    });
  });

  // Escape to close modals
  useHotkeys("escape", (e) => {
    // Close any open dialogs/modals
    const activeDialog = document.querySelector(
      "[role='dialog']:not([hidden])",
    );
    if (activeDialog) {
      const closeButton = activeDialog.querySelector(
        "button[aria-label='Close']",
      ) as HTMLButtonElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  });
}
