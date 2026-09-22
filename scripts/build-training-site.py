#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build-training-site.py — собирает статический офлайн-сайт обучения Verus из markdown.

Единый источник — markdown/training/*.md (те же файлы, из которых рендерятся .docx).
Презентации (.pptx) и тесты (training/tests/) уже существуют — сайт на них ссылается,
не дублирует. docx остаются как «скачать» рядом с веб-версией.

Результат: training/site/ (index.html + m01..mNN.html + site.css), работает с file://
(офлайн, с флешки). Тема — как дашборд (тёмно-синий + циан).

Запуск:  py -3.14 scripts/build-training-site.py
"""
import os, re, glob, html, sys
from urllib.parse import quote
import markdown

sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MD_DIR = os.path.join(ROOT, 'markdown', 'training')
TRAIN_DIR = os.path.join(ROOT, 'training')
OUT_DIR = os.path.join(TRAIN_DIR, 'site')

CSS = """:root{--bg:#0a1020;--card:#0f1a2e;--bd:#1b2740;--cy:#22d3ee;--mt:#34d399;--am:#fbbf24;--rs:#fb7185;--tx:#f8fafc;--mu:#94a3b8}
*{box-sizing:border-box}
body{margin:0;background:linear-gradient(160deg,#0a1020,#0d1424);color:var(--tx);font-family:'Segoe UI',system-ui,Arial,sans-serif;line-height:1.6;font-size:16px}
a{color:var(--cy);text-decoration:none}a:hover{text-decoration:underline}
.wrap{max-width:860px;margin:0 auto;padding:24px 20px 64px}
header.top{position:sticky;top:0;background:rgba(10,16,32,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--bd);padding:12px 20px;display:flex;align-items:center;gap:14px;z-index:10}
header.top .home{font-weight:700;color:var(--cy)}
header.top .crumb{color:var(--mu);font-size:14px}
h1{font-size:26px;margin:18px 0 8px;color:var(--tx)}
h2{font-size:20px;color:var(--cy);margin:26px 0 8px;border-bottom:1px solid var(--bd);padding-bottom:6px}
h3{font-size:17px;color:var(--tx);margin:18px 0 6px}
code{background:#0d1424;border:1px solid var(--bd);border-radius:5px;padding:1px 6px;font-family:Consolas,monospace;font-size:14px;color:var(--am)}
pre{background:#0d1424;border:1px solid var(--bd);border-radius:8px;padding:12px 14px;overflow:auto}
pre code{border:0;background:0;color:var(--tx)}
table{border-collapse:collapse;width:100%;margin:12px 0;font-size:14px}
th,td{border:1px solid var(--bd);padding:7px 10px;text-align:left}
th{background:rgba(34,211,238,.10);color:var(--cy)}
blockquote{border-left:3px solid var(--am);margin:12px 0;padding:6px 14px;background:rgba(251,191,36,.06);color:var(--mu)}
ul,ol{padding-left:24px}li{margin:4px 0}
hr{border:0;border-top:1px solid var(--bd);margin:22px 0}
.hero{padding:18px 0 6px}
.hero p{color:var(--mu);font-size:17px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;margin:18px 0}
.card{display:block;background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:16px;transition:all .15s}
.card:hover{border-color:var(--cy);transform:translateY(-2px);text-decoration:none}
.card .num{font-family:Consolas,monospace;color:var(--cy);font-size:13px}
.card .t{font-weight:700;color:var(--tx);margin:4px 0 6px;font-size:16px}
.card .d{color:var(--mu);font-size:13px;line-height:1.45}
.res{display:flex;flex-wrap:wrap;gap:10px;margin:10px 0 0}
.btn{display:inline-block;background:var(--card);border:1px solid var(--bd);border-radius:9px;padding:9px 14px;color:var(--tx);font-size:14px}
.btn:hover{border-color:var(--cy);text-decoration:none}
.btn.cy{border-color:var(--cy);color:var(--cy)}
.nav{display:flex;justify-content:space-between;gap:10px;margin-top:30px;flex-wrap:wrap}
.dl{margin:14px 0;padding:10px 14px;border:1px dashed var(--bd);border-radius:9px;color:var(--mu);font-size:14px}
footer.site{margin-top:40px;padding-top:16px;border-top:1px solid var(--bd);color:var(--mu);font-size:13px}
"""

def page(title, body, crumb='', rel=''):
    # rel — префикс к корню сайта для ссылок (для модулей внутри той же папки = '')
    return f"""<!DOCTYPE html><html lang="ru"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)} · Verus Обучение</title>
<link rel="stylesheet" href="{rel}site.css">
</head><body>
<header class="top"><a class="home" href="{rel}index.html">📚 Verus · Обучение</a>{f'<span class="crumb">{html.escape(crumb)}</span>' if crumb else ''}</header>
<div class="wrap">
{body}
<footer class="site">Verus · курс ПК-мастера · автор <a href="https://androman.pro" target="_blank" rel="noopener">androman.pro</a> · <a href="https://t.me/andromanpro1c" target="_blank" rel="noopener">Telegram</a></footer>
</div></body></html>"""

def slugify_ru(value, sep='-'):
    # Кириллице-дружественный slug (дефолтный Python-Markdown режет non-ASCII → ломает #якоря).
    # «Накопители (диски)» -> «накопители-диски» — совпадает с ручными ссылками в md.
    v = value.strip().lower()
    v = re.sub(r'[^\w\s-]', '', v, flags=re.U)
    v = re.sub(r'\s+', sep, v)
    v = re.sub(r'-+', '-', v)
    return v.strip('-')

def md_to_html(text):
    md = markdown.Markdown(extensions=['tables', 'fenced_code', 'sane_lists', 'toc', 'nl2br'],
                           extension_configs={'toc': {'slugify': slugify_ru}})
    return md.convert(text)

def first_para(text):
    # первый непустой абзац после H1 — для описания карточки
    lines = text.splitlines()
    out = []
    started = False
    for ln in lines:
        s = ln.strip()
        if s.startswith('# '):
            started = True; continue
        if not started:
            continue
        if s.startswith('#') or s.startswith('---') or not s:
            if out:
                break
            continue
        out.append(s)
    desc = ' '.join(out)
    desc = re.sub(r'[*`\[\]]', '', desc)        # убрать md-разметку
    desc = re.sub(r'\(#[^)]*\)', '', desc)
    return (desc[:160] + '…') if len(desc) > 160 else desc

def find_asset(pattern):
    hits = sorted(glob.glob(os.path.join(TRAIN_DIR, pattern)))
    return hits[0] if hits else None

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(os.path.join(OUT_DIR, 'site.css'), 'w', encoding='utf-8') as f:
        f.write(CSS)

    md_files = sorted(glob.glob(os.path.join(MD_DIR, '*.md')))
    modules = []
    for mf in md_files:
        base = os.path.basename(mf)
        m = re.match(r'(\d+)', base)
        if not m:
            continue
        num = m.group(1)
        text = open(mf, encoding='utf-8').read()
        h1 = re.search(r'^#\s+(.+)$', text, re.M)
        title = h1.group(1).strip() if h1 else base
        # тело без первого H1 (заголовок выводим в шапке страницы)
        body_md = re.sub(r'^#\s+.+$', '', text, count=1, flags=re.M)
        docx = find_asset(f'{num}-*.docx')
        modules.append({
            'num': num, 'title': title, 'desc': first_para(text),
            'page': f'm{num}.html', 'body': md_to_html(body_md),
            'docx': os.path.basename(docx) if docx else None,
        })

    # --- страницы модулей ---
    for i, mod in enumerate(modules):
        prev_m = modules[i-1] if i > 0 else None
        next_m = modules[i+1] if i < len(modules)-1 else None
        dl = ''
        if mod['docx']:
            dl = f'<div class="dl">📥 <a href="../{quote(mod["docx"])}">Версия для печати (.docx)</a></div>'
        nav = '<div class="nav">'
        nav += f'<a class="btn" href="{prev_m["page"]}">← {html.escape(prev_m["title"][:32])}</a>' if prev_m else '<span></span>'
        nav += '<a class="btn cy" href="index.html">К списку модулей</a>'
        nav += f'<a class="btn" href="{next_m["page"]}">{html.escape(next_m["title"][:32])} →</a>' if next_m else '<span></span>'
        nav += '</div>'
        body = f'<h1>{html.escape(mod["title"])}</h1>{dl}{mod["body"]}<hr>{nav}'
        with open(os.path.join(OUT_DIR, mod['page']), 'w', encoding='utf-8') as f:
            f.write(page(mod['title'], body, crumb=f'Модуль {mod["num"]}'))

    # --- лендинг ---
    cards = ''.join(
        f'<a class="card" href="{m["page"]}"><div class="num">Модуль {m["num"]}</div>'
        f'<div class="t">{html.escape(m["title"])}</div><div class="d">{html.escape(m["desc"])}</div></a>'
        for m in modules)

    # Презентации — веб-слайдшоу (presentations.json от build-presentations-web.py).
    # Каждая ведёт на страницу-листалку (картинки слайдов), внутри — ссылка «скачать .pptx».
    import json as _json
    manifest_path = os.path.join(OUT_DIR, 'presentations.json')
    if os.path.exists(manifest_path):
        decks = _json.load(open(manifest_path, encoding='utf-8'))
        ppt_links = ''.join(
            f'<a class="btn" href="{html.escape(d["page"])}">🖥 {html.escape(d["title"])} <span style="color:var(--mu);font-size:11px">({d["slides"]} сл.)</span></a>'
            for d in decks)
    else:
        # fallback: прямые .pptx, если слайдшоу ещё не собрано
        ppts = sorted(glob.glob(os.path.join(TRAIN_DIR, 'presentations', '*.pptx'))) + sorted(glob.glob(os.path.join(TRAIN_DIR, '*.pptx')))
        ppt_links = ''.join(
            f'<a class="btn" href="../presentations/{quote(os.path.basename(p))}">🖥 {html.escape(os.path.splitext(os.path.basename(p))[0])}</a>'
            for p in ppts)

    hero = (
        '<div class="hero"><h1>Курс ПК-мастера</h1>'
        '<p>12 недель от новичка до первого клиента. Теория + практика + проверка. '
        'Открывается с флешки, без интернета. Начни с дорожной карты, иди по неделям, не торопись.</p></div>'
        '<div class="res">'
        '<a class="btn cy" href="../tests/index.html">📝 Учебные тесты (10 модулей)</a>'
        '<a class="btn" href="../../field-handbook/knowledge-base.html">📗 Справочник мастера</a>'
        '</div>'
    )
    body = (
        hero +
        '<h2>Модули курса</h2>'
        '<p style="color:var(--mu);font-size:14px">Теория в вебе. Рядом — версия для печати (.docx) на странице каждого модуля.</p>'
        f'<div class="grid">{cards}</div>'
        '<h2>Презентации</h2>'
        f'<div class="res">{ppt_links or "<span style=color:#94a3b8>презентаций не найдено</span>"}</div>'
    )
    with open(os.path.join(OUT_DIR, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(page('Курс ПК-мастера', body))

    n_pres = ppt_links.count('class="btn"')
    print(f'Сайт собран: {OUT_DIR}')
    print(f'  модулей: {len(modules)} · презентаций: {n_pres}')
    print(f'  открыть: training/site/index.html')

if __name__ == '__main__':
    main()
