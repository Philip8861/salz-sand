# Salz&Sand - Server Starter
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Salz&Sand - Server Starter" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

# Starte Backend
Write-Host "Starte Backend-Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; `$env:PATH = 'C:\Program Files\nodejs;' + `$env:PATH; Write-Host 'Backend-Server laeuft auf Port 3000' -ForegroundColor Green; node -e `"const {spawn} = require('child_process'); const proc = spawn('node', ['node_modules/tsx/dist/cli.mjs', 'src/server.ts'], {cwd: process.cwd(), stdio: 'inherit', shell: true}); proc.on('error', (e) => console.error('Error:', e));`""

Start-Sleep -Seconds 3

# Starte Frontend
Write-Host "Starte Frontend-Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; `$env:PATH = 'C:\Program Files\nodejs;' + `$env:PATH; Write-Host 'Frontend-Server laeuft auf Port 5173' -ForegroundColor Green; node -e `"const {spawn} = require('child_process'); const path = require('path'); const vitePath = path.join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js'); const proc = spawn('node', [vitePath], {cwd: process.cwd(), stdio: 'inherit', shell: true}); proc.on('error', (e) => console.error('Error:', e));`""

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Server werden gestartet!" -ForegroundColor Green
Write-Host ""
Write-Host "Warte 15 Sekunden..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "Oeffne Browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5173/login"

Write-Host ""
Write-Host "Fertig!" -ForegroundColor Green
Write-Host ""
Write-Host "Links:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Tipp: Du kannst dieses Script jederzeit mit .\start.ps1 ausfuehren" -ForegroundColor Gray
Write-Host ""
