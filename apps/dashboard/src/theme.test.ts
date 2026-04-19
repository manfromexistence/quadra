import { test, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

test("Theme configuration uses OKLCH", () => {
  const uiConfig = readFileSync(join(process.cwd(), "../../packages/ui/tailwind.config.ts"), "utf-8");
  expect(uiConfig).toContain("oklch(");
  expect(uiConfig).not.toContain("hsl(");
});

test("Theme variables are OKLCH space separated", () => {
  const uiCss = readFileSync(join(process.cwd(), "../../packages/ui/src/globals.css"), "utf-8");
  // Check for the specific default dark theme background in OKLCH
  expect(uiCss).toContain("--background: 0.145 0 0");
});

test("Dashboard specific variables are OKLCH", () => {
  const dashCss = readFileSync(join(process.cwd(), "src/styles/globals.css"), "utf-8");
  expect(dashCss).toContain("--sidebar: oklch(0.985 0 0)");
  expect(dashCss).not.toContain("hsl(");
});
