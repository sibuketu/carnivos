@echo off
chcp 65001 >nul
echo ========================================
echo 自動チェック（Lint + 型チェック）
echo ========================================
echo.

cd /d "C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web"

echo [1/2] Lintチェック...
call npm run lint
if %ERRORLEVEL% NEQ 0 (echo. & echo ⚠️ Lintエラーあり) else (echo. & echo ✅ Lint OK)

echo [2/2] 型チェック...
call npx tsc --noEmit
if %ERRORLEVEL% NEQ 0 (echo. & echo ⚠️ 型エラーあり) else (echo. & echo ✅ 型チェック OK)

echo.
echo ========================================
echo 次: 開発サーバー起動 → @Browser で動作確認
echo ========================================
echo.
echo 1. 開発サーバー起動:
echo    C:\Users\susam\Downloads\CarnivOS\start-dev.bat をダブルクリック
echo    または Cursor で「npm run dev して」と指示
echo.
echo 2. ブラウザ動作確認（Cursorチャットにコピペして送信）:
echo    @Browser http://localhost:5174 を開いて、ホーム・食事記録・AIチャット・コンソールエラーを確認して
echo.
pause
