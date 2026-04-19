# Changelog

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Added

- **Export to PDF and Excel** - Proper file download functionality
  - Created `ExportButton` component with dropdown menu for PDF/Excel options
  - Integrated `jspdf`, `jspdf-autotable`, and `xlsx` libraries
  - Export utility functions in `lib/export-utils.ts`
  - PDF exports include: title, metadata, formatted tables, page numbers, generation date
  - Excel exports include: headers, data, column widths, proper formatting
  - Replaced `PrintButton` with `ExportButton` in documents and transmittals pages
  - Export includes current filters and search queries in metadata
- **Transmittal Creation Page** - `/transmittals/new` with live preview
  - Form with all transmittal fields (number, date, recipient, purpose, subject, due date, remarks)
  - Checkbox list to select documents
  - Live preview that updates in real-time as form changes
  - Document table in preview
  - Signature blocks
  - Database integration with transmittals and transmittalDocuments tables
- **Print CSS Styles** - Added comprehensive print media queries
  - Hides navigation, sidebars, buttons, and UI elements
  - Full-width content layout for printing
  - Proper table formatting
  - Page break controls
  - Link URL display in print

### Changed

- **AGENTS.md File Policy** - Added strict rules against creating stray markdown and script files
  - Only allowed markdown files: TODO.md, CHANGELOG.md, HELP.md (when blocked)
  - No README, SUMMARY, IMPLEMENTATION, ANALYSIS, or other documentation files
  - Focus on code implementation, not documentation
- **Sidebar ScrollArea** - Added ScrollArea component to sidebar navigation
  - Sidebar menu items now scrollable in both expanded and collapsed states
  - Proper overflow handling for long menu lists
  - Smooth scrolling experience

### Fixed

- **CSS Print Styles** - Fixed PostCSS parsing errors with escaped class names
  - Changed `.print\\:hidden` to `.print\:hidden` (single backslash)
  - Fixed all print utility classes (hidden, block, inline, inline-block)
  - Print styles now compile without warnings
- **Print Button** - Now properly triggers browser print dialog with print CSS
  - Added print media queries to hide UI elements
  - Format content for PDF export
  - Proper table and page break handling
  - Print button available alongside Export button on all pages

### Removed

- **PrintButton component** - Replaced with ExportButton for actual file downloads

### Blocked / Failed

- **Logo and favicon not displaying** - Created `HELP-LOGO-FAVICON.md` with full diagnostic info after 5 failed attempts. Files exist in public/ but images don't load. Needs investigation of custom image loader + Turbopack interaction.

### Fixed

- Fixed dashboard image loader to properly serve local logo files in development (removed hardcoded midday.ai CDN URL)
- Extracted and configured favicon files in both website and dashboard from root favicon.zip
- Added missing "Quadra" preset to theme presets so theme name field displays correctly in theme editor
- Replaced hardcoded SVG icon with BrandLogo component in EdmsDashboardSidebar header (note: EdmsDashboardSidebar is not currently active; the main Sidebar component already uses BrandLogo correctly)
- Fixed ChunkLoadError in GlobalSheetsProvider by adding loading fallback to dynamic import
- Fixed theme preset helper to import from correct presets file (was importing from old theme-presets.ts instead of new presets.ts with Quadra theme)
- Fixed BrandLogo component to use native img tags with eager loading and object-contain for better compatibility with Next.js 16.3
- Added explicit favicon link tags in layout head section for better browser compatibility
- Removed all console.log statements from EDMS session management (cleaner development logs)

### Changed

- Reorganized theme preview panel layout: moved button showcase to top, removed Progress component per user request
- Simplified Document Control Summary card with cleaner layout
- Professionalized all theme editor text: removed developer jargon, package references, and technical implementation details
- Updated theme editor descriptions to be concise and user-focused
- Made all color accordions auto-expand in theme editor Colors tab for better UX
- Removed Theme Name input field from theme control panel (redundant with preset selector)
- Cleaned up unused imports and state management code (removed themeName state, createTheme/updateTheme actions, useTransition, useEffect)
- Removed NavigationSidebar Menu section from theme preview panel

### Added

- Enhanced theme preview panel with comprehensive interactive Midday UI components:
  - **Interactive Controls**: Slider with live value display, switches and checkboxes with conditional rendering
  - **Form Components**: Input, Select (2 dropdowns), Textarea, Checkbox, Switch, RadioGroup with 3 options
  - **Navigation**: Tabs with 3 sections (Overview, Details, History) with rich content
  - **Data Display**: Enhanced table with 4 rows and multiple badge variants
  - **Sidebar Preview**: Interactive navigation with hover states
  - **Typography & Colors**: Color palette swatches for all theme colors
  - **Button Showcase**: All variants (Primary, Secondary, Outline, Ghost, Destructive) and sizes (Small, Default, Large, Icon) - now at the top
  - **Card Footer**: Action buttons in form card footer
  - **Real-time Updates**: All components respond instantly to theme changes
- **Logo and favicon assets configured for both websites**
  - Copied `logo-dark.png` and `logo-light.png` to `apps/website/public/`
  - Extracted favicon bundle to `apps/website/public/`
  - Both dashboard and website now have complete branding assets
  
- **Theme presets from construction app**
  - Copied complete theme presets file (3597 lines, 50+ themes) from `apps/construction/utils/theme-presets.ts`
  - Added to `packages/ui/src/theme/presets.ts` for shared access
  - Exported from `packages/ui/src/theme/index.ts`
  - Themes include: Modern Minimal, Violet Bloom, T3 Chat, Twitter, Mocha Mousse, Bubblegum, Amethyst Haze, Notebook, Doom 64, Catppuccin, Graphite, and 40+ more
  - All themes available in dashboard theme editor preset selector

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
