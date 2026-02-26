@echo off
cd /d "%~dp0"
echo Prisma Generate...
call node "%~dp0node_modules\prisma\build\index.js" generate
if errorlevel 1 exit /b 1
echo Building Backend...
call node "%~dp0node_modules\typescript\bin\tsc"
if errorlevel 1 exit /b 1
echo Starting Backend on http://localhost:3000
node "%~dp0dist\server.js"
