param(
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

Push-Location $repoRoot
try {
  Write-Host "Linking repository to Vercel project app-quadra..."
  & vercel link --yes --project app-quadra --scope team_EkitCm8bZtUN9sFeG3KfDAJe

  Write-Host "Pulling production environment configuration..."
  & vercel pull --yes --environment=production

  if (-not $SkipBuild) {
    Write-Host "Building @midday/dashboard from the monorepo root..."
    & bun run build:dashboard
  }

  Write-Host "Deploying the current repo state to production..."
  & vercel --prod --yes

  Write-Host "Inspecting the production alias..."
  & vercel inspect app-quadra.vercel.app
}
finally {
  Pop-Location
}
