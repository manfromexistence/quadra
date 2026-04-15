/* eslint-disable @typescript-eslint/no-explicit-any */

import { PluginKey } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { ReactRenderer } from "@tiptap/react";
import type { Instance } from "tippy.js";
import tippy from "tippy.js";
import { MentionList } from "@/components/editor/mention-list"; // We'll create this component next
import { useThemePresetStore } from "@/store/theme-preset-store"; // Import the theme store

export const mentionPluginKey = new PluginKey("mention");

export const suggestion = {
  pluginKey: mentionPluginKey,
  items: ({ query }: { query: string }) => {
    // Get all presets from the store
    const allPresets = useThemePresetStore.getState().getAllPresets();

    // Convert presets object to the required array format { id: string, label: string }
    const themeItems = Object.entries(allPresets).map(([id, preset]) => ({
      id: id, // Use the preset key as the id
      label: preset.label, // Use the preset label
    }));

    // Filter based on the query
    return themeItems
      .filter((item) => {
        const labelWithoutSpaces = item.label?.replace(/\s+/g, "").toLowerCase() || "";
        const queryWithoutSpaces = query.replace(/\s+/g, "").toLowerCase();
        return labelWithoutSpaces.includes(queryWithoutSpaces);
      })
      .slice(0, 7)
      .concat({ id: "editor:current-changes", label: "Current Theme" }); // Limit to 5 suggestions
  },

  render: () => {
    let component: ReactRenderer | null = null;
    let popup: Instance[] | null = null;

    return {
      onStart: (props: { editor: Editor; clientRect?: (() => DOMRect | null) | null }) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        const clientRect = typeof props.clientRect === "function" ? props.clientRect() : null;
        if (!clientRect) {
          return;
        }

        popup = tippy("body", {
          getReferenceClientRect: () => clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate(props: { editor: Editor; clientRect?: (() => DOMRect | null) | null }) {
        component?.updateProps(props);

        const clientRect = typeof props.clientRect === "function" ? props.clientRect() : null;
        if (!clientRect) {
          return;
        }

        if (popup && popup[0]) {
          popup[0].setProps({
            getReferenceClientRect: () => clientRect,
          });
        }
      },

      onKeyDown(props: { event: KeyboardEvent }) {
        if (props.event.key === "Escape") {
          if (popup && popup[0]) {
            popup[0].hide();
          }
          return true;
        }

        // @ts-expect-error - This is a valid way to access the component's methods
        return component?.ref?.onKeyDown(props);
      },

      onExit() {
        if (popup && popup[0]) {
          popup[0].destroy();
        }
        component?.destroy();
        popup = null;
        component = null;
      },
    };
  },
};
