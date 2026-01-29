@echo off
chcp 65001 >nul
echo ========================================
echo Visual Regression Test（UI見た目テスト）
echo ========================================
echo.

cd /d "%~dp0"

echo Visual Regression Testを実行中...
echo 初回実行の場合は、ベースラインが作成されます。
echo.

call npm run test:visual
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️ Visual Regression Testで差分が検出されました
    echo 差分を確認してください: test-results/
    echo.
    echo 意図的な変更の場合は、以下でベースラインを更新:
    echo   npm run test:visual:update
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ Visual Regression Testが成功しました！
echo ========================================
pause

