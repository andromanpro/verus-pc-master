# Verus — сборка tests-data.js из data/*.json
# Запускать после правки любого JSON в data/. Можно через двойной клик.
# Скрипт идемпотентный: перезаписывает tests-data.js полностью.

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Definition
$dataDir = Join-Path $here 'data'
$outFile = Join-Path $here 'tests-data.js'

Write-Host "Verus — сборка tests-data.js" -ForegroundColor Cyan
Write-Host "Source: $dataDir"
Write-Host "Target: $outFile"
Write-Host ''

if (-not (Test-Path $dataDir)) {
  Write-Host "Папки data/ нет, нечего собирать." -ForegroundColor Red
  exit 1
}

$jsonFiles = Get-ChildItem -Path $dataDir -Filter '*.json' | Sort-Object Name
if (-not $jsonFiles) {
  Write-Host "В data/ нет .json файлов." -ForegroundColor Red
  exit 1
}

# Собираем встроенный объект { '01': {...}, '02': {...} }
$entries = @()
foreach ($f in $jsonFiles) {
  $id = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
  $raw = Get-Content -LiteralPath $f.FullName -Raw -Encoding UTF8

  # Валидация — попробуем распарсить
  try {
    $null = $raw | ConvertFrom-Json
  } catch {
    Write-Host "✕ $($f.Name) — битый JSON: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
  }

  # raw json без лишнего форматирования (как есть в файле)
  $entries += "  '$id': $raw"
  Write-Host "  ✓ $($f.Name)" -ForegroundColor Green
}

$body = "// Verus — встроенные данные тестов (запекание для работы без сервера, file://).`r`n"
$body += "// СГЕНЕРИРОВАНО автоматически скриптом build-tests-data.ps1.`r`n"
$body += "// НЕ ПРАВИТЬ ВРУЧНУЮ — правь data/<id>.json и пересоберай.`r`n"
$body += "'use strict';`r`n"
$body += "window.TESTS_DATA = {`r`n"
$body += ($entries -join ",`r`n")
$body += "`r`n};`r`n"

# Атомарная запись через .tmp
$tmp = "$outFile.tmp"
[System.IO.File]::WriteAllText($tmp, $body, [System.Text.UTF8Encoding]::new($false))
if (Test-Path $outFile) { Remove-Item -LiteralPath $outFile -Force }
Move-Item -LiteralPath $tmp -Destination $outFile

$sizeKb = [Math]::Round((Get-Item $outFile).Length / 1KB, 1)
Write-Host ''
Write-Host "Готово. $($jsonFiles.Count) модулей · $sizeKb KB" -ForegroundColor Cyan
Write-Host "Файл: $outFile"
