param(
  [ValidateSet("dev", "start")]
  [string]$Mode = "dev",
  [int]$Port = 3001
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$appRoot = Resolve-Path (Join-Path $scriptRoot "..")
$repoRoot = Resolve-Path (Join-Path $scriptRoot "..\..\..")
$envFile = Join-Path $repoRoot ".vercel\.env.production.local"

if (-not (Test-Path $envFile)) {
  throw "Missing Vercel production env file at $envFile. Run `vercel pull --environment=production` from the repo root first."
}

Set-Location $appRoot

Get-Content $envFile | ForEach-Object {
  if ($_ -match '^(?<key>[A-Za-z0-9_]+)=(?<value>.*)$') {
    $value = $matches["value"]

    if ($value.Length -ge 2 -and $value.StartsWith('"') -and $value.EndsWith('"')) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    [System.Environment]::SetEnvironmentVariable($matches["key"], $value, "Process")
  }
}

$localUrl = "http://localhost:$Port"
[System.Environment]::SetEnvironmentVariable("NEXT_PUBLIC_APP_URL", $localUrl, "Process")
[System.Environment]::SetEnvironmentVariable("BETTER_AUTH_URL", $localUrl, "Process")
[System.Environment]::SetEnvironmentVariable("NEXT_PUBLIC_URL", $localUrl, "Process")

if ($Mode -eq "dev") {
  bunx next dev -p $Port --turbo
  exit $LASTEXITCODE
}

bunx next start -p $Port
exit $LASTEXITCODE
