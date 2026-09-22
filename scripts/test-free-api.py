"""Exercise a real, isolated Free server; never invoke hardware mutations.

Starts a private copy with no tools, credentials or client data from the
developer checkout. Checks local storage and rejects unsafe requests.
"""
import http.cookiejar
import json
import os
import pathlib
import re
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')
ROOT=pathlib.Path(__file__).resolve().parents[1]
checks=[]
def check(name, ok):
    checks.append(bool(ok)); print(('PASS ' if ok else 'FAIL ')+name, flush=True)
    if not ok: raise AssertionError(name)

with tempfile.TemporaryDirectory(prefix='verus-free-api-') as temp:
    base=pathlib.Path(temp).resolve(); dash=base/'dashboard'; dash.mkdir()
    for name in ['server.ps1','index.html','qrcode.js','training-scenarios.js','price.json','partners.json','tools.json','vpn-recommendations.json']:
        shutil.copyfile(ROOT/'dashboard'/name,dash/name)
    price=json.loads((dash/'price.json').read_text(encoding='utf-8-sig'))
    price.pop('мастер',None); price.pop('оплата',None)
    (dash/'price.json').write_text(json.dumps(price),encoding='utf-8')
    (dash/'partners.json').write_text('{"contacts":[]}',encoding='utf-8')
    # Release, without dev.flag, license.token or any developer credential.
    src=(dash/'server.ps1').read_text(encoding='utf-8-sig')
    assert src.count("$script:buildChannel = 'dev'")==1
    src=src.replace("$script:buildChannel = 'dev'","$script:buildChannel = 'release'")
    (dash/'server.ps1').write_text(src,encoding='utf-8-sig')
    (base/'VERSION').write_text('0.7.0',encoding='ascii')
    with socket.socket() as sock:
        sock.bind(('127.0.0.1',0)); port=sock.getsockname()[1]
    origin='http://127.0.0.1:'+str(port)
    jar=http.cookiejar.CookieJar()
    opener=urllib.request.build_opener(urllib.request.ProxyHandler({}),urllib.request.HTTPCookieProcessor(jar))
    csrf=''
    def call(path, data=None, token=True, extra=None, client=opener):
        headers={}
        if data is not None:
            headers={'Content-Type':'application/json','Origin':origin}
            if token:headers['X-CSRF-Token']=csrf
        headers.update(extra or {})
        req=urllib.request.Request(origin+path,data=None if data is None else json.dumps(data).encode(),headers=headers)
        try:
            with client.open(req,timeout=15) as response:return response.status,json.load(response)
        except urllib.error.HTTPError as e:return e.code,json.load(e)
    log=(base/'server.log').open('wb')
    proc=subprocess.Popen(['powershell.exe','-NoProfile','-ExecutionPolicy','Bypass','-File',str(dash/'server.ps1'),'-Port',str(port),'-NoOpen'],stdout=log,stderr=log,creationflags=subprocess.CREATE_NO_WINDOW)
    try:
        for _ in range(100):
            if proc.poll() is not None:raise RuntimeError('Isolated server exited; code '+str(proc.returncode))
            try:
                with opener.open(origin+'/',timeout=1) as response:page=response.read().decode('utf-8')
                break
            except (OSError,urllib.error.URLError):time.sleep(.3)
        else:raise TimeoutError('Isolated server did not become ready')
        match=re.search(r'<meta name="csrf" content="([0-9a-f]+)"',page); assert match
        csrf=match.group(1)
        status,edition=call('/api/edition')
        check('Release without activation is Free',status==200 and edition['edition']=='free' and not edition['canActivate'])
        caps=edition['capabilities']
        check('All local capabilities are enabled',all(caps[x] for x in ['localCore','localCrm','documents','localMaintenance','aiOwnKey','personalBackup']))
        check('Unbuilt paid services are not advertised as enabled',not caps['managedAi'] and not caps['teamSync'])
        _,r=call('/api/run/cleanup',{},token=False)
        check('Cleanup without CSRF is rejected before execution',r.get('ok') is False and 'CSRF' in r.get('msg',''))
        _,r=call('/api/run/cleanup',{},extra={'Origin':'https://untrusted.example'})
        check('Cross-origin mutation is rejected',r.get('ok') is False and 'Origin' in r.get('msg',''))
        _,r=call('/api/cloud/config')
        check('Experimental cloud is unavailable in Free',r.get('unavailable') is True)
        pc='a'*12
        visit={'client':'Fixture Client','phone':'+70000000000','done':'Fixture diagnostic visit','actType':'handoff','total':100}
        _,r=call('/api/pc/save-visit?id='+pc,visit)
        if not r.get('ok'):print('Save response:',r)
        check('A local visit can be saved without license',r.get('ok') is True)
        _,history=call('/api/pc/history?id='+pc)
        check('Saved visit can be read',len(history.get('visits',[]))==1)
        _,export=call('/api/visits/export')
        check('Data export is available without subscription',export.get('ok') is not False and not export.get('authRequired'))
        _,r=call('/api/auth/set',{'new':'Fixture-Password-782!'},token=True)
        check('Free can enable password protection',r.get('ok') is True)
        anonymous=urllib.request.build_opener(urllib.request.ProxyHandler({}))
        status,r=call('/api/pc/history?id='+pc,client=anonymous)
        check('Password gate still rejects an anonymous request',status==401 and r.get('authRequired') is True)
        _,r=call('/api/auth/login',{'password':'Fixture-Password-782!'})
        check('Owner can sign in after enabling protection',r.get('ok') is True)
        status,r=call('/api/pc/history?id='+pc)
        check('Owner retains saved data after password setup',status==200 and len(r.get('visits',[]))==1)
        blobs=[x.read_bytes() for x in (dash/'clients').rglob('visits.json')]
        check('Persisted protected visits do not contain the client name',bool(blobs) and all(b'Fixture Client' not in b for b in blobs))
    finally:
        proc.terminate(); proc.wait(timeout=10);log.close()
print(str(len(checks))+' Free API checks passed')
