# Restart Dev Server Script
# This script clears all caches and restarts the development server

Write-Host "🧹 Clearing caches..." -ForegroundColor Cyan

# Clear Next.js build cache
if (Test-Path "apps/dashboard/.next") {
    Remove-Item -Recurse -Force "apps/dashboard/.next"
    Write-Host "✓ Cleared .next cache" -ForegroundColor Green
}

# Clear node_modules cache
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "✓ Cleared node_modules cache" -ForegroundColor Green
}

# Clear Next.js panic logs
Remove-Item "$env:LOCALAPPDATA\Temp\next-panic-*.log" -Force -ErrorAction SilentlyContinue
Write-Host "✓ Cleared panic logs" -ForegroundColor Green

Write-Host ""
Write-Host "✨ Caches cleared! Now starting dev server..." -ForegroundColor Cyan
Write-Host ""

# Change to dashboard directory and start dev server
Set-Location "apps/dashboard"
bun run dev
