@echo off
chcp 65001 >nul
echo ========================================
echo   Salz^&Sand - Server Starter
echo ========================================
echo.
echo Starte Backend und Frontend...
echo.
echo WICHTIG: Zwei CMD-Fenster werden geoeffnet.
echo          Lasse diese Fenster OFFEN!
echo.

cd /d "%~dp0backend"
start "Backend-Server (Port 3000)" cmd /k "cd /d %~dp0backend && echo Backend-Server wird gestartet... && npm run dev"

timeout /t 3 /nobreak >nul

cd /d "%~dp0frontend"
start "Frontend-Server (Port 5173)" cmd /k "cd /d %~dp0frontend && echo Frontend-Server wird gestartet... && npm run dev"

echo.
echo Server werden gestartet...
echo.
echo Warte 20 Sekunden, damit die Server starten koennen...
timeout /t 20 /nobreak >nul

echo.
echo Oeffne Browser...
start http://localhost:5173/login

echo.
echo ========================================
echo   Fertig!
echo ========================================
echo.
echo Links:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3000
echo.
echo Die Server laufen in zwei separaten CMD-Fenstern.
echo.
echo WICHTIG:
echo   - Lasse die CMD-Fenster OFFEN!
echo   - Wenn du die Fenster schliesst, stoppen die Server
echo   - Schaue in die CMD-Fenster auf Fehlermeldungen
echo.
echo Falls die Seite nicht laedt:
echo   1. Warte weitere 10 Sekunden
echo   2. Lade die Seite neu (F5)
echo   3. Pruefe die CMD-Fenster auf Fehler
echo.
pause
