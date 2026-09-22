# Verus — обновление портативных инструментов с официальных адресов.
# Запуск: через "Обновить инструменты.bat" в корне флешки, или кнопкой в дашборде.
# Проверяет актуальность (маркеры в portable/_versions.json) и качает ТОЛЬКО изменившееся.
# Не делает pause сам — это задача вызывающего (.bat) или окна -NoExit (дашборд).

$ErrorActionPreference = 'Stop'
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls11 } catch {}

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$portable = $null
foreach ($c in @((Join-Path $here 'dashboard\portable'), (Join-Path $here 'portable'), (Join-Path $here '..\dashboard\portable'))) {
  if (Test-Path (Split-Path $c -Parent)) { $portable = $c; break }
}
if (-not $portable) { $portable = Join-Path $here 'dashboard\portable' }
if (-not (Test-Path $portable)) { New-Item -ItemType Directory -Path $portable -Force | Out-Null }

Write-Host ""
Write-Host "  Verus — обновление инструментов" -ForegroundColor Cyan
Write-Host "  Папка назначения: $portable" -ForegroundColor DarkGray
Write-Host "  Проверяю актуальность, качаю только изменившееся. Нужен интернет." -ForegroundColor DarkGray
Write-Host ""

$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

# Маркеры установленных версий
$verFile  = Join-Path $portable '_versions.json'
$versions = @{}
if (Test-Path $verFile) { try { (Get-Content $verFile -Raw -Encoding UTF8 | ConvertFrom-Json).PSObject.Properties | ForEach-Object { $versions[$_.Name] = "$($_.Value)" } } catch {} }

# BleachBit: версия из последнего релиза GitHub (файл — с их CDN)
$bbVer = '6.0.0'
try { $rel = Invoke-RestMethod 'https://api.github.com/repos/bleachbit/bleachbit/releases/latest' -Headers @{ 'User-Agent' = $ua } -TimeoutSec 20; $v = ($rel.tag_name -replace '^v', ''); if ($v) { $bbVer = $v } } catch {}

# HEAD-маркер удалённого файла (Last-Modified|размер). $null если не удалось (например 403).
function Get-HeadMarker($url, $referer) {
  try {
    $h = @{ 'User-Agent' = $ua }; if ($referer) { $h['Referer'] = $referer }
    $r = Invoke-WebRequest -Uri $url -Method Head -Headers $h -UseBasicParsing -MaximumRedirection 10 -TimeoutSec 20
    $m = "$($r.Headers['Last-Modified'])" + '|' + "$($r.Headers['Content-Length'])"
    if ($m -ne '|') { return $m }
  } catch {}
  return $null
}

$tools = @(
  @{ name = 'Sysinternals Suite'; url = 'https://download.sysinternals.com/files/SysinternalsSuite.zip'; out = 'SysinternalsSuite'; check = 'Autoruns64.exe'; mode = 'head' },
  @{ name = 'CrystalDiskInfo';    url = 'https://sourceforge.net/projects/crystaldiskinfo/files/latest/download'; out = 'CrystalDiskInfo'; check = 'DiskInfo64.exe'; mode = 'head'; referer = 'https://crystalmark.info/' },
  @{ name = 'Victoria';           url = 'https://hdd.by/Victoria/Victoria537.zip'; out = 'Victoria'; check = 'Victoria.exe'; mode = 'fixed'; marker = 'v5.37' },
  @{ name = 'BleachBit';          url = "https://download.bleachbit.org/BleachBit-$bbVer-portable.zip"; out = 'BleachBit'; check = 'bleachbit.exe'; mode = 'tag'; marker = $bbVer }
)

$tmp = Join-Path $env:TEMP ('verus-tools-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmp -Force | Out-Null

$updated = 0; $skipped = 0; $failed = 0
foreach ($t in $tools) {
  $dest = Join-Path $portable $t.out
  $installed = (Test-Path $dest) -and [bool](Get-ChildItem $dest -Recurse -Filter $t.check -ErrorAction SilentlyContinue)

  # Маркер «как сейчас на сервере»
  $remote = switch ($t.mode) {
    'fixed' { $t.marker }
    'tag'   { $t.marker }
    'head'  { Get-HeadMarker $t.url $t.referer }
    default { $null }
  }
  $stored = $versions[$t.out]

  # Уже актуально → пропускаем
  if ($installed -and $remote -and ($stored -eq $remote)) {
    Write-Host ("[=] {0} — уже актуально, пропускаю" -f $t.name) -ForegroundColor DarkGray; $skipped++; continue
  }
  # Не смогли проверить (HEAD недоступен/403), но тул уже стоит → не трогаем
  if ($installed -and -not $remote) {
    Write-Host ("[=] {0} — не удалось проверить актуальность, оставляю текущую версию" -f $t.name) -ForegroundColor DarkGray; $skipped++; continue
  }

  Write-Host ("[*] {0} — скачиваю..." -f $t.name) -ForegroundColor Cyan
  $zip = Join-Path $tmp ($t.out + '.zip'); $ex = Join-Path $tmp $t.out
  try {
    $dh = @{ 'User-Agent' = $ua }; if ($t.referer) { $dh['Referer'] = $t.referer }
    Invoke-WebRequest -Uri $t.url -OutFile $zip -Headers $dh -UseBasicParsing -MaximumRedirection 10
    if (-not (Test-Path $zip) -or (Get-Item $zip).Length -lt 10240) { throw 'скачанный файл пустой/слишком мал' }
    Expand-Archive -Path $zip -DestinationPath $ex -Force
    $kids = @(Get-ChildItem $ex -Force)
    if ($kids.Count -eq 1 -and $kids[0].PSIsContainer) {
      $inner = $kids[0].FullName
      Get-ChildItem $inner -Force | ForEach-Object { Move-Item $_.FullName $ex -Force }
      Remove-Item $inner -Recurse -Force
    }
    if (-not (Get-ChildItem $ex -Recurse -Filter $t.check -ErrorAction SilentlyContinue)) { throw ("в архиве нет {0} — формат изменился?" -f $t.check) }
    if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
    Move-Item $ex $dest -Force
    $versions[$t.out] = "$(if ($remote) { $remote } else { $t.marker })"
    $mb = [math]::Round((Get-Item $zip).Length / 1MB, 1)
    Write-Host ("[ok] {0} обновлён ({1} МБ) -> portable/{2}/" -f $t.name, $mb, $t.out) -ForegroundColor Green
    $updated++
  } catch {
    if ($installed) {
      Write-Host ("[!] {0} — не смог скачать ({1}); оставил текущую версию" -f $t.name, $_.Exception.Message) -ForegroundColor Yellow; $skipped++
    } else {
      Write-Host ("[!!] {0} — не удалось: {1}" -f $t.name, $_.Exception.Message) -ForegroundColor Red; $failed++
    }
  }
}

try { ($versions | ConvertTo-Json) | Set-Content -LiteralPath $verFile -Encoding UTF8 } catch {}
Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
Write-Host ""
Write-Host ("  Итог: обновлено {0}, уже актуальны {1}, не удалось {2}." -f $updated, $skipped, $failed) -ForegroundColor $(if ($failed) { 'Yellow' } else { 'Green' })
if ($updated -gt 0) { Write-Host "  Перезапусти дашборд или обнови страницу." -ForegroundColor DarkGray }
