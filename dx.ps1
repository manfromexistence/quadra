#!/usr/bin/env pwsh
<#
.SYNOPSIS
    DX - Professional Developer Experience Communication System
.DESCRIPTION
    Ultra-fast, battle-tested agent communication with zero dependencies.
    Default: Agent mode (reads prompt)
    Args: Human mode (saves prompt)
.PARAMETER InputText
    Text to save (triggers human mode). Supports multi-word input.
.PARAMETER Timeout
    Agent timeout in seconds (1-3600, default: 120)
.PARAMETER Force
    Force overwrite if another process is active
.PARAMETER Silent
    Suppress all output except prompt content
.PARAMETER Version
    Show version information
.EXAMPLE
    .\dx.ps1                           # Agent mode - read prompt
    .\dx.ps1 "create new feature"      # Human mode - save prompt
    .\dx.ps1 fix bug in auth module    # Human mode - multi-word
    .\dx.ps1 -Timeout 60              # Agent with 1min timeout
    .\dx.ps1 -Version                  # Show version
#>

[CmdletBinding(DefaultParameterSetName='Default')]
param(
    [Parameter(Position=0, ValueFromRemainingArguments=$true, ParameterSetName='Default')]
    [string[]]$InputText,
    
    [Parameter(ParameterSetName='Default')]
    [ValidateRange(1, 3600)]
    [int]$Timeout = 120,
    
    [Parameter(ParameterSetName='Default')]
    [switch]$Force,
    
    [Parameter(ParameterSetName='Default')]
    [switch]$Silent,
    
    [Parameter(ParameterSetName='Version')]
    [switch]$Version
)

# Constants
$DX_VERSION = "1.0.0"
$DX_BUILD = "2026.04.16"
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Dynamic paths with fallbacks
$ScriptDir = $PSScriptRoot
if (-not $ScriptDir) { 
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path 
}
if (-not $ScriptDir) { 
    $ScriptDir = Get-Location 
}

$StorageFile = Join-Path $ScriptDir "dx-prompt.txt"
$TimestampFile = Join-Path $ScriptDir "dx-timestamp.txt"
$LockFile = Join-Path $ScriptDir "dx.lock"
$LogFile = Join-Path $ScriptDir "dx.log"

# Performance counters
$Script:StartTime = Get-Date

#region Utility Functions

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    if (-not $Silent) {
        $timestamp = Get-Date -Format "HH:mm:ss.fff"
        $logEntry = "[$timestamp] [$Level] $Message"
        try {
            Add-Content -Path $LogFile -Value $logEntry -Encoding UTF8 -ErrorAction SilentlyContinue
        } catch {
            # Ignore logging errors
        }
    }
}

