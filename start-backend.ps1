cd "$PSScriptRoot\backend"
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
Write-Host "Backend-Server startet..." -ForegroundColor Cyan
node -e "const {spawn} = require('child_process'); const proc = spawn('node', ['node_modules/tsx/dist/cli.mjs', 'src/server.ts'], {cwd: process.cwd(), stdio: 'inherit', shell: true}); proc.on('error', (e) => console.error('Error:', e));"
