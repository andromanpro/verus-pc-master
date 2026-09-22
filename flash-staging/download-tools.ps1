<#
  download-tools.ps1 - auto-download the honest free PC-master toolkit into .\portable\
  Idempotent: existing files are skipped unless -Force is passed.
  ASCII-only source on purpose (PowerShell 5.1 + Cyrillic folder path is fine: path comes from $PSScriptRoot).
  Run:
    powershell -ExecutionPolicy Bypass -File .\download-tools.ps1
    powershell -ExecutionPolicy Bypass -File .\download-tools.ps1 -Force
#>
param([switch]$Force)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ErrorActionPreference = 'Stop'
$ua = 'pc-master-kit'

$dest = Join-Path $PSScriptRoot 'portable'
New-Item -ItemType Directory -Force -Path $dest | Out-Null

$manifest = @()
function Save-File($name, $url, $outName) {
    $out = Join-Path $dest $outName
    if ((Test-Path $out) -and -not $Force) {
        Write-Host "[skip] $name (exists: $outName)"
        $script:manifest += [pscustomobject]@{ tool=$name; file=$outName; url=$url; status='skip' }
        return
    }
    try {
        Write-Host "[get ] $name -> $outName"
        Invoke-WebRequest -Uri $url -OutFile $out -Headers @{ 'User-Agent'=$ua } -UseBasicParsing
        $size = [math]::Round((Get-Item $out).Length/1MB,2)
        Write-Host "       ok ($size MB)"
        $script:manifest += [pscustomobject]@{ tool=$name; file=$outName; url=$url; status="ok ${size}MB" }
    } catch {
        Write-Host "       FAIL: $($_.Exception.Message)" -ForegroundColor Red
        $script:manifest += [pscustomobject]@{ tool=$name; file=$outName; url=$url; status="FAIL" }
    }
}

function Save-GitHubLatest($name, $repo, $assetRegex, $outName) {
    try {
        $rel = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases/latest" -Headers @{ 'User-Agent'=$ua } -UseBasicParsing
        $asset = $rel.assets | Where-Object { $_.name -match $assetRegex } | Select-Object -First 1
        if (-not $asset) { throw "no asset matching /$assetRegex/ in $repo $($rel.tag_name)" }
        $ext = [System.IO.Path]::GetExtension($asset.name)
        Save-File $name $asset.browser_download_url ($outName + $ext)
    } catch {
        Write-Host "[gh  ] $name FAIL: $($_.Exception.Message)" -ForegroundColor Red
        $script:manifest += [pscustomobject]@{ tool=$name; file=$outName; url="github:$repo"; status="FAIL" }
    }
}

Write-Host "Target: $dest`n"

# --- Bootloader ---
Save-GitHubLatest 'Ventoy'                      'ventoy/Ventoy' 'ventoy-[0-9.]+-windows\.zip$' 'ventoy-windows'
# --- Drivers: SDIO is LINK-ONLY (SourceForge 'latest' returns an HTML page, not the file) ---
# --- Disk health/speed (also pre-copied from neighbor; skipped if present) ---
Save-File         'CrystalDiskInfo (portable)'  'https://sourceforge.net/projects/crystaldiskinfo/files/latest/download' 'CrystalDiskInfo-portable.zip'
Save-File         'CrystalDiskMark (portable)'  'https://sourceforge.net/projects/crystaldiskmark/files/latest/download' 'CrystalDiskMark-portable.zip'
# --- Hardware monitor (open-source) ---
Save-GitHubLatest 'LibreHardwareMonitor'        'LibreHardwareMonitor/LibreHardwareMonitor' '\.zip$' 'LibreHardwareMonitor'
# --- Sysinternals: НЕ бандлим (EULA запрещает перераспространение; коммерческое ИСПОЛЬЗОВАНИЕ ок,
#     но класть в продаваемый комплект нельзя). Мастер качает сам с download.sysinternals.com.
#     См. LINK-ONLY ниже. То же по HWiNFO (free только для личного; bundle только с письменным согласием).

