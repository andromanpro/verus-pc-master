# test-agent-invariants.ps1 — офлайн-проверка инвариантов Verus Hand (без сети, без listener).
# Dot-source'ит server.ps1 -NoListen и проверяет «закрытый мир»: набор инструментов агента,
# закрытость enum run_heal (корень обязательного теста 5), no-arg read-tools, dedup, nonce.
# Запуск:  powershell -NoProfile -ExecutionPolicy Bypass -File scripts\test-agent-invariants.ps1
# Exit 0 = чисто, 1 = есть провал.
$ErrorActionPreference = 'Stop'
$srv = Join-Path $PSScriptRoot '..\dashboard\server.ps1'
. $srv -NoListen

$fail = 0
function Check($name, $cond) {
  if ($cond) { Write-Host "  OK  $name" -ForegroundColor Green }
  else { Write-Host "  FAIL $name" -ForegroundColor Red; $script:fail++ }
}

Write-Host "Verus Hand — инварианты закрытого мира"

# 1. agentExposable — ровно ожидаемый набор; запретные write НЕ присутствуют.
$keys = @($script:agentExposable.Keys)
$expectedRead = @('get_metrics', 'get_disk_smart', 'get_event_errors', 'get_heal_preview',
  'get_debloat_inventory', 'get_installed_apps', 'get_startup_items', 'get_big_items', 'get_net_test')
$expectedTools = @($expectedRead) + @('run_heal', 'run_debloat', 'suggest_backup')
Check "agentExposable: точный разрешённый набор из 12 инструментов" (@(Compare-Object $expectedTools $keys).Count -eq 0)
foreach ($name in $expectedRead) {
  Check "$name остаётся read" ($script:agentExposable[$name].kind -eq 'read')
}
Check "есть базовые read + run_heal + run_debloat + suggest_backup" (
  ($keys -contains 'get_metrics') -and ($keys -contains 'get_disk_smart') -and
  ($keys -contains 'get_event_errors') -and ($keys -contains 'get_heal_preview') -and
  ($keys -contains 'get_debloat_inventory') -and ($keys -contains 'run_heal') -and
  ($keys -contains 'run_debloat') -and ($keys -contains 'suggest_backup'))
Check "suggest_backup kind=suggest (НЕ write — ничего не исполняет)" ($script:agentExposable['suggest_backup'].kind -eq 'suggest')
foreach ($forbidden in 'cleanup','restore','backup','run_powershell','exec','shell','eval','run_cleanup','run_backup') {
  Check "агенту НЕ доступен '$forbidden'" (-not ($keys -contains $forbidden))
}

# 2. run_heal enum закрыт (корень теста 5).
$enum = @($script:agentExposable['run_heal'].enum)
Check "run_heal enum = ровно 4 значения (Фаза 2: +net-reset +winsxs-clean)" ($enum.Count -eq 4)
Check "run_heal enum = sfc/winupd/net/winsxs" (($enum -contains 'sfc-dism') -and ($enum -contains 'winupd-reset') -and ($enum -contains 'net-reset') -and ($enum -contains 'winsxs-clean'))
Check "run_heal enum НЕ содержит debloat" (-not ($enum -contains 'debloat'))
Check "run_heal enum НЕ содержит cleanup" (-not ($enum -contains 'cleanup'))

