"""Browser regressions against current dashboard code and synthetic API fixtures.

Requires Playwright: py -3.14 -m pip install playwright
Run: py -3.14 scripts/test-ui-browser.py --channel msedge
No real API, hardware operation or customer file is accessed.
"""
import argparse
import json
import pathlib
import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')
ROOT = pathlib.Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--channel', default='msedge')
parser.add_argument('--artifacts', type=pathlib.Path)
args = parser.parse_args()
fixtures = json.loads((ROOT / 'scripts/fixtures/ui.json').read_text(encoding='utf-8'))
for endpoint, filename in [('/api/price','price.json'),('/api/partners','partners.json'),('/api/vpn-recommendations','vpn-recommendations.json')]:
    value=json.loads((ROOT / 'dashboard' / filename).read_text(encoding='utf-8-sig'))
    if endpoint == '/api/price':
        value.pop('мастер',None); value.pop('оплата',None)
    if endpoint == '/api/partners': value={'contacts':[]}
    fixtures[endpoint]=value
fixtures['/api/version']={'version':(ROOT/'VERSION').read_text().strip(),'channel':'release','dev':False}
html = (ROOT / 'dashboard/index.html').read_text(encoding='utf-8-sig')
anchor = '<script src="/qrcode.js"></script>\n<script src="/training-scenarios.js"></script>'
assert anchor in html
mock_script = """(() => {
 const fixtures = __FIXTURES__;
 localStorage.setItem('pcm_wizard_done','1');
 localStorage.setItem('pcm_profile','master');
 const originalFetch=window.fetch.bind(window);
 window.fetch=async (input, options={}) => {
   const url=new URL(typeof input==='string'?input:input.url,location.href);
   if(!url.pathname.startsWith('/api/')) return originalFetch(input,options);
   if((options.method||'GET').toUpperCase()!=='GET')
     return new Response(JSON.stringify({ok:false,error:'Test fixture blocks mutations'}),{status:403});
   const payload=fixtures[url.pathname] || {ok:false,error:'Missing test fixture'};
   return new Response(JSON.stringify(payload),{headers:{'Content-Type':'application/json'}});
 };
 if(navigator.mediaDevices){
   navigator.mediaDevices.getUserMedia=async()=>{throw new Error('Hardware access blocked in UI test');};
   navigator.mediaDevices.enumerateDevices=async()=>[];
 }
})();""".replace('__FIXTURES__', json.dumps(fixtures,ensure_ascii=False).replace('</','<\\/'))
sources = [(ROOT/'dashboard/qrcode.js').read_text(encoding='utf-8-sig'),
           (ROOT/'dashboard/training-scenarios.js').read_text(encoding='utf-8-sig'), mock_script]
html = html.replace(anchor, '\n'.join('<script>' + s + '</script>' for s in sources))
results = []

