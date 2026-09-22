"""Export an explicit public source manifest; never copy a working directory.

The destination must be absent or empty. Runtime data and the private Git
history are never input to this export. Works without Git in a source archive.
"""
import argparse
import hashlib
import json
import pathlib
import re
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
DENIED_PARTS = {'clients', 'portable', 'portable-cache', 'issued', 'master-software', '.git', '.claude', '__pycache__', 'landing', 'marketing'}
SECRET = re.compile(rb'gh[pousr]_[A-Za-z0-9]{30,}|sk-or-v1-[a-f0-9]{40,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|<RSAKeyValue>[^\r\n]{0,2500}<D[>]')

def export(output):
    manifest = json.loads((ROOT / 'public-files.json').read_text(encoding='utf-8'))
    output = output.resolve()
    if output == ROOT or ROOT.is_relative_to(output):
        raise ValueError('Output must not be the source or its parent')
    if output.exists() and any(output.iterdir()):
        raise ValueError('Output is not empty; use a new directory')
    approved = []
    for name in manifest:
        rel = pathlib.PurePosixPath(name)
        if rel.is_absolute() or '..' in rel.parts or set(rel.parts) & DENIED_PARTS or '-private' in rel.name:
            raise ValueError('Forbidden public path: ' + name)
        src = (ROOT / name).resolve()
        if not src.is_relative_to(ROOT) or not src.is_file():
            raise ValueError('Missing or escaping source: ' + name)
        data = src.read_bytes()
        if SECRET.search(data):
            raise ValueError('Possible secret in ' + name)
        if name == 'dashboard/price.json':
            doc = json.loads(data.decode('utf-8-sig'))
            doc.pop('мастер', None); doc.pop('оплата', None)
            data = (json.dumps(doc, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
        if name == 'dashboard/partners.json':
            data = b'{"contacts": []}\n'
        approved.append((name, data))
    output.mkdir(parents=True, exist_ok=True)
    for name, data in approved:
        dst = output / name; dst.parent.mkdir(parents=True, exist_ok=True); dst.write_bytes(data)
    # Publish a short release history, not internal audit narratives from the author checkout.
    shutil.copyfile(ROOT / 'docs/PUBLIC-CHANGELOG.md', output / 'CHANGELOG.md')
    shutil.copyfile(ROOT / 'scripts/public.gitattributes', output / '.gitattributes')
    hashes = {name: hashlib.sha256((output/name).read_bytes()).hexdigest() for name,_ in approved}
    hashes['CHANGELOG.md'] = hashlib.sha256((output/'CHANGELOG.md').read_bytes()).hexdigest()
    hashes['.gitattributes'] = hashlib.sha256((output/'.gitattributes').read_bytes()).hexdigest()
    print(json.dumps({'output': str(output), 'files': len(hashes), 'bytes': sum((output/n).stat().st_size for n in hashes)}, ensure_ascii=False))

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True, type=pathlib.Path)
    export(parser.parse_args().output)