# 3. Build-AgentTools — точный набор function-tools; read без required; run_heal с enum в схеме.
$tools = @(Build-AgentTools)
Check "Build-AgentTools: точные имена без дублей" ($tools.Count -eq $expectedTools.Count -and @(Compare-Object $expectedTools @($tools | ForEach-Object { $_.function.name })).Count -eq 0)
# suggest_backup: kind suggest, без required-параметров (только optional reason)
$sb = $tools | Where-Object { $_.function.name -eq 'suggest_backup' } | Select-Object -First 1
Check "suggest_backup: нет required-параметров" (@($sb.function.parameters.required).Count -eq 0)
# run_debloat: categories — массив с enum, без mail/onedrive
$rd = $tools | Where-Object { $_.function.name -eq 'run_debloat' } | Select-Object -First 1
Check "run_debloat: required=categories" (@($rd.function.parameters.required) -contains 'categories')
$catEnum = @($rd.function.parameters.properties['categories'].items.enum)
Check "run_debloat categories enum без mail/onedrive" (($catEnum -notcontains 'mail') -and ($catEnum -notcontains 'onedrive') -and ($catEnum -contains 'bing') -and ($catEnum -contains 'xbox'))
# Layer 2 для debloat: category allow-list
Check "Test-AgentCategoryAllowed: bing разрешён"     (Test-AgentCategoryAllowed 'bing')
Check "Test-AgentCategoryAllowed: xbox разрешён"     (Test-AgentCategoryAllowed 'xbox')
Check "Test-AgentCategoryAllowed: mail ОТКЛОНЁН"     (-not (Test-AgentCategoryAllowed 'mail'))
Check "Test-AgentCategoryAllowed: onedrive ОТКЛОНЁН" (-not (Test-AgentCategoryAllowed 'onedrive'))
Check "Test-AgentCategoryAllowed: левая категория ОТКЛОНЕНА" (-not (Test-AgentCategoryAllowed 'rm-rf-all'))
$rh = $tools | Where-Object { $_.function.name -eq 'run_heal' } | Select-Object -First 1
Check "run_heal: required=operation" (@($rh.function.parameters.required) -contains 'operation')
$schemaEnum = @($rh.function.parameters.properties['operation'].enum)
Check "run_heal schema enum = 4 (sfc/winupd/net/winsxs), без debloat" (($schemaEnum.Count -eq 4) -and ($schemaEnum -contains 'sfc-dism') -and ($schemaEnum -contains 'winupd-reset') -and ($schemaEnum -contains 'net-reset') -and ($schemaEnum -contains 'winsxs-clean') -and ($schemaEnum -notcontains 'debloat'))
$gm = $tools | Where-Object { $_.function.name -eq 'get_metrics' } | Select-Object -First 1
Check "get_metrics: нет required-параметров" (@($gm.function.parameters.required).Count -eq 0)

# 4. get_heal_preview отдаёт ТОЛЬКО разрешённые операции (не winsxs/debloat).
$prev = Invoke-AgentReadTool 'get_heal_preview'
$opNames = @($prev.operations | ForEach-Object { $_.name })
Check "get_heal_preview = только разрешённый enum (4)" (($opNames.Count -eq 4) -and ($opNames -notcontains 'debloat'))

# 4b. Runtime-граница исполнения (layer 2, корень теста 5): out-of-enum op отклоняется
#     БЕЗ зависимости от модели. Test-AgentOpAllowed — то, что Run-AgentLoop вызывает на write.
Check "Test-AgentOpAllowed: sfc-dism разрешён"      (Test-AgentOpAllowed 'run_heal' 'sfc-dism')
Check "Test-AgentOpAllowed: winupd-reset разрешён"  (Test-AgentOpAllowed 'run_heal' 'winupd-reset')
Check "Test-AgentOpAllowed: net-reset разрешён (Фаза 2)" (Test-AgentOpAllowed 'run_heal' 'net-reset')
Check "Test-AgentOpAllowed: winsxs-clean разрешён (Фаза 2)" (Test-AgentOpAllowed 'run_heal' 'winsxs-clean')
Check "Test-AgentOpAllowed: debloat ОТКЛОНЁН"       (-not (Test-AgentOpAllowed 'run_heal' 'debloat'))
Check "Test-AgentOpAllowed: cleanup ОТКЛОНЁН"       (-not (Test-AgentOpAllowed 'run_heal' 'cleanup'))
Check "Test-AgentOpAllowed: пустой op ОТКЛОНЁН"     (-not (Test-AgentOpAllowed 'run_heal' ''))

# 5. Dedup tool_calls — дубль id = жёсткая ошибка.
$dupThrew = $false
try { Get-DedupToolCalls @(@{ id='a'; function=@{name='get_metrics'} }, @{ id='a'; function=@{name='get_metrics'} }) }
catch { $dupThrew = $true }
Check "Get-DedupToolCalls бросает на дубле id" $dupThrew

# 6. New-ConfirmNonce — 48 hex (24 байта).
$n = New-ConfirmNonce
Check "New-ConfirmNonce = 48 hex" ($n -match '^[0-9a-f]{48}$')

# 7. Нет активной сессии → active=false.
$pub = Get-AgentSessionPublic
Check "пустая сессия → active=false" ($pub.active -eq $false)

Write-Host ""
if ($fail -gt 0) { Write-Host "РЕЗУЛЬТАТ: FAIL ($fail)" -ForegroundColor Red; exit 1 }
Write-Host "РЕЗУЛЬТАТ: чисто" -ForegroundColor Green
exit 0
