cd "$PSScriptRoot\frontend"
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Write-Host "Frontend-Server startet..." -ForegroundColor Cyan
node -e "const {spawn} = require('child_process'); const path = require('path'); const vitePath = path.join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js'); const proc = spawn('node', [vitePath], {cwd: process.cwd(), stdio: 'inherit', shell: true}); proc.on('error', (e) => console.error('Error:', e));"
