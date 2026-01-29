@echo off
chcp 65001 >nul
echo ========================================
echo Visual Regression Test - ベースライン作成
echo ========================================
echo.

REM このバッチファイルは、エクスプローラーから実行するか、フルパスで実行してください
REM フルパス: C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\create-visual-baseline.bat

cd /d "%~dp0"

echo Visual Regression Testのベースライン（スナップショット）を作成します。
echo 初回実行時のみ必要です。
echo.
pause

echo ベースラインを作成中...
call npm run test:visual:update

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️ ベースライン作成中にエラーが発生しました
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ ベースラインの作成が完了しました！
echo ========================================
echo.
echo 次回からは通常のテスト実行で比較されます:
echo   npm run test:visual
echo.
pause

