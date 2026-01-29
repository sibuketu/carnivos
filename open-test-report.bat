@echo off
chcp 65001 >nul
echo ========================================
echo Playwright Test Reportを開く
echo ========================================
echo.

cd /d "%~dp0"

echo [準備] HTMLレポートを開いています...
echo.

REM HTMLレポートを開く
start "" "playwright-report\index.html"

echo.
echo ========================================
echo ✅ HTMLレポートを開きました！
echo ========================================
echo.
echo 次のステップ:
echo 1. ブラウザでPlaywright Test Reportが開きます
echo 2. 失敗したテストをクリックして詳細を確認
echo 3. エラーメッセージをスクリーンショットで撮影
echo 4. スクリーンショットをチャットに貼り付け
echo.
pause

