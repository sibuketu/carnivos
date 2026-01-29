@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo UI自動チェックを開始します
echo ========================================
echo.

echo [1/4] ESLintでコード品質をチェックしています...
call npm run lint
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ESLintエラーが見つかりました
    echo    修正するには: npm run lint:fix
    echo.
) else (
    echo ✅ ESLintチェック完了
    echo.
)

echo [2/4] TypeScriptの型チェックを実行しています...
call npx tsc --noEmit
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ TypeScriptの型エラーが見つかりました
    echo.
) else (
    echo ✅ TypeScript型チェック完了
    echo.
)

echo [3/4] Prettierでフォーマットをチェックしています...
call npm run format:check
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ フォーマットエラーが見つかりました
    echo    修正するには: npm run format
    echo.
) else (
    echo ✅ Prettierチェック完了
    echo.
)

echo [4/4] Visual Regression Testを実行しています...
echo     （開発サーバーが起動している必要があります）
call npm run test:visual
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Visual Regression Testが失敗しました
    echo    結果を確認するには: npm run test:ui
    echo.
) else (
    echo ✅ Visual Regression Test完了
    echo.
)

echo ========================================
echo 自動チェック完了
echo ========================================
pause

