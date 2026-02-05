@echo off
echo ==========================================
echo   CarnivOS Deployment Helper
echo ==========================================
echo.
echo 1. Building Project...
call npm run build > build_debug.txt 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed. Deployment aborted.

    exit /b %ERRORLEVEL%
)

echo.
echo 2. Deploying to Netlify (Production)...
call npx netlify deploy --prod
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Deployment failed.

    exit /b %ERRORLEVEL%
)

echo.
echo [SUCCESS] Deployed successfully!
pause
