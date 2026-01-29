@echo off
REM Primal Logic - 全画面スクリーンショット取得バッチファイル
REM 開発サーバーが起動している状態で実行してください

echo ========================================
echo Primal Logic - スクリーンショット取得
echo ========================================
echo.
echo 開発サーバーが起動していることを確認してください。
echo 起動していない場合は、別のターミナルで以下を実行してください：
echo   npm run dev
echo.
pause

cd /d "%~dp0"
npx tsx scripts/capture-screenshots-simple.ts

echo.
echo ========================================
echo スクリーンショット取得が完了しました
echo ========================================
echo.
echo スクリーンショットは以下のフォルダに保存されました：
echo   screenshots-for-gemini\
echo.
pause

