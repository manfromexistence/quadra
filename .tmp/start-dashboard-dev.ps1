Set-Location 'F:\quadra'
Get-Content 'F:\quadra\.vercel\.env.production.local' | ForEach-Object {
  if ($_ -match '^(?<key>[A-Za-z0-9_]+)=(?<value>.*)$') {
    $value = $matches['value']
    if ($value.Length -ge 2 -and $value.StartsWith('"') -and $value.EndsWith('"')) {
      $value = $value.Substring(1, $value.Length - 2)
    }
    [System.Environment]::SetEnvironmentVariable($matches['key'], $value, 'Process')
  }
}
[System.Environment]::SetEnvironmentVariable('NEXT_PUBLIC_APP_URL', 'http://localhost:3001', 'Process')
[System.Environment]::SetEnvironmentVariable('BETTER_AUTH_URL', 'http://localhost:3001', 'Process')
[System.Environment]::SetEnvironmentVariable('NEXT_PUBLIC_URL', 'http://localhost:3001', 'Process')
bun run dev:dashboard