function Get-SafeTimestamp {
    return [System.DateTimeOffset]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

function Test-FileAccess {
    param([string]$Path)
    try {
        $testFile = Join-Path $Path "dx-test-$PID.tmp"
        "test" | Out-File -FilePath $testFile -Encoding UTF8 -Force
        Remove-Item $testFile -Force -ErrorAction SilentlyContinue
        return $true
    } catch {
        return $false
    }
}

function Write-SafeFile {
    param([string]$Path, [string]$Content)
    
    $tempFile = "$Path.tmp.$PID"
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    
    try {
        # Atomic write: temp file -> move
        [System.IO.File]::WriteAllText($tempFile, $Content, $utf8NoBom)
        
        # Verify write
        $written = [System.IO.File]::ReadAllText($tempFile, $utf8NoBom)
        if ($written -ne $Content) {
            throw "Write verification failed"
        }
        
        # Atomic move
        Move-Item $tempFile $Path -Force
        Write-Log "File written: $Path ($($Content.Length) bytes)"
        
    } catch {
        if (Test-Path $tempFile) { 
            Remove-Item $tempFile -Force -ErrorAction SilentlyContinue 
        }
        Write-Log "Write failed: $Path - $_" "ERROR"
        throw
    }
}

function Read-SafeFile {
    param([string]$Path)
    
    if (-not (Test-Path $Path)) { 
        return $null 
    }
    
    $maxRetries = 5
    for ($i = 0; $i -lt $maxRetries; $i++) {
        try {
            $content = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
            Write-Log "File read: $Path ($($content.Length) bytes)"
            return $content
        } catch {
            Write-Log "Read attempt $($i+1) failed: $Path - $_" "WARN"
            if ($i -eq ($maxRetries - 1)) { 
                Write-Log "Read failed after $maxRetries attempts: $Path" "ERROR"
                throw 
            }
            Start-Sleep -Milliseconds (50 * [Math]::Pow(2, $i))  # Exponential backoff
        }
    }
}

function Set-ProcessLock {
    try {
        $processInfo = @{
            PID = $PID
            Mode = if ($InputText -and $InputText.Count -gt 0) { "human" } else { "agent" }
            Started = Get-SafeTimestamp
            Version = $DX_VERSION
            Host = $env:COMPUTERNAME
            User = $env:USERNAME
        } | ConvertTo-Json -Compress
        
        Write-SafeFile $LockFile $processInfo
        Write-Log "Process lock acquired: PID $PID"
        return $true
    } catch {
        Write-Log "Failed to acquire lock: $_" "ERROR"
        return $false
    }
}

function Test-ProcessLock {
    if (-not (Test-Path $LockFile)) { 
        return $false 
    }
    
    try {
        $lockContent = Read-SafeFile $LockFile
        if (-not $lockContent) { 
            return $false 
        }
        
        $lockInfo = $lockContent | ConvertFrom-Json
        $process = Get-Process -Id $lockInfo.PID -ErrorAction SilentlyContinue
        
        $isActive = ($null -ne $process)
        if (-not $isActive) {
            Write-Log "Stale lock detected, cleaning up: PID $($lockInfo.PID)"
            Remove-Item $LockFile -Force -ErrorAction SilentlyContinue
        }
        
        return $isActive
    } catch {
        Write-Log "Lock validation failed: $_" "WARN"
        return $false
    }
}

function Remove-ProcessLock {
    try {
        if (Test-Path $LockFile) {
            Remove-Item $LockFile -Force -ErrorAction SilentlyContinue
            Write-Log "Process lock released: PID $PID"
        }
    } catch {
        Write-Log "Lock cleanup failed: $_" "WARN"
    }
}

function Show-Version {
    Write-Host "DX - Developer Experience Communication System"
    Write-Host "Version: $DX_VERSION"
    Write-Host "Build: $DX_BUILD"
    Write-Host "PowerShell: $($PSVersionTable.PSVersion)"
    Write-Host "Platform: $($PSVersionTable.Platform)"
    Write-Host "OS: $($PSVersionTable.OS)"
    exit 0
}

function Measure-Performance {
    $elapsed = ((Get-Date) - $Script:StartTime).TotalMilliseconds
    Write-Log "Operation completed in ${elapsed}ms"
}

#endregion

#region Core Functions

function Write-HumanPrompt {
    param([string]$Text = "")
    
    Write-Log "Human mode initiated"
    
    # Validate environment
    if (-not (Test-FileAccess $ScriptDir)) {
        Write-Error "Cannot write to directory: $ScriptDir"
        exit 1
    }
    
    # Check for existing lock
    if ((Test-ProcessLock) -and -not $Force) {
        Write-Error "Another DX process is active. Use -Force to override or wait for completion."
        exit 1
    }
    
    # Acquire process lock
    if (-not (Set-ProcessLock)) {
        Write-Error "Failed to acquire process lock. Check permissions."
        exit 1
    }
    
    try {
        $line = $Text
        
        # Interactive input if no text provided
        if ([string]::IsNullOrWhiteSpace($line)) {
            if (-not $Silent) {
                Write-Host "> " -NoNewline
            }
            $line = [System.Console]::In.ReadLine()
        }
        
        # Validate input
        if ([string]::IsNullOrWhiteSpace($line)) {
            Write-Log "Empty input provided" "WARN"
            exit 1
        }
        
        # Process input
        $content = $line.Trim()
        $timestamp = Get-SafeTimestamp
        
        # Validate content length
        if ($content.Length -gt 10000) {
            Write-Error "Input too long (max 10,000 characters)"
            exit 1
        }
        
        # Atomic save operations
        Write-SafeFile $StorageFile $content
        Write-SafeFile $TimestampFile $timestamp
        
        Write-Log "Prompt saved: '$content' ($($content.Length) chars)"
        
        if (-not $Silent) {
            Write-Host "Saved: $($content.Length) chars" -ForegroundColor Green
        }
        
    } catch {
        Write-Log "Human mode failed: $_" "ERROR"
        Write-Error "Failed to save prompt: $_"
        exit 1
    } finally {
        Remove-ProcessLock
        Measure-Performance
    }
}

function Read-AgentPrompt {
    Write-Log "Agent mode initiated (timeout: ${Timeout}s)"
    
    # Quick check for existing prompt
    if (Test-Path $StorageFile) {
        try {
            $content = Read-SafeFile $StorageFile
            if ($content) {
                Write-Log "Existing prompt found and returned"
                Write-Output $content
                Measure-Performance
                exit 0
            }
        } catch {
            Write-Log "Failed to read existing prompt: $_" "WARN"
        }
    }
    
    # Polling setup
    $startTime = Get-Date
    $lastTimestamp = $null
    $pollCount = 0
    
    # Get baseline timestamp
    try {
        $lastTimestamp = Read-SafeFile $TimestampFile
        Write-Log "Baseline timestamp: $lastTimestamp"
    } catch {
        Write-Log "No baseline timestamp found"
    }
    
    # Optimized polling loop
    while ($true) {
        $pollCount++
        $elapsed = ((Get-Date) - $startTime).TotalSeconds
        
        # Timeout check
        if ($elapsed -ge $Timeout) {
            Write-Log "Timeout reached after ${elapsed}s, $pollCount polls" "WARN"
            
            # Last attempt to read existing prompt
            try {
                $content = Read-SafeFile $StorageFile
                if ($content) {
                    Write-Log "Fallback prompt returned on timeout"
                    Write-Output $content
                    exit 0
                }
            } catch {
                # Ignore final read errors
            }
            
            Write-Error "Timeout: No prompt received in $Timeout seconds"
            exit 1
        }
        
        # Check for new prompt
        try {
            if (Test-Path $TimestampFile) {
                $currentTimestamp = Read-SafeFile $TimestampFile
                
                if ($currentTimestamp -and $currentTimestamp -ne $lastTimestamp) {
                    Write-Log "New timestamp detected: $currentTimestamp"
                    
                    $content = Read-SafeFile $StorageFile
                    if ($content) {
                        Write-Log "New prompt received after ${elapsed}s, $pollCount polls"
                        Write-Output $content
                        Measure-Performance
                        exit 0
                    }
                    
                    $lastTimestamp = $currentTimestamp
                }
            }
        } catch {
            Write-Log "Poll $pollCount failed: $_" "WARN"
        }
        
        # Adaptive polling interval
        if ($elapsed -lt 5) {
            Start-Sleep -Milliseconds 500      # 0.5s for first 5s
        } elseif ($elapsed -lt 30) {
            Start-Sleep -Seconds 1             # 1s for next 25s
        } elseif ($elapsed -lt 60) {
            Start-Sleep -Seconds 2             # 2s for next 30s
        } else {
            Start-Sleep -Seconds 5             # 5s thereafter
        }
    }
}

#endregion

#region Cleanup & Error Handling

# Cleanup handler for graceful shutdown
$cleanup = {
    try {
        if (Test-Path $LockFile) {
            Remove-Item $LockFile -Force -ErrorAction SilentlyContinue
        }
    } catch {
        # Ignore cleanup errors
    }
}

# Register cleanup for various exit scenarios
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action $cleanup | Out-Null
trap {
    try {
        if (Test-Path $LockFile) {
            Remove-Item $LockFile -Force -ErrorAction SilentlyContinue
        }
    } catch {
        # Ignore cleanup errors
    }
    Write-Error "DX Error: $_"
    exit 1
}

#endregion

#region Main Execution

try {
    # Handle version request
    if ($Version) {
        Show-Version
    }
    
    # Initialize logging
    Write-Log "DX v$DX_VERSION started (PID: $PID)"
    
    # Route to appropriate mode
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
    Write-Log "Fatal error: $_" "ERROR"
    if (-not $Silent) {
        Write-Error "DX Fatal: $_"
    }
    exit 1
}

#endregion