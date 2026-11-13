#!/usr/bin/env python3
"""r135 Q1 standalone: rung-2/3 visibility on the committed r134-after panel.
Same math as analyze-journey-establishment-r135-20261113.py (rung_window),
run standalone because that analyzer's main loop needs the r135 panels,
which do not exist until the Q2 before/after sims run. Reads
evidence/2026-11-12/journey-establishment-r134-after-seed{2501..2516}.json.
Usage: python3 scripts/analyze-journey-establishment-r135-rung.py
"""
import json, os, sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
EVID = os.path.join(ROOT, 'evidence', '2026-11-12')
SEEDS = list(range(2501, 2517))
SPECS = ['butcher', 'cook', 'preserver', 'spotter', 'builder']
WINDOWS = ('d1-d14', 'd14-d28', 'd28-dEnd')

def snap_of(practice, key):
    if not practice:
        return None, None
    entry = practice.get(key)
    if not entry or not entry.get('snap'):
        return None, None
    return entry.get('day'), {str(v['id']): v for v in entry['snap']}

def rung_window(a, b):
    out = {t: {'R2X': 0, 'R3X': 0, 'fx15': 0, 'fx30': 0, 'xp_gains': []} for t in SPECS}
    if a is None or b is None:
        return out
    for vid, va in a.items():
        vb = b.get(vid)
        if not vb:
            continue
        for t in SPECS:
            fa = (va.get('foodXp') or {}).get(t) or 0
            fb = (vb.get('foodXp') or {}).get(t) or 0
            sa = (va.get('specialist') or {}).get(t)
            sb = (vb.get('specialist') or {}).get(t)
            if sa == 1 and sb is not None and sb >= 2:
                out[t]['R2X'] += 1
            if sa == 2 and sb is not None and sb >= 3:
                out[t]['R3X'] += 1
            if fa < 15 <= fb:
                out[t]['fx15'] += 1
            if fa < 30 <= fb:
                out[t]['fx30'] += 1
            if fb > fa:
                out[t]['xp_gains'].append(fb - fa)
    return out

