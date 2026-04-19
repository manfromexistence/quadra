# TODO

## In Progress

_Nothing in progress right now — agent should pick the next pending task._

---

## Pending

### Theme Editor Migration (High Priority)

- [ ] **Step 1** — Create shared `@midday/theme` package (or export from `@midday/ui/theme`)
  - Move `apps/construction/config/theme.ts` → shared package
  - Move `apps/construction/types/editor.ts`, `types/theme.ts` → shared package
  - Update imports in `apps/construction` to use shared package
  - Add exports to `packages/ui/package.json` or create `packages/theme/`

- [ ] **Step 2** — Port Zustand stores to `apps/dashboard`
  - `apps/construction/store/editor-store.ts` → `apps/dashboard/src/store/theme-editor-store.ts`
  - `apps/construction/store/theme-preset-store.ts` → `apps/dashboard/src/store/theme-preset-store.ts`
  - Fix all relative import paths

- [ ] **Step 3** — Port `theme-script.tsx` (CRITICAL — this is what makes dark mode work)
  - Copy `apps/construction/components/theme-script.tsx` → `apps/dashboard/src/components/theme-script.tsx`
  - Inject into `apps/dashboard/src/app/[locale]/layout.tsx` as a `beforeInteractive` script
  - Verify dark background changes on toggle

- [ ] **Step 4** — Port `theme-provider.tsx`
  - Copy and adapt to work alongside `next-themes`
  - Ensure CSS vars are applied via `document.documentElement.style.setProperty`

- [ ] **Step 5** — Copy editor UI components
  - Target: `apps/dashboard/src/components/theme-editor/`
  - Files: `editor.tsx`, `theme-control-panel.tsx`, `theme-preview-panel.tsx`, `color-picker.tsx`, `colors-tab-content.tsx`, `theme-preset-select.tsx`, `hsl-adjustment-controls.tsx`, `shadow-control.tsx`
  - Fix all imports

- [ ] **Step 6** — Create theme editor page
  - `apps/dashboard/src/app/[locale]/(app)/(sidebar)/theme/page.tsx`
  - Add "Theme" entry to sidebar nav in `apps/dashboard/src/components/main-menu.tsx`

- [ ] **Step 7** — Test dark mode end to end
  - Dark bg changes: `oklch(1 0 0)` ↔ `oklch(0.145 0 0)` on toggle
  - Light mode UI doesn't break
  - Default theme on load is "Quadra" (not a random preset)

- [ ] **Step 8** — Add bun tests for theme system
  - Default theme state === `defaultThemeState` from `config/theme.ts`
  - Theme script produces correct CSS variable strings

---

## Completed ✅

- [x] ~~EDMS Dashboard pages (documents, projects, workflows, transmittals, notifications)~~ ✅ 2026-04-15
- [x] ~~Bulk document upload support in `DocumentBulkUploadSheet`~~ ✅ 2026-04-15
- [x] ~~Search API `/api/search/route.ts` with Drizzle ilike queries~~ ✅ 2026-04-15
- [x] ~~AI chat RAG with project portfolio context `/api/chat/route.ts`~~ ✅ 2026-04-15
- [x] ~~EDMS database seed script `src/db/scripts/seed-edms.ts`~~ ✅ 2026-04-15
- [x] ~~`PrintButton` component + integrated into reports, schedule, databook, matrix, audit pages~~ ✅ 2026-04-19
- [x] ~~Theme migration HSL → OKLCH in `packages/ui/tailwind.config.ts`~~ ✅ 2026-04-19
- [x] ~~Theme migration HSL → OKLCH in `packages/ui/src/globals.css`~~ ✅ 2026-04-19
- [x] ~~Theme migration HSL → OKLCH in `apps/dashboard/src/styles/globals.css`~~ ✅ 2026-04-19
- [x] ~~Sidebar OKLCH variables in `apps/dashboard/src/styles/globals.css`~~ ✅ 2026-04-19
- [x] ~~`bun test` verification suite `apps/dashboard/src/theme.test.ts` (3/3 pass)~~ ✅ 2026-04-19
- [x] ~~Fixed `package.json` test script to `bun test src` (Windows-compatible)~~ ✅ 2026-04-19

---

## Blocked / Failed

_None currently._
