@echo off
echo ========================================
echo   Salz^&Sand Backup
echo ========================================
echo.
echo Starte Backup...
echo.

cd /d "%~dp0"
node backup.js

pause
