@echo off
cd /d "%~dp0"
echo 🤖 CarnivOS Auto Test ^& Fix Loop
echo.
call npm run auto-fix
pause
