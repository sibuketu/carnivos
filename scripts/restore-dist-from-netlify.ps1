$siteName = "carnivos"
$baseUrl = "https://$siteName.netlify.app"
$distDir = "dist"

Write-Host "Restoring dist folder from Netlify..." -ForegroundColor Green
Write-Host "Site: $baseUrl" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $distDir) {
    $backupDir = "dist-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Write-Host "Backing up existing dist folder to: $backupDir" -ForegroundColor Yellow
    Move-Item -Path $distDir -Destination $backupDir -Force
}

New-Item -ItemType Directory -Force -Path $distDir | Out-Null
New-Item -ItemType Directory -Force -Path "$distDir/assets" | Out-Null

function Download-File {
    param(
        [string]$Url,
        [string]$OutputPath,
        [string]$FileName
    )
    
    try {
        Write-Host "Downloading: $FileName" -ForegroundColor Yellow -NoNewline
        $response = Invoke-WebRequest -Uri $Url -OutFile $OutputPath -ErrorAction Stop
        $fileSize = (Get-Item $OutputPath).Length / 1KB
        Write-Host " OK ($([math]::Round($fileSize, 1)) KB)" -ForegroundColor Green
        return $true
    } catch {
        Write-Host " FAILED: $_" -ForegroundColor Red
        return $false
    }
}

$rootFiles = @(
    "index.html",
    "manifest.json",
    "manifest.webmanifest",
    "sw.js",
    "registersw.js",
    "registerSW.js",
    "vite.svg"
)

$iconFiles = @(
    "apple-touch-icon.png",
    "favicon.ico",
    "icon-spear-gold.png",
    "icon-steak-fire.png",
    "icon-v2-192.png",
    "icon-v2-512.png",
    "pwa-192x192.png",
    "pwa-512x512.png",
    "pwa-v2-192.png",
    "pwa-v2-512.png"
)

$assetsFiles = @(
    "assets/index-Itu--OF1.js",
    "assets/react-vendor-OvXVS5lI.js",
    "assets/chart-vendor-BKK2UjWf.js",
    "assets/index-CW5E81Lq.css"
)

Write-Host "=== Root Files ===" -ForegroundColor Cyan
$rootSuccess = 0
foreach ($file in $rootFiles) {
    $url = "$baseUrl/$file"
    $outputPath = Join-Path $distDir $file
    if (Download-File -Url $url -OutputPath $outputPath -FileName $file) {
        $rootSuccess++
    }
    Start-Sleep -Milliseconds 200
}

Write-Host ""
Write-Host "=== Icon Files ===" -ForegroundColor Cyan
$iconSuccess = 0
foreach ($file in $iconFiles) {
    $url = "$baseUrl/$file"
    $outputPath = Join-Path $distDir $file
    if (Download-File -Url $url -OutputPath $outputPath -FileName $file) {
        $iconSuccess++
    }
    Start-Sleep -Milliseconds 200
}

Write-Host ""
Write-Host "=== Assets Files ===" -ForegroundColor Cyan
$assetsSuccess = 0
foreach ($file in $assetsFiles) {
    $url = "$baseUrl/$file"
    $outputPath = Join-Path $distDir $file
    $dir = Split-Path $outputPath -Parent
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    if (Download-File -Url $url -OutputPath $outputPath -FileName $file) {
        $assetsSuccess++
    }
    Start-Sleep -Milliseconds 200
}

Write-Host ""
Write-Host "=== Restore Complete ===" -ForegroundColor Green
Write-Host "Root files: $rootSuccess/$($rootFiles.Count)" -ForegroundColor Cyan
Write-Host "Icon files: $iconSuccess/$($iconFiles.Count)" -ForegroundColor Cyan
Write-Host "Assets files: $assetsSuccess/$($assetsFiles.Count)" -ForegroundColor Cyan
Write-Host ""
Write-Host "dist folder restored from Netlify" -ForegroundColor Green
Write-Host "Run 'npm run preview' to test locally" -ForegroundColor Yellow
