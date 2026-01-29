@echo off
chcp 65001 >nul
echo ========================================
echo Netlify UI完全復元スクリプト
echo ========================================
echo.

REM 既存のdistフォルダをバックアップ
if exist dist (
    set BACKUP_DIR=dist-backup-%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%
    set BACKUP_DIR=!BACKUP_DIR: =0!
    move dist "!BACKUP_DIR!" >nul 2>&1
    echo [1/3] 既存のdistフォルダをバックアップしました
)

REM distフォルダを作成
mkdir dist 2>nul
mkdir dist\assets 2>nul

REM Netlifyからファイルをダウンロード
echo [2/3] Netlifyから最新のビルド済みファイルをダウンロード中...
echo.

set SITE_URL=https://carnivos.netlify.app
set FILES=index.html manifest.json manifest.webmanifest sw.js registersw.js vite.svg
set ASSETS=assets/index-Itu--OF1.js assets/react-vendor-OvXVS5lI.js assets/chart-vendor-BKK2UjWf.js assets/index-CW5E81Lq.css

for %%f in (%FILES%) do (
    echo ダウンロード中: %%f
    curl -s -o "dist\%%f" "%SITE_URL%/%%f" >nul 2>&1
    if exist "dist\%%f" (
        echo   ✓ %%f
    ) else (
        echo   ✗ %%f (失敗)
    )
)

for %%f in (%ASSETS%) do (
    echo ダウンロード中: %%f
    for /f "tokens=*" %%d in ("%%f") do set DIR=%%~dpd
    if not exist "dist\%%~dpf" mkdir "dist\%%~dpf" >nul 2>&1
    curl -s -o "dist\%%f" "%SITE_URL%/%%f" >nul 2>&1
    if exist "dist\%%f" (
        echo   ✓ %%f
    ) else (
        echo   ✗ %%f (失敗)
    )
)

echo.
echo [3/3] プレビューサーバーを起動します...
echo.
echo ブラウザで http://localhost:4173 を開いてください
echo (ポート番号は表示されたものを確認してください)
echo.
echo プレビューサーバーを停止するには Ctrl+C を押してください
echo.

npm run preview

pause
