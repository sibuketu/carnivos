@echo off
chcp 65001 >nul
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "scripts\restore-dist-from-netlify.ps1"
pause
