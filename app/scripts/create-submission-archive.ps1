param(
  [string]$ArchiveName = "PhonoTrail-Studio-Assessment3-source.zip"
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..\..")).Path
$appRoot = (Resolve-Path -LiteralPath (Join-Path $repoRoot "app")).Path
$submissionRoot = Join-Path $repoRoot "submission"
$archivePath = Join-Path $submissionRoot $ArchiveName
$stagingRoot = Join-Path ([IO.Path]::GetTempPath()) ("phonotrail-a3-" + [guid]::NewGuid().ToString("N"))
$packageRoot = Join-Path $stagingRoot "PhonoTrail-Studio-Assessment3"

$excludedDirectoryPrefixes = @(
  "node_modules/",
  ".next/",
  "out/",
  "build/",
  "coverage/",
  "playwright-report/",
  "test-results/",
  "prisma/playwright/",
  "prisma/backups/",
  "load-tests/raw-results/",
  "lighthouse/raw-results/",
  ".vercel/"
)
$excludedFileNames = @("AGENTS.md", "CLAUDE.md", "next-env.d.ts", "tsconfig.tsbuildinfo")
$excludedExtensions = @(".db", ".db-journal", ".log", ".pem", ".tsbuildinfo")

function Copy-PackageFile {
  param(
    [Parameter(Mandatory)] [string]$Source,
    [Parameter(Mandatory)] [string]$Destination
  )

  $destinationDirectory = Split-Path -Parent $Destination
  New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
  Copy-Item -LiteralPath $Source -Destination $Destination -Force
}

New-Item -ItemType Directory -Path $packageRoot -Force | Out-Null

try {
  Copy-PackageFile -Source (Join-Path $repoRoot "README.md") -Destination (Join-Path $packageRoot "README.md")
  Copy-PackageFile -Source (Join-Path $repoRoot "dockerinstructions.txt") -Destination (Join-Path $packageRoot "dockerinstructions.txt")
  Copy-PackageFile -Source (Join-Path $repoRoot ".gitignore") -Destination (Join-Path $packageRoot ".gitignore")

  $courseFiles = @("Assessment3_Plan.md", "Assessment3_Metrics_Contract.md", "Assessment3_Video_and_Submission.md")
  foreach ($courseFile in $courseFiles) {
    Copy-PackageFile `
      -Source (Join-Path $repoRoot "course-materials\md\$courseFile") `
      -Destination (Join-Path $packageRoot "course-materials\md\$courseFile")
  }

  $appPrefix = $appRoot.TrimEnd("\") + "\"
  foreach ($file in Get-ChildItem -LiteralPath $appRoot -File -Recurse) {
    $relativePath = $file.FullName.Substring($appPrefix.Length)
    $normalisedPath = $relativePath.Replace("\", "/")
    $isExcludedDirectory = $false
    foreach ($prefix in $excludedDirectoryPrefixes) {
      if ($normalisedPath.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) {
        $isExcludedDirectory = $true
        break
      }
    }
    if ($isExcludedDirectory) { continue }
    if ($excludedFileNames -contains $file.Name) { continue }
    if ($excludedExtensions -contains $file.Extension) { continue }
    if ($file.Name.StartsWith(".env", [StringComparison]::OrdinalIgnoreCase) -and $file.Name -ne ".env.example") { continue }

    Copy-PackageFile -Source $file.FullName -Destination (Join-Path (Join-Path $packageRoot "app") $relativePath)
  }

  New-Item -ItemType Directory -Path $submissionRoot -Force | Out-Null
  Compress-Archive -LiteralPath $packageRoot -DestinationPath $archivePath -CompressionLevel Optimal -Force

  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $archive = [IO.Compression.ZipFile]::OpenRead($archivePath)
  try {
    $unsafeEntries = @($archive.Entries | Where-Object {
      $entry = $_.FullName.Replace("\", "/")
      $leaf = [IO.Path]::GetFileName($entry)
      $entry -match "/node_modules/|/\.next/|/playwright-report/|/test-results/|/raw-results/|/prisma/playwright/" -or
      ($leaf.StartsWith(".env", [StringComparison]::OrdinalIgnoreCase) -and $leaf -ne ".env.example") -or
      $leaf -match "\.(db|db-journal|log|pem|tsbuildinfo)$"
    })
    if ($unsafeEntries.Count -gt 0) {
      throw "Archive contains excluded entries: $($unsafeEntries.FullName -join ', ')"
    }
    $entryCount = $archive.Entries.Count
  } finally {
    $archive.Dispose()
  }

  $archiveFile = Get-Item -LiteralPath $archivePath
  $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $archivePath).Hash
  Write-Output "Created: $($archiveFile.FullName)"
  Write-Output "Entries: $entryCount"
  Write-Output "Bytes: $($archiveFile.Length)"
  Write-Output "SHA-256: $hash"
} finally {
  $tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd("\") + "\"
  $resolvedStaging = [IO.Path]::GetFullPath($stagingRoot)
  if ($resolvedStaging.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase) -and
      (Split-Path -Leaf $resolvedStaging).StartsWith("phonotrail-a3-")) {
    Remove-Item -LiteralPath $resolvedStaging -Recurse -Force -ErrorAction SilentlyContinue
  }
}