def med(xs):
    xs = sorted(xs)
    return xs[len(xs) // 2] if xs else None

def main():
    rung = {w: {t: {'R2X': 0, 'R3X': 0, 'fx15': 0, 'fx30': 0, 'xp_gains': []} for t in SPECS} for w in WINDOWS}
    stall = {w: {t: {'G': 0, 'W': 0, 'NEW': 0} for t in SPECS} for w in WINDOWS}
    nearmiss2 = {t: 0 for t in SPECS}
    nearmiss2_rows = []
    nearest15 = {t: [] for t in SPECS}
    seeds_read = 0
    for seed in SEEDS:
        p = os.path.join(EVID, f'journey-establishment-r134-after-seed{seed}.json')
        try:
            j = json.load(open(p))
        except Exception as e:
            print(f'seed {seed}: MISSING {e}')
            continue
        seeds_read += 1
        pr = j.get('practice') or {}
        _, m1 = snap_of(pr, 'd1')
        _, m14 = snap_of(pr, 'd14')
        _, m28 = snap_of(pr, 'd28')
        _, mE = snap_of(pr, 'dEnd')
        for wkey, a, b in (('d1-d14', m1, m14), ('d14-d28', m14, m28), ('d28-dEnd', m28, mE)):
            rw = rung_window(a, b)
            for t in SPECS:
                rung[wkey][t]['R2X'] += rw[t]['R2X']
                rung[wkey][t]['R3X'] += rw[t]['R3X']
                rung[wkey][t]['fx15'] += rw[t]['fx15']
                rung[wkey][t]['fx30'] += rw[t]['fx30']
                rung[wkey][t]['xp_gains'].extend(rw[t]['xp_gains'])
                # stall context: G/W/NEW
                if a and b:
                    for vid, va in a.items():
                        vb = b.get(vid)
                        if not vb:
                            continue
                        fa = (va.get('foodXp') or {}).get(t) or 0
                        fb = (vb.get('foodXp') or {}).get(t) or 0
                        if fb > fa:
                            stall[wkey][t]['G'] += fb - fa
                            stall[wkey][t]['W'] += 1
                        sa = (va.get('specialist') or {}).get(t)
                        sb = (vb.get('specialist') or {}).get(t)
                        if sa == 0 and sb is not None and sb > 0:
                            stall[wkey][t]['NEW'] += 1
        if m28 and mE:
            for vid, v28 in m28.items():
                vE = mE.get(vid)
                if not vE:
                    continue
                for t in SPECS:
                    f28 = (v28.get('foodXp') or {}).get(t) or 0
                    fE = (vE.get('foodXp') or {}).get(t) or 0
                    if 5 <= f28 <= 14 and fE < 15:
                        nearmiss2[t] += 1
                        nearmiss2_rows.append((seed, vE.get('name') or vid, t, f28, fE))
                    if 5 <= fE <= 14:
                        nearest15[t].append((fE, seed, vE.get('name') or vid))
    print(f'Q1 RUNG-2/3 VISIBILITY (rung panel = r134-after, {seeds_read}/16 seeds):')
    print('  rung math (code): rung1 foodXp>=5, rung2 >=15, rung3 >=30; above 5 XP accrues 2:1, so rung2 needs 25 granting units from 0, rung3 needs 55.')
    for w in WINDOWS:
        parts = []
        for t in ('butcher', 'cook', 'preserver', 'builder'):
            d = rung[w][t]
            g = d['xp_gains']
            parts.append(f"{t} R2X={d['R2X']} R3X={d['R3X']} fx15={d['fx15']} fx30={d['fx30']} XP/worker med={med(g)} max={max(g) if g else 0} n={len(g)}")
        print(f'  {w}: ' + ' | '.join(parts))
    tot_r2x = sum(rung[w][t]['R2X'] for w in WINDOWS for t in SPECS)
    tot_r3x = sum(rung[w][t]['R3X'] for w in WINDOWS for t in SPECS)
    tot_fx15 = sum(rung[w][t]['fx15'] for w in WINDOWS for t in SPECS)
    tot_fx30 = sum(rung[w][t]['fx30'] for w in WINDOWS for t in SPECS)
    print(f'  panel totals: spec 1->2 R2X={tot_r2x} | spec 2->3 R3X={tot_r3x} | foodXp 15-crossings={tot_fx15} | foodXp 30-crossings={tot_fx30}')
    print(f'  NEAR-MISS-2 (5-14 foodXp at d28, still <15 at dEnd): {nearmiss2} total={sum(nearmiss2.values())}')
    for r in nearmiss2_rows[:20]:
        print(f'    near-miss-2: seed {r[0]} {r[1]} {r[2]} foodXp d28={r[3]} dEnd={r[4]}')
    print('  NEAREST to rung 2 at dEnd (5-14 foodXp, per specialty, top 5):')
    for t in SPECS:
        near = sorted(nearest15[t], reverse=True)[:5]
        print(f'    {t}: {[(f, s, n) for (f, s, n) in near]}')
    print('  stall context (r134 panel, same windows):')
    for w in WINDOWS:
        parts = []
        for t in ('butcher', 'cook', 'preserver', 'builder'):
            d = stall[w][t]
            parts.append(f"{t} G={d['G']} W={d['W']} NEW={d['NEW']}")
        print(f'    {w}: ' + ' | '.join(parts))
    if tot_r2x >= 1:
        print(f'  Q1 RUNG verdict: R2-REACHABLE ({tot_r2x} spec-2 crossings panel-wide)')
    else:
        print('  Q1 RUNG verdict: R2-BEYOND-LEG (0 spec-2 crossings panel-wide)')
    print(f'  Q1 R3 (descriptive): {tot_r3x} spec-3 crossings (expected 0)')

if __name__ == '__main__':
    main()
