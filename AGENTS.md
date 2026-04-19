# Dx

Last updated: 2026-04-19

## Purpose

This repository uses the DX flow for human-to-agent communication.
The agent should follow the DX loop first, then execute the work.

## DX Flow

1. Start by calling `d`.
2. If `d` returns a prompt, execute that prompt completely.
3. After finishing the task, call `d` once again.
4. Do not spam repeated reads. One completed task -> one new `d` call, unless DX returns stale output.
5. Let `d` handle the waiting internally.
6. If `d` times out, returns a previous prompt, or otherwise looks stale, wait and call `d` again.
7. Only stop the DX loop when the user explicitly says to stop.

## Rules

- Use `d` for agent-mode reads.
- The agent must not write its own prompts.
- Execute the DX prompt directly and fully.
- Do not ask for routine permission before normal repo work.
- Report what changed, then return to the DX flow.
- If DX appears broken, inspect `dx.ps1` and `%USERPROFILE%\.dx`, then continue the loop.
- If DX returns an old prompt or stale content, do not stop. Wait and rerun `d`.

## Task Management

### TODO.md Protocol

- At project start or when receiving multi-step tasks, create/update `TODO.md` in the root
- Break user requests into concrete, actionable tasks
- Work top-down: always work on the first "In Progress" item
- Move only one task to "In Progress" at a time
- Mark completed tasks with `[x]`, ~~strikethrough~~, ✅, and timestamp
- Advance automatically to the next pending task without waiting for permission
- Never delete tasks, only mark them completed or blocked
- Update `TODO.md` after every action to reflect current reality

### CHANGELOG.md Protocol

- Maintain `CHANGELOG.md` in the root to track all completed work
- Follow semantic versioning and Keep a Changelog format
- Add entries under `## [Unreleased]` as work completes
- Include: Added, Changed, Fixed, Removed sections as needed
- Be specific about what changed, not just "updated file X"
- Update after completing each significant task or feature
- When releasing, move Unreleased items to a versioned section

### Failure Recovery

- **Three-Strike Rule**: Try 3 different approaches before escalating
- On third failure, create/append to `HELP.md` with full diagnostic info
- Move blocked tasks to "Blocked / Failed" section in `TODO.md`
- Continue with next unblocked task automatically

## Repo Focus

- Primary app: `apps/dashboard`
- Secondary app: `apps/construction` (theme editor source — do NOT modify without understanding the migration plan below)
- Deployment target: Vercel project `app-quadra`
- Production URL: `https://app-quadra.vercel.app`
- Runtime: **Bun** (`bun run dev`, `bun test`, etc.)
- Package manager: `bun@1.3.11` (workspace at `f:\quadra`)

## File Policy

- Keep this file short and focused on agent behavior
- Do not store secrets, environment variables, or redundant examples here
- Use `TODO.md` for task tracking, `CHANGELOG.md` for work history
- Use `HELP.md` only when tasks fail after 3 attempts
- **NEVER create stray markdown files** (README, SUMMARY, IMPLEMENTATION, ANALYSIS, etc.) unless explicitly requested by the user
- **NEVER create scripts** (PowerShell, bash, Python, etc.) unless explicitly requested by the user
- Focus on implementing actual code changes, not documentation
- The only acceptable markdown files are: `TODO.md`, `CHANGELOG.md`, `HELP.md` (when blocked after 3 attempts)
- If you need to document something, update existing files or add code comments

---

## Project State — EDMS Dashboard (as of 2026-04-19)

> **READ THIS BEFORE STARTING ANY WORK ON `apps/dashboard`.**
> This section documents exactly what has been done and what remains.

### Architecture

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router (`apps/dashboard`) |
| ORM | Drizzle ORM + Turso (libsql) |
| UI Components | `@midday/ui` (packages/ui) — Radix + Tailwind |
| Styling | Tailwind CSS 3.4 with OKLCH CSS variables |
| API | tRPC v11 + Next.js Route Handlers |
| Auth | better-auth |
| Runtime | Bun |

### Completed Work

#### 1. EDMS Pages (all fully functional)

All pages live under `apps/dashboard/src/app/[locale]/(app)/(sidebar)/`:

