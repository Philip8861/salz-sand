# Backend starten (funktioniert auch bei Ordnernamen mit &)
Set-Location -LiteralPath $PSScriptRoot
Write-Host "Building Backend..."
& "$PSScriptRoot\node_modules\typescript\bin\tsc"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Starting Backend on http://localhost:3000"
node "$PSScriptRoot\dist\server.js"
