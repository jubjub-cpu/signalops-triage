param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
  [int]$Port = 4174,
  [string]$NodePath = ""
)

$ErrorActionPreference = "Stop"

$candidates = New-Object System.Collections.Generic.List[string]
if ($NodePath) {
  $candidates.Add($NodePath)
}

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCommand) {
  $candidates.Add($nodeCommand.Source)
}

$node = $null
foreach ($candidate in $candidates) {
  if ($candidate -and (Test-Path -LiteralPath $candidate -PathType Leaf)) {
    $node = $candidate
    break
  }
}

if (-not $node) {
  throw "Node.js was not found. Install Node.js or pass -NodePath to run the local preview server."
}

$serverScript = Join-Path $PSScriptRoot "static-server.mjs"
& $node $serverScript "--root" (Resolve-Path -LiteralPath $Root).Path "--port" $Port
exit $LASTEXITCODE
