@echo off
chcp 65001 >nul
echo Netlifyのビルド済みファイルを復元してプレビューします...
echo.

REM PowerShellスクリプトを実行
powershell.exe -ExecutionPolicy Bypass -File "scripts\restore-dist-from-netlify.ps1"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo 復元完了！プレビューサーバーを起動します...
    echo.
    npm run preview
) else (
    echo.
    echo エラーが発生しました
    pause
)
