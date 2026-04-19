# Changelog

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Fixed
- **apps/dashboard — Turbopack panic on old editor/theme route**
  - Removed leftover `apps/dashboard/src/app/[locale]/(app)/editor/theme/[[...themeId]]/` directory from construction app migration
  - Updated dashboard sidebar to use new `/theme` route instead of `/editor/theme`
  - Fixed "metadata file not found" Turbopack error that was causing repeated panics
  - Theme editor now accessible only at `/theme` route (cleaner URL structure)

### Added
- `PrintButton` component at `apps/dashboard/src/components/edms/print-button.tsx`
  - Integrated into: reports, schedule, databook, matrix, audit pages
  - Uses `window.print()` with `print:hidden` Tailwind utilities
- `apps/dashboard/src/theme.test.ts` - Bun test suite for OKLCH theme verification and theme editor initialization (5 tests passing)
- `TODO.md` and `CHANGELOG.md` to track ongoing work
- `packages/ui/src/theme/` - shared Quadra theme config, theme types, preset helpers, theme application utilities, and the pre-hydration theme script
- `apps/dashboard/src/components/theme-editor/` - dashboard-side theme editor controls copied and adapted from `apps/construction`
- `apps/dashboard/src/components/brand-logo.tsx` and `apps/website/src/components/brand-logo.tsx` - theme-aware PNG logo components using the root `logo-dark.png` and `logo-light.png`
- `apps/dashboard/src/lib/edms/dates.ts` - stored-date normalization for mixed seconds vs milliseconds EDMS timestamps

### Changed
- `packages/ui/tailwind.config.ts` - all color tokens migrated from `hsl(var(...))` to `oklch(var(...) / <alpha-value>)` syntax
- `packages/ui/src/globals.css` - all `:root` and `.dark` CSS variables now use OKLCH space-separated triplets
- `apps/dashboard/src/styles/globals.css` - all remaining `hsl(var(--*))` references replaced with `oklch(var(--*))` and sidebar variables aligned to Quadra OKLCH values
- `apps/dashboard/package.json` - `test` script changed from a broken Unix pipeline to `bun test src`
- Theme sharing now lives under `@midday/ui/theme` instead of a temporary standalone `@midday/theme` workspace
- `apps/dashboard/src/components/theme-provider.tsx` and `apps/dashboard/src/components/theme-script.tsx` now apply the dashboard theme editor state before and after hydration without breaking light/dark mode
- `apps/dashboard/src/app/[locale]/(app)/(sidebar)/theme/page.tsx` and `apps/dashboard/src/components/main-menu.tsx` now expose the dashboard theme editor as a first-class EDMS route
- `apps/dashboard/src/app/[locale]/(app)/(sidebar)/schedule/page.tsx`, `databook/page.tsx`, `matrix/page.tsx`, `audit/page.tsx`, and `reports/page.tsx` now render live derived Turso data instead of hardcoded mock content
- `apps/dashboard/src/app/[locale]/layout.tsx` and `apps/website/src/app/layout.tsx` now reference the shipped favicon bundle, manifest, and explicit theme colors
- `apps/dashboard/src/components/sidebar.tsx`, `apps/dashboard/src/components/mobile-menu.tsx`, `apps/dashboard/src/components/edms/shell.tsx`, `apps/website/src/components/header.tsx`, and `apps/website/src/components/footer.tsx` now use the provided root Quadra PNG branding assets

### Fixed
- EDMS pages now normalize legacy mixed timestamp storage so live rows no longer render far-future years when Turso data was stored in milliseconds
- Bulk EDMS report pages, audit views, databook summaries, and matrix counts are now sourced from the live workspace dataset rather than placeholder values
- Dashboard and website branding now use the provided root favicon bundle and logo assets

### Removed
- Temporary `packages/theme` workspace after migrating the shared theme source into `packages/ui`

## [0.3.0] - 2026-04-15

### Added
- EDMS full page suite: documents, projects, workflows, transmittals, notifications, reports, schedule, databook, matrix, audit
- Bulk document upload (`DocumentBulkUploadSheet`) with concurrent multi-file processing
- `/api/search/route.ts` - Drizzle `ilike` queries across projects + documents tables
- `/api/chat/route.ts` - RAG-informed AI responses using user's active project portfolio
- `apps/dashboard/src/db/scripts/seed-edms.ts` - Database seed for all EDMS entities
- EDMS component library under `apps/dashboard/src/components/edms/`

## [0.2.0] - 2026-04-13

### Added
- EDMS dashboard initial pages migrated from `edms.html` reference file
- Database schema for EDMS (documents, projects, document_workflows, workflow_steps, transmittals, notifications tables)
- Drizzle ORM + Turso (libsql) integration

## [0.1.0] - 2026-04-11

### Added
- Initial monorepo setup
- `apps/dashboard` - Next.js 16 dashboard (primary app)
- `apps/construction` - Theme editor app (source for theme migration)
- `packages/ui` - Shared Midday UI component library
