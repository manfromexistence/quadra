#!/usr/bin/env pwsh
# Script to analyze Vercel bundle size and identify large functions

Write-Host "🔍 Analyzing Vercel Bundle Size..." -ForegroundColor Cyan
Write-Host ""

# Set environment variable for detailed analysis
$env:VERCEL_ANALYZE_BUILD_OUTPUT = "1"
$env:NODE_ENV = "production"

# Clean previous build
if (Test-Path "apps/dashboard/.next") {
    Write-Host "🧹 Cleaning previous build..." -ForegroundColor Yellow
    Remove-Item -Path "apps/dashboard/.next" -Recurse -Force
}

# Run build with analysis
Write-Host "🚀 Building with bundle analysis..." -ForegroundColor Green
Set-Location "apps/dashboard"

try {
    bun run build 2>&1 | Tee-Object -FilePath "bundle-analysis.log"
    
    Write-Host ""
    Write-Host "✅ Build complete! Check bundle-analysis.log for detailed size breakdown" -ForegroundColor Green
    Write-Host ""
    
    # Check if .next directory exists and show size
    if (Test-Path ".next") {
        $size = (Get-ChildItem ".next" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "📦 Total .next directory size: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
        
        if ($size -gt 200) {
            Write-Host "⚠️  WARNING: Build size is approaching 250 MB limit!" -ForegroundColor Yellow
        }
        
        # Show largest directories
        Write-Host ""
        Write-Host "📊 Largest directories in .next:" -ForegroundColor Cyan
        Get-ChildItem ".next" -Directory | ForEach-Object {
            $dirSize = (Get-ChildItem $_.FullName -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
            [PSCustomObject]@{
                Directory = $_.Name
                SizeMB = [math]::Round($dirSize, 2)
            }
        } | Sort-Object SizeMB -Descending | Format-Table -AutoSize
    }
    
} catch {
    Write-Host "❌ Build failed: $_" -ForegroundColor Red
    exit 1
} finally {
    Set-Location "../.."
}
