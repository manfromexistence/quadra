param(
  [string]$BaseUrl = "",
  [string]$Email = "",
  [string]$Password = "",
  [string]$Name = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Get-Setting {
  param(
    [string]$Value,
    [string]$EnvironmentName,
    [string]$Fallback
  )

  if ($Value) {
    return $Value.Trim()
  }

  $envValue = [Environment]::GetEnvironmentVariable($EnvironmentName)
  if ($envValue) {
    return $envValue.Trim()
  }

  return $Fallback
}

function Invoke-CurlRequest {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  $headerFile = [System.IO.Path]::GetTempFileName()
  $bodyFile = [System.IO.Path]::GetTempFileName()

  try {
    $status = & curl.exe @Arguments -D $headerFile -o $bodyFile -sS -w "%{http_code}"
    $body = Get-Content -Path $bodyFile -Raw
    $headers = Get-Content -Path $headerFile -Raw

    return [pscustomobject]@{
      Status  = [int]$status
      Body    = $body
      Headers = $headers
    }
  }
  finally {
    Remove-Item -LiteralPath $headerFile, $bodyFile -ErrorAction SilentlyContinue
  }
}

function Report-Step {
  param(
    [string]$Step,
    [bool]$Ok,
    [string]$Details
  )

  $state = if ($Ok) { "PASS" } else { "FAIL" }
  Write-Host ("{0} {1}: {2}" -f $state, $Step, $Details)

  if (-not $Ok) {
    throw "$Step failed: $Details"
  }
}

function Get-Excerpt {
  param(
    [AllowNull()]
    [string]$Value
  )

  if ([string]::IsNullOrEmpty($Value)) {
    return "<empty>"
  }

  return $Value.Substring(0, [Math]::Min(240, $Value.Length))
}

$resolvedBaseUrl = Get-Setting -Value $BaseUrl -EnvironmentName "SMOKE_BASE_URL" -Fallback "http://127.0.0.1:3001"
$resolvedEmail = Get-Setting -Value $Email -EnvironmentName "SMOKE_AUTH_EMAIL" -Fallback "smoke-edms@quadra.example"
$resolvedPassword = Get-Setting -Value $Password -EnvironmentName "SMOKE_AUTH_PASSWORD" -Fallback "QuadraSmoke123!"
$resolvedName = Get-Setting -Value $Name -EnvironmentName "SMOKE_AUTH_NAME" -Fallback "Quadra Smoke"

$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("quadra-curl-smoke-" + [guid]::NewGuid().ToString("N"))
$null = New-Item -ItemType Directory -Path $tempDir -Force
$cookieJar = Join-Path $tempDir "cookies.txt"
$tinyPngPath = Join-Path $tempDir "smoke-image.png"
$tinyPdfPath = Join-Path $tempDir "smoke-check.pdf"

try {
  [System.IO.File]::WriteAllBytes(
    $tinyPngPath,
    [Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9p3h2N8AAAAASUVORK5CYII=")
  )

  Set-Content -LiteralPath $tinyPdfPath -Value "%PDF-1.4`n1 0 obj`n<< /Type /Catalog >>`nendobj`ntrailer`n<< /Root 1 0 R >>`n%%EOF" -NoNewline

  $signUpPayload = @{
    email = $resolvedEmail
    password = $resolvedPassword
    name = $resolvedName
    role = "user"
    callbackURL = "/en/projects"
  } | ConvertTo-Json -Compress

  $signUp = Invoke-CurlRequest -Arguments @(
    "-X", "POST",
    "-H", "Content-Type: application/json",
    "-c", $cookieJar,
    "--data-raw", $signUpPayload,
    "$resolvedBaseUrl/api/auth/sign-up/email"
  )

  if ($signUp.Status -ge 200 -and $signUp.Status -lt 300) {
    Report-Step -Step "auth.signUp" -Ok $true -Details "Created or refreshed $resolvedEmail"
  } else {
    $signInPayload = @{
      email = $resolvedEmail
      password = $resolvedPassword
      callbackURL = "/en/projects"
    } | ConvertTo-Json -Compress

    $signIn = Invoke-CurlRequest -Arguments @(
      "-X", "POST",
      "-H", "Content-Type: application/json",
      "-b", $cookieJar,
      "-c", $cookieJar,
      "--data-raw", $signInPayload,
      "$resolvedBaseUrl/api/auth/sign-in/email"
    )

    $authOk = $signIn.Status -ge 200 -and $signIn.Status -lt 300
    $authDetails = if ($authOk) {
      "Signed in $resolvedEmail"
    } else {
      "status=$($signIn.Status) body=$(Get-Excerpt $signIn.Body)"
    }

    Report-Step -Step "auth.signIn" -Ok $authOk -Details $authDetails
  }

  $session = Invoke-CurlRequest -Arguments @(
    "-b", $cookieJar,
    "$resolvedBaseUrl/api/auth/get-session"
  )
  $sessionOk = $session.Status -eq 200 -and $session.Body.Contains($resolvedEmail)
  $sessionDetails = if ($sessionOk) {
    "Session endpoint returned the authenticated user."
  } else {
    "status=$($session.Status) body=$(Get-Excerpt $session.Body)"
  }
  Report-Step -Step "auth.session" -Ok $sessionOk -Details $sessionDetails

  foreach ($route in @("/en/projects", "/en/documents", "/en/workflows", "/en/transmittals", "/en/notifications")) {
    $page = Invoke-CurlRequest -Arguments @(
      "-b", $cookieJar,
      "$resolvedBaseUrl$route"
    )

    $pageOk = $page.Status -eq 200 -and -not $page.Body.Contains("Internal Server Error")
    $pageDetails = if ($pageOk) {
      "Loaded $route"
    } else {
      "status=$($page.Status) body=$(Get-Excerpt $page.Body)"
    }

    Report-Step -Step "page.$route" -Ok $pageOk -Details $pageDetails
  }

  $pdfUpload = Invoke-CurlRequest -Arguments @(
    "-X", "POST",
    "-b", $cookieJar,
    "-F", "file=@$tinyPdfPath;type=application/pdf",
    "-F", "projectId=smoke-project",
    "-F", "folder=workflow-attachments",
    "$resolvedBaseUrl/api/edms/uploads"
  )
  $pdfOk = $pdfUpload.Status -ge 200 -and $pdfUpload.Status -lt 300
  $pdfDetails = if ($pdfOk) {
    $pdfUpload.Body
  } else {
    "status=$($pdfUpload.Status) body=$(Get-Excerpt $pdfUpload.Body)"
  }
  Report-Step -Step "upload.document" -Ok $pdfOk -Details $pdfDetails

  $pngUpload = Invoke-CurlRequest -Arguments @(
    "-X", "POST",
    "-b", $cookieJar,
    "-F", "file=@$tinyPngPath;type=image/png",
    "-F", "projectId=smoke-project",
    "-F", "folder=workflow-attachments",
    "$resolvedBaseUrl/api/edms/uploads"
  )
  $pngOk = $pngUpload.Status -ge 200 -and $pngUpload.Status -lt 300
  $pngDetails = if ($pngOk) {
    $pngUpload.Body
  } else {
    "status=$($pngUpload.Status) body=$(Get-Excerpt $pngUpload.Body)"
  }
  Report-Step -Step "upload.image" -Ok $pngOk -Details $pngDetails
}
finally {
  Remove-Item -LiteralPath $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}
