#!/usr/bin/env pwsh
param(
    [switch]$Uninstall
)

$ErrorActionPreference = "Stop"

$ScriptPath = Join-Path $PSScriptRoot "dx.ps1"
$UserBin = Join-Path $env:USERPROFILE "bin"
$GlobalDx = Join-Path $UserBin "dx.ps1"
$BatchFile = Join-Path $UserBin "dx.bat"

if ($Uninstall) {
    if (Test-Path $GlobalDx) { Remove-Item $GlobalDx -Force }
    if (Test-Path $BatchFile) { Remove-Item $BatchFile -Force }
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

# Copy script
Copy-Item $ScriptPath $GlobalDx -Force

# Create batch wrapper for CMD
$batchContent = "@echo off`npowershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$GlobalDx`" %*"
$batchContent | Out-File -FilePath $BatchFile -Encoding ASCII -Force

# Add to PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentPath -notcontains $UserBin) {
    $newPath = "$currentPath;$UserBin"
    [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
    $env:PATH = "$env:PATH;$UserBin"
    Write-Host "Added to PATH" -ForegroundColor Green
}

# Create PowerShell function
$function:global:dx = {
    if ($args) { 
        & $GlobalDx @args 
    } else { 
        & $GlobalDx 
    }
}.GetNewClosure()

# Ultra-short aliases
Set-Alias -Name d -Value dx -Scope Global -Force
Set-Alias -Name x -Value dx -Scope Global -Force

Write-Host ""
Write-Host "🚀 DX installed! Commands:" -ForegroundColor Green
Write-Host "  dx                 # Agent mode"
Write-Host "  dx hello world     # Human mode" 
Write-Host "  d                  # Ultra-short"
Write-Host "  x                  # Ultra-short"
Write-Host ""
Write-Host "Restart PowerShell for permanent PATH access" -ForegroundColor Yellow