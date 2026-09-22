#!/usr/bin/env python3
"""
test-ui.py — статический UI smoke-test для дашборда Verus.

Ловит классы багов которые иначе всплывают только через жалобу пользователя:
  1. Unbound handlers — onclick/onchange/oninput вызывает функцию, которой нет в JS
  2. JS syntax errors — через node --check (если node доступен)
  3. Orphan endpoints — fetch/apost на /api/* которого нет в server.ps1 dispatch

Запуск:
    py -3.14 scripts/test-ui.py
    py -3.14 scripts/test-ui.py --json      # машинный вывод

Exit code: 0 если чисто, 1 если есть ошибки. Можно использовать как gate перед сборкой.

История: создан 2026-05-30 после эпизода «кнопки курса не работают» (intakeAct undefined),
который backend-проверка curl'ом не поймала. Roadmap 0.4 — UI smoke test workflow.
"""
import re
import sys
import os
import subprocess
import argparse

sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, 'dashboard', 'index.html')
SERVER = os.path.join(ROOT, 'dashboard', 'server.ps1')

# DOM/JS builtins и методы которые НЕ являются нашими функциями (false positives)
BUILTINS = {
    'event', 'this', 'if', 'return', 'for', 'while', 'closeGroup', 'setTimeout', 'setInterval',
    'clearTimeout', 'clearInterval', 'document', 'window', 'parseInt', 'parseFloat', 'String',
    'Number', 'Math', 'JSON', 'Object', 'Array', 'getElementById', 'querySelector',
    'querySelectorAll', 'classList', 'getItem', 'setItem', 'removeItem', 'splice', 'push',
    'filter', 'map', 'forEach', 'find', 'preventDefault', 'stopPropagation', 'replace', 'trim',
    'toLowerCase', 'toUpperCase', 'split', 'join', 'slice', 'indexOf', 'includes', 'console',
    'localStorage', 'sessionStorage', 'crypto', 'URL', 'Blob', 'FileReader', 'Date', 'Promise',
    'fetch', 'alert', 'confirm', 'prompt', 'click', 'focus', 'blur', 'scrollIntoView',
    'toFixed', 'toString', 'reduce', 'some', 'every', 'sort', 'reverse', 'keys', 'values',
    'isFinite', 'isNaN', 'encodeURIComponent', 'decodeURIComponent', 'navigator',
    # CSS-функции внутри inline style='...' (false positives)
    'rgba', 'rgb', 'hsl', 'hsla', 'var', 'calc', 'url', 'translateX', 'translateY',
    'translate', 'rotate', 'scale', 'linear-gradient', 'radial-gradient',
}


def extract_handlers(src):
    """Все имена функций, вызываемых из inline on* атрибутов."""
    handlers = []
    for m in re.finditer(r'on(?:click|input|change|submit|focus|blur|load|mouseover|mouseout|keydown)=(?:"([^"]+)"|\'([^\']+)\')', src):
        h = m.group(1) or m.group(2)
        for fn in re.findall(r'\b([a-zA-Z_$][\w$]*)\s*\(', h):
            if fn in BUILTINS:
                continue
            line_num = src[:m.start()].count('\n') + 1
            handlers.append((fn, line_num, (h[:70])))
    return handlers


def extract_js(src):
    return '\n'.join(re.findall(r'<script(?![^>]*src=)[^>]*>(.*?)</script>', src, re.S))


def is_defined(name, js):
    patterns = [
        rf'\bfunction\s+{re.escape(name)}\s*\(',
        rf'\bwindow\.{re.escape(name)}\s*=',
        rf'\b{re.escape(name)}\s*=\s*(?:async\s+)?function',
        rf'\b{re.escape(name)}\s*=\s*(?:async\s+)?\(',          # arrow assigned
        rf'\b(?:const|let|var)\s+{re.escape(name)}\s*=',
    ]
    return any(re.search(p, js) for p in patterns)


def check_unbound_handlers(src, js):
    handlers = extract_handlers(src)
    names = {}
    for fn, line, ctx in handlers:
        names.setdefault(fn, (line, ctx))
    missing = []
    for name, (line, ctx) in sorted(names.items()):
        if not is_defined(name, js):
            missing.append({'name': name, 'line': line, 'context': ctx})
    return len(names), missing


