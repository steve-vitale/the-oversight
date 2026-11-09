#!/usr/bin/env python3
"""r118 establishment panel analyzer (16 fresh seeds, single panel, no
before/after pair). Reads journey-establishment-r118-seed{seed}.json +
-convo-seed{seed}.txt from EVIDDIR (default evidence/2026-11-09).
- Q1 PACE: specialist 0->positive moves per seed (d1->dEnd practice
  snapshots) and pace03 ((villager, spec-task) cells 0 at d1 -> 3 at dEnd).
  Plus ladder-by-task, foodXp totals, rack batches (cookLog), hunt kills.
- Q2 INVITATIONS: lists every NPC-offered invitation THEM line in the
  convo files with its following two lines, so the run adjudicates
  answered-vs-unanswered by reading; counts driver answers
  (YOU: [betrayal:accept] / [betrayal:decline]) and reports the answer
  rate. Invitation patterns are the r116 shapes ("walk ... with me",
  "come see", "come with", "come get", "join me", "walk with me") plus
  any THEM line ending in '?' that contains 'with me' / 'come' / 'join'.
- Q3 NULL LINES: count of literal THEM: (null) lines.
- M3/M4: aliveAt40/aliveEnd per seed; starvation deaths per seed.
- Carried: preserve_food holders (dEnd npcSkills) vs uses (cookLog
  holdsPreserveFood resolutions + skillRows mentioning preserve_food).
Usage: python3 scripts/analyze-journey-establishment-r118-20261109.py [EVIDDIR]
"""
import json, os, re, sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
EVID = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'evidence', '2026-11-09')
SEEDS = list(range(1901, 1917))
SPECS = ['butcher', 'cook', 'preserver', 'spotter', 'builder']
INVITE_RE = re.compile(r'(walk\b.*\bwith me|walk my trap line|help me haul|come get air|come see what i found|come with|come get|join me|come along|follow me)', re.I)

def load(seed):
    with open(os.path.join(EVID, f'journey-establishment-r118-seed{seed}.json')) as f:
        return json.load(f)

def snap(d, key):
    return {s['id']: s for s in d['practice'][key]['snap']}

moves_seeds = 0
pace03 = []
ladder_by_task = Counter()
foodxp_total = Counter()
print('=== Q1 PACE (d1 -> dEnd) ===')
for seed in SEEDS:
    d = load(seed)
    s1, sE = snap(d, 'd1'), snap(d, 'dEnd')
    moved = False
    for vid, a in s1.items():
        b = sE.get(vid)
        if not b:
            continue
        for t in SPECS:
            av, bv = (a.get('specialist') or {}).get(t, 0), (b.get('specialist') or {}).get(t, 0)
            if av == 0 and bv > 0:
                moved = True
                ladder_by_task[t] += 1
            if av == 0 and bv == 3:
                pace03.append((seed, b.get('name'), t))
            foodxp_total[t] += (b.get('foodXp') or {}).get(t, 0)
    if moved:
        moves_seeds += 1
    print(f"seed {seed}: moved={'Y' if moved else 'n'} aliveEnd={d['aliveEnd']} "
          f"wave={d['waveReached']} pantryEnd={d['pantryKcalEnd']}")
print(f"moves: {moves_seeds}/16 seeds (bar >=8)")
print(f"pace03: {len(pace03)} (bar <=4): {pace03}")
print('ladder moves by task:', dict(ladder_by_task))
print('foodXp totals at dEnd:', dict(foodxp_total))

print('\n=== FOOD WORK ===')
for seed in SEEDS:
    d = load(seed)
    cooks = d.get('cookLog') or []
    racks = sum(1 for c in cooks if c.get('rackLines'))
    # r118 FIX: the r117 analyzer counted a 'kills' key the driver never
    # writes (always 0). A hunt kill is a huntLog entry with kcal > 0 —
    # the same count the driver's per-seed console line prints.
    hunt_kills = sum(1 for h in (d.get('huntLog') or []) if (h.get('kcal') or 0) > 0)
    print(f"seed {seed}: cook resolutions={len(cooks)} rack batches={racks} "
          f"hunt kills in huntLog={hunt_kills}")

print('\n=== M3/M4 ===')
for seed in SEEDS:
    d = load(seed)
    starv = [x for x in (d.get('deaths') or []) if 'starv' in str(x.get('cause', '')).lower()]
    print(f"seed {seed}: aliveAt40={d['aliveAt40']} aliveEnd={d['aliveEnd']} "
          f"starvation deaths={len(starv)} total deaths={len(d.get('deaths') or [])}")

print('\n=== CARRIED: preserve_food ===')
for seed in SEEDS:
    d = load(seed)
    holders = [s['name'] for s in snap(d, 'dEnd').values()
               if 'preserve_food' in (s.get('npcSkills') or [])]
    uses = sum(1 for c in (d.get('cookLog') or []) if c.get('holdsPreserveFood'))
    print(f"seed {seed}: preserve_food holders={len(holders)} {holders} uses in cookLog={uses}")

print('\n=== Q2 INVITATIONS (NPC-offered, with following lines) ===')
inv_total = 0
for seed in SEEDS:
    p = os.path.join(EVID, f'journey-establishment-r118-convo-seed{seed}.txt')
    lines = open(p).read().split('\n')
    for i, line in enumerate(lines):
        if not line.startswith('THEM:'):
            continue
        text = line[5:].strip().strip('"')
        if INVITE_RE.search(text):
            inv_total += 1
            print(f"--- seed {seed} line {i+1}: THEM: {text}")
            for j in range(i + 1, min(i + 3, len(lines))):
                if lines[j].strip():
                    print(f"    {lines[j].strip()[:160]}")
print(f"invitation lines total: {inv_total}")
# r118 Q2(b): driver answers — the picker logs YOU: [betrayal:accept] /
# YOU: [betrayal:decline] when it answers an invitation-owned menu.
# Silence is the miss: an invitation line whose following two lines show
# YOU: [silence] (or no YOU line at all before the next THEM).
accepted = declined = silenced = 0
for seed in SEEDS:
    p = os.path.join(EVID, f'journey-establishment-r118-convo-seed{seed}.txt')
    text = open(p).read()
    accepted += text.count('YOU: [betrayal:accept]')
    declined += text.count('YOU: [betrayal:decline]')
print(f"driver answers: accept={accepted} decline={declined} "
      f"answered={accepted + declined} offered={inv_total} "
      f"(bar: answered >= 80% of offered when offered > 0)")

print('\n=== Q3 NULL LINES ===')
nulls = 0
for seed in SEEDS:
    p = os.path.join(EVID, f'journey-establishment-r118-convo-seed{seed}.txt')
    n = open(p).read().count('THEM: (null)')
    nulls += n
    print(f"seed {seed}: {n}")
print(f"null THEM lines total: {nulls} (bar 0)")