# --- YouTube/Discord throttling-fix (DPI bypass — local userspace tools) ---
# GoodbyeDPI: open-source TLS fragmentation, ставится как Windows-сервис; стабильно много лет
Save-GitHubLatest 'GoodbyeDPI'                  'ValdikSS/GoodbyeDPI' '\.zip$' 'goodbyedpi'
# Zapret (Russian-ru-pack Flowseal): готовые .bat под YouTube/Discord, service-install в комплекте
Save-GitHubLatest 'zapret-discord-youtube'      'Flowseal/zapret-discord-youtube' '\.zip$' 'zapret-discord-youtube'
# SpoofDPI / ByeDPI / PowerTunnel — на 2026-05 Windows-binary в стабильных релизах нет.
# Если нужен userspace вариант без admin — см. LINK-ONLY раздел ниже.

$manifestPath = Join-Path $dest '_manifest.csv'
$manifest | Export-Csv -Path $manifestPath -NoTypeInformation -Encoding UTF8
Write-Host "`nManifest: $manifestPath"
$manifest | Format-Table -AutoSize

Write-Host "`n=== LINK-ONLY (download on the OFFICIAL site; version-pinned / installer / fresh bases) ==="
@"
Sysinternals Suite (Autoruns/ProcExp/TCPView) : https://download.sysinternals.com/files/SysinternalsSuite.zip  (НЕ бандлить — мастер качает сам)
Hiren's BootCD PE (rescue ISO) : https://www.hirensbootcd.org/download/
Windows 10/11 ISO              : https://www.microsoft.com/software-download
MemTest86+ (boot)             : https://memtest.org/
HWiNFO (portable)             : https://www.hwinfo.com/download/   (pick the Portable zip)
CPU-Z (zip = portable)        : https://www.cpuid.com/softwares/cpu-z.html
GPU-Z                          : https://www.techpowerup.com/gpuz/
SDIO drivers (no adware)      : https://www.snappy-driver-installer.org/   (or https://sdi-tool.org/)
BleachBit (portable)          : https://www.bleachbit.org/download/windows
7-Zip                          : https://www.7-zip.org/
OCCT (stress test)            : https://www.ocbase.com/download
Victoria (disk diag/repair)   : https://hdd.by/victoria/   (ONLY here; file: https://hdd.by/Victoria/Victoria537.zip)
Rufus (1 ISO -> USB)          : https://rufus.ie/
Ninite (clean batch install)  : https://ninite.com/
Unchecky (block bundleware)   : https://unchecky.com/
DDU (clean GPU driver removal): https://www.wagnardsoft.com/display-driver-uninstaller-ddu
WinDirStat (what eats space)  : https://windirstat.net/
Everything (instant file find): https://www.voidtools.com/
System Informer (task manager): https://systeminformer.sourceforge.io/
O&O ShutUp10++ (telemetry off): https://www.oo-software.com/en/shutup10
VLC                           : https://www.videolan.org/
Notepad++                     : https://notepad-plus-plus.org/
Data recovery (write recovered files to ANOTHER drive!):
  TestDisk / PhotoRec         : https://www.cgsecurity.org/
  DMDE (free edition)         : https://dmde.com/
  Windows File Recovery (MS)  : https://apps.microsoft.com/detail/9n26s50ln705
  R.saver (NON-commercial!)   : https://rlab.ru/tools/rsaver.html
  Recuva (watch installer)    : https://www.ccleaner.com/recuva
YouTube/Discord — userspace без admin (если GoodbyeDPI/zapret недоступны):
  PowerTunnel (GUI)           : https://github.com/krlvm/PowerTunnel/releases   (Windows .exe)
  ByeDPI (для Android)        : https://github.com/dovecoteescapee/ByeDPIAndroid

Antivirus scanners (download FRESH each job, bases are inside):
  Microsoft Safety Scanner    : https://learn.microsoft.com/ru-ru/defender-endpoint/safety-scanner-download
  ESET Online Scanner         : https://www.eset.com/int/home/online-scanner/
  Malwarebytes (Free)         : https://www.malwarebytes.com/
  Kaspersky KVRT              : https://www.kaspersky.ru/downloads/free-virus-removal-tool
  Dr.Web CureIt!              : https://free.drweb.ru/cureit/
"@ | Write-Host