def check(label, condition):
    results.append({'check': label, 'ok': bool(condition)})
    print(('PASS ' if condition else 'FAIL ') + label)

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, channel=args.channel)
    page = browser.new_page(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    page_errors = []
    page.on('pageerror', lambda e: page_errors.append(str(e)))
    # Fulfil only local assets; unknown requests fail instead of reaching a live server.
    def route(req):
        path = req.request.url.removeprefix('http://verus.test').split('?')[0]
        if path == '/':
            req.fulfill(content_type='text/html; charset=utf-8', body=html)
        elif path == '/favicon.svg':
            req.fulfill(content_type='image/svg+xml', body=(ROOT / 'dashboard/favicon.svg').read_bytes())
        else:
            req.fulfill(status=404, body='Offline test: no such fixture')
    page.route('**/*', route)
    page.goto('http://verus.test/')
    page.wait_for_function("document.querySelector('[data-mark=probs]') && !document.querySelector('#loading').classList.contains('show')")
    page.wait_for_timeout(400)
    check('Free enables local UI without an activation token', page.evaluate("M.edition === 'free' && hasLocalCore() && !document.body.classList.contains('user-edition')"))
    check('Primary tabs are keyboard-accessible native buttons', page.locator('.tabs button.tab').count() == 6)
    page.get_by_role('button', name='Free и планы Pro', exact=True).click()
    check('Free information does not sell unfinished Pro', 'пока не продаются' in page.locator('#actForm').inner_text())
    page.locator('#actCancel').click()
    buttons = page.get_by_role('button', name='Показать устройства', exact=False)
    check('Problem devices action exists', buttons.count() == 1)
    buttons.click()
    page.wait_for_timeout(600)
    check('Problem devices click focuses and reveals the target card', page.evaluate("""() => {
      const card = document.querySelector('[data-mark=probs]').closest('.card');
      const r = card.getBoundingClientRect();
      return card.contains(document.activeElement) && r.top >= 0 && r.top < innerHeight;
    }"""))
    page.get_by_role('button', name='Посмотреть автозагрузку', exact=False).first.click()
    check('Startup action opens startup list, not application removal', page.locator('#actModal').is_visible() and 'Автозагрузка' in page.locator('#actTitle').inner_text())
    page.locator('#actCancel').click()
    # Reproduce the colleague's installed Win11 + disabled Secure Boot combination.
    page.evaluate("""() => { M.computer.os='Windows 11 Pro'; M.computer.osBuild='26200';
      W11.overall='fixable'; W11.secureBoot=false; renderWin11(); }""")
    win11 = page.locator('#w11Card').inner_text()
    check('Already installed Windows 11 is not presented as an upgrade',
          'Windows 11 уже установлена' in win11 and 'Можно подготовить' not in win11)
    check('Secure Boot finding remains visible on Windows 11', 'Secure Boot' in win11 and '✕' in win11)
    check('UEFI action describes instructions, not automatic opening',
          page.locator('#w11Card').get_by_role('button', name='Как включить Secure Boot / TPM', exact=False).count() == 1)
    if args.artifacts:
        args.artifacts.mkdir(parents=True, exist_ok=True)
        page.locator('#w11Card').screenshot(path=str(args.artifacts / 'windows11-settings.png'))
    page.locator('#w11Card').get_by_role('button', name='Как включить Secure Boot / TPM', exact=False).click()
    check('UEFI help opens a readable dialog', page.locator('#actModal').is_visible() and 'BitLocker' in page.locator('#actForm').inner_text())
    page.locator('#actCancel').click()
    # Fresh render, no client name guessing: Windows 10 keeps its upgrade verdict.
    page.evaluate("() => { M.computer.os='Windows 10 Pro'; M.computer.osBuild='19045'; renderWin11(); }")
    check('Windows 10 retains upgrade readiness', 'Можно подготовить' in page.locator('#w11Card').inner_text())
    page.evaluate("() => { M.computer.os='Windows Server 2025'; M.computer.osBuild='26100'; renderWin11(); }")
    check('Windows Server is not mistaken for Windows 11', 'Windows 11 уже установлена' not in page.locator('#w11Card').inner_text())
    nav = []
    for tab in ['diag', 'price', 'periph', 'learn', 'soft', 'settings']:
        # Test actual nav buttons where present; do not fabricate a passing tab.
        button = page.locator(f'.tabs [onclick*="switchTab(\'{tab}\')"]')
        if button.count() != 1:
            nav.append({'tab': tab, 'found': False})
            continue
        button.click()
        nav.append({'tab': tab, 'found': True, 'visible': page.locator('#tab-' + tab).is_visible()})
    check('All six primary navigation buttons open their panels', len(nav) == 6 and all(x.get('visible') for x in nav))
    page.evaluate("switchTab('diag')")
    page.locator('#clientWidget a').click()
    check('Client intake opens from the empty client widget', page.locator('#actModal').is_visible() and page.locator('#actForm input').count() > 0)
    page.locator('#actCancel').click()
    page.evaluate("() => { setProfile('client'); showDiagCard('topproc'); }")
    check('A hidden technical card is revealed before navigation', page.locator('[data-mark=topproc]').is_visible())
    page.evaluate("switchTab('diag')")
    for width, height in [(1440, 1000), (1366, 768), (1920, 1080)]:
        page.set_viewport_size({'width': width, 'height': height})
        check(f'No horizontal overflow at {width}px', page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
    check('No uncaught browser errors', not page_errors)
    if args.artifacts:
        args.artifacts.mkdir(parents=True, exist_ok=True)
        page.set_viewport_size({'width': 1440, 'height': 1000})
        page.screenshot(path=str(args.artifacts / 'dashboard-checked.png'), full_page=True)
        (args.artifacts / 'browser-results.json').write_text(json.dumps({'checks': results, 'navigation': nav, 'errors': page_errors}, ensure_ascii=False, indent=2), encoding='utf-8')
    browser.close()
sys.exit(0 if all(x['ok'] for x in results) else 1)
