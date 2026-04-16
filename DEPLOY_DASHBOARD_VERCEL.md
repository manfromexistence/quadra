# Dashboard deployment to Vercel

This is the exact production deployment flow that worked for `app-quadra` on April 17, 2026.

## Why deploy from the repo root

`apps/dashboard` depends on workspace packages from `packages/*`. Deploying from the repo root lets Vercel resolve the monorepo correctly and use the linked `app-quadra` project.

## One-command deploy

Preferred command:

```powershell
bun run deploy:dashboard:vercel
```

Direct script call:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-dashboard-vercel.ps1
```

## What the script does

1. Links the repo to the Vercel project `app-quadra`.
2. Pulls production environment settings with `vercel pull`.
3. Runs `bun run build:dashboard` from the repo root.
4. Runs `vercel --prod --yes` from the repo root.
5. Runs `vercel inspect app-quadra.vercel.app` to verify the live alias.

## Manual commands

```powershell
vercel link --yes --project app-quadra --scope team_EkitCm8bZtUN9sFeG3KfDAJe
vercel pull --yes --environment=production
bun run build:dashboard
vercel --prod --yes
vercel inspect app-quadra.vercel.app
```

## Notes

- The repo root must stay linked to `app-quadra`.
- The reliable production flow here is a normal source deployment from the repo root.
- A local `vercel build --prod` followed by `vercel deploy --prebuilt --prod` hit a missing function artifact error for `[locale]/[...slug].func`, so the source deploy is the recommended path for this project.
- Production URL: `https://app-quadra.vercel.app`
