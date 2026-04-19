# Changelog

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Added
- `PrintButton` component at `apps/dashboard/src/components/edms/print-button.tsx`
  - Integrated into: reports, schedule, databook, matrix, audit pages
  - Uses `window.print()` with `print:hidden` Tailwind utilities
- `apps/dashboard/src/theme.test.ts` — bun test suite for OKLCH theme verification (3 tests, all pass)
- `TODO.md` and `CHANGELOG.md` to track ongoing work

### Changed
- `packages/ui/tailwind.config.ts` — All color tokens migrated from `hsl(var(...))` to `oklch(var(...) / <alpha-value>)` syntax
- `packages/ui/src/globals.css` — All `:root` and `.dark` CSS variables now use OKLCH space-separated triplets (no `oklch()` wrapper in the value, just the triplet e.g. `0.145 0 0`)
- `apps/dashboard/src/styles/globals.css` — All `hsl(var(--*))` references replaced with `oklch(var(--*))`. Sidebar variables migrated to explicit `oklch(L C H)` values.
- `apps/dashboard/package.json` — `test` script changed from broken Unix `find | grep` to `bun test src` (Windows compatible)

---

## [0.3.0] — 2026-04-15

### Added
- EDMS full page suite: documents, projects, workflows, transmittals, notifications, reports, schedule, databook, matrix, audit
- Bulk document upload (`DocumentBulkUploadSheet`) with concurrent multi-file processing
- `/api/search/route.ts` — Drizzle `ilike` queries across projects + documents tables
- `/api/chat/route.ts` — RAG-informed AI responses using user's active project portfolio
- `apps/dashboard/src/db/scripts/seed-edms.ts` — Database seed for all EDMS entities
- EDMS component library under `apps/dashboard/src/components/edms/`

## [0.2.0] — 2026-04-13

### Added
- EDMS dashboard initial pages migrated from `edms.html` reference file
- Database schema for EDMS (documents, projects, document_workflows, workflow_steps, transmittals, notifications tables)
- Drizzle ORM + Turso (libsql) integration

## [0.1.0] — 2026-04-11

### Added
- Initial monorepo setup
- `apps/dashboard` — Next.js 16 dashboard (primary app)
- `apps/construction` — Theme editor app (source for theme migration)
- `packages/ui` — Shared Midday UI component library
