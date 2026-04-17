# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **apps/dashboard — Vercel 250 MB serverless function size limit exceeded**
  - Root cause 1: `outputFileTracingExcludes` patterns were missing `/**/*` wildcards,
    meaning they matched directory names literally and excluded nothing inside them.
  - Root cause 2: All `pdfjs-dist` subfolders (`legacy`, `es5`, `cmaps`, `standard_fonts`,
    `web`, `wasm`, `image_decoders`, `iccs`) were leaking into server-side function bundles.
    The `build/` subfolder alone is ~15 MB and `legacy/` is ~19 MB.
  - Root cause 3: `outputFileTracingIncludes` was pulling in the Bun package-manager cache
    (`.bun/@libsql+*`, `.bun/node-fetch@*`, `.bun/ws@*`) unnecessarily on every deploy.
  - Fix applied in `apps/dashboard/next.config.ts`:
    - All exclusion glob patterns now end with `/**/*` so they correctly exclude
      every file inside the matched directories.
    - Added full exclusion of all non-essential `pdfjs-dist` subfolders
      (`cmaps`, `standard_fonts`, `web`, `wasm`, `image_decoders`, `iccs`).
    - Added exclusions for additional `@swc/core-*` and `@esbuild/*` platform variants
      (`darwin-x64`, `darwin-arm64`, `win32-x64-msvc`, `linux-arm64`, `linux-ia32`, `linux-arm`).
    - Removed `.bun` cache paths from `outputFileTracingIncludes` (not needed at runtime).
    - Extended metadata exclusions: `LICENSE.txt`, `README.txt`, and corrected
      test/example patterns to `/**/*` for full recursive exclusion.
    - Excluded `.turbopack` and `.cache` dev-tool directories.

- **apps/dashboard — `vercel.json` had `experimentalServices` and `functions` together**
  - Vercel CLI rejected the config with: `The experimentalServices property cannot be used
    in conjunction with the functions property`.
  - Removed the `experimentalServices` block entirely — it was unused scaffolding.

- **apps/dashboard — `vercel.json` `functions` patterns incompatible with App Router**
  - After removing `experimentalServices`, both the `"**"` and `"api/**"` patterns in
    `functions` failed with: `The pattern defined in functions doesn't match any
    Serverless Functions`.
  - Next.js App Router does not expose functions via legacy `vercel.json` `functions` key
    patterns. Route-level settings (e.g. `maxDuration`) must be exported directly from
    route segment files (`export const maxDuration = 60`).
  - Removed the entire `functions` block from `vercel.json`. Vercel plan defaults apply.
- **apps/dashboard — 314 Turbopack build errors: `Module not found` for icon packages**
  - `modularizeImports` in `next.config.ts` was transforming imports to paths that don't exist:
    - `@radix-ui/react-icons/dist/ArchiveIcon` — package has no per-icon files at that path
    - `lucide-react/dist/esm/icons/arrow-down-icon` — lucide v1 files use `arrow-down` (no `-icon` suffix)
  - `optimizePackageImports` (already configured) handles tree-shaking for all these packages correctly.
    Having both `optimizePackageImports` and `modularizeImports` for the same packages was redundant and broken.
  - Removed the entire `modularizeImports` block from `next.config.ts`.
  - Deployed to Vercel project `app-quadra` on 2026-04-17.
  - Production URL: https://app-quadra.vercel.app