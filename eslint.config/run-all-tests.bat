@echo off
chcp 65001 >nul
echo ========================================
echo リリース前テスト - 全テスト実行
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] E2Eテスト（動作テスト）を実行中...
call npm test
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ E2Eテストが失敗しました
    pause
    exit /b 1
)

echo.
echo [2/2] Visual Regression Test（UI見た目テスト）を実行中...
call npm run test:visual
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Visual Regression Testが失敗しました
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 全てのテストが成功しました！
echo ========================================
echo.
echo 次のステップ:
echo 1. iOS版テストを実行: cd ..\ && npm run test:e2e
echo 2. RELEASE_PRE_CHECKLIST.mdの手動確認項目を確認
echo.
pause

