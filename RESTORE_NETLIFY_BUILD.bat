@echo off
echo Netlifyのビルド済みファイルを復元しています...
echo.

REM 既存のdistフォルダをバックアップ
if exist dist (
    set BACKUP_DIR=dist-backup-%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%
    set BACKUP_DIR=!BACKUP_DIR: =0!
    move dist "!BACKUP_DIR!" >nul 2>&1
    echo 既存のdistフォルダをバックアップしました: !BACKUP_DIR!
)

REM netlify-deploy-backupからdistにコピー
if exist netlify-deploy-backup (
    mkdir dist 2>nul
    xcopy /E /I /Y "netlify-deploy-backup\*" "dist\" >nul
    echo Netlifyのビルド済みファイルをdistフォルダにコピーしました
    echo.
    echo プレビューサーバーを起動します...
    npm run preview
) else (
    echo エラー: netlify-deploy-backupフォルダが見つかりません
    echo Netlifyからファイルをダウンロードしてください
    pause
)
