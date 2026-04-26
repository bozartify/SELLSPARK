# Push local changes to origin (commit if needed). Use: npm run github:sync
$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Root

$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
  Write-Host "No changes. Nothing to commit."
  $ahead = (git rev-list --count '@{u}..HEAD' 2>$null)
  if ($ahead -and [int]$ahead -gt 0) {
    git push
    Write-Host "Pushed $ahead unpushed commit(s)."
  } else {
    Write-Host "Nothing to push."
  }
  exit 0
}

$msg = if ($args[0]) { $args[0] } else { "chore: auto-sync $(Get-Date -Format 'yyyy-MM-dd HH:mm') UTC" }
git add -A
git commit -m $msg
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
git push
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Done: committed and pushed to origin."
