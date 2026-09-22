# Диагностика ПК -> неон HTML-дашборд. Сбор ТОЛЬКО ЧТЕНИЕ.
# Запусти от админа для полного SMART (износ/температура/часы).
param([switch]$NoOpen, [string]$OutDir = ([Environment]::GetFolderPath('Desktop')))
$OutputEncoding = [System.Text.Encoding]::UTF8
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
function TryGet($b, $d = $null) { try { & $b } catch { $d } }

Write-Host "Снимаю данные с ПК..." -ForegroundColor Cyan

$os  = TryGet { Get-CimInstance Win32_OperatingSystem }
$cs  = TryGet { Get-CimInstance Win32_ComputerSystem }
$cpuRaw = @(TryGet { Get-CimInstance Win32_Processor } @())

$cpu = $null
if ($cpuRaw.Count) {
  $cpu = [ordered]@{
    name    = $cpuRaw[0].Name.Trim()
    cores   = ($cpuRaw | Measure-Object NumberOfCores -Sum).Sum
    threads = ($cpuRaw | Measure-Object NumberOfLogicalProcessors -Sum).Sum
    load    = [int](($cpuRaw | Measure-Object LoadPercentage -Average).Average)
  }
}

$mem = $null
if ($os -and $cs) {
  $tot  = [math]::Round($cs.TotalPhysicalMemory/1GB,1)
  $free = [math]::Round(($os.FreePhysicalMemory*1KB)/1GB,1)
  $mods = @(TryGet { Get-CimInstance Win32_PhysicalMemory } @())
  $mem = [ordered]@{
    totalGB = $tot
    usedPct = if ($tot) { [int](100*($tot-$free)/$tot) } else { 0 }
    slots   = @($mods).Count
    speed   = ($mods | Select-Object -First 1).Speed
  }
}

$pd = @()
$phys = TryGet { Get-PhysicalDisk } $null
if ($phys) {
  foreach ($d in @($phys)) {
    $rc = $d | Get-StorageReliabilityCounter -ErrorAction SilentlyContinue
    $pd += [ordered]@{
      name = $d.FriendlyName; media = "$($d.MediaType)"; sizeGB = [math]::Round($d.Size/1GB,0)
      health = "$($d.HealthStatus)"; wear = $rc.Wear; tempC = $rc.Temperature; hours = $rc.PowerOnHours
      removable = ($d.BusType -eq 'USB' -or $d.BusType -eq 'SD')
    }
  }
}

$ld = @(TryGet { Get-CimInstance Win32_LogicalDisk -Filter 'DriveType=3' } @()) | ForEach-Object {
  [ordered]@{ drive = $_.DeviceID; sizeGB = [math]::Round($_.Size/1GB,1); freeGB = [math]::Round($_.FreeSpace/1GB,1)
              usedPct = if ($_.Size) { [int](100*($_.Size-$_.FreeSpace)/$_.Size) } else { 0 } }
}

$perf = $null
$pc = TryGet { Get-Counter '\Processor(_Total)\% Processor Time' -SampleInterval 1 -MaxSamples 3 -ErrorAction Stop } $null
if ($pc) { $perf = [ordered]@{ cpuPct = [int](($pc.CounterSamples | Measure-Object CookedValue -Average).Average) } }

$top = @(TryGet { Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 6 } @()) | ForEach-Object {
  [ordered]@{ name = $_.ProcessName; ramMB = [math]::Round($_.WorkingSet64/1MB,0) }
}

$net = @()
$na = TryGet { Get-NetAdapter -Physical | Where-Object Status -eq 'Up' } $null
if ($na) {
  foreach ($a in @($na)) {
    $ip = TryGet { (Get-NetIPAddress -InterfaceIndex $a.ifIndex -AddressFamily IPv4 -ErrorAction Stop).IPAddress } ''
    $net += [ordered]@{ name = $a.Name; link = "$($a.LinkSpeed)"; ip = (@($ip) -join ', ') }
  }
}

# Composite health score
$score = 100
foreach ($d in $pd) { if ($d.removable) { continue }; if ($d.health -and $d.health -ne 'Healthy') { $score -= 30 }; if ($d.wear -and $d.wear -gt 50) { $score -= 15 } }
foreach ($d in $ld) { if ($d.usedPct -ge 90) { $score -= 15 } elseif ($d.usedPct -ge 80) { $score -= 7 } }
if ($score -lt 0) { $score = 0 }

