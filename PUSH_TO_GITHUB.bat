@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo ========================================
echo   GitHub Push Script for CarnivOS
echo ========================================
echo.

REM Remove existing .git if it points elsewhere
if exist ".git" (
    echo Removing old git config...
    rmdir /s /q .git
)

echo Initializing fresh git repository...
git init
git remote add origin https://github.com/sibuketu/carnivos.git

echo.
echo Adding all files...
git add -A

echo.
echo Committing...
git commit -m "Add full app source code for iOS build"

echo.
echo Pushing to GitHub (force to overwrite)...
git branch -M main
git push -u origin main --force

echo.
echo ========================================
echo   Done! Check: https://github.com/sibuketu/carnivos
echo ========================================
echo.
echo Next: Go to Codemagic and run build again
echo https://codemagic.io/builds
echo.
pause
