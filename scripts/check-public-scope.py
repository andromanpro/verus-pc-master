"""Check the exact tracked publication scope before CI exports or builds it."""
import json
from pathlib import Path, PurePosixPath
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'public-files.json').read_text(encoding='utf-8'))
expected=set(manifest)|{'CHANGELOG.md','.gitattributes'}
for name in expected:
    path=PurePosixPath(name)
    if path.is_absolute() or '..' in path.parts or set(path.parts)&{'landing','marketing','.git','clients','portable','issued'} or '-private' in path.name:
        sys.exit('Forbidden publication path: '+name)
    if not (ROOT/name).is_file():sys.exit('Missing publication file: '+name)
top=subprocess.run(['git','-C',str(ROOT),'rev-parse','--show-toplevel'],capture_output=True,text=True)
if top.returncode==0 and Path(top.stdout.strip()).resolve()==ROOT:
    tracked=set(subprocess.check_output(['git','-C',str(ROOT),'ls-files','-z']).decode('utf-8').split('\0'))-{''}
    extra=tracked-expected
    missing=expected-tracked
    if extra or missing:
        print(json.dumps({'unapproved':sorted(extra),'not_tracked':sorted(missing)},ensure_ascii=False,indent=2))
        sys.exit(1)
print('Public scope verified: '+str(len(expected))+' files')
