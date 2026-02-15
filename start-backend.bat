@echo off
cd /d "%~dp0backend"
echo Backend-Server wird gestartet...
call npm run dev
pause
