#!/usr/bin/env pwsh
param([Parameter(ValueFromRemainingArguments=$true)][string[]]$InputText)

# Set strict error handling
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# Fixed storage location
$StorageDir = Join-Path $env:USERPROFILE ".dx"
$StorageFile = Join-Path $StorageDir "prompt.txt"
$TimestampFile = Join-Path $StorageDir "timestamp.txt"

# Timeout wrapper function
function Invoke-WithTimeout {
    param(
        [ScriptBlock]$ScriptBlock,
        [int]$TimeoutSeconds = 10,
        [string]$Operation = "Operation"
    )
    
    try {
        Write-Host "[DEBUG] Starting: $Operation" -ForegroundColor Yellow
        
        $job = Start-Job -ScriptBlock $ScriptBlock
        $completed = Wait-Job $job -Timeout $TimeoutSeconds
        
        if ($completed) {
            $result = Receive-Job $job
            Remove-Job $job -Force
            Write-Host "[DEBUG] Completed: $Operation" -ForegroundColor Green
            return $result
        } else {
            Remove-Job $job -Force
            throw "TIMEOUT: $Operation froze after $TimeoutSeconds seconds"
        }
    } catch {
        Write-Host "[ERROR] $Operation failed: $_" -ForegroundColor Red
        throw
    }
}

# Main execution with comprehensive error catching
try {
    Write-Host "[DEBUG] DX Debug Mode - PID: $PID" -ForegroundColor Magenta
    Write-Host "[DEBUG] Storage directory: $StorageDir" -ForegroundColor Cyan
    Write-Host "[DEBUG] Input args: $($InputText -join ' ')" -ForegroundColor Cyan
    
    # Test 1: Directory creation
    Invoke-WithTimeout -TimeoutSeconds 5 -Operation "Directory Creation" -ScriptBlock {
        if (-not (Test-Path $using:StorageDir)) {
            New-Item -ItemType Directory -Path $using:StorageDir -Force | Out-Null
            Write-Host "[DEBUG] Created directory: $using:StorageDir"
        }
    }
    
    # Test 2: File access test
    Invoke-WithTimeout -TimeoutSeconds 5 -Operation "File Access Test" -ScriptBlock {
        $testFile = Join-Path $using:StorageDir "test-$using:PID.tmp"
        "test" | Out-File -FilePath $testFile -Force
        $content = Get-Content $testFile
        Remove-Item $testFile -Force
        Write-Host "[DEBUG] File access test passed"
    }
    
    if ($InputText -and $InputText.Count -gt 0) {
        # Human mode
        Write-Host "[DEBUG] HUMAN MODE" -ForegroundColor Green
        
        $text = $InputText -join " "
        $timestamp = (Get-Date).ToString("o")
        
        # Test 3: Write operations
        Invoke-WithTimeout -TimeoutSeconds 5 -Operation "Write Prompt" -ScriptBlock {
            [System.IO.File]::WriteAllText($using:StorageFile, $using:text, [System.Text.Encoding]::UTF8)
            Write-Host "[DEBUG] Wrote prompt: '$using:text'"
        }
        
        Invoke-WithTimeout -TimeoutSeconds 5 -Operation "Write Timestamp" -ScriptBlock {
            [System.IO.File]::WriteAllText($using:TimestampFile, $using:timestamp, [System.Text.Encoding]::UTF8)
            Write-Host "[DEBUG] Wrote timestamp: $using:timestamp"
        }
        
        Write-Host "Saved: $($text.Length) chars" -ForegroundColor Green
        
    } else {
        # Agent mode
        Write-Host "[DEBUG] AGENT MODE" -ForegroundColor Blue
        
        # Test 4: Read operations
        $content = Invoke-WithTimeout -TimeoutSeconds 5 -Operation "Read Prompt" -ScriptBlock {
            if (Test-Path $using:StorageFile) {
                $result = [System.IO.File]::ReadAllText($using:StorageFile, [System.Text.Encoding]::UTF8)
                Write-Host "[DEBUG] Read prompt: '$result'"
                return $result
            } else {
                Write-Host "[DEBUG] No prompt file found"
                return $null
            }
        }
        
        if ($content) {
            Write-Output $content
        } else {
            # Test 5: Polling with timeout
            Write-Host "[DEBUG] Starting polling loop" -ForegroundColor Yellow
            
            $startTime = Get-Date
            $maxWait = 30  # 30 second max wait
            
            while (((Get-Date) - $startTime).TotalSeconds -lt $maxWait) {
                Write-Host "[DEBUG] Polling... $([math]::Round(((Get-Date) - $startTime).TotalSeconds, 1))s" -ForegroundColor Cyan
                
                # Check with timeout
                $newContent = Invoke-WithTimeout -TimeoutSeconds 2 -Operation "Poll Check" -ScriptBlock {
                    if (Test-Path $using:StorageFile) {
                        return [System.IO.File]::ReadAllText($using:StorageFile, [System.Text.Encoding]::UTF8)
                    }
                    return $null
                }
                
                if ($newContent -and $newContent -ne $content) {
                    Write-Host "[DEBUG] New content detected!" -ForegroundColor Green
                    Write-Output $newContent
                    exit 0
                }
                
                Start-Sleep -Seconds 1
            }
            
            Write-Error "TIMEOUT: No new prompt received in $maxWait seconds"
            exit 1
        }
    }
    
    Write-Host "[DEBUG] DX completed successfully" -ForegroundColor Green
    
} catch {
    Write-Host "[FATAL ERROR] $_" -ForegroundColor Red
    Write-Host "[FATAL ERROR] At line: $($_.InvocationInfo.ScriptLineNumber)" -ForegroundColor Red
    Write-Host "[FATAL ERROR] Command: $($_.InvocationInfo.Line.Trim())" -ForegroundColor Red
    
    # Emergency diagnostics
    Write-Host "[DIAGNOSTICS] PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor Yellow
    Write-Host "[DIAGNOSTICS] Execution Policy: $(Get-ExecutionPolicy)" -ForegroundColor Yellow
    Write-Host "[DIAGNOSTICS] Current Location: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "[DIAGNOSTICS] Storage Dir Exists: $(Test-Path $StorageDir)" -ForegroundColor Yellow
    
    exit 1
}