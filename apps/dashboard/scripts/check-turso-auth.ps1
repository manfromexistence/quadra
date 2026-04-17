param(
  [string]$DatabaseName = "quadra",
  [string]$SmokeEmail = "smoke-edms@quadra.example"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$queries = @(
  "SELECT COUNT(*) AS user_count FROM user;",
  "SELECT COUNT(*) AS account_count FROM account;",
  "SELECT COUNT(*) AS session_count FROM session;",
  "SELECT id, email, role, organization FROM user WHERE email = '$SmokeEmail' LIMIT 1;"
)

foreach ($query in $queries) {
  Write-Host ""
  Write-Host "SQL> $query"
  wsl ~/.turso/turso db shell $DatabaseName $query
}
