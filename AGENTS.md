# Dx

Last updated: 2026-04-17

## Purpose

This repository uses the DX flow for human-to-agent communication.
The agent should follow the DX loop first, then execute the work.

## DX Flow

1. Start by calling `d`.
2. If `d` returns a prompt, execute that prompt completely.
3. After finishing the task, call `d` once again.
4. Do not spam repeated reads. One completed task -> one new `d` call, unless DX returns stale output.
5. Let `d` handle the waiting internally.
6. If `d` times out, returns a previous prompt, or otherwise looks stale, wait and call `d` again.
7. Only stop the DX loop when the user explicitly says to stop.

## Rules

- Use `d` for agent-mode reads.
- The agent must not write its own prompts.
- Execute the DX prompt directly and fully.
- Do not ask for routine permission before normal repo work.
- Report what changed, then return to the DX flow.
- If DX appears broken, inspect `dx.ps1` and `%USERPROFILE%\.dx`, then continue the loop.
- If DX returns an old prompt or stale content, do not stop. Wait and rerun `d`.

## Task Management

### TODO.md Protocol

- At project start or when receiving multi-step tasks, create/update `TODO.md` in the root
- Break user requests into concrete, actionable tasks
- Work top-down: always work on the first "In Progress" item
- Move only one task to "In Progress" at a time
- Mark completed tasks with `[x]`, ~~strikethrough~~, ✅, and timestamp
- Advance automatically to the next pending task without waiting for permission
- Never delete tasks, only mark them completed or blocked
- Update `TODO.md` after every action to reflect current reality

### CHANGELOG.md Protocol

- Maintain `CHANGELOG.md` in the root to track all completed work
- Follow semantic versioning and Keep a Changelog format
- Add entries under `## [Unreleased]` as work completes
- Include: Added, Changed, Fixed, Removed sections as needed
- Be specific about what changed, not just "updated file X"
- Update after completing each significant task or feature
- When releasing, move Unreleased items to a versioned section

### Failure Recovery

- **Three-Strike Rule**: Try 3 different approaches before escalating
- On third failure, create/append to `HELP.md` with full diagnostic info
- Move blocked tasks to "Blocked / Failed" section in `TODO.md`
- Continue with next unblocked task automatically

## Repo Focus

- Primary app: `apps/dashboard`
- Deployment target: Vercel project `app-quadra`
- Production URL: `https://app-quadra.vercel.app`

## File Policy

- Keep this file short and focused on agent behavior
- Do not store secrets, environment variables, or redundant examples here
- Use `TODO.md` for task tracking, `CHANGELOG.md` for work history
- Use `HELP.md` only when tasks fail after 3 attempts
