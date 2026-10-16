#!/usr/bin/env python3
# scripts/adjudicate-fameredirect2-20261016.py — pilot adjudication for FAMEREDIRECT2.
# Mirrors measure-fameredirect2-20261016.js aggregate(); applies the pre-registered
# header thresholds from evidence/2026-10-16/sim-fameredirect2-b.md (§§9-12, 14).
import json, os, sys, glob
from statistics import median

BASE = os.path.join('evidence/2026-10-16')

def load(side):
    d = os.path.join(BASE, f'fameredirect2-{side}-perseed')
    files = sorted(glob.glob(os.path.join(d, '*.json')))
    runs = [json.load(open(f)) for f in files]
    return files, runs

def agg(runs):
    starve = sum(r.get('starveDeaths', 0) for r in runs)
    thirst = sum(r.get('thirstDeaths', 0) for r in runs)
    vdays = sum(r.get('villagerDays', 0) for r in runs)
    deaths = {}
    for r in runs:
        for k, v in (r.get('deaths') or {}).items():
            deaths[k] = deaths.get(k, 0) + v
    return {
        'n': len(runs),
        'starve': starve, 'thirst': thirst, 'vdays': vdays,
        'sp100vd': round(100 * starve / max(1, vdays), 3),
        'tp100vd': round(100 * thirst / max(1, vdays), 3),
        'medianDays': median([r['days'] for r in runs]),
        'maxDays': max(r['days'] for r in runs),
        'national': sum(r.get('national', 0) for r in runs),
        'table': sum(r.get('table', 0) for r in runs),
        'wins': sum(r.get('won', 0) for r in runs),
        'exiled': sum(r.get('exiled', 0) for r in runs),
        'redirects': sum((r.get('fam2Ledger') or {}).get('redirects', 0) for r in runs),
        'redir_wood': sum((r.get('fam2Ledger') or {}).get('redir_wood', 0) for r in runs),
        'redir_stone': sum((r.get('fam2Ledger') or {}).get('redir_stone', 0) for r in runs),
        'signals': sum((r.get('fam2Ledger') or {}).get('signals', 0) for r in runs),
        'blockedAway': sum((r.get('fam2Ledger') or {}).get('blockedAway', 0) for r in runs),
        'woodDelta': sum(r.get('woodDelta', 0) for r in runs),
        'hungryDays': sum(r.get('hungryDays', 0) for r in runs),
        'rotFresh': sum(r.get('rotFresh', 0) for r in runs),
        'deathCauses': deaths,
        'waveReachMax': max([r.get('waveReach', 1) for r in runs] + [1]),
        'maxArc': max([r.get('maxArc', 1) for r in runs] + [1]),
    }

for side in ('control', 'armed'):
    files, runs = load(side)
    keys = sorted((r['policy'], r['seed']) for r in runs)
    expect = {('leadfeast', s) for s in (11,22,33,44,55,66,77,88)} | \
             {('belongfeast', s) for s in (11,22,33,44,55,66,77,88)}
    print(f'{side}: {len(runs)} runs; expected coverage complete: {set(keys)==expect}')

fc, rc = load('control'); fa, ra = load('armed')
C, A = agg(rc), agg(ra)
print('\n=== CONTROL ==='); print(json.dumps(C, indent=1))
print('\n=== ARMED ==='); print(json.dumps(A, indent=1))

print('\n=== ADJUDICATION (pre-registered header) ===')
ok = True
def verdict(name, passed, detail):
    global ok
    ok = ok and passed
    print(('GO  ' if passed else 'NO-GO') + f' {name} — {detail}')

verdict('PRIMARY starvation sp100vd armed<=controlx0.6',
        A['sp100vd'] <= C['sp100vd'] * 0.6,
        f"armed {A['sp100vd']} vs bar {round(C['sp100vd']*0.6,3)} (control {C['sp100vd']}; {A['starve']} vs {C['starve']} deaths / {A['vdays']} vs {C['vdays']} vd)")
verdict('guardrail thirst deaths <= control+2',
        A['thirst'] <= C['thirst'] + 2,
        f"armed {A['thirst']} vs control {C['thirst']}")
verdict('guardrail national >= control-2',
        A['national'] >= C['national'] - 2,
        f"armed {A['national']} vs control {C['national']}")
verdict('guardrail median survival >= control-10d',
        A['medianDays'] >= C['medianDays'] - 10,
        f"armed {A['medianDays']}d vs control {C['medianDays']}d")
verdict('guardrail exiled <= control',
        A['exiled'] <= C['exiled'],
        f"armed {A['exiled']} vs control {C['exiled']}")
armedKeys = set(A['deathCauses']) - set(C['deathCauses'])
armedKeys = {k for k in armedKeys if A['deathCauses'][k] > 0}
verdict('guardrail no NEW death mode', not armedKeys, f'armed-only keys: {armedKeys or "none"}')
inert = all((r.get('fam2Ledger') or {}).get('redirects', 0) == 0 for r in rc)
verdict('instrument honesty: control inert', inert, 'all control redirects=0')
fired = A['redirects'] >= 1
verdict('instrument honesty: armed fired', fired, f"armed redirects={A['redirects']}")
print(f"\nWOOD COST (report-only): armed Δ{A['woodDelta']} vs control Δ{C['woodDelta']} (diff {A['woodDelta']-C['woodDelta']})")
print('\nVERDICT:', 'GO' if ok else 'NO-GO')
sys.exit(0 if ok else 1)
