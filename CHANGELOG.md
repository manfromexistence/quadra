# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **apps/dashboard — Vercel 250 MB serverless function size limit exceeded**
  - Root cause 1: `outputFileTracingExcludes` patterns were missing `/**/*` wildcards,
    meaning they matched directory names literally and silently excluded nothing inside them.
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
  - Deployed to Vercel project `app-quadra` on 2026-04-17.
  - Production URL: https://app-quadra.vercel.app