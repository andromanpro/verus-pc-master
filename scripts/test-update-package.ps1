# Build with a disposable RSA key and synthetic private data, never the author key.
param([string]$Generator = (Join-Path $PSScriptRoot '../license-authority/make-update.ps1'))
$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch {}
$testRoot = Join-Path $env:TEMP ('verus-update-test-' + [Guid]::NewGuid().ToString('N'))
$utf8 = New-Object Text.UTF8Encoding($false)
$fail = 0
function Check($name, $ok) {
  if ($ok) { Write-Host "PASS $name" } else { Write-Host "FAIL $name"; $script:fail++ }
}
try {
  foreach ($dir in @('authority', 'dashboard', 'dashboard/portable', 'dashboard/clients', 'dashboard/clients.restore-bak-fixture', 'dist')) {
    New-Item -ItemType Directory -Path (Join-Path $testRoot $dir) -Force | Out-Null
  }
  Copy-Item -LiteralPath $Generator -Destination (Join-Path $testRoot 'authority/make-update.ps1')
  $key = New-Object Security.Cryptography.RSACryptoServiceProvider(2048)
  [IO.File]::WriteAllText((Join-Path $testRoot 'authority/private-key.xml'), $key.ToXmlString($true), $utf8)
  [IO.File]::WriteAllText((Join-Path $testRoot 'VERSION'), '9.9.9-test', $utf8)
  foreach ($name in @('server.ps1', 'index.html', 'qrcode.js')) {
    [IO.File]::WriteAllText((Join-Path $testRoot ('dashboard/' + $name)), 'fixture program', $utf8)
  }
  foreach ($name in @('master-auth.json', 'backup-config.json', 'ai-config.json', 'price.json', 'partners.json', 'future-secret.json', 'private-key.xml', 'license.token', 'old.bak', 'portable/vendor.exe', 'clients/visits.json', 'clients.restore-bak-fixture/visits.json')) {
    [IO.File]::WriteAllText((Join-Path $testRoot ('dashboard/' + $name)), 'PRIVATE-SENTINEL', $utf8)
  }
  & (Join-Path $testRoot 'authority/make-update.ps1') -OutDir (Join-Path $testRoot 'dist') | Out-Null
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $zip = [IO.Compression.ZipFile]::OpenRead((Join-Path $testRoot 'dist/verus-update-9.9.9-test.zip'))
  try {
    $entries = @{}
    foreach ($e in $zip.Entries) {
      if (-not $e.Name) { continue }
      $stream = $e.Open(); $ms = New-Object IO.MemoryStream
      try { $stream.CopyTo($ms); $entries[$e.FullName.Replace('\', '/')] = $ms.ToArray() }
      finally { $stream.Dispose(); $ms.Dispose() }
    }
    $manBytes = $entries['update.manifest']
    $man = [Text.Encoding]::UTF8.GetString($manBytes) | ConvertFrom-Json
    $expected = @('server.ps1', 'index.html', 'qrcode.js', 'VERSION')
    Check 'Only program files and baked version are in the manifest' (@(Compare-Object $expected @($man.files.PSObject.Properties.Name)).Count -eq 0)
    Check 'No private payload anywhere in the ZIP' (@($entries.Values | Where-Object { [Text.Encoding]::UTF8.GetString($_) -like '*PRIVATE-SENTINEL*' }).Count -eq 0)
    Check 'ZIP has no unmanifested files' ($entries.Count -eq $expected.Count + 2)
    Check 'Installed version matches signed manifest' ([Text.Encoding]::UTF8.GetString($entries['dashboard/VERSION']) -eq $man.version -and $man.version -eq '9.9.9-test')
    $publicKey = New-Object Security.Cryptography.RSACryptoServiceProvider
    $publicKey.FromXmlString($key.ToXmlString($false))
    $sig = [Convert]::FromBase64String([Text.Encoding]::UTF8.GetString($entries['update.manifest.sig']))
    Check 'Manifest RSA signature verifies with public key' ($publicKey.VerifyData($manBytes, 'SHA256', $sig))
    $sha = [Security.Cryptography.SHA256]::Create()
    foreach ($prop in $man.files.PSObject.Properties) {
      $actual = ($sha.ComputeHash($entries['dashboard/' + $prop.Name]) | ForEach-Object { $_.ToString('x2') }) -join ''
      Check ('File hash: ' + $prop.Name) ($actual -eq $prop.Value)
    }
  } finally { $zip.Dispose() }
  # Read the installed version through the real runtime function, with an old
  # outer VERSION file left by the initial full USB build.
  $tokens = $null; $parseErrors = $null
  $ast = [Management.Automation.Language.Parser]::ParseFile((Join-Path $PSScriptRoot '../dashboard/server.ps1'), [ref]$tokens, [ref]$parseErrors)
  if ($parseErrors.Count) { throw ($parseErrors | Out-String) }
  $fn = $ast.Find({ param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst] -and $n.Name -eq 'Get-VersionInfo' }, $true)
  . ([scriptblock]::Create($fn.Extent.Text))
  $root = Join-Path $testRoot 'dashboard'
  [IO.File]::WriteAllText((Join-Path $testRoot 'VERSION'), '0.1.0', $utf8)
  [IO.File]::WriteAllBytes((Join-Path $root 'VERSION'), $entries['dashboard/VERSION'])
  [IO.File]::WriteAllText((Join-Path $root 'VERSION-COMMIT'), 'fixture', $utf8)
  Check 'Runtime reports signed update version over old full-build version' ((Get-VersionInfo).version -eq '9.9.9-test')
  $script:buildChannel = 'release'
  [IO.File]::WriteAllText((Join-Path $root 'VERSION'), '9.9.9-dev', $utf8)
  Check 'Development version suffix cannot change release channel' ((Get-VersionInfo).channel -eq 'release')
  Remove-Item -LiteralPath (Join-Path $root 'VERSION')
  Check 'Runtime falls back to full-build version when no update is installed' ((Get-VersionInfo).version -eq '0.1.0')
  Remove-Item -LiteralPath (Join-Path $testRoot 'dashboard/server.ps1')
  $rejected = $false
  try { & (Join-Path $testRoot 'authority/make-update.ps1') -OutDir (Join-Path $testRoot 'missing-dist') | Out-Null }
  catch { $rejected = $true }
  Check 'Missing required program source rejects the build' $rejected
} finally {
  $tempRoot = [IO.Path]::GetFullPath($env:TEMP).TrimEnd('\') + '\'
  $resolved = [IO.Path]::GetFullPath($testRoot)
  if (-not $resolved.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase)) { throw 'Test cleanup escaped TEMP' }
  if (Test-Path -LiteralPath $resolved) { Remove-Item -LiteralPath $resolved -Recurse -Force }
}
if ($fail) { exit 1 }
