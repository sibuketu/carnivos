@echo off
chcp 65001 >nul
echo ========================================
echo UI自動確認スクリプト
echo ========================================
echo.

REM プレビューサーバーが起動しているか確認
echo プレビューサーバーが起動しているか確認中...
netstat -ano | findstr "4173" >nul
if %ERRORLEVEL% NEQ 0 (
    echo エラー: プレビューサーバーが起動していません
    echo まず、RESTORE_NETLIFY_AND_PREVIEW.bat を実行してください
    pause
    exit /b 1
)

echo プレビューサーバーが起動しています
echo.

REM ブラウザ操作を自動化
echo ブラウザ操作を自動化してUIを確認します...
echo.

node scripts/auto-browser-check.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo UI確認が完了しました
) else (
    echo.
    echo エラーが発生しました
)

pause