def check_js_syntax(js):
    """node --check через временный файл в ASCII-пути."""
    tmp = os.path.join(os.environ.get('TEMP', '/tmp'), 'verus_ui_check.js')
    try:
        with open(tmp, 'w', encoding='utf-8') as f:
            f.write(js)
    except Exception as e:
        return None, f'write fail: {e}'
    try:
        r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True, timeout=30)
        if r.returncode == 0:
            return True, None
        return False, (r.stderr or r.stdout)[:500]
    except FileNotFoundError:
        return None, 'node не найден — JS syntax check пропущен'
    except Exception as e:
        return None, str(e)


def check_orphan_endpoints(src, server_src):
    """fetch/apost на /api/* которых нет в server dispatch (regex-строки '^/api/...$')."""
    called = set()
    for m in re.finditer(r"""(?:fetch|apost|fetchJson)\(\s*['"`](/api/[a-zA-Z0-9/_-]+)""", src):
        called.add(m.group(1).rstrip('/'))
    # endpoints из server.ps1 — строки вида '^/api/xxx$' или '^/api/xxx'
    declared = set()
    for m in re.finditer(r"""['"]\^(/api/[a-zA-Z0-9/_$-]+)\$?['"]""", server_src):
        declared.add(m.group(1).rstrip('$').rstrip('/'))
    orphans = []
    for c in sorted(called):
        base = c.split('?')[0].rstrip('/')
        # ok если: точное совпадение; ИЛИ called — префикс declared (динамич. '/api/run/'+tool);
        # ИЛИ declared — префикс called (called с доп. сегментом)
        if base in declared:
            continue
        if any(d.startswith(base + '/') or base.startswith(d + '/') for d in declared):
            continue
        orphans.append(base)
    return sorted(set(orphans))


# Красная линия Verus Hand (design §2): AI не держит executor мутаций и не может eval.
EVAL_PRIMITIVES = [r'Invoke-Expression', r'\biex\b', r'\[ScriptBlock\]::Create', r'\[scriptblock\]::Create', r'Invoke-Command']
# Мутирующие executors, которые agent-секция НЕ имеет права звать напрямую.
# Start-Heal/Start-Debloat — исключения, и ТОЛЬКО внутри Confirm-AgentPending (sanctioned dispatch).
FORBIDDEN_IN_AGENT = ['Invoke-Cleanup', 'Invoke-Restore', 'Invoke-Backup',
                      'Invoke-YouTubeInstall', 'Invoke-YouTubeUninstall', 'Invoke-YouTubeRunOnce']
SANCTIONED_IN_CONFIRM = ['Start-Heal', 'Start-Debloat']


def strip_ps_comments(text):
    """Гасит # ...-комментарии пробелами той же длины (смещения и номера строк сохраняются),
    чтобы grep-gate не ловил перечисление executors в комментарии-баннере."""
    out = []
    for line in text.split('\n'):
        i = line.find('#')
        if i != -1:
            line = line[:i] + ' ' * (len(line) - i)
        out.append(line)
    return '\n'.join(out)


