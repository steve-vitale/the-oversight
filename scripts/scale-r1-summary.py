#!/usr/bin/env python3
"""Summarize journey-scale-r1 per-seed JSONs for the run note + metrics."""
import json, glob, sys
from collections import Counter

fps = sorted(glob.glob(sys.argv[1] if len(sys.argv) > 1 else 'evidence/2026-10-15/journey-scale-r1-leadcourt-*.json'))
n = 0
nat = hold = 0
watch = table = 0
alive140 = 0
viewers = []
print(f"{'seed':>6} {'day':>4} {'end':>10} {'wave':>4} {'scale':>8} {'nat':>3} {'view':>4} {'seat':>7} {'pop':>7} links")
for fp in fps:
    d = json.load(open(fp))
    n += 1
    fs = d.get('finalSnap') or {}
    scale = fs.get('scale')
    natLive = bool(fs.get('nationalLive'))
    viewers.append(fs.get('viewership') or 0)
    pop = sum(1 for c in d.get('census', []) if c.get('alive'))
    roster = len(d.get('census', []))
    links = [l for l in (fs.get('links') or []) if l.get('status') == 'active']
    natEvents = [e for e in d.get('scaleLog', []) if e.get('ev') == 'national-on']
    if natEvents: nat += 1
    if natLive: hold += 1
    if (fs.get('viewership') or 0) >= 32: watch += 1
    tt = d.get('tableTele', [])
    if tt: table += 1
    if d.get('maxGameDay', 0) >= 140: alive140 += 1
    vw = fs.get('viewership') or 0
    print(f"{d['seed']:>6} {d.get('maxGameDay'):>4} {(d.get('endReason') or '')[:10]:>10} {str(d.get('finalWave')):>4} {str(scale):>8} {'ON' if natLive else 'off':>3} {vw:>4} {str(fs.get('tableSeat')):>7} {pop:>2}/{roster:<3} " + ','.join(f"{l['other'][:10]}:t{l['trust']}/{l['age']}d" for l in links))
    # deedLog window checkpoints (dedupe by day — harness replays can double-push)
    seen = set()
    for e in d.get('deedLog', []):
        if e.get('day') in seen: continue
        seen.add(e.get('day'))
        ls = [l for l in (e.get('links') or []) if l.get('status') == 'active']
        print(f"    d{e['day']}: scale={e.get('scale')} nat={'ON' if e.get('nationalLive') else 'off'} view={e.get('viewership')} seat={e.get('tableSeat')} pantry={e.get('pantry')} links=" + ';'.join(f"{l['other'][:10]}:t{l['trust']}/{l['age']}d{'S' if l.get('seasoned') else ''}" for l in ls))
    # scale transitions
    for e in d.get('scaleLog', []):
        print(f"    SCALEEV d{e['day']}: {e['ev']} view={e.get('viewership')}")
    # national beat notes
    for e in d.get('regionalLog', []):
        if e.get('ev') in ('national', 'global', 'accord', 'propose', 'demand', 'tribute'):
            print(f"    REG d{e.get('day')}: {e['ev']} {e.get('shape','')} {e.get('how','')} {e.get('target','')} {str(e.get('lines',''))[:120]}")
    dh = d.get('deathHonesty', {})
    if (dh.get('mislabels') or []):
        print(f"    MISLABELS: {dh['mislabels']}")
print(f"\nMETRICS: n={n} national={nat} holdAtEnd={hold} viewership>=32={watch} tableTele={table} alive140={alive140}")
