@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Prettierでコードをフォーマットしています...
call npm run format
if %ERRORLEVEL% EQU 0 (
    echo.
    echo フォーマット完了しました。
) else (
    echo.
    echo エラーが発生しました。
)
pause

