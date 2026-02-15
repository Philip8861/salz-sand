@echo off
cd /d "%~dp0frontend"
echo Frontend-Server wird gestartet...
call npm run dev
pause
