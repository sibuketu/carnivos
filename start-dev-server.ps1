# 開発サーバー起動スクリプト
# このスクリプトを実行すると、開発サーバーが起動します

$ErrorActionPreference = "Stop"

# 現在のスクリプトのディレクトリに移動
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Starting development server..."
Write-Host "Directory: $scriptPath"
Write-Host ""

# npm run devを実行
npm run dev

