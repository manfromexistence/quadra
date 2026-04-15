#!/usr/bin/env pwsh
param([switch]$Uninstall)

$ErrorActionPreference = "Stop"

$ScriptPath = Join-Path $PSScriptRoot "dx.ps1"
$UserBin = Join-Path $env:USERPROFILE "bin"
$GlobalDx = Join-Path $UserBin "dx.ps1"

if ($Uninstall) {
    $filesToRemove = @("dx.ps1", "dx.bat", "d.bat", "x.bat", "d.ps1", "x.ps1")
    foreach ($file in $filesToRemove) {
        $fullPath = Join-Path $UserBin $file
        if (Test-Path $fullPath) {
            Remove-Item $fullPath -Force
            Write-Host "Removed: $file" -ForegroundColor Green
        }
    }
    Write-Host "DX uninstalled" -ForegroundColor Green
    exit 0
}

if (-not (Test-Path $ScriptPath)) {
    Write-Error "dx.ps1 not found"
    exit 1
}

Write-Host "Installing DX globally..." -ForegroundColor Cyan

# Create user bin directory
if (-not (Test-Path $UserBin)) {
    New-Item -ItemType Directory -Path $UserBin -Force | Out-Null
}

# Copy main script
Copy-Item $ScriptPath $GlobalDx -Force

# Create batch files for global access
$commands = @("dx", "d", "x")
foreach ($cmd in $commands) {
    $batchFile = Join-Path $UserBin "$cmd.bat"
    $batchContent = "@echo off`npowershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$GlobalDx`" %*"
    $batchContent | Out-File -FilePath $batchFile -Encoding ASCII -Force
    
    # Also create .ps1 versions
    $ps1File = Join-Path $UserBin "$cmd.ps1"
    "param([Parameter(ValueFromRemainingArguments=`$true)][string[]]`$Args)`n& `"$GlobalDx`" @Args" | Out-File -FilePath $ps1File -Encoding UTF8 -Force
}

# Update PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if (-not ($currentPath -and $currentPath.Contains($UserBin))) {
    $newPath = if ($currentPath) { "$currentPath;$UserBin" } else { $UserBin }
    [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
    $env:PATH = "$env:PATH;$UserBin"
    Write-Host "Added to PATH: $UserBin" -ForegroundColor Green
}

# Add to PowerShell profile
$profileContent = @"

# DX - Ultra-fast communication
if (Test-Path "$GlobalDx") {
    function global:dx { if (`$args) { & "$GlobalDx" @args } else { & "$GlobalDx" } }
    function global:d { if (`$args) { & "$GlobalDx" @args } else { & "$GlobalDx" } }
    function global:x { if (`$args) { & "$GlobalDx" @args } else { & "$GlobalDx" } }
}

"@

if (Test-Path $PROFILE) {
    $existing = Get-Content $PROFILE -Raw -ErrorAction SilentlyContinue
    if (-not ($existing -and $existing.Contains("DX - Ultra-fast communication"))) {
        Add-Content -Path $PROFILE -Value $profileContent
        Write-Host "Added to PowerShell profile" -ForegroundColor Green
    }
} else {
    $profileDir = Split-Path $PROFILE -Parent
    if (-not (Test-Path $profileDir)) {
        New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
    }
    $profileContent | Out-File -FilePath $PROFILE -Encoding UTF8 -Force
    Write-Host "Created PowerShell profile" -ForegroundColor Green
}

# Create session functions immediately
$function:global:dx = { if ($args) { & $GlobalDx @args } else { & $GlobalDx } }.GetNewClosure()
$function:global:d = { if ($args) { & $GlobalDx @args } else { & $GlobalDx } }.GetNewClosure()
$function:global:x = { if ($args) { & $GlobalDx @args } else { & $GlobalDx } }.GetNewClosure()

Write-Host ""
Write-Host "🚀 DX installed globally!" -ForegroundColor Green
Write-Host ""
Write-Host "Commands available everywhere:" -ForegroundColor Cyan
Write-Host "  d hello world     # Human mode"
Write-Host "  x                 # Agent mode"
Write-Host "  dx -Version       # Version info"
Write-Host ""
Write-Host "Available in: PowerShell, CMD, Run dialog, any terminal" -ForegroundColor Yellow
Write-Host "Restart PowerShell for permanent access" -ForegroundColor Cyan