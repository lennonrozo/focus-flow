param(
  [string]$OutDir = "..\dist",
  [string]$ZipName = "focusflow-extension.zip"
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path "$PSScriptRoot\.."
$dist = Join-Path $root $OutDir
if (!(Test-Path $dist)) { New-Item -ItemType Directory -Path $dist | Out-Null }

$zipPath = Join-Path $dist $ZipName
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

# Build a temp staging folder
$stage = Join-Path $dist "stage"
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage | Out-Null

# Copy only extension files (exclude backend and docs)
$include = @(
  "manifest.json",
  "background.js",
  "content",
  "images",
  "lib",
  "popup",
  "settings",
  "options"
)

foreach ($item in $include) {
  $src = Join-Path $root $item
  if (Test-Path $src) {
    Copy-Item $src -Destination $stage -Recurse -Force
  }
}

# Create the zip
Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $zipPath

# Clean up stage
Remove-Item $stage -Recurse -Force

Write-Host "✅ Package created:" $zipPath
