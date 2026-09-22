# Verus PC-Master — генератор пакета обновления ПРОГРАММЫ (только у автора).
# Делает маленький подписанный verus-update-<VERSION>.zip с одним лишь dashboard/ (несколько МБ),
# вместо пересборки/пересылки всей 265-МБ флешки на каждый фикс.
#
# Пакет ПОДПИСЫВАЕТСЯ приватным ключом автора (тем же, что и лицензии). server.ps1 при применении
# проверяет подпись публичным ключом — без валидной подписи обновление отвергается (защита от RCE,
# т.к. программа запускается от админа).
#
# Использование:  .\make-update.ps1            (из license-authority/, берёт ../dashboard и ../VERSION)
#                 .\make-update.ps1 -OutDir D:\releases

param(
  [string]$DashboardDir = (Join-Path $PSScriptRoot '..\dashboard'),
  [string]$VersionFile  = (Join-Path $PSScriptRoot '..\VERSION'),
  [string]$OutDir       = (Join-Path $PSScriptRoot '..\dist')
)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch {}
$privPath = Join-Path $PSScriptRoot 'private-key.xml'
if (-not (Test-Path $privPath)) { Write-Error "Не найден приватный ключ: $privPath"; exit 1 }
if (-not (Test-Path $DashboardDir)) { Write-Error "Не найдена папка dashboard: $DashboardDir"; exit 1 }
$dash = (Resolve-Path $DashboardDir).Path
$version = if (Test-Path $VersionFile) { (Get-Content $VersionFile -Raw).Trim() } else { '0.0.0' }

# Явный список файлов программы: новые приватные JSON/бэкапы и portable не могут
# попасть в обновление. Прайс, контакты, настройки и данные мастера не перезаписываем.
$programFiles = @('server.ps1', 'index.html', 'qrcode.js', 'training-scenarios.js',
  'favicon.svg', 'verus-icon-256.png', 'verus-icon.ico', 'Dashboard.bat',
  'Diagnostics.bat', 'diagnostics.ps1')
foreach ($required in @('server.ps1', 'index.html')) {
  if (-not (Test-Path -LiteralPath (Join-Path $dash $required) -PathType Leaf)) {
    throw "Нет обязательного файла программы: $required"
  }
}

$sha = [System.Security.Cryptography.SHA256]::Create()
$files = @{}
$staged = Join-Path $env:TEMP ("verus-upd-" + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path (Join-Path $staged 'dashboard') -Force | Out-Null

foreach ($rel in $programFiles) {
  $sourcePath = Join-Path $dash $rel
  if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) { continue }
  $f = Get-Item -LiteralPath $sourcePath
  $hash = ($sha.ComputeHash([IO.File]::ReadAllBytes($f.FullName)) | ForEach-Object { $_.ToString('x2') }) -join ''
  $files[$rel] = $hash
  $dest = Join-Path $staged (Join-Path 'dashboard' $rel)
  New-Item -ItemType Directory -Path (Split-Path $dest -Parent) -Force | Out-Null
  Copy-Item $f.FullName $dest -Force
}
# The installed updater copies dashboard files only. Include the canonical
# version there so the next launch reports the update, not the old USB build.
$versionBytes = [Text.Encoding]::UTF8.GetBytes($version)
[IO.File]::WriteAllBytes((Join-Path $staged 'dashboard/VERSION'), $versionBytes)
$files['VERSION'] = ($sha.ComputeHash($versionBytes) | ForEach-Object { $_.ToString('x2') }) -join ''
# License notices travel with each signed program update as well as full builds.
$projectRoot = Split-Path $dash -Parent
foreach ($notice in @('LICENSE','NOTICE','THIRD_PARTY_NOTICES.md','licenses/qrcode-generator-MIT.txt','licenses/winutil-MIT.txt','licenses/tron-MIT.txt')) {
  $noticeSource = Join-Path $projectRoot $notice
  if (-not (Test-Path -LiteralPath $noticeSource -PathType Leaf)) { continue }
  $bytes = [IO.File]::ReadAllBytes($noticeSource)
  $dest = Join-Path $staged (Join-Path 'dashboard' $notice)
  New-Item -ItemType Directory -Path (Split-Path $dest -Parent) -Force | Out-Null
  [IO.File]::WriteAllBytes($dest, $bytes)
  $files[$notice] = ($sha.ComputeHash($bytes) | ForEach-Object { $_.ToString('x2') }) -join ''
}

# Манифест: версия + карта файл→sha256. Подписываем UTF-8 байты JSON.
$manifestObj = [ordered]@{ v = 1; product = 'verus-pc-master'; version = $version; createdAt = (Get-Date).ToString('o'); files = $files }
$manifestJson = ($manifestObj | ConvertTo-Json -Compress -Depth 5)
$manifestBytes = [Text.Encoding]::UTF8.GetBytes($manifestJson)

$rsa = New-Object System.Security.Cryptography.RSACryptoServiceProvider
$rsa.FromXmlString([IO.File]::ReadAllText($privPath, [Text.Encoding]::UTF8))
$sig = [Convert]::ToBase64String($rsa.SignData($manifestBytes, 'SHA256'))

[IO.File]::WriteAllText((Join-Path $staged 'update.manifest'), $manifestJson, (New-Object Text.UTF8Encoding($false)))
[IO.File]::WriteAllText((Join-Path $staged 'update.manifest.sig'), $sig, (New-Object Text.UTF8Encoding($false)))

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }
$zipPath = Join-Path $OutDir "verus-update-$version.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path "$staged/*" -DestinationPath $zipPath -CompressionLevel Optimal -Force
$tempRoot = [IO.Path]::GetFullPath($env:TEMP).TrimEnd('\') + '\'
$resolvedStage = [IO.Path]::GetFullPath($staged)
if (-not $resolvedStage.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase)) {
  throw 'Каталог временной сборки оказался вне TEMP — очистка остановлена.'
}
Remove-Item -LiteralPath $resolvedStage -Recurse -Force -ErrorAction SilentlyContinue

$mb = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host "=== Пакет обновления готов ===" -ForegroundColor Green
Write-Host "Версия : $version"
Write-Host "Файлов : $($files.Count)"
Write-Host "Размер : $mb МБ - вместо ~265 МБ полной флешки"
Write-Host "Файл   : $zipPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Скопируй zip рядом с Verus.exe. В дашборде: Настройки → «Обновить программу», затем перезапусти Verus." -ForegroundColor Yellow
