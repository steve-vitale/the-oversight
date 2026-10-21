#!/usr/bin/env python3
# analyze-bond-events.py -- replay a journey-social pilot JSON's bondEvents
# through the engine's exact bondAdd rules to recover per-pair (v, depth),
# player-involved deep pairs, first-deep days, and channel attribution.
# Usage: python3 scripts/analyze-bond-events.py evidence/2026-10-20/journey-social-r35-pilot-s3204.json
import json, sys
from collections import Counter

def is_deep(b): return (b['v'] >= 30) or (b['depth'] >= 1)

for path in sys.argv[1:]:
    r = json.load(open(path))
    mn = r.get('meName', '?')
    bonds = {}
    first_deep_day = {}
    for e in sorted(r.get('bondEvents', []), key=lambda e: e['day']):
        a, b, dv, day = e['a'], e['b'], e['dv'], e['day']
        k = tuple(sorted([a, b]))
        bd = bonds.get(k, {'v': 0, 'depth': 0, 'day': 0, 'dayGain': 0})
        add = dv
        if dv > 0:
            if bd['day'] != day: bd['day'] = day; bd['dayGain'] = 0
            room = max(0, 6 - (bd['dayGain'] or 0))
            add = min(dv, room); bd['dayGain'] += add
        before = bd['v']
        bd['v'] = max(-100, min(100, before + add))
        crossed = lambda th: (before < th and bd['v'] >= th) or (before > th and bd['v'] <= th)
        if crossed(25) or crossed(50) or crossed(75): bd['depth'] = min(3, bd['depth'] + 1)
        if crossed(-25) or crossed(-50) or crossed(-75): bd['depth'] = max(-3, bd['depth'] - 1)
        was = is_deep({'v': before, 'depth': bd['depth']})  # depth-only approximation; v-crossing dominates
        if not was and is_deep(bd) and k not in first_deep_day:
            first_deep_day[k] = day
        bonds[k] = bd
    deep = {k: b for k, b in bonds.items() if is_deep(b)}
    mine_deep = sorted([(k, b) for k, b in deep.items() if mn in k],
                       key=lambda x: -x[1]['v'])
    chans = Counter()
    for e in r.get('bondEvents', []):
        chans[e['reason']] += e['dv']
    print(f"== {path.split('/')[-1]} (player: {mn})")
    print(f"  pairs={len(bonds)} deep={len(deep)} player-deep={len(mine_deep)}")
    for k, b in mine_deep[:12]:
        other = k[0] if k[1] == mn else k[1]
        print(f"    PLAYER x {other}: v={b['v']} depth={b['depth']} first-deep d{first_deep_day.get(k, '?')}")
    top = sorted(deep.items(), key=lambda x: -x[1]['v'])[:6]
    print("  top non-player deep pairs:")
    for k, b in top:
        if mn in k: continue
        print(f"    {k[0]} x {k[1]}: v={b['v']} depth={b['depth']}")
    print("  channels (total dv):", dict(chans.most_common(8)))
    neg = Counter(e['reason'] for e in r.get('bondEvents', []) if e['dv'] < 0)
    if neg: print("  negative:", dict(neg))
