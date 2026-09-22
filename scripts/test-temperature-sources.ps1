# Offline regression tests: load only sensor functions, never start the server.
$ErrorActionPreference = 'Stop'
$srv = Join-Path $PSScriptRoot '../dashboard/server.ps1'
$tokens = $null; $errors = $null
$ast = [System.Management.Automation.Language.Parser]::ParseFile($srv, [ref]$tokens, [ref]$errors)
if ($errors.Count) { throw ($errors | Out-String) }
foreach ($name in @('Get-LHMWebTemps', 'Get-Temps', 'Select-CpuTemperature')) {
  $fn = $ast.Find({ param($n) $n -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $n.Name -eq $name }, $true)
  if ($fn) { . ([scriptblock]::Create($fn.Extent.Text)) }
}
$script:fail = 0
function Check($name, $ok) {
  if ($ok) { Write-Host "PASS $name" } else { Write-Host "FAIL $name"; $script:fail++ }
}
# All OS/network access in the extracted functions is replaced with fixtures.
function Get-Process { return $null }
function Test-Path { return $false }
function Get-CimInstance { return [pscustomobject]@{ CurrentTemperature = 2902 } }
function Invoke-RestMethod { return $script:webFixture }
$script:lhm = $null
$r = Get-Temps
Check 'ACPI thermal zone (17 C) must not be labelled CPU' ($null -eq $r.cpu -and $null -eq $r.cpuSrc)
function Sensor($name, $value) { return [pscustomobject]@{ Name = $name; Value = $value; SensorType = 'Temperature' } }
function Cpu($sensors) {
  $hw = [pscustomobject]@{ HardwareType = 'Cpu'; Name = 'Fixture CPU'; Sensors = $sensors }
  $hw | Add-Member -MemberType ScriptMethod -Name Update -Value {}
  return $hw
}
$script:lhm = [pscustomobject]@{ Hardware = @((Cpu @((Sensor 'CPU Core #1 Distance to TjMax' 17)))) }
$r = Get-Temps
Check 'Distance to TjMax (17) is not CPU temperature' ($null -eq $r.cpu)
$script:lhm = [pscustomobject]@{ Hardware = @((Cpu @((Sensor 'CPU Package' 62), (Sensor 'CPU Core #1 Distance to TjMax' 83)))) }
$r = Get-Temps
Check 'Package temperature wins over distance-to-limit' ($r.cpu -eq 62)
$script:lhm = [pscustomobject]@{ Hardware = @((Cpu @((Sensor 'Core (Tdie)' 51), (Sensor 'Core (Tctl)' 71)))) }
$r = Get-Temps
Check 'AMD Tdie preferred to control temperature with offset' ($r.cpu -eq 51)
$script:lhm = [pscustomobject]@{ Hardware = @((Cpu @((Sensor 'CPU Package' 17)))) }
$r = Get-Temps
Check 'Actual package reading is not arbitrarily clamped' ($r.cpu -eq 17)
function WebFixture($values) {
  return [pscustomobject]@{ Text = 'PC'; Children = @([pscustomobject]@{ Text = 'AMD Ryzen fixture'; Children = @([pscustomobject]@{ Text = 'Temperatures'; Children = $values }) }) }
}
$script:webFixture = WebFixture @([pscustomobject]@{ Text = 'Core (Tdie)'; Value = '51.5 C' }, [pscustomobject]@{ Text = 'Core (Tctl)'; Value = '71.5 C' })
$r = Get-LHMWebTemps
Check 'Web selection agrees with DLL: Tdie before Tctl' ($r.cpu -eq 52)
$script:webFixture = WebFixture @([pscustomobject]@{ Text = 'CPU Package'; Value = '62,5 C' }, [pscustomobject]@{ Text = 'Core Max'; Value = '59 C' })
$r = Get-LHMWebTemps
Check 'Web package preferred to first traversal match; comma decimal accepted' ($r.cpu -eq 62)
$script:webFixture = WebFixture @([pscustomobject]@{ Text = 'CPU Package'; Value = '-' }, [pscustomobject]@{ Text = 'CPU Core #1 Distance to TjMax'; Value = '17 C' })
$r = Get-LHMWebTemps
Check 'Unavailable package and distance-only web data produce no CPU reading' ($null -eq $r.cpu)
if ($script:fail) { exit 1 }
