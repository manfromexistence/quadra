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

## Repo Focus

- Primary app: `apps/dashboard`
- Deployment target: Vercel project `app-quadra`
- Production URL: `https://app-quadra.vercel.app`

## File Policy

- Keep this file short.
- Keep this file focused on agent behavior.
- Do not store secrets here.
- Do not dump environment variables here.
- Do not mix project notes, long tutorials, or redundant examples into this file.
