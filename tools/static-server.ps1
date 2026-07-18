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

if ($env:USERPROFILE) {
  $bundledNode = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
  if (Test-Path -LiteralPath $bundledNode -PathType Leaf) {
    $candidates.Add($bundledNode)
  }
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
