@echo off
echo ========================================
echo   Backup-Server wird gestartet...
echo ========================================
echo.
echo Der Server laeuft 30 Sekunden lang.
echo.

cd /d "%~dp0"
start /min node backup-server.js

timeout /t 2 /nobreak >nul

echo Backup-Server gestartet!
echo.
echo Du kannst jetzt den Button verwenden.
echo.
pause
