#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Professional agent communication system
.PARAMETER InputText
    Text to save (triggers human mode)
.PARAMETER Timeout
    Timeout in seconds (default: 120)
.PARAMETER Force
    Force overwrite existing prompt
#>

[CmdletBinding()]
param(
    [Parameter(Position=0, ValueFromRemainingArguments=$true)]
    [string[]]$InputText,
    
    [Parameter()]
    [ValidateRange(1, 3600)]
    [int]$Timeout = 120,
    
    [Parameter()]
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# File paths with validation
$ScriptDir = $PSScriptRoot
if (-not $ScriptDir) { $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path }
if (-not $ScriptDir) { $ScriptDir = Get-Location }

$StorageFile = Join-Path $ScriptDir "agent-prompt.txt"
$TimestampFile = Join-Path $ScriptDir "agent-timestamp.txt"
$LockFile = Join-Path $ScriptDir "agent.lock"

# Utility functions
function Test-FileAccess {
    param([string]$Path)
    try {
        [System.IO.File]::OpenWrite($Path).Close()
        return $true
    } catch {
        return $false
    }
}

function Get-SafeTimestamp {
    return [System.DateTimeOffset]::UtcNow.ToString("o")
}

function Write-SafeFile {
    param([string]$Path, [string]$Content)
    
    $tempFile = "$Path.tmp"
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    
    try {
        [System.IO.File]::WriteAllText($tempFile, $Content, $utf8NoBom)
        Move-Item $tempFile $Path -Force
        return $true
    } catch {
        if (Test-Path $tempFile) { Remove-Item $tempFile -Force -ErrorAction SilentlyContinue }
        throw
    }
}

function Read-SafeFile {
    param([string]$Path)
    
    if (-not (Test-Path $Path)) { return $null }
    
    $maxRetries = 3
    for ($i = 0; $i -lt $maxRetries; $i++) {
        try {
            return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
        } catch {
            if ($i -eq ($maxRetries - 1)) { throw }
            Start-Sleep -Milliseconds (100 * ($i + 1))
        }
    }
}

function Set-ProcessLock {
    try {
        $processInfo = @{
            PID = $PID
            Mode = if ($InputText) { "human" } else { "agent" }
            Started = Get-SafeTimestamp
        } | ConvertTo-Json -Compress
        
        Write-SafeFile $LockFile $processInfo
        return $true
    } catch {
        return $false
    }
}

function Remove-ProcessLock {
    try {
        if (Test-Path $LockFile) {
            Remove-Item $LockFile -Force -ErrorAction SilentlyContinue
        }
    } catch {
        # Ignore cleanup errors
    }
}

function Test-ProcessLock {
    if (-not (Test-Path $LockFile)) { return $false }
    
    try {
        $lockContent = Read-SafeFile $LockFile
        if (-not $lockContent) { return $false }
        
        $lockInfo = $lockContent | ConvertFrom-Json
        $process = Get-Process -Id $lockInfo.PID -ErrorAction SilentlyContinue
        
        return ($null -ne $process)
    } catch {
        return $false
    }
}

function Write-HumanPrompt {
    param([string]$Text = "")
    
    # Check for existing lock
    if ((Test-ProcessLock) -and -not $Force) {
        Write-Error "Another process is active. Use -Force to override."
        exit 1
    }
    
    # Set process lock
    if (-not (Set-ProcessLock)) {
        Write-Error "Failed to acquire process lock"
        exit 1
    }
    
    try {
        # Validate write access
        if (-not (Test-FileAccess $StorageFile)) {
            Write-Error "Cannot write to storage location"
            exit 1
        }
        
        $line = $Text
        
        # If no text provided, prompt for input
        if ([string]::IsNullOrWhiteSpace($line)) {
            Write-Host "> " -NoNewline
            $line = [System.Console]::In.ReadLine()
        }
        
        # Validate input
        if ([string]::IsNullOrWhiteSpace($line)) {
            exit 1
        }
        
        # Process and save
        $content = $line.Trim()
        $timestamp = Get-SafeTimestamp
        
        # Atomic write operations
        Write-SafeFile $StorageFile $content | Out-Null
        Write-SafeFile $TimestampFile $timestamp | Out-Null
        
    } finally {
        Remove-ProcessLock
    }
}

function Read-AgentPrompt {
    # Check if prompt file exists first
    if (Test-Path $StorageFile) {
        try {
            $content = Read-SafeFile $StorageFile
            if ($content) {
                Write-Output $content
                exit 0
            }
        } catch {
            # Continue to polling if read fails
        }
    }
    
    $startTime = Get-Date
    $lastTimestamp = $null
    $pollInterval = 1
    
    # Get baseline timestamp
    try {
        $lastTimestamp = Read-SafeFile $TimestampFile
    } catch {
        # Ignore initial read errors
    }
    
    # Main polling loop
    while ($true) {
        $elapsed = ((Get-Date) - $startTime).TotalSeconds
        
        # Check timeout
        if ($elapsed -ge $Timeout) {
            # Try to read existing prompt on timeout
            try {
                $content = Read-SafeFile $StorageFile
                if ($content) {
                    Write-Output $content
                    exit 0
                }
            } catch {
                # Ignore read errors on timeout
            }
            exit 1
        }
        
        # Check for new prompt
        try {
            if (Test-Path $TimestampFile) {
                $currentTimestamp = Read-SafeFile $TimestampFile
                
                if ($currentTimestamp -and $currentTimestamp -ne $lastTimestamp) {
                    $content = Read-SafeFile $StorageFile
                    if ($content) {
                        Write-Output $content
                        exit 0
                    }
                    $lastTimestamp = $currentTimestamp
                }
            }
        } catch {
            # Continue on read errors
        }
        
        Start-Sleep -Seconds $pollInterval
    }
}

# Cleanup handler
$cleanup = {
    Remove-ProcessLock
}
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action $cleanup | Out-Null

# Main execution with comprehensive error handling
try {
    if ($InputText -and $InputText.Count -gt 0) {
        # Human mode - join all arguments as text
        $text = $InputText -join " "
        Write-HumanPrompt -Text $text
    } else {
        # Agent mode - default behavior
        Read-AgentPrompt
    }
} catch {
    Remove-ProcessLock
    Write-Error $_.Exception.Message
    exit 1
}