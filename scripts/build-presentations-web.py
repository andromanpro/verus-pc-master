#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build-presentations-web.py — превращает .pptx презентации в веб-слайдшоу (картинки) для мини-сайта.

Слайды уже визуально оформлены (pptxgenjs). Re-верстать их в HTML дорого и рискованно,
поэтому рендерим каждый слайд в PNG (LibreOffice → PDF → PyMuPDF) и собираем HTML-листалку
(стрелки/кнопки/счётчик), которая работает офлайн с флешки. .pptx остаётся как «скачать».

Выход:
  training/site/slides/<slug>/sNN.png   — кадры
  training/site/p-<slug>.html           — страница-слайдшоу
  training/site/presentations.json      — манифест для build-training-site.py (линковка в индексе)

Зависимости: LibreOffice (soffice), PyMuPDF (fitz). Запуск:
  py -3.14 scripts/build-presentations-web.py
"""
import os, sys, glob, json, subprocess, shutil, re, tempfile
sys.stdout.reconfigure(encoding='utf-8')
import fitz  # PyMuPDF

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRAIN = os.path.join(ROOT, 'training')
PRES = os.path.join(TRAIN, 'presentations')
SITE = os.path.join(TRAIN, 'site')
SLIDES = os.path.join(SITE, 'slides')
SOFFICE = r'C:\Program Files\LibreOffice\program\soffice.exe'
DPI = 120

def slugify(name):
    s = re.sub(r'\.pptx$', '', name, flags=re.I)
    s = re.sub(r'^(\d+)[-\s]*', r'\1-', s)  # keep leading number
    m = re.match(r'(\d+)', s)
    num = m.group(1) if m else ''
    return ('p' + num) if num else ('p-' + re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-'))[:20]

def pptx_to_pngs(pptx_path, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    with tempfile.TemporaryDirectory() as td:
        r = subprocess.run([SOFFICE, '--headless', '--convert-to', 'pdf', '--outdir', td, pptx_path],
                           capture_output=True, timeout=180)
        pdfs = glob.glob(os.path.join(td, '*.pdf'))
        if not pdfs:
            sys.stderr.write(f'  [warn] PDF не создан для {os.path.basename(pptx_path)}: {r.stderr[:200]}\n')
            return 0
        doc = fitz.open(pdfs[0])
        n = 0
        for i in range(doc.page_count):
            pix = doc[i].get_pixmap(dpi=DPI)
            pix.save(os.path.join(out_dir, f's{i+1:02d}.png'))
            n += 1
        doc.close()
        return n

VIEWER_CSS = """*{box-sizing:border-box}body{margin:0;background:#0a1020;color:#f8fafc;font-family:'Segoe UI',Arial,sans-serif}
.top{position:sticky;top:0;background:rgba(10,16,32,.95);border-bottom:1px solid #1b2740;padding:10px 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.top a{color:#22d3ee;text-decoration:none;font-weight:600}.top .t{font-weight:600}.top .sp{margin-left:auto;color:#94a3b8;font-size:13px}
.stage{max-width:1000px;margin:18px auto;padding:0 14px}
.slide{width:100%;border:1px solid #1b2740;border-radius:10px;display:block;background:#0d1424}
.bar{display:flex;align-items:center;justify-content:center;gap:14px;margin:14px 0 30px}
.btn{background:#0f1a2e;border:1px solid #1b2740;border-radius:9px;color:#f8fafc;padding:10px 18px;font-size:15px;cursor:pointer}
.btn:hover{border-color:#22d3ee}.btn:disabled{opacity:.35;cursor:default}
.counter{color:#94a3b8;font-family:Consolas,monospace;min-width:64px;text-align:center}
.hint{color:#94a3b8;font-size:12px;text-align:center;margin-bottom:24px}"""

def viewer_html(title, slug, count, pptx_rel):
    imgs = ','.join(f"'slides/{slug}/s{i+1:02d}.png'" for i in range(count))
    import html as _h
    return f"""<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{_h.escape(title)} · Verus</title><style>{VIEWER_CSS}</style></head><body>
<div class="top"><a href="index.html">📚 ← К курсу</a><span class="t">{_h.escape(title)}</span>
<span class="sp"><a href="{pptx_rel}">📥 .pptx</a></span></div>
<div class="stage"><img id="sl" class="slide" alt="слайд">
<div class="bar"><button class="btn" id="prev">← Назад</button>
<span class="counter" id="cnt"></span>
<button class="btn" id="next">Вперёд →</button></div>
<div class="hint">Стрелки ← → на клавиатуре тоже листают</div></div>
<script>
var S=[{imgs}],i=0,img=document.getElementById('sl'),cnt=document.getElementById('cnt'),
P=document.getElementById('prev'),N=document.getElementById('next');
function show(){{img.src=S[i];cnt.textContent=(i+1)+' / '+S.length;P.disabled=(i===0);N.disabled=(i===S.length-1);}}
P.onclick=function(){{if(i>0){{i--;show();}}}};N.onclick=function(){{if(i<S.length-1){{i++;show();}}}};
document.addEventListener('keydown',function(e){{if(e.key==='ArrowLeft')P.onclick();if(e.key==='ArrowRight')N.onclick();}});
show();
</script></body></html>"""

def main():
    if not os.path.exists(SOFFICE):
        sys.stderr.write('LibreOffice (soffice) не найден — слайдшоу не собрать.\n'); sys.exit(1)
    os.makedirs(SLIDES, exist_ok=True)
    pptx_list = sorted(glob.glob(os.path.join(PRES, '*.pptx'))) + sorted(glob.glob(os.path.join(TRAIN, '*.pptx')))
    manifest = []
    for idx, p in enumerate(pptx_list, 1):
        name = os.path.basename(p)
        title = re.sub(r'\.pptx$', '', name, flags=re.I)
        slug = f'p{idx:02d}'  # сквозная нумерация — уникально и ASCII (Cyrillic-имена давали коллизии)
        out_dir = os.path.join(SLIDES, slug)
        if os.path.isdir(out_dir): shutil.rmtree(out_dir)
        n = pptx_to_pngs(p, out_dir)
        if n == 0: continue
        # путь к .pptx ОТ site/: presentations/ → ../presentations/<name>; корневые training/<name> → ../<name>
        from urllib.parse import quote
        rel_from_site = ('../presentations/' if os.path.dirname(p) == PRES else '../') + name
        with open(os.path.join(SITE, f'{slug}.html'), 'w', encoding='utf-8') as f:
            f.write(viewer_html(title, slug, n, quote(rel_from_site)))
        manifest.append({'title': title, 'slug': slug, 'page': f'{slug}.html', 'slides': n})
        print(f'  {name}: {n} слайдов → {slug}.html')
    with open(os.path.join(SITE, 'presentations.json'), 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f'Слайдшоу собрано: {len(manifest)} презентаций')

if __name__ == '__main__':
    main()