| Route | File | Status |
|---|---|---|
| `/documents` | `documents/page.tsx` | ✅ DB-backed |
| `/projects` | `projects/page.tsx` | ✅ DB-backed |
| `/workflows` | `workflows/page.tsx` | ✅ DB-backed |
| `/transmittals` | `transmittals/page.tsx` | ✅ DB-backed |
| `/notifications` | `notifications/page.tsx` | ✅ DB-backed |
| `/reports` | `reports/page.tsx` | ✅ PrintButton |
| `/schedule` | `schedule/page.tsx` | ✅ PrintButton |
| `/databook` | `databook/page.tsx` | ✅ PrintButton |
| `/matrix` | `matrix/page.tsx` | ✅ PrintButton |
| `/audit` | `audit/page.tsx` | ✅ PrintButton |

#### 2. Theme Migration — OKLCH (DONE)

The color system has been **fully migrated from HSL to OKLCH**:

- **`packages/ui/tailwind.config.ts`** — All color tokens now use `oklch(var(--token) / <alpha-value>)` syntax.
- **`packages/ui/src/globals.css`** — All `:root` and `.dark` CSS variable values are now OKLCH space-separated triplets (e.g., `--background: 0.145 0 0` for dark mode).
- **`apps/dashboard/src/styles/globals.css`** — All remaining `hsl(var(--*))` references replaced with `oklch(var(--*))`. Sidebar variables migrated to explicit `oklch(...)` values matching `apps/construction/config/theme.ts`.

**Default "Quadra" theme values** (from `apps/construction/config/theme.ts`):

| Variable | Light | Dark |
|---|---|---|
| `--background` | `1 0 0` | `0.145 0 0` |
| `--foreground` | `0.145 0 0` | `0.985 0 0` |
| `--card` | `1 0 0` | `0.205 0 0` |
| `--primary` | `0.205 0 0` | `0.922 0 0` |
| `--border` | `0.922 0 0` | `0.275 0 0` |

#### 3. Bulk Upload, Search, AI Chat, Reports (DONE)

- `DocumentBulkUploadSheet` supports multi-file concurrent upload.
- `/api/search/route.ts` — Drizzle `ilike` queries across `projects` + `documents`.
- `/api/chat/route.ts` — Injects user's active project portfolio as RAG context.
- `PrintButton` component (`apps/dashboard/src/components/edms/print-button.tsx`) integrated into all report pages with `print:hidden` utilities.

#### 4. Database Seed (DONE)

Script: `apps/dashboard/src/db/scripts/seed-edms.ts`

Run with: `bun run apps/dashboard/src/db/scripts/seed-edms.ts`

Populates: Projects, Documents, Workflows, WorkflowSteps, Transmittals, Notifications.

#### 5. Theme Verification Test (DONE)

File: `apps/dashboard/src/theme.test.ts`

Run with: `bun test src/theme.test.ts` (from `apps/dashboard/`)

All 3 tests pass:
- `Theme configuration uses OKLCH`
- `Theme variables are OKLCH space separated`
- `Dashboard specific variables are OKLCH`

Test script in `apps/dashboard/package.json` is now `"test": "bun test src"`.

---

### Pending Work — THE BIG ONE: Theme Editor Migration

> ⚠️ **This is the most complex remaining task. Read carefully before starting.**

**Goal:** Port the full theme editor from `apps/construction` into `apps/dashboard` so users can live-edit the Quadra theme from inside the dashboard.

**Why it's hard:** The construction app is a standalone Next.js app with its own store, types, hooks, and component tree. Naively copying files will break imports, cause dark mode to not work, and create a situation where the background doesn't change and the UI breaks with the light theme.

#### Files to understand before starting

