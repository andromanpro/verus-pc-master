<#
  build-flash.ps1 — один скрипт собирает готовый комплект для USB-флешки мастера

  Что делает:
    1. Создаёт временную папку staging
    2. Копирует туда: dashboard, тулзы, field-handbook, training (теория+презентации+тесты), документы
    3. ИСКЛЮЧАЕТ: clients/ (личные данные), master.dat (привязка к флешке), dev.flag
    4. Упаковывает всё в zip
    5. Чистит staging

  Результат: <repo>/dist/verus-flash-<дата>.zip — распаковать на чистую флешку 32+ ГБ
  (По умолчанию складывается в dist/ репо. dist/ — gitignore'нут, артефакты не уезжают в git.)

  Запуск:  powershell -ExecutionPolicy Bypass -File .\build-flash.ps1
  С параметром: -OutDir "D:\releases" — папка куда положить zip (по умолчанию <repo>/dist)
                -SkipPortable      — не включать portable/ (если флешка маленькая)
                -SkipPresentations — не включать презентации
#>

param(
  # По умолчанию — dist/ в корне репо (рядом с этим скриптом две папки вверх).
  # Если хочешь куда-то ещё — передай -OutDir 'D:\releases' явно.
  [string]$OutDir = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')) 'dist'),
  [switch]$SkipPortable,
  [switch]$SkipPresentations,
  [switch]$SkipTraining,   # «полевая» сборка — без модуля обучения (training/), легче ~14 МБ. Дашборд деградирует мягко.
  [switch]$DryRun,
  # -Full отключает чистку. По умолчанию (без флага) делается чистый комплект:
  #   - убираем flash-staging/ (исходники сборки + 205 МБ дубликат portable)
  #   - убираем .md если есть парный .docx
  #   - убираем исходники презентаций (.js рядом с .pptx)
  #   - убираем training/tests/data/ и сборщик (запечено в tests-data.js)
  [switch]$Full,
  # -DevBuild (default OFF — продукт коммерческий, безопасный дефолт = RELEASE):
  #   RELEASE (по умолчанию): канал 'release' запекается в server.ps1, dev.flag игнорируется,
  #     требуется RSA-лицензия. Имя файла без префикса: verus-flash-VERSION.zip.
  #   DEV (только явный -DevBuild:$true): канал 'dev', dev.flag → тестовый режим ИИ,
  #     префикс dev-, README-DEV.txt. ⚠ Не раздавать покупателям!
  # Audit Codex P1: дефолт DEV — футган (no-args сборка = master-разблокированный zip).
  [bool]$DevBuild = $false
)

$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..')
Write-Host ""
Write-Host "=== Сборка флешки Verus ===" -ForegroundColor Cyan
Write-Host "Корень проекта: $root" -ForegroundColor DarkGray

# --- Читаем версию + git commit ---
$version = 'unknown'
$gitCommit = $null
try {
  $vf = Join-Path $root 'VERSION'
  if (Test-Path $vf) { $version = ((Get-Content -LiteralPath $vf -Raw -Encoding UTF8).Trim()) }
} catch {}
try {
  $headFile = Join-Path $root '.git\HEAD'
  if (Test-Path $headFile) {
    $head = (Get-Content -LiteralPath $headFile -Raw).Trim()
    if ($head -match '^ref:\s*(.+)$') {
      $refFile = Join-Path $root ('.git\' + $matches[1])
      if (Test-Path $refFile) { $gitCommit = ((Get-Content -LiteralPath $refFile -Raw).Trim()).Substring(0,7) }
    } elseif ($head -match '^[a-f0-9]{40}$') { $gitCommit = $head.Substring(0,7) }
  }
} catch {}

if ($DevBuild) {
  Write-Host "Режим: DEV (с dev.flag, префикс dev-)" -ForegroundColor Yellow
} else {
  Write-Host "Режим: RELEASE" -ForegroundColor Green
}
Write-Host "Версия: $version$(if($gitCommit){' · '+$gitCommit})" -ForegroundColor DarkGray

# --- Создаём staging ---
$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm'
$prefix = if ($DevBuild) { 'dev-' } else { '' }
$stagingName = "${prefix}verus-flash-$version-$timestamp"
$staging = Join-Path $env:TEMP $stagingName
$tempPrefix = [IO.Path]::GetFullPath($env:TEMP).TrimEnd('\') + '\'
if (-not ([IO.Path]::GetFullPath($staging)).StartsWith($tempPrefix, [StringComparison]::OrdinalIgnoreCase)) { throw 'Staging escaped TEMP' }
if (Test-Path -LiteralPath $staging) { Remove-Item -LiteralPath $staging -Recurse -Force }
New-Item -ItemType Directory -Path $staging -Force | Out-Null
Write-Host "Staging: $staging" -ForegroundColor DarkGray
Write-Host ""

function Copy-Section($name, $src, $dst, $exclude = @()) {
  $srcFull = Join-Path $root $src
  if (-not (Test-Path $srcFull)) {
    Write-Host "  [skip] $name (нет: $src)" -ForegroundColor DarkYellow
    return
  }
  $dstFull = Join-Path $staging $dst
  New-Item -ItemType Directory -Path (Split-Path $dstFull -Parent) -Force | Out-Null

  if ($DryRun) {
    Write-Host "  [dry] $name → $dst" -ForegroundColor DarkGray
    return
  }

  # Используем robocopy для надёжной копии с исключениями
  $robocopyArgs = @($srcFull, $dstFull, '/E', '/NFL', '/NDL', '/NJH', '/NJS', '/NC', '/NS', '/NP')
  foreach ($ex in $exclude) {
    $robocopyArgs += '/XD'; $robocopyArgs += $ex
    $robocopyArgs += '/XF'; $robocopyArgs += $ex
  }
  $r = & robocopy @robocopyArgs 2>&1 | Out-Null
  if ($LASTEXITCODE -ge 8) { Write-Host "  [err] robocopy exit=$LASTEXITCODE для $name" -ForegroundColor Red; return }

  $size = (Get-ChildItem $dstFull -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
  $sizeMB = if ($size) { [math]::Round($size/1MB, 1) } else { 0 }
  Write-Host "  [ok ] $name → $dst ($sizeMB МБ)" -ForegroundColor Green
}

function Copy-File($src, $dst) {
  $srcFull = Join-Path $root $src
  if (-not (Test-Path $srcFull)) {
    Write-Host "  [skip] $src (нет)" -ForegroundColor DarkYellow
    return
  }
  $dstFull = Join-Path $staging $dst
  New-Item -ItemType Directory -Path (Split-Path $dstFull -Parent) -Force | Out-Null
  if (-not $DryRun) { Copy-Item $srcFull $dstFull -Force }
  $size = (Get-Item $srcFull).Length
  Write-Host "  [ok ] $src → $dst ($([math]::Round($size/1KB)) КБ)" -ForegroundColor Green
}

# === Что копируем на флешку ===
Write-Host "[1/6] Dashboard (главное)..." -ForegroundColor Yellow
# Исключаем: clients/ (PII визитов), ai-config.json (ключ OpenRouter),
# ai-log.jsonl / ai-tool-log.jsonl (Q&A и tool-логи — могут содержать данные клиента).
# master-profile.json — личные реквизиты мастера (ФИО/ИНН/ОГРНИП/телефон/QR): исключаем целиком,
# у покупателя свой создастся через welcome-окно. *.bak — резервные копии price/profile с теми же данными.
Copy-Section 'Dashboard (без CRM, ключа, профиля и AI-логов)' 'dashboard' 'dashboard' @('clients', 'ai-config.json', 'ai-log.jsonl', 'ai-tool-log.jsonl', 'cloud-config.json', 'cloud-pending.jsonl', 'master-profile.json', 'master-auth.json', 'backup-config.json', '*.bak', 'clients.restore-bak-*')
# master.dat / license.token / .verus-id — всегда удаляем (привязка к КОНКРЕТНОЙ флешке, индивидуальны).
# Канал (dev/release) ЗАПЕКАЕТСЯ в server.ps1 (audit Codex P1: release.lock на writable-флешке
# бесполезен — покупатель удалит). В release заменяем строку $script:buildChannel = 'dev' → 'release'.
$mf = Join-Path $staging 'dashboard/master.dat'
$df = Join-Path $staging 'dashboard/dev.flag'
$srvStaged = Join-Path $staging 'dashboard/server.ps1'
foreach ($leak in @($mf, (Join-Path $staging 'dashboard/license.token'), (Join-Path $staging 'license.token'), (Join-Path $staging 'dashboard/.verus-id'), (Join-Path $staging '.verus-id'), (Join-Path $staging 'dashboard/release.lock'))) {
  if (Test-Path $leak) { Remove-Item $leak -Force -ErrorAction SilentlyContinue; Write-Host "  [clean] убрал индивидуальный файл: $(Split-Path $leak -Leaf)" -ForegroundColor DarkGray }
}
# price.json НУЖЕН на флешке (прайс услуг/деталей — стартовый контент), но Save-MasterProfile
# синкает в него личные поля мастера (ФИО/телефон/платёжный QR). Вычищаем узлы `мастер` и `оплата`,
# оставляя прайс — покупатель подставит свои цены и реквизиты через профиль.
$priceStaged = Join-Path $staging 'dashboard/price.json'
if (Test-Path $priceStaged) {
  try {
    $pj = Get-Content -LiteralPath $priceStaged -Raw -Encoding UTF8 | ConvertFrom-Json
    $removed = @()
    foreach ($k in @('мастер', 'оплата')) { if ($pj.PSObject.Properties[$k]) { $pj.PSObject.Properties.Remove($k); $removed += $k } }
    [IO.File]::WriteAllText($priceStaged, ($pj | ConvertTo-Json -Depth 6), (New-Object Text.UTF8Encoding($false)))
    if ($removed.Count) { Write-Host "  [clean] price.json — убраны личные поля мастера ($($removed -join ', '))" -ForegroundColor DarkGray }
  } catch { Write-Host "  [warn] не смог вычистить price.json: $($_.Exception.Message)" -ForegroundColor Yellow }
}
# partners.json — контакты партнёров мастера и реф-договорённости (приватны, чужому городу бесполезны).
# Обезличиваем: очищаем список контактов, покупатель заполнит своими.
$partnersStaged = Join-Path $staging 'dashboard/partners.json'
if (Test-Path $partnersStaged) {
  try {
    $tpl = [ordered]@{ '_комментарий' = 'Локальные контакты партнёров — куда направлять клиентов с задачами вне твоей специализации. Заполняй по мере того как находишь хороших мастеров в районе.'; contacts = @() }
    [IO.File]::WriteAllText($partnersStaged, ($tpl | ConvertTo-Json -Depth 4), (New-Object Text.UTF8Encoding($false)))
    Write-Host "  [clean] partners.json — обезличен (список контактов очищен)" -ForegroundColor DarkGray
  } catch { Write-Host "  [warn] не смог обезличить partners.json: $($_.Exception.Message)" -ForegroundColor Yellow }
}
if ($DevBuild) {
  # Канал остаётся 'dev' (в server.ps1 уже 'dev'); кладём dev.flag для мгновенного Master.
  if (-not (Test-Path $df)) { New-Item -ItemType File -Path $df -Force | Out-Null }
  Write-Host "  [dev] канал 'dev' + dev.flag — Free с тестовым режимом ИИ" -ForegroundColor Yellow
} else {
  if (Test-Path $df) { Remove-Item $df -Force; Write-Host "  [clean] убрал dev.flag" -ForegroundColor DarkGray }
  # Запекаем канал 'release' ТОЛЬКО в строку-присвоение (anchored ^...$), НЕ трогая литералы
  # `'dev'` внутри кода Apply-Update (иначе ломается re-bake обновлений и release-флешка после
  # обновления молча откатывается в dev-канал — баг найден боевым прогоном).
  $srvText = [IO.File]::ReadAllText($srvStaged)
  $rxCh = [regex]'(?m)^\$script:buildChannel = ''dev''$'
  if (-not $rxCh.IsMatch($srvText)) { throw "RELEASE-сборка: строка-присвоение канала (^`$script:buildChannel = 'dev'`$) не найдена в server.ps1 — СТОП (иначе уедет dev-разблокировка)." }
  $srvNew = $rxCh.Replace($srvText, { '$script:buildChannel = ''release''' }, 1)
  [IO.File]::WriteAllText($srvStaged, $srvNew, (New-Object Text.UTF8Encoding($true)))
  Write-Host "  [release] канал 'release' запечён в server.ps1 — dev.flag игнорируется, локальные функции Free доступны без активации" -ForegroundColor Green
}

# VERSION + VERSION-COMMIT в staging — для отдачи через /api/version в runtime
try {
  $vsrc = Join-Path $root 'VERSION'
  if (Test-Path $vsrc) {
    Copy-Item $vsrc (Join-Path $staging 'VERSION') -Force
    Write-Host "  [ok ] VERSION ($version)" -ForegroundColor DarkGray
  }
  if ($gitCommit) {
    [IO.File]::WriteAllText((Join-Path $staging 'dashboard/VERSION-COMMIT'), $gitCommit, [Text.UTF8Encoding]::new($false))
    Write-Host "  [ok ] VERSION-COMMIT ($gitCommit)" -ForegroundColor DarkGray
  }
} catch { Write-Host "  [warn] VERSION файлы не записаны: $($_.Exception.Message)" -ForegroundColor Yellow }

foreach ($name in @('LICENSE','NOTICE','THIRD_PARTY_NOTICES.md','licenses')) {
  $source = Join-Path $root $name
  if (Test-Path -LiteralPath $source) { Copy-Item -LiteralPath $source -Destination (Join-Path $staging $name) -Recurse -Force }
}
if (-not $SkipPortable) {
  Write-Host ""
  Write-Host "[2/6] Тулзы (portable)..." -ForegroundColor Yellow
  $stagedPortable = Join-Path $staging 'dashboard/portable'
  # Источник №1: portable/ уже внутри dashboard/ (скопировался шагом [1/6])
  if (Test-Path $stagedPortable) {
    $sz = [math]::Round(((Get-ChildItem $stagedPortable -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum / 1MB), 1)
    Write-Host "  [info] portable/ уже внутри dashboard/portable/ ($sz МБ)" -ForegroundColor DarkGray
  } else {
    # Источник №2: flash-staging/portable/ (скачано через download-tools.ps1)
    $portSrc = Join-Path $PSScriptRoot 'portable'
    if (Test-Path $portSrc) {
      # Runtime-deps распаковываются — дашборд использует их exe напрямую, а не zip.
      # 1) LibreHardwareMonitor — нужен для CPU/GPU температур
      # 2) goodbyedpi — нужен для youtube-fix
      # 3) zapret — альтернативный youtube-fix
      # 4) CrystalDiskInfo — SMART-диагностика (пути под tools.json)
      # 5) Sysinternals Suite — Autoruns/ProcExp/TCPView (свободно распространяемые MS-утилиты)
      # Victoria/BleachBit — кладутся как готовые папки portable/Victoria, portable/BleachBit
      #   (скачаны+уплощены заранее) — копируются как есть, в распаковке не нужны.
      $unpackTargets = @(
        @{ zip='LibreHardwareMonitor.zip';        out='LibreHardwareMonitor';        wrapper=$null         },
        @{ zip='goodbyedpi.zip';                  out='goodbyedpi';                  wrapper='youtube-fix' },
        @{ zip='zapret-discord-youtube.zip';      out='zapret';                      wrapper='youtube-fix' },
        @{ zip='CrystalDiskInfo-portable.zip';    out='CrystalDiskInfo';             wrapper=$null         }
      )
      # Sysinternals + HWiNFO — ТОЛЬКО в DEV/личной сборке. В RELEASE их бандлить НЕЛЬЗЯ
      # (Sysinternals EULA запрещает redistribution; HWiNFO free только для личного использования) —
      # в продаваемой флешке они отсутствуют, мастер качает сам (см. ссылки в tools.json / download-tools).
      if ($DevBuild) {
        $unpackTargets += @{ zip='SysinternalsSuite.zip'; out='SysinternalsSuite'; wrapper=$null }
        $hwZip = Get-ChildItem $portSrc -Filter 'hwi*.zip' -File -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($hwZip) { $unpackTargets += @{ zip = $hwZip.Name; out = 'HWiNFO'; wrapper = $null } }
      }
      # ВАЖНО: локальные имена $unpackZip/$unpackOut, чтобы не затереть $OutDir (PS case-insensitive)
      foreach ($t in $unpackTargets) {
        $unpackZip  = Join-Path $portSrc $t.zip
        $unpackBase = if ($t.wrapper) { Join-Path $portSrc $t.wrapper } else { $portSrc }
        $unpackOut  = Join-Path $unpackBase $t.out
        if (-not (Test-Path $unpackOut) -and (Test-Path $unpackZip)) {
          if ($t.wrapper -and -not (Test-Path $unpackBase)) { New-Item -ItemType Directory -Path $unpackBase | Out-Null }
          try {
            Expand-Archive -Path $unpackZip -DestinationPath $unpackOut -Force
            # Уплощение: если архив обёрнут в одну папку (hwi_xxx/, Victoria537/, ...),
            # поднимаем её содержимое на уровень выше — чтобы .exe лежал прямо в portable/<out>/.
            $kids = @(Get-ChildItem $unpackOut -Force)
            if ($kids.Count -eq 1 -and $kids[0].PSIsContainer) {
              $inner = $kids[0].FullName
              Get-ChildItem $inner -Force | ForEach-Object { Move-Item $_.FullName $unpackOut -Force }
              Remove-Item $inner -Recurse -Force
            }
            $wrapDisplay = if ($t.wrapper) { $t.wrapper + '/' } else { '' }
            Write-Host "  [unpack] $($t.zip) → portable/$wrapDisplay$($t.out)/" -ForegroundColor DarkGray
          } catch { Write-Host "  [warn] не смог распаковать $($t.zip): $($_.Exception.Message)" -ForegroundColor Yellow }
        }
      }
      Write-Host "  [info] dashboard/portable/ нет — копирую из flash-staging/portable/" -ForegroundColor DarkGray
      Copy-Item -Path $portSrc -Destination $stagedPortable -Recurse -Force
      # После копии — удаляем zip-дубли распакованных runtime-папок (они уже там в виде каталогов)
      foreach ($t in $unpackTargets) {
        $stagedZip = Join-Path $stagedPortable $t.zip
        if (Test-Path $stagedZip) { Remove-Item $stagedZip -Force; Write-Host "  [-zip] $($t.zip) (дубль распакованного)" -ForegroundColor DarkGray }
      }
      $sz = [math]::Round(((Get-ChildItem $stagedPortable -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum / 1MB), 1)
      $cnt = (Get-ChildItem $stagedPortable -File -ErrorAction SilentlyContinue).Count
      $dirs = (Get-ChildItem $stagedPortable -Directory -ErrorAction SilentlyContinue).Count
      Write-Host "  [ok ] portable/ → dashboard/portable/ ($cnt файлов + $dirs папок, $sz МБ)" -ForegroundColor Green
    } else {
      Write-Host "  [warn] portable/ не найден ни в dashboard/, ни в flash-staging/." -ForegroundColor Yellow
      Write-Host "         Запусти: powershell -ExecutionPolicy Bypass -File flash-staging\download-tools.ps1" -ForegroundColor Yellow
      Write-Host "         или передай -SkipPortable если портативки не нужны в этой сборке." -ForegroundColor Yellow
    }
  }
} else {
  Write-Host ""
  Write-Host "[2/6] Тулзы — SKIPPED (-SkipPortable)" -ForegroundColor DarkYellow
  $portDir = Join-Path $staging 'dashboard/portable'
  if (Test-Path $portDir) { Remove-Item $portDir -Recurse -Force; Write-Host "  [clean] убрал portable/" -ForegroundColor DarkGray }
}

# LHM веб-сервер: дашборд на PowerShell 5.1 не грузит .NET-сборку LHM 0.9.x (Add-Type падает),
# поэтому температуру читает через веб-сервер LHM на :8085. По умолчанию он выключен —
# включаем runWebServerMenuItem=true в конфиге (идемпотентно), чтобы автозапущенный LHM его поднял.
$lhmCfg = Join-Path $staging 'dashboard/portable/LibreHardwareMonitor/LibreHardwareMonitor.config'
if (Test-Path $lhmCfg) {
  $cfgTxt = [System.IO.File]::ReadAllText($lhmCfg)
  if ($cfgTxt -notmatch 'runWebServerMenuItem') {
    $cfgTxt = $cfgTxt -replace '(<add key="listenerPort" value="\d+" />)', "`$1`r`n    <add key=""runWebServerMenuItem"" value=""true"" />"
    [System.IO.File]::WriteAllText($lhmCfg, $cfgTxt, (New-Object System.Text.UTF8Encoding $false))
    Write-Host "  [lhm] включён веб-сервер :8085 в LibreHardwareMonitor.config" -ForegroundColor DarkGray
  } else {
    Write-Host "  [lhm] веб-сервер :8085 уже включён в конфиге" -ForegroundColor DarkGray
  }
}

Write-Host ""
Write-Host "[3/6] Полевой справочник..." -ForegroundColor Yellow
Copy-Section 'Полевой справочник' 'field-handbook' 'field-handbook'

Write-Host ""
Write-Host "[4/6] Курс (теория + презентации + тесты)..." -ForegroundColor Yellow
if ($SkipTraining) {
  Write-Host "  [skip] Модуль обучения не включён (-SkipTraining) — полевая сборка. Дашборд спрячет учебные карточки." -ForegroundColor DarkYellow
} elseif ($SkipPresentations) {
  # Только md/docx, без презентаций
  Copy-Section 'Курс — текстовые материалы' 'training' 'training' @('presentations')
} else {
  Copy-Section 'Курс — всё (тексты + презентации)' 'training' 'training'
}

Write-Host ""
Write-Host "[5/6] Документы верхнего уровня..." -ForegroundColor Yellow
Copy-File 'README.md' 'README.md'
Copy-File 'CHANGELOG.md' 'CHANGELOG.md'
# docs/ едет на флешку (мастеру нужны бизнес-доки + docs/legal/ с офертой и 152-ФЗ шаблонами),
# но ВНУТРЕННИЕ доки (аудит безопасности, стратегия коммерциализации) — НЕ для покупателя.
Copy-Section 'Бизнес-документы + право (без внутренних аудит/стратегия)' 'docs' 'docs' @('security-audit-*', 'commercialization-strategy-*', 'позиционирование-*', 'кастдев-*', 'маркетинг-*', '*-private.md', '*-private.docx')

# === Папка «Мой софт» (master-software/) в корень флешки ===
# Пустая папка + инструкция + пример манифеста. Мастер кладёт СВОИ программы (портативки,
# инсталляторы, ярлыки на установленный софт) — дашборд показывает их во вкладке «Мой софт».
# Свой/лицензионный софт мы НЕ бандлим (как и Sysinternals/HWiNFO) — ответственность мастера.
# Папка ВНЕ dashboard/ → integrity.json её не хеширует (как portable/), датчик подмены не триггерится.
$msStaged = Join-Path $staging 'master-software'
New-Item -ItemType Directory -Path $msStaged -Force | Out-Null
$msReadme = @"
========================================
       МОЙ СОФТ — папка master-software/
========================================

Сюда ты кладёшь СВОИ программы. Дашборд Verus покажет их во вкладке
«🧰 Мой софт» отдельными кнопками — запуск в один клик прямо с флешки.

ЧТО МОЖНО ПОЛОЖИТЬ:
  • Портативные программы (.exe, .com) — CrystalDiskInfo, Victoria, AIDA64
    portable и т.п. Просто скопируй папку программы сюда.
  • Установщики (.msi, .bat, .cmd, .ps1) — запустятся с подтверждением
    (спросят «точно запустить?», т.к. ставят что-то в систему).
  • Ярлыки (.lnk) на уже установленный софт и .url-ссылки на сайты/порталы.
  • Можно раскладывать по подпапкам (1 уровень вложенности) — имя подпапки
    станет категорией.

КАК НАЗВАТЬ КРАСИВО (необязательно):
  Рядом положи файл verus-software.json (см. пример verus-software.example.json
  в этой папке — переименуй его и поправь). Там можно задать понятное имя,
  категорию и иконку для каждой программы. Без него имена берутся из имён файлов.

ОБНОВЛЕНИЕ СПИСКА:
  Добавил/убрал файл — просто обнови страницу дашборда (F5). Перезапуск не нужен.

⚠ ВАЖНО — ПРАВО:
  Клади только тот софт, на который у тебя есть право (бесплатный, свободно
  распространяемый, или с твоей лицензией). Пиратский/чужой лицензионный софт
  на флешке — твоя ответственность. Verus ничего сюда сам не докладывает.

Папку можно переименовать в «ДопСофт» — дашборд поймёт оба имени.
========================================
"@
Set-Content -Path (Join-Path $msStaged 'README.txt') -Value $msReadme -Encoding UTF8
$msExample = @"
{
  "_комментарий": "ПРИМЕР. Переименуй этот файл в verus-software.json и поправь под свои программы. Ключ = путь файла относительно папки master-software (можно с подпапкой через / ). Все поля необязательны: name (имя кнопки), category (раздел), icon (эмодзи), confirm (true = спрашивать перед запуском), args (аргументы запуска).",
  "CrystalDiskInfo.exe": { "name": "CrystalDiskInfo", "category": "Диагностика дисков", "icon": "💽" },
  "Victoria/Victoria.exe": { "name": "Victoria — тест HDD/SSD", "category": "Диагностика дисков", "icon": "🩺" },
  "AIDA64/aida64.exe": { "name": "AIDA64 — железо и стресс", "category": "Информация о ПК", "icon": "📊" },
  "drivers/setup-drivers.bat": { "name": "Установка драйверов", "category": "Установщики", "icon": "⬇", "confirm": true },
  "Сервисный-портал.url": { "name": "Мой сервисный портал", "category": "Ссылки", "icon": "🔗" }
}
"@
Set-Content -Path (Join-Path $msStaged 'verus-software.example.json') -Value $msExample -Encoding UTF8
Write-Host "  [ok ] master-software/ (пустая + README.txt + verus-software.example.json) → корень" -ForegroundColor Green

if ($Full) {
  Write-Host ""
  Write-Host "[6/7] flash-staging/ (исходники сборки) — -Full включён..." -ForegroundColor Yellow
  Copy-Section 'Стейджинг флешки' 'flash-staging' 'flash-staging'
  # markdown/ намеренно НЕ включаем в поставку — на флешке только .docx-рендеры
  # для пользователя. Если кто-то захочет md-исходники, клонирует репо.
} else {
  Write-Host ""
  Write-Host "[6/7] Памятка-A4 в корень (без markdown/ и flash-staging/ — это исходники)..." -ForegroundColor Yellow
  Copy-File 'flash-staging/master-memo-A4.docx' 'master-memo-A4.docx'
}

# === Чистка по умолчанию (если не -Full) ===
if (-not $Full -and -not $DryRun) {
  Write-Host ""
  Write-Host "[7/7] Чистка (Lean-режим): убираю .js-исходники презентаций, тесты/data/..." -ForegroundColor Yellow
  $removed = 0; $savedBytes = 0

  # .md теперь живут в markdown/ (исходники), на флешку (Lean) попадают только .docx —
  # этот старый шаг по парному .md больше не нужен, но оставляем код для случая если
  # пользователь руками положит .md рядом с .docx где-нибудь.
  Get-ChildItem -Path $staging -Recurse -File -Filter '*.md' | ForEach-Object {
    $mdDir = $_.DirectoryName
    $mdBase = $_.BaseName
    $candidates = Get-ChildItem -Path $mdDir -File -Filter '*.docx' -ErrorAction SilentlyContinue
    $hasDocx = $candidates | Where-Object {
      $b = $_.BaseName
      ($b -eq $mdBase) -or
      ($b -ieq $mdBase) -or
      # «flash-toolkit.md» vs «flash-toolkit.docx» (одинаковое имя)
      ($b.ToLower().Replace(' ', '-') -ieq $mdBase.ToLower())
    }
    if ($hasDocx) {
      $savedBytes += $_.Length
      Remove-Item -LiteralPath $_.FullName -Force
      $removed++
    }
  }
  Write-Host "  [-md] убрано $removed файлов .md с парным .docx ($([math]::Round($savedBytes/1KB)) КБ)" -ForegroundColor DarkGray

  # 2) Убираем JS-исходники презентаций (рядом с .pptx)
  $jsRm = 0; $jsBytes = 0
  Get-ChildItem -Path (Join-Path $staging 'training/presentations') -File -Filter '*.js' -ErrorAction SilentlyContinue | ForEach-Object {
    $jsBytes += $_.Length
    Remove-Item -LiteralPath $_.FullName -Force
    $jsRm++
  }
  if ($jsRm) { Write-Host "  [-js] убрано $jsRm исходников презентаций ($([math]::Round($jsBytes/1KB)) КБ)" -ForegroundColor DarkGray }

  # 3) Тесты — оставляем tests-data.js, убираем data/ и сборку (источник запечён)
  $testsData = Join-Path $staging 'training/tests/data'
  $testsBuild = Join-Path $staging 'training/tests/build-tests-data.ps1'
  if (Test-Path $testsData) {
    $sz = (Get-ChildItem $testsData -Recurse -File | Measure-Object Length -Sum).Sum
    Remove-Item -LiteralPath $testsData -Recurse -Force
    Write-Host "  [-tests/data] убрана папка data/ — JSON-источники тестов ($([math]::Round($sz/1KB)) КБ, всё запечено в tests-data.js)" -ForegroundColor DarkGray
  }
  if (Test-Path $testsBuild) {
    Remove-Item -LiteralPath $testsBuild -Force
    Write-Host "  [-tests/build] убран сборщик (нужен только при правке тестов)" -ForegroundColor DarkGray
  }
}

# === Иконка + ярлык-обёртка в корень zip ===
$iconSrc = Join-Path $root 'dashboard/verus-icon.ico'
if (Test-Path $iconSrc) {
  Copy-Item $iconSrc (Join-Path $staging 'verus-icon.ico') -Force
  Write-Host "  [ok ] verus-icon.ico → корень флешки (для ярлыков)" -ForegroundColor Green
} else {
  Write-Host "  [skip] verus-icon.ico не найдена — сгенерируй: py -3.14 dashboard/build-icon.py" -ForegroundColor DarkYellow
}

# === Тихий лаунчер Verus.exe (WinExe, без консольного окна) ===
# Компилируем встроенным csc.exe (.NET Framework, есть на любом Windows) — без сторонних зависимостей.
# Verus.exe — ЕДИНСТВЕННАЯ точка входа комплекта (батников в корне больше нет, профвид 0.6.27):
# не собрался exe → комплект-брак → сборка ПАДАЕТ (fail-closed), а не молча деградирует в .bat.
$launcherCs = Join-Path $PSScriptRoot 'verus-launcher.cs'
if (-not $DryRun) {
  if (-not (Test-Path $launcherCs)) { throw "Не найден исходник лаунчера: $launcherCs" }
  $csc = $null
  foreach ($fw in @('Framework64', 'Framework')) {
    $cand = Get-ChildItem (Join-Path $env:WINDIR "Microsoft.NET\$fw") -Filter csc.exe -Recurse -ErrorAction SilentlyContinue |
            Where-Object { $_.DirectoryName -match 'v4\.' } | Sort-Object FullName -Descending | Select-Object -First 1
    if ($cand) { $csc = $cand.FullName; break }
  }
  if (-not $csc) { throw 'csc.exe (.NET Framework 4.x) не найден — без него не собрать Verus.exe, а комплект без exe не поставляем.' }

  # Версия в метаданные exe: AssemblyVersion требует чисел x.y.z.w → парсим из VERSION ("0.6.27-dev" → 0.6.27.0),
  # полная строка с каналом и коммитом идёт в InformationalVersion (Свойства файла → «Версия продукта»).
  # Отдельный сгенерированный .cs вторым исходником — НИКАКИХ строковых замен в verus-launcher.cs.
  $verCs = $null
  if ($version -match '^(\d+)\.(\d+)\.(\d+)') {
    $numVer = "$($matches[1]).$($matches[2]).$($matches[3]).0"
    $infoVer = "$version$(if($gitCommit){' ('+$gitCommit+')'})"
    $verCs = Join-Path $env:TEMP "verus-version-$PID.cs"
    $verLines = @(
      'using System.Reflection;',
      "[assembly: AssemblyVersion(`"$numVer`")]",
      "[assembly: AssemblyFileVersion(`"$numVer`")]",
      "[assembly: AssemblyInformationalVersion(`"$infoVer`")]"
    )
    [System.IO.File]::WriteAllLines($verCs, $verLines, (New-Object System.Text.UTF8Encoding $false))
  } else {
    Write-Host "  [warn] VERSION «$version» не распарсился в x.y.z — exe соберётся без номера версии" -ForegroundColor Yellow
  }

  $exeOut = Join-Path $staging 'Verus.exe'
  $icoArg = Join-Path $staging 'verus-icon.ico'
  $manifest = Join-Path $PSScriptRoot 'verus-app.manifest'
  $cscArgs = @('/nologo', '/codepage:65001', '/target:winexe', "/out:$exeOut",
               '/reference:System.Windows.Forms.dll', '/reference:System.Drawing.dll', $launcherCs)
  if ($verCs)               { $cscArgs += $verCs }
  if (Test-Path $icoArg)    { $cscArgs += "/win32icon:$icoArg" }
  if (Test-Path $manifest)  { $cscArgs += "/win32manifest:$manifest" }
  $cscOut = & $csc @cscArgs 2>&1 | Out-String
  if ($verCs) { Remove-Item $verCs -Force -ErrorAction SilentlyContinue }
  if (-not (Test-Path $exeOut)) { throw "Verus.exe не скомпилировался:`n$cscOut" }
  $vi = (Get-Item $exeOut).VersionInfo
  Write-Host "  [ok ] Verus.exe скомпилирован — $($vi.CompanyName) · $($vi.ProductName) · v$($vi.FileVersion)" -ForegroundColor Green
}

# === Апдейтер инструментов: скрипт в корень (скрыт; запускается кнопкой «Обновить инструменты» в дашборде) ===
$updSrc = Join-Path $PSScriptRoot 'update-tools.ps1'
if (Test-Path $updSrc) {
  Copy-Item $updSrc (Join-Path $staging 'update-tools.ps1') -Force
  Write-Host "  [ok ] update-tools.ps1 → корень (обновление тулз — из дашборда)" -ForegroundColor Green
} else {
  Write-Host "  [skip] update-tools.ps1 не найден в flash-staging — апдейтер не положен" -ForegroundColor DarkYellow
}

# Вход в веб-сайт обучения из корня флешки (редирект на training/site/index.html)
if (-not $SkipTraining) {
$trainHtml = Join-Path $staging '📚 Обучение.html'
$trainRedirect = @'
<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
<meta http-equiv="refresh" content="0; url=training/site/index.html">
<title>Verus — Обучение</title></head>
<body style="background:#0a1020;color:#f8fafc;font-family:'Segoe UI',Arial;padding:40px">
<p>Открываю курс ПК-мастера… Если не открылось — <a href="training/site/index.html" style="color:#22d3ee">нажми сюда</a>.</p>
</body></html>
'@
[System.IO.File]::WriteAllText($trainHtml, $trainRedirect, (New-Object System.Text.UTF8Encoding $false))
Write-Host "  [ok ] 📚 Обучение.html → корень (открывает веб-курс)" -ForegroundColor Green
}

# === Памятка-первый-запуск в корень zip-а ===
$firstStart = Join-Path $staging 'НАЧНИ-ЗДЕСЬ.txt'
$firstStartText = @"
========================================
       VERUS — комплект ПК-мастера
========================================

ЗАПУСК:

  Двойной клик на "Verus.exe".
  - Разреши запрос прав администратора (UAC) — без него Verus.exe не запустится.
    Нужен режим просмотра без прав? Открой скрытую папку "dashboard" и запусти
    "Dashboard.bat" — диагностику, сметы и историю видно, лечение закрыто.
  - Откроется браузер: http://localhost:8970/
  - Значок Verus повиснет в трее (у часов): правый клик =
    Открыть / Перезапустить / Выключить.

  Windows блокирует запуск ("Защита Windows / неизвестный издатель")?
    Жми "Подробнее" -> "Всё равно выполнить". Программа без цифровой подписи —
    это норма (издатель и версия видны в свойствах файла Verus.exe).
    Совсем не идёт? Включи показ скрытых файлов (Проводник -> Вид ->
    "Скрытые элементы"), открой папку "dashboard" и запусти "Dashboard.bat".

  ВЫКЛЮЧЕНИЕ: правый клик по значку в трее -> "Выключить Verus".
    После этого можно вынимать флешку.

VERUS FREE:
  Локальные функции бесплатны без срока действия. Токен лицензии не нужен.
  ИИ работает на твоём ключе провайдера. Pro пока планируется.
  Пароль защищает базу, а права администратора нужны отдельным операциям.

СВОЙ СОФТ:
  Папка "master-software" — твой ящик для софта. Кинь туда свои программы
  (портативки, установщики, ярлыки), и они появятся в дашборде
  на вкладке "Мой софт".

ВСЁ ОСТАЛЬНОЕ — ВНУТРИ ДАШБОРДА:
  курс и тесты (сертификат после всех), полевой справочник,
  обновление инструментов, чеклист smoke-теста, документы и право.
  Служебные папки в корне скрыты — так и задумано, не удаляй их.

ГЛАВНОЕ ПРАВИЛО:
  Данные клиента — святое. Делай бэкап перед любой работой.

⚠ НЕ форматируй флешку: на ней живут лицензия (license.token), данные
  клиентов (CRM) и твой софт. Обновления программы ставятся поверх.
========================================
"@
Set-Content -Path $firstStart -Value $firstStartText -Encoding UTF8
Write-Host "  [ok ] НАЧНИ-ЗДЕСЬ.txt (краткая инструкция первого запуска)" -ForegroundColor Green

# DEV-предупреждение в корень zip
if ($DevBuild) {
  $devReadme = Join-Path $staging 'README-DEV.txt'
  $devText = @"
========================================
ЭТО DEV-СБОРКА ($version$(if($gitCommit){' · '+$gitCommit}))
========================================

Что это значит:
  - В сборке лежит dev.flag — включён тестовый режим ИИ
    БЕЗ привязки к флешке и без нажатия "Активировать".
  - Это для тестирования и разработки, НЕ для финального
    распространения мастерам.
  - Возможны баги, изменения интерфейса, частые обновления.

Для финальной поставки:
  - Пересобрать с -DevBuild:`$false (или дождаться релиза 1.0)
  - Префикс dev- исчезнет, dev.flag будет удалён, мастер
    активирует свою флешку через UI.

========================================
"@
  Set-Content -Path $devReadme -Value $devText -Encoding UTF8
  Write-Host "  [ok ] README-DEV.txt (предупреждение про dev-сборку)" -ForegroundColor Yellow
}

# === Считаем размер staging ===
Write-Host ""
$total = (Get-ChildItem $staging -Recurse -File | Measure-Object Length -Sum).Sum
$totalMB = [math]::Round($total/1MB, 1)
$totalFiles = (Get-ChildItem $staging -Recurse -File).Count
$mode = if ($Full) { 'Full (с исходниками)' } else { 'Lean (чистый)' }
$channel = if ($DevBuild) { 'DEV' } else { 'RELEASE' }
Write-Host "Итого: $totalFiles файлов, $totalMB МБ · режим: $mode · канал: $channel · версия: $version$(if($gitCommit){' · '+$gitCommit})" -ForegroundColor Cyan

# === Манифест целостности (тревожный датчик подмены программы) ===
# Хешируем только исполняемую/служебную поверхность (.ps1/.bat/.html в dashboard/ и корне) —
# то, что реально запускается/отдаётся. Данные (clients/, *.jsonl, master.dat, ai-config.json,
# portable/) НЕ хешируем: им положено меняться, а portable/ слишком большой для проверки на старте.
try {
  $stagingDash = Join-Path $staging 'dashboard'
  $progFiles = @()
  if (Test-Path $stagingDash) { $progFiles += Get-ChildItem $stagingDash -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -in '.ps1', '.bat', '.html' } }
  $progFiles += Get-ChildItem $staging -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -in '.ps1', '.bat' }
  $imap = [ordered]@{}
  foreach ($f in ($progFiles | Sort-Object FullName -Unique)) {
    $rel = $f.FullName.Substring($staging.TrimEnd('\', '/').Length).TrimStart('\', '/')
    $imap[$rel] = (Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash
  }
  $integrity = [ordered]@{ generated = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'); version = $version; files = $imap }
  ($integrity | ConvertTo-Json -Depth 4) | Set-Content -Path (Join-Path $stagingDash 'integrity.json') -Encoding UTF8
  Write-Host "  [ok ] integrity.json — $($imap.Count) программных файлов захешировано" -ForegroundColor Green
} catch { Write-Host "  [warn] не смог сгенерировать integrity.json: $($_.Exception.Message)" -ForegroundColor Yellow }

# === Упаковка в zip ===
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }
$zipPath = Join-Path $OutDir "$stagingName.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

# === FAIL-CLOSED скан секретов (audit Codex P2 + Fable-аудит P1): падаем, если в staging остался приватный материал. ===
# master-profile.json (личные реквизиты мастера) и *.bak (резервы price/profile с ФИО/QR) — тоже приватны.
$secretPatterns = @('private-key*.xml', 'gen-license.ps1', '*.token', 'master-profile.json', '*.bak', 'master-auth.json', 'backup-config.json')
$secretLeaks = @()
foreach ($pat in $secretPatterns) { $secretLeaks += @(Get-ChildItem -Path $staging -Recurse -File -Filter $pat -ErrorAction SilentlyContinue) }
$secretLeaks += @(Get-ChildItem -Path $staging -Recurse -Directory -Filter 'license-authority' -ErrorAction SilentlyContinue)
$secretLeaks += @(Get-ChildItem -Path $staging -Recurse -Directory -Filter 'issued' -ErrorAction SilentlyContinue)
if ($secretLeaks.Count -gt 0) {
  Write-Host "✗ СБОРКА ОСТАНОВЛЕНА: в staging найден приватный/лицензионный материал:" -ForegroundColor Red
  $secretLeaks | ForEach-Object { Write-Host ("    " + $_.FullName) -ForegroundColor Red }
  throw "Приватный материал попал в staging — не пакуем zip (защита от утечки приватного ключа/генератора лицензий/личных данных мастера)."
}
# Fable-аудит P1: убедиться, что личные поля мастера не остались в staged price.json (двойная защита).
$priceCheck = Join-Path $staging 'dashboard/price.json'
if (Test-Path $priceCheck) {
  try {
    $pchk = Get-Content -LiteralPath $priceCheck -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($pchk.PSObject.Properties['мастер'] -or $pchk.PSObject.Properties['оплата']) {
      throw "RELEASE: в staged price.json остались личные поля мастера (мастер/оплата) — СТОП (защита от утечки ФИО/платёжного QR)."
    }
  } catch { if ($_.Exception.Message -like 'RELEASE:*') { throw } }
}
# RELEASE-гейт: проверяем, что dev-разблокировки нет и канал запечён.
if (-not $DevBuild) {
  if (Test-Path (Join-Path $staging 'dashboard/dev.flag')) { throw "RELEASE-сборка содержит dev.flag — СТОП." }
  $srvCheck = [IO.File]::ReadAllText((Join-Path $staging 'dashboard/server.ps1'))
  # Проверяем именно строку-ПРИСВОЕНИЕ (anchored), а не литералы 'dev' в коде Apply-Update.
  if ($srvCheck -match '(?m)^\$script:buildChannel = ''dev''$') { throw "RELEASE-сборка: канал не запечён в 'release' — СТОП." }
  # Юр-фикс (после всей сборки): вынести из ПРОДАВАЕМОЙ флешки тулзы, запрещённые к redistribution.
  # Источник №2 ([2/6]) копирует flash-staging/portable целиком (с уже распакованными SysinternalsSuite/HWiNFO),
  # поэтому удаляем ИМЕННО ЗДЕСЬ — после сборки портейбла, перед упаковкой.
  $portStaged = Join-Path $staging 'dashboard/portable'
  foreach ($noShip in @('SysinternalsSuite', 'HWiNFO')) {
    $np = Join-Path $portStaged $noShip
    if (Test-Path $np) { Remove-Item $np -Recurse -Force -ErrorAction SilentlyContinue; Write-Host "  [release-legal] убрал папку (нельзя redistribute): $noShip" -ForegroundColor Yellow }
  }
  # ...и сами zip-архивы (их тоже распространять нельзя): SysinternalsSuite.zip, hwi*.zip
  Get-ChildItem $portStaged -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -match '^(SysinternalsSuite|hwi).*\.zip$' } | ForEach-Object { Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue; Write-Host "  [release-legal] убрал архив: $($_.Name)" -ForegroundColor Yellow }
  # Fail-closed: ничего из запрещённого не осталось в portable (ни папок, ни архивов).
  $leftover = @(Get-ChildItem $portStaged -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Name -match 'Sysinternals|HWiNFO|^hwi.*\.zip$' -or $_.FullName -match 'SysinternalsSuite|\\HWiNFO\\' })
  if ($leftover.Count -gt 0) { $leftover | ForEach-Object { Write-Host "    LEFT: $($_.FullName)" -ForegroundColor Red }; throw "RELEASE-сборка: запрещённое к redistribution осталось в portable — СТОП." }
}

Write-Host ""
Write-Host "Упаковываю в zip... (может занять минуту)" -ForegroundColor Yellow
if (-not $DryRun) {
  Compress-Archive -Path "$staging/*" -DestinationPath $zipPath -CompressionLevel Optimal -Force
  $zipSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 1)
  Write-Host ""
  Write-Host "✓ Готово: $zipPath ($zipSize МБ)" -ForegroundColor Green
} else {
  Write-Host "[dry-run] zip пропущен" -ForegroundColor DarkYellow
}

# === Чистим staging ===
Write-Host ""
Write-Host "Очистка staging..." -ForegroundColor DarkGray
Remove-Item $staging -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "=== Сборка завершена ===" -ForegroundColor Cyan
Write-Host "Распакуй zip на чистую флешку — она готова к работе." -ForegroundColor Green
Write-Host ""
