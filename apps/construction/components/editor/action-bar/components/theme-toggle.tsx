"use client";

import { Moon, Sun } from "lucide-react";
import { Switch as SwitchPrimitives } from "radix-ui";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { TooltipWrapper } from "@/components/tooltip-wrapper";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX: x, clientY: y } = event;
    toggleTheme({ x, y });
  };

  // Render a placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="px-2">
        <SwitchPrimitives.Root
          checked={false}
          className={cn(
            "peer focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
            "bg-input"
          )}
        >
          <SwitchPrimitives.Thumb
            className={cn(
              "bg-background pointer-events-none flex size-5 items-center justify-center rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
            )}
          >
            <Sun className="size-3" />
          </SwitchPrimitives.Thumb>
        </SwitchPrimitives.Root>
      </div>
    );
  }

  return (
    <div className="px-2">
      <TooltipWrapper label="Toggle light/dark mode" asChild>
        <SwitchPrimitives.Root
          checked={theme === "dark"}
          onClick={handleThemeToggle}
          className={cn(
            "peer focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
            theme === "dark" ? "bg-primary" : "bg-input"
          )}
        >
          <SwitchPrimitives.Thumb
            className={cn(
              "bg-background pointer-events-none flex size-5 items-center justify-center rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
            )}
          >
            {theme === "dark" ? <Moon className="size-3" /> : <Sun className="size-3" />}
          </SwitchPrimitives.Thumb>
        </SwitchPrimitives.Root>
      </TooltipWrapper>
    </div>
  );
}
