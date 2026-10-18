# Copies LiveKit credentials from the clipboard into .env without showing them.
#
# 1. In LiveKit Cloud: Settings -> API keys -> Create key, then click the copy
#    button next to "Environment variables" (LIVEKIT_URL / API_KEY / API_SECRET).
# 2. Run from the project root:  .\scripts\set-livekit-env.ps1

$ErrorActionPreference = "Stop"
$envFile = Join-Path (Split-Path $PSScriptRoot -Parent) ".env"
$clip = (Get-Clipboard -Raw)
if (-not $clip) { throw "The clipboard is empty. Copy the Environment variables block first." }

$values = @{}
foreach ($line in ($clip -split "`r?`n")) {
  if ($line -match '^\s*(?:export\s+)?(LIVEKIT_URL|LIVEKIT_API_KEY|LIVEKIT_API_SECRET)\s*=\s*"?([^"\s]+)"?\s*$') {
    $values[$Matches[1]] = $Matches[2]
  }
}

$problems = @()
if ($values["LIVEKIT_URL"] -notmatch '^wss://[\w.-]+\.livekit\.cloud$') { $problems += "LIVEKIT_URL (expected wss://<project>.livekit.cloud)" }
if ($values["LIVEKIT_API_KEY"] -notmatch '^API\w{8,}$') { $problems += "LIVEKIT_API_KEY (expected to start with API)" }
if ("$($values["LIVEKIT_API_SECRET"])".Length -lt 30) { $problems += "LIVEKIT_API_SECRET (too short or missing)" }
if ($problems.Count) {
  throw ("The clipboard doesn't contain valid LiveKit credentials. Problem with: " + ($problems -join "; "))
}

$lines = [System.Collections.Generic.List[string]](Get-Content $envFile)
foreach ($name in "LIVEKIT_URL", "LIVEKIT_API_KEY", "LIVEKIT_API_SECRET") {
  $entry = "$name=$($values[$name])"
  $index = $lines.FindIndex([Predicate[string]] { param($l) $l -match "^$name=" })
  if ($index -ge 0) { $lines[$index] = $entry } else { $lines.Add($entry) }
}
Set-Content -Path $envFile -Value $lines -Encoding utf8
Set-Clipboard -Value " "

Write-Host "Saved LIVEKIT_URL, LIVEKIT_API_KEY and LIVEKIT_API_SECRET to .env (clipboard cleared)." -ForegroundColor Green