def check_agent_safety(server_src):
    """grep-gate: ноль eval-примитивов в server.ps1; agent-секция не зовёт мутирующие executors
    напрямую; Start-Heal только в Confirm-AgentPending. Комментарии вырезаны."""
    issues = []
    orig = server_src
    stripped = strip_ps_comments(server_src)  # для поиска токенов (комментарии-баннер не ловим)
    for pat in EVAL_PRIMITIVES:
        for m in re.finditer(pat, stripped):
            ln = stripped[:m.start()].count('\n') + 1
            issues.append({'kind': 'eval', 'line': ln, 'detail': m.group(0)})
    # Границы секции ищем по ОРИГИНАЛУ (маркер сам начинается с # — в stripped он стёрт).
    # Смещения совпадают: strip сохраняет длину строк.
    start = orig.find('# Verus Hand —')
    end = orig.find('\nfunction Get-WinUpdateStatus')
    if start != -1 and end != -1 and end > start:
        section = stripped[start:end]
        base_line = stripped[:start].count('\n')
        for fn in FORBIDDEN_IN_AGENT:
            for m in re.finditer(re.escape(fn), section):
                ln = base_line + section[:m.start()].count('\n') + 1
                issues.append({'kind': 'forbidden_executor', 'line': ln, 'detail': fn})
        # Start-Heal/Start-Debloat допустимы ТОЛЬКО внутри Confirm-AgentPending
        cap = section.find('function Confirm-AgentPending')
        capend = section.find('\nfunction ', cap + 1) if cap != -1 else -1
        for fn in SANCTIONED_IN_CONFIRM:
            for m in re.finditer(re.escape(fn) + r'\b', section):
                pos = m.start()
                ok = (cap != -1 and pos > cap and (capend == -1 or pos < capend))
                if not ok:
                    ln = base_line + section[:pos].count('\n') + 1
                    issues.append({'kind': 'executor_outside_confirm', 'line': ln, 'detail': fn})
    else:
        issues.append({'kind': 'section_markers_missing', 'line': 0, 'detail': 'не найдены границы секции Verus Hand'})
    return issues


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--json', action='store_true')
    args = ap.parse_args()

    if not os.path.exists(INDEX):
        print(f'НЕ найден {INDEX}', file=sys.stderr)
        return 2

    src = open(INDEX, encoding='utf-8').read()
    js = extract_js(src)
    server_src = open(SERVER, encoding='utf-8').read() if os.path.exists(SERVER) else ''

    n_handlers, missing = check_unbound_handlers(src, js)
    syntax_ok, syntax_err = check_js_syntax(js)
    orphans = check_orphan_endpoints(src, server_src) if server_src else []
    agent_issues = check_agent_safety(server_src) if server_src else []

    errors = 0
    if args.json:
        import json
        print(json.dumps({
            'handlers_total': n_handlers,
            'unbound': missing,
            'js_syntax_ok': syntax_ok,
            'js_syntax_error': syntax_err,
            'orphan_endpoints': orphans,
            'agent_safety_issues': agent_issues,
        }, ensure_ascii=False, indent=2))
        return 1 if (missing or syntax_ok is False or orphans or agent_issues) else 0

    print('=' * 60)
    print('Verus UI smoke-test')
    print('=' * 60)

    print(f'\n[1] Unbound handlers (всего onclick-имён: {n_handlers})')
    if missing:
        errors += len(missing)
        for m in missing:
            print(f'  ✗ L{m["line"]:<5} {m["name"]:30} в "{m["context"]}"')
    else:
        print('  ✓ все handlers определены')

    print(f'\n[2] JS syntax')
    if syntax_ok is True:
        print('  ✓ node --check прошёл')
    elif syntax_ok is False:
        errors += 1
        print(f'  ✗ синтаксическая ошибка:\n{syntax_err}')
    else:
        print(f'  ⊘ {syntax_err}')

    print(f'\n[3] Orphan endpoints (fetch на /api/* которого нет в server.ps1)')
    if orphans:
        # это warning, не hard error (могут быть динамические пути) — но показываем
        for o in orphans:
            print(f'  ⚠ {o}')
        print('  (проверь вручную — может быть динамический путь или опечатка)')
    else:
        print('  ✓ все вызванные endpoints найдены в dispatch')

    print(f'\n[4] Verus Hand grep-gate (eval-примитивы + agent→executor)')
    if agent_issues:
        errors += len(agent_issues)
        for it in agent_issues:
            print(f'  ✗ L{it["line"]:<5} [{it["kind"]}] {it["detail"]}')
    else:
        print('  ✓ ноль eval; agent-секция не зовёт мутирующие executors напрямую')

    print('\n' + '=' * 60)
    if errors:
        print(f'РЕЗУЛЬТАТ: ✗ {errors} ошибок')
        return 1
    print('РЕЗУЛЬТАТ: ✓ чисто')
    return 0


if __name__ == '__main__':
    sys.exit(main())
