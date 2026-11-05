#!/usr/bin/env python3
"""r104 holdings analyzer. Reads evidence/2026-11-05/journey-establishment-r104-seed{1501..1504}.json
and the r103 panel for M0 + the silent set.
- M0: r104 reproduces r103 endDay/aliveEnd/pantryKcalEnd exactly; lesson sets
  identical modulo wall-clock-id'd learners (teacher/skill/day, learner by name).
- M1: holdings — per living villager at end: granted magic slots, owned union,
  skills, XP levels. Silent-set classification: HELD-BUT-SILENT / NEVER-HELD / FIRED.
- M2: diplomat / herbal_medicine held + fired.
- M3/M4: survival + pantry guardrails (same as r103).
Usage: python3 scripts/analyze-journey-establishment-r104-20261105.py [EVIDDIR]
"""
import json, os, sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
EVID = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'evidence', '2026-11-05')
SEEDS = [1501, 1502, 1503, 1504]

# ability id -> skill id for lane='skill' abilities; lane map for source split
abil2skill = {}
abil_lane = {}
try:
    for a in json.load(open(os.path.join(ROOT, 'src', 'data', 'abilities.json'))):
        if a and a.get('id'):
            abil_lane[a['id']] = a.get('lane')
            if a.get('lane') == 'skill':
                abil2skill[a['id']] = a.get('skillId') or a['id']
except Exception as e:
    print('abilities map unavailable:', e)

# ffFired completion-site ids (src/js/fieldFights.js, r103 instrument)
FF_SITES = ['ambush', 'blood_trail', 'bodyguard', 'brawler_instinct', 'come_get_some',
            'dead_aim', 'draw_fire', 'echo_location', 'field_medicine', 'freeze_tag',
            'game_sense', 'haymaker', 'hogtie', 'intimidating_presence', 'leech',
            'patient_aim', 'peacemaker', 'rally', 'scream_cheese', 'shield_wall',
            'shoulder_check', 'stalk', 'tracker', 'trade_of_blows', 'tripwire',
            'unbreakable', 'war_cry']

THRESHOLDS = [18, 48, 96, 192, 384]
TRACKS = ['combat', 'field', 'social', 'craft', 'strange']

def level_for(xp):
    return sum(1 for t in THRESHOLDS if (xp or 0) >= t)

def load(tag, seed):
    p = os.path.join(EVID, f'journey-establishment-{tag}-seed{seed}.json')
    return json.load(open(p))

# --- r103 panel: fired set + M0 reference ---
r103 = {}
fired_103 = Counter()
for seed in SEEDS:
    try:
        j = load('r103', seed)
    except Exception as e:
        print(f'r103 seed {seed}: MISSING {e}'); continue
    r103[seed] = j
    for t in (j.get('teleAll') or []):
        if t.get('type') == 'skill_used':
            fired_103[str(t.get('skill'))] += 1
SILENT = sorted(set(FF_SITES) - set(fired_103))
print(f'r103 panel: skill_used rows={sum(fired_103.values())} fired ids={sorted(fired_103)}')
print(f'R103-SILENT set ({len(SILENT)}): {SILENT}')

ACTOR_KEYS = ('vid', 'teacher', 'learner', 'who', 'actor')
SKILL_KEYS = ('skill', 'ability', 'track', 'id', 'item')

def row_skill(r):
    for k in SKILL_KEYS:
        v = r.get(k)
        if v is None:
            continue
        v = str(v)
        if r.get('type') in ('ability_used', 'skill_used'):
            return abil2skill.get(v) or v
        return v
    return None

def row_actors(r):
    return [str(r[k]) for k in ACTOR_KEYS if r.get(k) is not None]