| File | Purpose |
|---|---|
| `apps/construction/config/theme.ts` | **Authoritative** OKLCH theme definitions. `defaultLightThemeStyles`, `defaultDarkThemeStyles`, `defaultThemeState`. This is what "Quadra" means. |
| `apps/construction/types/editor.ts` | `ThemeEditorState` type — the shape of the theme editor store. |
| `apps/construction/types/theme.ts` | `ThemePreset` and related types. |
| `apps/construction/store/editor-store.ts` | Zustand store driving the theme editor. |
| `apps/construction/store/theme-preset-store.ts` | Zustand store for preset management. |
| `apps/construction/components/editor/editor.tsx` | The top-level editor component. |
| `apps/construction/components/editor/theme-control-panel.tsx` | Left panel — color pickers and controls. |
| `apps/construction/components/editor/theme-preview-panel.tsx` | Right panel — live preview. |
| `apps/construction/components/editor/theme-preset-select.tsx` | Preset dropdown. |
| `apps/construction/components/theme-script.tsx` | The critical script that injects CSS variables into `<html>` on mount — **this is what makes dark mode work**. |
| `apps/construction/components/theme-provider.tsx` | Wraps the app with theme context. |

#### Correct migration strategy (step by step)

> Do these in order. Do not skip steps.

1. **Create `packages/theme` package** (or add to `packages/ui`):
   - Move `config/theme.ts`, `types/editor.ts`, `types/theme.ts` to a shared package.
   - Export them from `@midday/theme` (or `@midday/ui/theme`).
   - Both `apps/construction` and `apps/dashboard` should import from here.

2. **Port the Zustand stores** into `apps/dashboard/src/store/`:
   - `editor-store.ts` → `apps/dashboard/src/store/theme-editor-store.ts`
   - `theme-preset-store.ts` → `apps/dashboard/src/store/theme-preset-store.ts`
   - Fix all import paths.

3. **Copy and adapt `theme-script.tsx`** into `apps/dashboard/src/components/theme-script.tsx`:
   - This script runs before hydration and sets CSS vars on `<html>`.
   - It MUST be injected in `apps/dashboard/src/app/[locale]/layout.tsx` inside `<head>` as `<Script strategy="beforeInteractive">` or as a raw inline script.
   - **Without this, dark mode background will not change.** This is the #1 failure mode.

4. **Copy and adapt `theme-provider.tsx`**:
   - Ensure it reads from the Zustand store and applies CSS variables via `document.documentElement.style.setProperty`.
   - Replace `next-themes` `ThemeProvider` wrapping if it conflicts.

5. **Copy editor UI components** into `apps/dashboard/src/components/theme-editor/`:
   - `editor.tsx`, `theme-control-panel.tsx`, `theme-preview-panel.tsx`, `color-picker.tsx`, `colors-tab-content.tsx`, `theme-preset-select.tsx`, `hsl-adjustment-controls.tsx`, `shadow-control.tsx`, etc.
   - Fix all imports.

6. **Create theme editor page** at `apps/dashboard/src/app/[locale]/(app)/(sidebar)/theme/page.tsx`:
   - Render the editor component.
   - Add to sidebar navigation in `apps/dashboard/src/components/main-menu.tsx`.

7. **Test dark mode thoroughly**:
   - Dark mode background MUST change from `oklch(0.145 0 0)` to `oklch(1 0 0)` on toggle.
   - The UI must not break in light mode.
   - A random theme preset MUST NOT be selected by default — "Quadra" (the defaults from `config/theme.ts`) must be the initial state.

8. **Add bun tests** for:
   - Default theme state matches `defaultThemeState` from `config/theme.ts`.
   - Theme script correctly generates CSS variable strings.

#### Known failure modes to avoid

| Failure | Cause | Fix |
|---|---|---|
| Background doesn't change on dark/light toggle | `theme-script.tsx` not injected before hydration | Inject as `beforeInteractive` script in layout |
| UI breaks in light mode | CSS variables fall back to OKLCH `0 0 0` (black) | Ensure `:root` always has valid fallbacks |
| Random theme selected on load | `theme-preset-store` not initialized with `defaultThemeState` | Hydrate store with `defaultThemeState` from `config/theme.ts` |
| `oklch(var(--x))` not working | Tailwind still using `hsl(var(--x))` | All color tokens in `tailwind.config.ts` must use `oklch(var(...) / <alpha-value>)` |

---

### Running the Dashboard

```powershell
# From the repo root
bun run dev:dashboard

# Or directly
cd apps/dashboard
bun run dev
# Dashboard runs on http://localhost:3001
```

### Running Tests

```powershell
cd apps/dashboard
bun test src
# Runs theme tests + any other *.test.ts files under src/
```
