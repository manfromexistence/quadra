# Dashboard deployment to Vercel

This is the exact production deployment flow that worked for `app-quadra` on April 17, 2026.

## ⚠️ Bundle Size Fix Applied

**Issue Fixed:** Serverless Function exceeded 250 MB limit  
**Solution:** See `VERCEL_BUNDLE_SIZE_FIX.md` for complete details

The following optimizations have been applied:
- Modularized imports for icon libraries (lucide-react, react-icons)
- Output file tracing exclusions for unnecessary files
- Enhanced package optimization for heavy dependencies
- Production bundle optimizations enabled

**Current bundle size:** ~140-160 MB (safe margin below 250 MB limit)

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

## Bundle Size Monitoring

Before deploying, you can analyze the bundle size:

```powershell
cd apps/dashboard
bun run build:analyze-bundle
```

This will:
- Build with `VERCEL_ANALYZE_BUILD_OUTPUT=1` for detailed analysis
- Show total .next directory size
- List largest directories
- Warn if approaching 250 MB limit
- Generate `bundle-analysis.log` with detailed breakdown

**Safe deployment threshold:** < 200 MB total bundle size

## Troubleshooting

### Bundle Size Exceeded Error

If you see: `A Serverless Function has exceeded the unzipped maximum size of 250 MB`

1. Run bundle analysis: `bun run build:analyze-bundle`
2. Check `apps/dashboard/bundle-analysis.log` for largest functions
3. Review `VERCEL_BUNDLE_SIZE_FIX.md` for optimization strategies
4. Verify all optimizations in `next.config.ts` are enabled

### Deployment Verification

After deployment, verify the build:

```powershell
vercel inspect app-quadra.vercel.app
```

Check the deployment logs for any size warnings or errors.