$data = [ordered]@{
  computer = [ordered]@{ host = $env:COMPUTERNAME; os = $os.Caption; model = "$($cs.Manufacturer) $($cs.Model)";
                         uptimeH = if ($os) { [math]::Round(((Get-Date)-$os.LastBootUpTime).TotalHours,1) } else { 0 } }
  cpu = $cpu; memory = $mem; disksPhysical = $pd; disksLogical = $ld; perf = $perf; top = $top; network = $net
  isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
  score = $score; collectedAt = (Get-Date).ToString('yyyy-MM-dd HH:mm')
}
$json = $data | ConvertTo-Json -Depth 6

$html = @"
<!doctype html><html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Диагностика ПК</title>
<style>
 :root{--bg:#0A0E17;--card:rgba(21,29,48,.72);--bd:#26314d;--cy:#22d3ee;--mt:#34d399;--pk:#f72585;--am:#fbbf24;--rs:#fb7185;--pu:#a855f7;--tx:#f8fafc;--mu:#94a3b8}
 *{box-sizing:border-box;margin:0;padding:0}
 body{background:var(--bg);color:var(--tx);font-family:Segoe UI,Roboto,Arial,sans-serif;min-height:100vh;overflow-x:hidden}
 .bg{position:fixed;inset:0;z-index:-1;background:
   radial-gradient(60vw 60vw at 12% -10%,rgba(34,211,238,.10),transparent 60%),
   radial-gradient(55vw 55vw at 110% 115%,rgba(247,37,133,.10),transparent 60%),
   linear-gradient(transparent 95%,rgba(148,163,184,.05) 96%) 0 0/100% 32px,
   linear-gradient(90deg,transparent 95%,rgba(148,163,184,.05) 96%) 0 0/32px 100%}
 header{padding:34px 40px 10px}
 .eyebrow{font-family:Consolas,monospace;color:var(--cy);letter-spacing:3px;font-size:13px}
 h1{font-size:30px;margin-top:6px;font-weight:800}
 .meta{color:var(--mu);font-size:14px;margin-top:6px}
 main{padding:18px 40px 40px}
 .hero{display:flex;align-items:center;gap:34px;background:var(--card);border:1px solid var(--bd);border-radius:18px;padding:26px 30px;margin-bottom:22px;backdrop-filter:blur(8px);position:relative;overflow:hidden}
 .hero .spin{position:absolute;right:-60px;top:-60px;width:240px;height:240px;border-radius:50%;background:conic-gradient(from 0deg,transparent,rgba(34,211,238,.25),transparent 60%);animation:spin 8s linear infinite}
 @keyframes spin{to{transform:rotate(360deg)}}
 .verdict{font-size:24px;font-weight:800}.verdict small{display:block;font-size:14px;font-weight:400;color:var(--mu);margin-top:6px}
 .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:18px}
 .card{background:var(--card);border:1px solid var(--bd);border-radius:16px;padding:20px 22px;backdrop-filter:blur(8px);transition:.3s;position:relative}
 .card:hover{border-color:var(--cy);box-shadow:0 0 22px rgba(34,211,238,.18)}
 .card h2{font-size:13px;letter-spacing:2px;text-transform:uppercase;color:var(--mu);font-family:Consolas,monospace;margin-bottom:14px}
 .g{position:relative;width:120px;height:120px;flex:0 0 auto}
 .g svg{width:120px;height:120px}
 .gt{stroke:#1b2740;stroke-width:9;fill:none}
 .gv{stroke:currentColor;stroke-width:9;fill:none;stroke-linecap:round;transform:rotate(-90deg);transform-origin:50% 50%;transition:stroke-dashoffset 1.6s cubic-bezier(.2,.8,.2,1);filter:drop-shadow(0 0 6px currentColor)}
 .gc{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
 .gn{font-size:30px;font-weight:800;font-family:Consolas,monospace}.gl{font-size:11px;color:var(--mu)}
 .row{display:flex;align-items:center;gap:18px}
 .disk{display:flex;align-items:center;gap:16px;padding:12px 0;border-top:1px solid rgba(148,163,184,.12)}
 .disk:first-of-type{border-top:0}
 .badge{font-family:Consolas,monospace;font-size:11px;padding:2px 8px;border-radius:6px;border:1px solid var(--bd)}
 .dt{flex:1}.dt b{font-size:15px}.dt span{display:block;color:var(--mu);font-size:12px;margin-top:3px}
 .bar{height:14px;border-radius:7px;background:#1b2740;overflow:hidden;margin:6px 0 2px}
 .bar i{display:block;height:100%;width:0;border-radius:7px;transition:width 1.4s cubic-bezier(.2,.8,.2,1)}
 .lbl{display:flex;justify-content:space-between;font-size:13px}.lbl span{color:var(--mu)}
 .pbar{margin:10px 0}.pbar .lbl b{font-weight:600}
 .kv{display:flex;justify-content:space-between;padding:7px 0;border-top:1px solid rgba(148,163,184,.12);font-size:14px}
 .kv:first-child{border-top:0}.kv span{color:var(--mu)}
 footer{color:var(--mu);font-size:13px;text-align:center;padding:8px 40px 34px}
 .miniR{width:64px;height:64px;flex:0 0 auto;position:relative}
 .miniR svg{width:64px;height:64px}.miniR .gn{font-size:15px}.miniR .gl{font-size:9px}
</style></head><body>
<div class="bg"></div>
<header>
 <div class="eyebrow">ЧЕСТНАЯ ДИАГНОСТИКА</div>
 <h1>Диагностика компьютера</h1>
 <div class="meta" id="meta"></div>
</header>
<main>
 <section class="hero">
  <div class="spin"></div>
  <div class="g" id="scoreRing"></div>
  <div class="verdict" id="verdict"></div>
 </section>
 <div class="grid">
  <div class="card" id="cDisks"><h2>Накопители · здоровье</h2><div id="disks"></div></div>
  <div class="card" id="cSpace"><h2>Место на дисках</h2><div id="space"></div></div>
  <div class="card"><h2>Процессор</h2><div id="cpu"></div></div>
  <div class="card"><h2>Оперативная память</h2><div id="ram"></div></div>
  <div class="card"><h2>Что грузит память</h2><div id="top"></div></div>
  <div class="card"><h2>Система и сеть</h2><div id="sys"></div></div>
 </div>
</main>
<footer id="foot"></footer>
<script>
const DATA = $json;
var arr = function(x){ return Array.isArray(x) ? x : (x ? [x] : []); };
var na = function(v){ return (v===null||v===undefined||v==='') ? 'n/a' : v; };
function pick(p, good){ if(p===null||isNaN(p))return '#94a3b8'; var v=good?p:100-p; return v>=70?'#34d399':v>=40?'#fbbf24':'#fb7185'; }
function ring(pct,color,big,unit){
  pct = Math.max(0, Math.min(100, isNaN(pct)?0:pct));
  var r=52, c=2*Math.PI*r, off=c*(1-pct/100), cls=big?'g':'g miniR';
  return '<div class="'+cls+'" style="color:'+color+'"><svg viewBox="0 0 120 120">'
   +'<circle class="gt" cx="60" cy="60" r="52"/>'
   +'<circle class="gv" cx="60" cy="60" r="52" stroke-dasharray="'+c+'" stroke-dashoffset="'+c+'" data-off="'+off+'"/>'
   +'</svg><div class="gc"><div class="gn" data-to="'+Math.round(pct)+'">0</div>'
   +'<div class="gl">'+(unit||'')+'</div></div></div>';
}
var d=DATA;
document.getElementById('meta').textContent = na(d.computer.host)+' · '+na(d.computer.os)+' · '+d.collectedAt;
// score
var sc=d.score||0, scol=sc>=80?'#34d399':sc>=50?'#fbbf24':'#fb7185';
var sv=sc>=80?'Всё в порядке':sc>=50?'Есть к чему присмотреться':'Нужно внимание';
document.getElementById('scoreRing').innerHTML = ring(sc,scol,true,'из 100');
document.getElementById('verdict').innerHTML = sv+'<small>Общая оценка состояния ПК</small>';
// disks
var dh='';
arr(d.disksPhysical).forEach(function(x){
  var ok = (x.health==='Healthy');
  var hcol = ok?'#34d399':'#fb7185';
  var miniPct = (x.wear!==null&&x.wear!==undefined)?(100-x.wear):(ok?100:30);
  var mcol = (x.wear!==null&&x.wear!==undefined)?pick(x.wear,false):hcol;
  dh += '<div class="disk">'+ring(miniPct,mcol,false,'%')
     +'<div class="dt"><b>'+na(x.name)+'</b>'
     +'<span><span class="badge">'+na(x.media)+'</span>'+(x.removable?' <span class="badge" style="border-color:#fbbf24;color:#fbbf24">съёмный</span>':'')+' &nbsp;'+na(x.sizeGB)+' ГБ &nbsp;·&nbsp; здоровье: '+na(x.health)
     +((x.tempC!==null&&x.tempC!==undefined)?' &nbsp;·&nbsp; '+x.tempC+'°C':'')
     +((x.hours!==null&&x.hours!==undefined)?' &nbsp;·&nbsp; '+x.hours+' ч':'')+'</span></div></div>';
});
document.getElementById('disks').innerHTML = dh || '<span class="gl">нет данных</span>';
// logical space
var sp='';
arr(d.disksLogical).forEach(function(x){
  var col = x.usedPct>=90?'#fb7185':x.usedPct>=80?'#fbbf24':'#34d399';
  sp += '<div class="pbar"><div class="lbl"><b>Диск '+x.drive+'</b><span>'+x.freeGB+' ГБ свободно из '+x.sizeGB+'</span></div>'
     +'<div class="bar"><i data-w="'+x.usedPct+'" style="background:'+col+'"></i></div></div>';
});
document.getElementById('space').innerHTML = sp || '<span class="gl">нет данных</span>';
// cpu
var cp=d.cpu||{}; var cload=(d.perf&&d.perf.cpuPct!=null)?d.perf.cpuPct:(cp.load||0);
document.getElementById('cpu').innerHTML='<div class="row">'+ring(cload,pick(cload,false),false,'%')
  +'<div class="dt"><b>'+na(cp.name)+'</b><span>'+na(cp.cores)+' ядер / '+na(cp.threads)+' потоков · загрузка '+cload+'%</span></div></div>';
// ram
var m=d.memory||{};
document.getElementById('ram').innerHTML='<div class="row">'+ring(m.usedPct||0,pick(m.usedPct||0,false),false,'%')
  +'<div class="dt"><b>'+na(m.totalGB)+' ГБ</b><span>занято '+na(m.usedPct)+'% · слотов: '+na(m.slots)+(m.speed?' · '+m.speed+' МГц':'')+'</span></div></div>';
// top processes
var tp='', mx=1; arr(d.top).forEach(function(x){ if(x.ramMB>mx)mx=x.ramMB; });
arr(d.top).forEach(function(x){
  var w=Math.round(100*x.ramMB/mx);
  tp += '<div class="pbar"><div class="lbl"><b>'+na(x.name)+'</b><span>'+x.ramMB+' МБ</span></div>'
     +'<div class="bar"><i data-w="'+w+'" style="background:#22d3ee"></i></div></div>';
});
document.getElementById('top').innerHTML = tp || '<span class="gl">нет данных</span>';
// sys + net
var sy='<div class="kv"><span>Модель</span><b>'+na(d.computer.model)+'</b></div>'
  +'<div class="kv"><span>Аптайм</span><b>'+na(d.computer.uptimeH)+' ч</b></div>';
arr(d.network).forEach(function(x){ sy+='<div class="kv"><span>'+na(x.name)+'</span><b>'+na(x.ip)+' · '+na(x.link)+'</b></div>'; });
if(!d.isAdmin) sy+='<div class="kv"><span>SMART</span><b style="color:#fbbf24">запусти от админа для полных данных</b></div>';
document.getElementById('sys').innerHTML = sy;
// footer
document.getElementById('foot').innerHTML='Данные сняты прямо с этого ПК · ничего не изменено · '+d.collectedAt;
// animate
setTimeout(function(){
  document.querySelectorAll('.gv').forEach(function(el){ el.style.strokeDashoffset = el.getAttribute('data-off'); });
  document.querySelectorAll('.bar i').forEach(function(el){ el.style.width = el.getAttribute('data-w')+'%'; });
  document.querySelectorAll('.gn').forEach(function(el){
    var to=+el.getAttribute('data-to'), t0=performance.now(), dur=1400;
    function step(now){ var p=Math.min(1,(now-t0)/dur); el.textContent=Math.round(to*(1-Math.pow(1-p,3))); if(p<1)requestAnimationFrame(step); }
    requestAnimationFrame(step);
  });
}, 80);
</script></body></html>
"@

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Force -Path $OutDir | Out-Null }
$outFile = Join-Path $OutDir ("Диагностика_" + $env:COMPUTERNAME + "_" + (Get-Date -Format 'yyyy-MM-dd_HH-mm') + ".html")
[System.IO.File]::WriteAllText($outFile, $html, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Готово. Дашборд: $outFile" -ForegroundColor Green
if (-not $NoOpen) { Start-Process $outFile }
