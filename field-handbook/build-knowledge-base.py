# Генерирует поисковую HTML-базу знаний из master-handbook.md (единый источник).
# Запуск: py -3.14 build-knowledge-base.py
import os, re, sys, html, json
sys.stdout.reconfigure(encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
# .md-исходники переехали в markdown/<подпапка>/ — generator теперь смотрит туда
REPO_ROOT = os.path.dirname(HERE)
SRC = os.path.join(REPO_ROOT, "markdown", "field-handbook", "master-handbook.md")
OUT = os.path.join(HERE, "knowledge-base.html")

md = open(SRC, encoding="utf-8").read()
lines = md.split("\n")

# Разбор на блоки по заголовкам # и ##
blocks = []
cur = None
for ln in lines:
    m = re.match(r"^(#{1,2})\s+(.*)$", ln)
    if m:
        if cur:
            blocks.append(cur)
        cur = {"level": len(m.group(1)), "title": m.group(2).strip(), "body": []}
    else:
        if cur:
            cur["body"].append(ln)
if cur:
    blocks.append(cur)

# Первый блок = заголовок документа
doc_title = blocks[0]["title"] if blocks else "Справочник мастера"
blocks = blocks[1:]

def _inline(s):
    e = html.escape(s)
    e = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", e)
    e = re.sub(r"`(.+?)`", r"<code>\1</code>", e)
    return e

def _is_table_sep(line):
    # строка-разделитель таблицы: |---|---| (тире/двоеточия/трубы/пробелы, есть хотя бы один -)
    return bool(re.match(r"^\s*\|?[\s:|-]+\|?\s*$", line)) and "-" in line and "|" in line

def _split_row(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]

def _render_table(rows):
    head = _split_row(rows[0])
    th = "".join("<th>" + _inline(c) + "</th>" for c in head)
    trs = ""
    for r in rows[2:]:
        cells = _split_row(r)
        trs += "<tr>" + "".join("<td>" + _inline(c) + "</td>" for c in cells) + "</tr>"
    return "<table><thead><tr>" + th + "</tr></thead><tbody>" + trs + "</tbody></table>"

def render_body(body_lines):
    text = "\n".join(body_lines).strip("\n")
    # вырезаем код-блоки, чтобы не трогать их разметкой
    fences = []
    def stash(m):
        fences.append(m.group(1))
        return "\x00%d\x00" % (len(fences) - 1)
    text = re.sub(r"```[a-z]*\n(.*?)```", stash, text, flags=re.S)
    out = []
    para, inlist = [], False
    def flush_para():
        nonlocal para
        if para:
            out.append("<p>" + " ".join(para) + "</p>")
            para = []
    def close_list():
        nonlocal inlist
        if inlist:
            out.append("</ul>")
            inlist = False
    lines = text.split("\n")
    i = 0
    while i < len(lines):
        s = lines[i].rstrip()
        if not s.strip():
            flush_para(); close_list(); i += 1; continue
        ph = re.match(r"^\x00(\d+)\x00$", s.strip())
        if ph:
            flush_para(); close_list()
            out.append("<pre>" + html.escape(fences[int(ph.group(1))].rstrip()) + "</pre>"); i += 1; continue
        # Таблица: текущая строка с | и следующая — разделитель |---|
        if s.strip().startswith("|") and i + 1 < len(lines) and _is_table_sep(lines[i + 1]):
            flush_para(); close_list()
            tbl = [s]; j = i + 1
            while j < len(lines) and lines[j].strip().startswith("|"):
                tbl.append(lines[j].rstrip()); j += 1
            out.append(_render_table(tbl)); i = j; continue
        # Заголовки ## / ### / #### внутри карточки
        mh = re.match(r"^(#{1,6})\s+(.*)$", s.strip())
        if mh:
            flush_para(); close_list()
            lvl = max(3, min(len(mh.group(1)), 6))
            out.append("<h%d>%s</h%d>" % (lvl, _inline(mh.group(2)), lvl)); i += 1; continue
        mli = re.match(r"^\s*(?:[-*]|\d+[.)])\s+(.*)$", s)
        if mli:
            flush_para()
            if not inlist:
                out.append("<ul>"); inlist = True
            out.append("<li>" + _inline(mli.group(1)) + "</li>"); i += 1; continue
        if s.strip().startswith(">"):
            flush_para(); close_list()
            out.append("<blockquote>" + _inline(re.sub(r"^\s*>\s?", "", s)) + "</blockquote>"); i += 1; continue
        para.append(_inline(s)); i += 1
    flush_para(); close_list()
    return "\n".join(out)

cards = []
category = ""
for b in blocks:
    body_html = render_body(b["body"])
    body_text = "\n".join(b["body"])
    if b["level"] == 1 and not body_text.strip():
        category = b["title"]  # чистый разделитель-категория
        continue
    cat = category if b["level"] == 2 else ""
    plain = (b["title"] + " " + body_text).lower()
    cards.append({"title": b["title"], "cat": cat, "html": body_html, "search": plain})

cards_json = json.dumps(cards, ensure_ascii=False)

HTML = """<!doctype html><html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__</title>
<style>
 :root{--bg:#0A0E17;--card:rgba(21,29,48,.72);--bd:#26314d;--cy:#22d3ee;--mt:#34d399;--am:#fbbf24;--rs:#fb7185;--tx:#f8fafc;--mu:#94a3b8}
 *{box-sizing:border-box;margin:0;padding:0}
 body{background:var(--bg);color:var(--tx);font-family:Segoe UI,Roboto,Arial,sans-serif;min-height:100vh}
 .bg{position:fixed;inset:0;z-index:-1;background:radial-gradient(60vw 60vw at 10% -10%,rgba(34,211,238,.10),transparent 60%),radial-gradient(55vw 55vw at 110% 115%,rgba(247,37,133,.09),transparent 60%)}
 header{padding:30px 36px 8px}
 .eyebrow{font-family:Consolas,monospace;color:var(--cy);letter-spacing:3px;font-size:12px}
 h1{font-size:26px;margin-top:6px}
 .wrap{padding:14px 36px 50px;max-width:1100px}
 .search{position:sticky;top:0;background:linear-gradient(var(--bg),var(--bg) 70%,transparent);padding:12px 0 14px;z-index:5}
 #q{width:100%;padding:14px 18px;font-size:16px;border-radius:12px;border:1px solid var(--bd);background:#121a2e;color:var(--tx);outline:none}
 #q:focus{border-color:var(--cy);box-shadow:0 0 18px rgba(34,211,238,.18)}
 .count{color:var(--mu);font-size:13px;margin:4px 2px 10px}
 .card{background:var(--card);border:1px solid var(--bd);border-radius:14px;margin-bottom:12px;overflow:hidden}
 .card.hidden{display:none}
 .head{padding:15px 18px;cursor:pointer;display:flex;align-items:center;gap:12px}
 .head:hover{background:rgba(34,211,238,.05)}
 .cat{font-family:Consolas,monospace;font-size:11px;color:var(--am);border:1px solid var(--bd);border-radius:6px;padding:2px 8px;white-space:nowrap}
 .htitle{font-size:16px;font-weight:700;flex:1}
 .chev{color:var(--mu);transition:.2s}
 .card.open .chev{transform:rotate(90deg)}
 .body{display:none;padding:2px 20px 18px;color:#dbe3f0}
 .card.open .body{display:block}
 .body p{margin:8px 0;line-height:1.55}
 .body ul{margin:8px 0 8px 4px;list-style:none}
 .body li{position:relative;padding:4px 0 4px 20px;line-height:1.5}
 .body li:before{content:"▸";color:var(--cy);position:absolute;left:0}
 .body code{font-family:Consolas,monospace;background:#0c1424;border:1px solid var(--bd);border-radius:5px;padding:1px 6px;color:var(--mt);font-size:13px}
 .body pre{background:#0b1220;border:1px solid var(--bd);border-left:3px solid var(--cy);border-radius:8px;padding:12px 14px;margin:10px 0;overflow-x:auto;font-family:Consolas,monospace;font-size:13px;color:#cfe;line-height:1.5}
 .body blockquote{border-left:3px solid var(--am);background:rgba(251,191,36,.07);padding:8px 14px;margin:10px 0;border-radius:6px;color:#f3e6c8}
 .body strong{color:#fff}
 .body h3,.body h4,.body h5{color:var(--cy);margin:14px 0 6px;font-size:15px;font-weight:700}
 .body h4,.body h5{font-size:14px;color:#dbe3f0}
 .body table{border-collapse:collapse;width:100%;margin:10px 0;font-size:13px}
 .body th,.body td{border:1px solid var(--bd);padding:6px 9px;text-align:left;vertical-align:top}
 .body th{background:rgba(34,211,238,.10);color:var(--cy)}
 footer{color:var(--mu);font-size:12px;padding:0 36px 30px}
</style></head><body>
<div class="bg"></div>
<header><div class="eyebrow">БАЗА ЗНАНИЙ МАСТЕРА · ПОИСК ПО СИМПТОМУ</div><h1>__TITLE__</h1></header>
<div class="wrap">
 <div class="search"><input id="q" placeholder="Опиши проблему: тормозит, нет звука, синий экран, не грузится..." autofocus></div>
 <div class="count" id="count"></div>
 <div id="list"></div>
</div>
<footer>Открывается с флешки, без интернета. Полный текст — справочник-мастера.md. Сначала данные, потом всё остальное.</footer>
<script>
const CARDS = __DATA__;
var list=document.getElementById('list'), q=document.getElementById('q'), count=document.getElementById('count');
function build(){
  list.innerHTML='';
  CARDS.forEach(function(c,i){
    var d=document.createElement('div'); d.className='card'; d.setAttribute('data-s',c.search);
    d.innerHTML='<div class="head">'+(c.cat?'<span class="cat">'+c.cat+'</span>':'')+'<span class="htitle">'+c.title+'</span><span class="chev">▸</span></div><div class="body">'+c.html+'</div>';
    d.querySelector('.head').onclick=function(){ d.classList.toggle('open'); };
    list.appendChild(d);
  });
}
function filter(){
  var v=q.value.trim().toLowerCase(), terms=v.split(/\\s+/).filter(Boolean), n=0;
  document.querySelectorAll('.card').forEach(function(d){
    var s=d.getAttribute('data-s');
    var ok = terms.every(function(t){ return s.indexOf(t)>=0; });
    d.classList.toggle('hidden', !ok);
    if(ok){ n++; if(v) d.classList.add('open'); else d.classList.remove('open'); }
  });
  count.textContent = v ? (n+' совпадений') : (CARDS.length+' случаев — начни печатать симптом');
}
build(); q.addEventListener('input',filter); filter();
</script></body></html>"""

out = HTML.replace("__TITLE__", html.escape(doc_title)).replace("__DATA__", cards_json)
open(OUT, "w", encoding="utf-8").write(out)
print("OK:", OUT, "| карточек:", len(cards))
