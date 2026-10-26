#!/usr/bin/env python3
# split-racksvoice-gate-b.py — split a SWEEP_CENSUS sweep stdout log into
# per-seed JSON files. Short-lived writer (flap-proof: the long-running
# sweep process never writes files itself).
# Usage: python3 scripts/split-racksvoice-gate-b.py <sweep-log> <corpus-dir>
import json, sys, os

log, outdir = sys.argv[1], sys.argv[2]
os.makedirs(outdir, exist_ok=True)
n = 0
for line in open(log, encoding='utf-8'):
    line = line.rstrip('\n')
    if not line.startswith('PERSEED-CENSUS '):
        continue
    rest = line[len('PERSEED-CENSUS '):]
    name, _, payload = rest.partition(' ')
    rec = json.loads(payload)
    assert rec['seed'] is not None and str(rec['seed']) in name, (name, rec.get('seed'))
    path = os.path.join(outdir, name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(payload)
    back = json.load(open(path, encoding='utf-8'))
    assert back['seed'] == rec['seed']
    n += 1
print(f'split {n} per-seed files into {outdir}')
