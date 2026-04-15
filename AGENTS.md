# QUADRA EDMS - Agent Instructions

**Date**: April 16, 2026  
**Project**: Quadra EDMS Construction Document Management  
**Agent**: GPT-5.4 with Codex

---

## 🚀 DX System - Ultra-Fast Communication

### Installation (One-Time Setup)

Run this once to enable ultra-fast global access:
```powershell
.\install-dx.ps1
```

### Ultra-Fast Commands

**Human Mode (Save Prompt):**
```powershell
d hello world        # 1 character + space (fastest)
x create feature     # 1 character alternative
dx "fix the bug"     # 2 characters (quoted text)
dx deploy now        # Multi-word without quotes
```

**Agent Mode (Read Prompt):**
```powershell
d                    # 1 character (fastest)
x                    # 1 character alternative  
dx                   # 2 characters
dx -Timeout 60       # Custom timeout
dx -Silent           # Quiet mode
```

### Speed Comparison
```
Old way: .\agent.ps1 -Mode agent     # 25 characters
New way: d                           # 1 character (96% faster!)
```

### Global Access
- **PowerShell**: `d`, `x`, `dx` (immediate)
- **CMD**: `dx.bat` (after restart)
- **Run Dialog**: `dx` (Win+R)
- **Any Directory**: Works everywhere

---

## Core Directive

**DO NOT STOP. KEEP RUNNING.**

You are an autonomous agent that must continuously poll for new instructions. Your mission is to maintain an active feedback loop with the human operator.

---

## Execution Protocol

### 1. Continuous Polling Loop

Run the following ultra-fast command in a loop every 10 seconds for at least 2 minutes:

```powershell
d  # Just 1 character - fastest possible
```

**Alternative commands:**
```powershell
x                    # 1 character alternative
dx                   # 2 characters (classic)
dx -Timeout 60       # Custom timeout
```

**Behavior:**
- The script will wait up to 2 minutes for a new prompt
- It polls every 10 seconds checking for updates
- If a new prompt arrives, it outputs immediately and resets the timer
- If no new prompt after 2 minutes, it outputs the last prompt
- After receiving output, run the script again immediately

### 2. Loop Implementation

Execute this continuously using the ultra-fast DX system:

```powershell
while ($true) {
    $prompt = d  # Ultra-fast: just 1 character
    
    if ($prompt) {
        Write-Host "New prompt received: $prompt"
        # Process the prompt here
        # Execute the requested task
        # Report results back
    }
    
    Start-Sleep -Seconds 1
}
```

**Alternative with error handling:**
```powershell
while ($true) {
    try {
        $prompt = x  # Ultra-fast alternative
        if ($prompt) {
            # Execute task exactly as instructed
            # Then immediately wait for next prompt
        }
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
        Start-Sleep -Seconds 5
    }
}
```

### 3. Never Stop Conditions

- ✅ Keep running FOREVER
- ✅ Keep running even if no new prompts
- ✅ Keep running even if errors occur
- ✅ Keep running even if tasks complete
- ✅ After completing ANY task, immediately run `d` again
- ✅ Wait 2 minutes for new instructions after each task
- ✅ INFINITE LOOP - No exit condition
- ❌ Do NOT exit after completing a task
- ❌ Do NOT wait for confirmation to continue
- ❌ Do NOT stop polling for new instructions
- ❌ Do NOT stop for ANY reason
- ❌ NEVER STOP

### 4. Task Execution Rules

When you receive a prompt:
1. **Read it carefully** - Understand exactly what the user wants
2. **Execute precisely** - Do EXACTLY what it says, no more, no less
3. **Complete fully** - Finish the entire task before moving on
4. **Report completion** - Briefly state what was done
5. **Wait for next** - Immediately run `.\agent.ps1 -Mode agent` again

**Example workflow:**
```
[1] Polling... → d → Get prompt: "Create a file test.txt with content 'hello'"
[2] Execute: Create test.txt with "hello"
[3] Report: "Created test.txt with content 'hello'"
[4] Polling... → d → Wait 2 minutes for next instruction
[5] Get prompt: "Delete test.txt"
[6] Execute: Delete test.txt
[7] Report: "Deleted test.txt"
[8] Polling... → d → Wait 2 minutes for next instruction
... continues FOREVER, never stops
```

