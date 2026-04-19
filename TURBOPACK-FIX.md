# Turbopack Panic Fix

## Problem
Turbopack is panicking with error:
```
Failed to write app endpoint /[locale]/(app)/editor/theme/[[...themeId]]/page
Caused by: metadata file not found
```

## Root Cause
The old theme editor route from `apps/construction` was deleted, but Turbopack has it cached in memory.

## Solution

### Option 1: Use the Restart Script (Recommended)
```powershell
.\restart-dev.ps1
```

This will:
1. Clear all Next.js caches
2. Clear node_modules cache
3. Clear panic logs
4. Restart the dev server

### Option 2: Manual Steps
1. **Stop the dev server** (Ctrl+C in the terminal)
2. **Clear caches:**
   ```powershell
   Remove-Item -Recurse -Force "apps/dashboard/.next"
   Remove-Item -Recurse -Force "node_modules/.cache"
   Remove-Item "$env:LOCALAPPDATA\Temp\next-panic-*.log" -Force
   ```
3. **Restart dev server:**
   ```powershell
   cd apps/dashboard
   bun run dev
   ```

## What Was Fixed
- ✅ Deleted `apps/dashboard/src/app/[locale]/(app)/editor/` directory
- ✅ Updated sidebar navigation from `/editor/theme` to `/theme`
- ✅ Cleared all caches
- ✅ Theme editor now only accessible at `/theme`

## Verification
After restarting, you should see:
- No more Turbopack panic errors
- Dev server runs normally
- Theme editor accessible at `http://localhost:3000/en/theme`

## If Problem Persists
If you still see the error after restarting:
1. Make sure you completely stopped the old dev server process
2. Check for any zombie Node/Bun processes:
   ```powershell
   Get-Process | Where-Object { $_.ProcessName -like "*node*" -or $_.ProcessName -like "*bun*" }
   ```
3. Kill any zombie processes and try again
