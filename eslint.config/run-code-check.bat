@echo off
chcp 65001 >nul
echo ========================================
echo コードチェック（Lint + 型チェック）
echo ========================================
echo.

cd /d "%~dp0"

echo Lintチェックを実行中...
call npm run lint
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️ Lintエラーが見つかりました
) else (
    echo.
    echo ✅ Lintチェック完了
)

echo.
echo 型チェックを実行中...
call npx tsc --noEmit
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️ 型エラーが見つかりました
) else (
    echo.
    echo ✅ 型チェック完了
)

echo.
echo ========================================
echo コードチェック完了
echo ========================================
pause

