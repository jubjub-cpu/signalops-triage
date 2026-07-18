$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$required = @(
  "index.html",
  "assets/styles.css",
  "assets/app.js",
  "data/synthetic-incidents.json",
  "README.md",
  "docs/CASE_STUDY.md",
  "docs/RELEASE_NOTES.md",
  "tools/static-server.ps1",
  "tools/static-server.mjs",
  ".env.example",
  ".gitignore",
  ".nojekyll",
  "LICENSE"
)

$failures = New-Object System.Collections.Generic.List[string]

foreach ($file in $required) {
  if (-not (Test-Path -LiteralPath (Join-Path $root $file) -PathType Leaf)) {
    $failures.Add("Missing required file: $file")
  }
}

$html = Get-Content -LiteralPath (Join-Path $root "index.html") -Raw
foreach ($needle in @('<meta name="viewport"', 'skip-link', 'SignalOps Triage', 'assets/app.js')) {
  if ($html -notmatch [Regex]::Escape($needle)) {
    $failures.Add("index.html missing: $needle")
  }
}

$script = Get-Content -LiteralPath (Join-Path $root "assets/app.js") -Raw
foreach ($needle in @('synthetic', 'Approve dispatch plan', 'scoreIncident', 'Dispatch recommendation approved')) {
  if ($script -notmatch [Regex]::Escape($needle)) {
    $failures.Add("app.js missing: $needle")
  }
}

$json = Get-Content -LiteralPath (Join-Path $root "data/synthetic-incidents.json") -Raw | ConvertFrom-Json
if ($json.Count -lt 3) {
  $failures.Add("Expected at least three synthetic incidents.")
}

$allText = ""
Get-ChildItem -LiteralPath $root -Recurse -File |
  Where-Object { $_.FullName -notmatch "\\.git\\" -and $_.FullName -notmatch "\\tests\\validate\.ps1$" } |
  ForEach-Object { $allText += "`n" + (Get-Content -LiteralPath $_.FullName -Raw) }

foreach ($phrase in @("synthetic", "Human", "deterministic", "AI-assisted")) {
  if ($allText -notmatch [Regex]::Escape($phrase)) {
    $failures.Add("Required documentation phrase missing: $phrase")
  }
}

foreach ($pattern in @("sk-[A-Za-z0-9]{20,}", "ghp_[A-Za-z0-9]{20,}", "gho_[A-Za-z0-9]{20,}", "BEGIN RSA PRIVATE KEY", "BEGIN OPENSSH PRIVATE KEY")) {
  if ($allText -match $pattern) {
    $failures.Add("Potential secret pattern found: $pattern")
  }
}

if ($failures.Count -gt 0) {
  Write-Host "SIGNALOPS VALIDATION FAILED"
  foreach ($failure in $failures) {
    Write-Host "- $failure"
  }
  exit 1
}

Write-Host "SIGNALOPS VALIDATION PASSED"
Write-Host "Checked $($required.Count) required files, synthetic fixtures, privacy markers, and secret patterns."