m0_seeds = []
m3_seeds = m4_seeds = 0
panel_living = 0
panel_granted_holders = 0
panel_owned_holders = 0
silent_holders = defaultdict(set)   # silent id -> set of (seed, villager name) holders
silent_fires = Counter()            # silent id -> fires in r104 panel
grant_growth = 0
grant_growth_names = []
xp_nearest = []  # (gap-to-next-threshold, seed, name, track)
diplomat = {'held': [], 'fired': 0}
herbal = {'held': [], 'fired': 0}
for seed in SEEDS:
    try:
        j = load('r104', seed)
    except Exception as e:
        print(f'seed {seed}: MISSING/UNREADABLE {e}'); continue
    tele = j.get('teleAll') or []
    census = {str(c['id']): c for c in (j.get('census') or [])}
    hold_end = j.get('holdingsEnd') or []
    hold_start = {str(h['id']): h for h in (j.get('holdingsStart') or [])}
    # --- M0 vs r103 ---
    ref = r103.get(seed)
    m0 = None
    lesson_note = ''
    if ref:
        same = (j.get('endDay') == ref.get('endDay') and j.get('aliveEnd') == ref.get('aliveEnd')
                and j.get('pantryKcalEnd') == ref.get('pantryKcalEnd'))
        # lesson sets: (teacher-name, skill, day), learner matched by name
        def lesson_keyset(jj):
            keys = []
            cen = {str(c['id']): c for c in (jj.get('census') or [])}
            for t in (jj.get('teleAll') or []):
                if t.get('type') != 'skill_lesson':
                    continue
                teacher = (cen.get(str(t.get('teacher')), {}) or {}).get('name', t.get('teacher'))
                learner = (cen.get(str(t.get('learner')), {}) or {}).get('name', t.get('learner'))
                keys.append((str(teacher), str(t.get('skill')), t.get('day'), str(learner)))
            return Counter(keys)
        lk104 = lesson_keyset(j)
        lk103 = lesson_keyset(ref)
        diff = (lk104 - lk103) + (lk103 - lk104)
        lesson_note = f'lessons r104={sum(lk104.values())} r103={sum(lk103.values())} diff={dict(diff) if diff else "none"}'
        m0 = same and not diff
        m0_seeds.append(m0)
    # --- holdings ---
    living = [h for h in hold_end if not h.get('dead')]
    granted_holders = [h for h in living if (h.get('granted') or [])]
    owned_holders = [h for h in living if (h.get('owned') or [])]
    panel_living += len(living)
    panel_granted_holders += len(granted_holders)
    panel_owned_holders += len(owned_holders)
    # silent-set classification inputs
    for h in living:
        owned = set(h.get('owned') or [])
        for sid in SILENT:
            if sid in owned:
                silent_holders[sid].add((seed, h.get('name')))
        if 'diplomat' in owned:
            diplomat['held'].append((seed, h.get('name')))
        if 'herbal_medicine' in owned or 'herbal_remedy' in owned:
            herbal['held'].append((seed, h.get('name')))
    # in-window growth: owned set grew start -> end
    for h in living:
        st = hold_start.get(str(h['id']))
        if not st:
            continue
        grew = set(h.get('owned') or []) - set(st.get('owned') or [])
        if grew:
            grant_growth += 1
            grant_growth_names.append((seed, h.get('name'), sorted(grew)))
        # nearest-to-next-threshold (end XP record)
        xp = h.get('xp') or {}
        for tr in TRACKS:
            cur = xp.get(tr) or 0
            nxt = next((t for t in THRESHOLDS if cur < t), None)
            if nxt is not None:
                xp_nearest.append((nxt - cur, seed, h.get('name'), tr, cur, nxt))
    # fires in this run's telemetry (skill_used + ability_used naming a roster villager)
    id2name = {str(h['id']): h.get('name') for h in hold_end}
    for t in tele:
        if t.get('type') not in ('skill_used', 'ability_used'):
            continue
        sk = row_skill(t)
        actors = row_actors(t)
        if not any(a in id2name for a in actors):
            continue
        for sid in SILENT:
            if sk == sid or (t.get('type') == 'skill_used' and str(t.get('skill')) == sid):
                silent_fires[sid] += 1
        rs = row_skill(t)
        if t.get('type') != 'villager_skill' and rs == 'diplomat':
            diplomat['fired'] += 1
        if t.get('type') != 'villager_skill' and rs in ('herbal_medicine', 'herbal_remedy'):
            herbal['fired'] += 1
    # M3 / M4
    if not j.get('gameOver') and (j.get('aliveAt40') or 0) >= 1:
        m3_seeds += 1
    starv = [d for d in (j.get('deaths') or []) if any(w in str(d.get('cause') or '').lower() for w in ('starvat', 'hunger', 'thirst'))]
    if not starv:
        m4_seeds += 1
    print(f'\n=== seed {seed} (endDay {j.get("endDay")}, over {j.get("gameOver")}, aliveEnd {j.get("aliveEnd")}, wave {j.get("waveReached")}, pantryEnd {j.get("pantryKcalEnd")}, playerAbilities {j.get("playerAbilitiesEnd")}) ===')
    print(f'  M0 vs r103: {"PASS" if m0 else "FAIL"} {lesson_note}')
    print(f'  HOLDINGS end: living={len(living)} grantedHolders={len(granted_holders)} ownedHolders={len(owned_holders)}')
    for h in hold_end:
        g = h.get('granted') or []
        o = h.get('owned') or []
        skill_derived = [x for x in o if x not in g]
        xp = h.get('xp') or {}
        lvls = {tr: level_for(xp.get(tr)) for tr in TRACKS if (xp.get(tr) or 0) > 0}
        print(f'    {"DEAD " if h.get("dead") else ""}{h.get("name")}: granted={g} skillDerived={skill_derived} skills={len(h.get("skills") or [])} xpLevels={lvls if lvls else "-"}')
    print(f'  skill_used rows: {sum(1 for t in tele if t.get("type") == "skill_used")} ability_used: {sum(1 for t in tele if t.get("type") == "ability_used")}')

