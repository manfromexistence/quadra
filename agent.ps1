#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Two-way communication script for human-agent interaction
.PARAMETER Mode
    Either "human" or "agent"
.EXAMPLE
    .\agent.ps1 -Mode human
    .\agent.ps1 -Mode agent
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true, Position=0)]
    [ValidateSet("human", "agent")]
    [string]$Mode
)

$ErrorActionPreference = "Stop"
$StorageFile = Join-Path $PSScriptRoot "agent-prompt.txt"
$TimestampFile = Join-Path $PSScriptRoot "agent-timestamp.txt"

function Write-HumanPrompt {
    $line = [System.Console]::In.ReadLine()
    
    if ([string]::IsNullOrWhiteSpace($line)) {
        Write-Error "No content provided"
        exit 1
    }
    
    $content = $line
    $timestamp = (Get-Date).ToString("o")
    
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($StorageFile, $content, $utf8NoBom)
    [System.IO.File]::WriteAllText($TimestampFile, $timestamp, $utf8NoBom)
}

function Read-AgentPrompt {
    $timeoutSeconds = 120
    $pollIntervalSeconds = 10
    $startTime = Get-Date
    $lastTimestamp = $null
    
    if (Test-Path $TimestampFile) {
        $lastTimestamp = [System.IO.File]::ReadAllText($TimestampFile, [System.Text.Encoding]::UTF8)
    }
    
    while ($true) {
        $elapsed = ((Get-Date) - $startTime).TotalSeconds
        
        if ($elapsed -ge $timeoutSeconds) {
            if (Test-Path $StorageFile) {
                $content = [System.IO.File]::ReadAllText($StorageFile, [System.Text.Encoding]::UTF8)
                Write-Output $content
                exit 0
            } else {
                Write-Error "No prompt found after 2 minutes"
                exit 1
            }
        }
        
        if (Test-Path $TimestampFile) {
            $currentTimestamp = [System.IO.File]::ReadAllText($TimestampFile, [System.Text.Encoding]::UTF8)
            
            if ($currentTimestamp -ne $lastTimestamp) {
                $content = [System.IO.File]::ReadAllText($StorageFile, [System.Text.Encoding]::UTF8)
                Write-Output $content
                exit 0
            }
        }
        
        Start-Sleep -Seconds $pollIntervalSeconds
    }
}

switch ($Mode) {
    "human" { Write-HumanPrompt }
    "agent" { Read-AgentPrompt }
}
