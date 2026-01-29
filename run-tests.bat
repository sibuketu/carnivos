@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Running Playwright tests...
npm test
pause

