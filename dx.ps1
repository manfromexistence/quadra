#!/usr/bin/env pwsh
<#
.SYNOPSIS
    DX - Developer Experience Communication System
.PARAMETER InputText
    Text to save (triggers human mode)
.PARAMETER Timeout
    Timeout in seconds (default: 120)
.PARAMETER Force
    Force overwrite existing prompt
.PARAMETER Silent
    Suppress all output except prompt content
.PARAMETER Version
    Show version information
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
$DX_VERSION = "1.0.1"
$DX_BUILD = "2026.04.16"
$ErrorActionPreference = "Stop"

# Fixed storage location (not script directory)
$StorageDir = Join-Path $env:USERPROFILE ".dx"
$StorageFile = Join-Path $StorageDir "dx-prompt.txt"
$TimestampFile = Join-Path $StorageDir "dx-timestamp.txt"
$LockFile = Join-Path $StorageDir "dx.lock"

# Ensure storage directory exists
if (-not (Test-Path $StorageDir)) {
    New-Item -ItemType Directory -Path $StorageDir -Force | Out-Null
}

function Get-SafeTimestamp {
    return [System.DateTimeOffset]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

function Write-SafeFile {
    param([string]$Path, [string]$Content)
    
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Read-SafeFile {
    param([string]$Path)
    
    if (-not (Test-Path $Path)) { 
        return $null 
    }
    
    return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}

function Set-ProcessLock {
    try {
        $processInfo = @{
            PID = $PID
            Mode = if ($InputText -and $InputText.Count -gt 0) { "human" } else { "agent" }
            Started = Get-SafeTimestamp
            Version = $DX_VERSION
        } | ConvertTo-Json -Compress
        
        Write-SafeFile $LockFile $processInfo
        return $true
    } catch {
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
            Remove-Item $LockFile -Force -ErrorAction SilentlyContinue
        }
        
        return $isActive
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

function Show-Version {
    Write-Host "DX - Developer Experience Communication System"
    Write-Host "Version: $DX_VERSION"
    Write-Host "Build: $DX_BUILD"
    Write-Host "PowerShell: $($PSVersionTable.PSVersion)"
    exit 0
}

function Write-HumanPrompt {
    param([string]$Text = "")
    
    # Check for existing lock
    if ((Test-ProcessLock) -and -not $Force) {
        Write-Error "Another DX process is active. Use -Force to override."
        exit 1
    }
    
    # Acquire process lock
    if (-not (Set-ProcessLock)) {
        Write-Error "Failed to acquire process lock."
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
            exit 1
        }
        
        # Process input
        $content = $line.Trim()
        $timestamp = Get-SafeTimestamp
        
        # Save operations
        Write-SafeFile $StorageFile $content
        Write-SafeFile $TimestampFile $timestamp
        
        if (-not $Silent) {
            Write-Host "Saved: $($content.Length) chars" -ForegroundColor Green
        }
        
    } catch {
        Write-Error "Failed to save prompt: $_"
        exit 1
    } finally {
        Remove-ProcessLock
    }
}

function Read-AgentPrompt {
    # Quick check for existing prompt
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
    
    # Polling setup
    $startTime = Get-Date
    $lastTimestamp = $null
    
    # Get baseline timestamp
    try {
        $lastTimestamp = Read-SafeFile $TimestampFile
    } catch {
        # Ignore initial read errors
    }
    
    # Polling loop
    while ($true) {
        $elapsed = ((Get-Date) - $startTime).TotalSeconds
        
        # Timeout check
        if ($elapsed -ge $Timeout) {
            # Last attempt to read existing prompt
            try {
                $content = Read-SafeFile $StorageFile
                if ($content) {
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
        
        # Adaptive polling interval
        if ($elapsed -lt 5) {
            Start-Sleep -Milliseconds 500
        } elseif ($elapsed -lt 30) {
            Start-Sleep -Seconds 1
        } else {
            Start-Sleep -Seconds 2
        }
    }
}

# Cleanup handler
$cleanup = {
    Remove-ProcessLock
}
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action $cleanup | Out-Null

# Main execution
try {
    # Handle version request
    if ($Version) {
        Show-Version
    }
    
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
    Write-Error "DX Error: $_"
    exit 1
}