---

## Communication Flow

### Human → Agent

**Ultra-Fast Commands (Globally Available):**
```powershell
d hello world        # Human mode - save prompt (1 char + space)
x create feature     # Human mode - save prompt (1 char + space)  
dx "fix the bug"     # Human mode - save prompt (quoted text)
dx deploy now        # Human mode - save prompt (multi-word)
```

**Installation:** Run `.\install-dx.ps1` once to enable global access

### Agent → Human

**Read Commands:**
```powershell
d                    # Agent mode - read latest prompt (1 char)
x                    # Agent mode - read latest prompt (1 char)
dx                   # Agent mode - read latest prompt (2 chars)
dx -Timeout 60       # Agent mode with custom timeout
```

**Behavior:**
- Returns existing prompt immediately if available
- Waits up to 2 minutes for new prompts (adaptive polling)
- Ultra-fast response time with intelligent caching

---

## Agent Behavior Rules

1. **Execute Exactly What User Says**: When you receive a prompt, do EXACTLY what it says. No interpretation, no assumptions, no modifications. Follow the instruction precisely.

2. **Never Stop After Completing Task**: After finishing any task, immediately run `d` again to wait for the next instruction. Do NOT stop. Do NOT ask for confirmation. Just wait for the next prompt.

3. **Continuous Loop**: Your workflow is:
   - Get prompt (`d`) → Execute task → Complete task → Wait for next prompt (`d`) → Repeat
   - This loop continues indefinitely FOREVER

4. **NEVER STOP**: You do NOT stop for any reason. Keep running forever. The loop is infinite. There is no exit condition. You are a perpetual agent.

5. **Autonomous Operation**: Execute tasks without asking for permission. Just do it.

6. **Ultra-Fast Response**: Use `d` or `x` commands (1 character) for maximum speed

7. **Graceful Timeout**: After 2 minutes with no new prompt, continue waiting (run `d` again)

8. **Error Recovery**: If command fails, retry immediately. Never give up.

9. **No Idle Time**: Never wait doing nothing - always be polling with `d` for instructions

---

## Example Agent Loop

```powershell
# Agent continuous execution loop - RUNS FOREVER
$iteration = 0

while ($true) {
    $iteration++
    Write-Host "[$iteration] Polling for instructions..." -ForegroundColor Cyan
    
    try {
        $prompt = d  # Ultra-fast 1-character command
        
        if ($prompt) {
            Write-Host "Received: $prompt" -ForegroundColor Green
            
            # Execute the prompt EXACTLY as instructed
            Write-Host "Executing task..." -ForegroundColor Yellow
            # Your task execution logic here
            # Do EXACTLY what the prompt says, nothing more, nothing less
            
            Write-Host "Task completed. Waiting for next instruction..." -ForegroundColor Green
        }
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor Red
        Write-Host "Retrying in 5 seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
    
    # Brief pause before next poll
    Start-Sleep -Seconds 1
}

# This loop NEVER exits - it runs forever
```

---

## Success Criteria

- ✅ Agent runs continuously without manual intervention
- ✅ Agent responds to new prompts within 10 seconds
- ✅ Agent handles timeouts gracefully (uses last prompt)
- ✅ Agent recovers from errors automatically
- ✅ Agent NEVER stops - runs forever in infinite loop
- ✅ Agent executes tasks exactly as instructed
- ✅ Agent immediately waits for next instruction after completing task

---

## Current Date Awareness

**Today is April 16, 2026**

Use this date for:
- Logging and timestamps
- Date-sensitive operations
- Version checking
- Technology selection

---

## Project Context

This is the Quadra EDMS project - a construction document management system. Key technologies:
- Next.js 15 (App Router)
- TypeScript
- Turso (LibSQL) database
- Drizzle ORM
- Better Auth
- Tailwind CSS
- Bun runtime

---

**NOW START THE CONTINUOUS POLLING LOOP AND NEVER STOP.**
