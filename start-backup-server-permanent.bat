@echo off
echo ========================================
echo   Backup-Server wird gestartet...
echo ========================================
echo.
echo Der Server laeuft dauerhaft im Hintergrund.
echo Schliesse dieses Fenster, um den Server zu beenden.
echo.

cd /d "%~dp0"
node backup-server.js

pause