print(f'\nPANEL: livingEnd={panel_living} grantedHolders={panel_granted_holders} ownedHolders={panel_owned_holders}')
print(f'  M0 INSTRUMENT-NEUTRALITY: {sum(1 for x in m0_seeds if x)}/{len(m0_seeds)} seeds exact')
print(f'  M1a SHARE holding >=1 granted (magic) ability: {panel_granted_holders}/{panel_living} = {(panel_granted_holders/panel_living if panel_living else 0):.2f} -> {"WIDESPREAD" if panel_living and panel_granted_holders/panel_living >= 0.5 else ("SPARSE" if panel_living and panel_granted_holders/panel_living >= 0.1 else "RARE")}')
print(f'  M1a SHARE holding >=1 owned ability (any source): {panel_owned_holders}/{panel_living} = {(panel_owned_holders/panel_living if panel_living else 0):.2f}')
print(f'  M1b SILENT-SET classification:')
n_held_silent = n_never = n_fired = 0
for sid in SILENT:
    holders = silent_holders.get(sid, set())
    fires = silent_fires.get(sid, 0)
    cls = 'FIRED' if fires else ('HELD-BUT-SILENT' if holders else 'NEVER-HELD')
    if cls == 'FIRED':
        n_fired += 1
    elif cls == 'HELD-BUT-SILENT':
        n_held_silent += 1
    else:
        n_never += 1
    print(f'    {sid}: {cls} holders={sorted(holders) if holders else "-"} fires={fires}')
print(f'    verdict: {"HOLDINGS-EXPLAIN-SILENCE" if n_held_silent == 0 and n_fired == 0 else ("FIRING-GAP" if n_never == 0 and n_fired == 0 else "MIXED")} (held-silent={n_held_silent} never-held={n_never} fired={n_fired})')
print(f'  M1c IN-WINDOW GRANTS: villagers whose owned set grew: {grant_growth} {"GRANTS-HAPPEN" if grant_growth else "NO-GRANTS"} {grant_growth_names if grant_growth_names else ""}')
xp_nearest.sort()
print(f'  nearest-to-next-threshold (top 5): {xp_nearest[:5]}')
print(f'  M2 diplomat: held={diplomat["held"]} firedRows={diplomat["fired"]}')
print(f'  M2 herbal_medicine/remedy: held={herbal["held"]} firedRows={herbal["fired"]}')
print(f'  M3 SURVIVAL-42 {m3_seeds}/4 | M4 PANTRY {m4_seeds}/4')
