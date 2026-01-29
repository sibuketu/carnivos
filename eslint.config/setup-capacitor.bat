@echo off
chcp 65001 >nul
echo ========================================
echo Primal Logic - Capacitorセットアップ
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Webアプリをビルド中...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ ビルドに失敗しました
    pause
    exit /b 1
)
echo ✅ ビルド完了
echo.

echo [2/5] Androidプラットフォームを追加中...
call npx cap add android
if %errorlevel% neq 0 (
    echo ❌ Androidプラットフォームの追加に失敗しました
    pause
    exit /b 1
)
echo ✅ Androidプラットフォーム追加完了
echo.

echo [3/5] Capacitorに同期中...
call npx cap sync
if %errorlevel% neq 0 (
    echo ❌ 同期に失敗しました
    pause
    exit /b 1
)
echo ✅ 同期完了
echo.

echo [4/5] Android Studioで開く準備完了
echo.
echo ========================================
echo セットアップ完了！
echo ========================================
echo.
echo 次のステップ:
echo 1. Android Studioで開く: npx cap open android
echo 2. 実機を接続して実行
echo.
echo 注意: iOSはmacOSが必要です
echo.

pause

