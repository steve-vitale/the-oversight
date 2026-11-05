#!/usr/bin/env python3
"""r103 strict-use analyzer. Reads evidence/2026-11-05/journey-establishment-r103-seed{1501..1504}.json.
For each skill_lesson row L (seq S), evidence = a later telemetry row (seq > S),
type != 'villager_skill', naming the learner as actor AND the skill (or its
skill-lane ability, mapped via src/data/abilities.json, else the id itself).
Categories: ONWARD / CRAFT / ABILITY / FIGHT (NEW: skill_used rows from the
r103 field-fight instrument) / OTHER. See prereg for the binding definition.
Usage: python3 scripts/analyze-journey-establishment-r103-20261105.py [EVIDDIR]
"""
import json, os, sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
EVID = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'evidence', '2026-11-05')
SEEDS = [1501, 1502, 1503, 1504]

# ability id -> skill id for lane='skill' abilities
abil2skill = {}
try:
    for a in json.load(open(os.path.join(ROOT, 'src', 'data', 'abilities.json'))):
        if a and a.get('lane') == 'skill':
            abil2skill[a['id']] = a.get('skillId') or a['id']
except Exception as e:
    print('abilities map unavailable:', e)

ACTOR_KEYS = ('vid', 'teacher', 'learner', 'who', 'actor')
SKILL_KEYS = ('skill', 'ability', 'track', 'id', 'item')

def row_skill(r):
    for k in SKILL_KEYS:
        v = r.get(k)
        if v is None:
            continue
        v = str(v)
        if r.get('type') in ('ability_used', 'skill_used'):
            # skill-lane ability id -> its skill; else the id itself
            # (e.g. 'stalk' is both a taught skill id and an ability id).
            return abil2skill.get(v) or v
        return v
    return None

def row_actors(r):
    return [str(r[k]) for k in ACTOR_KEYS if r.get(k) is not None]

tot_lessons = tot_evidence = 0
cat_tot = Counter(); skill_tot = Counter(); skill_ev = Counter()
m1_seeds = m3_seeds = m4_seeds = 0
for seed in SEEDS:
    p = os.path.join(EVID, f'journey-establishment-r103-seed{seed}.json')
    try:
        j = json.load(open(p))
    except Exception as e:
        print(f'seed {seed}: MISSING/UNREADABLE {p} ({e})'); continue
    tele = j.get('teleAll') or []
    census = {str(c['id']): c for c in (j.get('census') or [])}
    # player vid: census entry whose skill set equals the player codex skill set
    codex = j.get('playerCodexSkills') or {}
    player_vid = None
    for cid, c in census.items():
        if c.get('skills') is not None and set(c['skills']) == set(codex.keys()) and len(codex) > 0:
            player_vid = cid; break
    lessons = [t for t in tele if t.get('type') == 'skill_lesson']
    ev = []
    for L in lessons:
        learner = str(L.get('learner')); skill = str(L.get('skill')); S = L.get('seq', 0)
        found = None
        for R in tele:
            if R.get('seq', 0) <= S or R.get('type') == 'villager_skill':
                continue
            if learner not in row_actors(R):
                continue
            rs = row_skill(R)
            if rs != skill:
                continue
            if R.get('type') == 'skill_lesson' and str(R.get('teacher')) == learner:
                cat = 'ONWARD'
            elif R.get('type') in ('armor_craft', 'ammo_craft'):
                cat = 'CRAFT'
            elif R.get('type') == 'ability_used':
                cat = 'ABILITY'
            elif R.get('type') == 'skill_used':
                cat = 'FIGHT'
            else:
                cat = 'OTHER'
            found = (cat, R.get('seq'), R.get('type'), R.get('day')); break
        dead = bool(census.get(learner, {}).get('dead'))
        last = tele[-1].get('seq', 0) if tele else 0
        noopp = dead or (last - S) < 20
        ev.append({'lesson': L, 'evidence': found, 'learnerDead': dead, 'noopp': noopp})
        skill_tot[skill] += 1
        if found:
            cat_tot[found[0]] += 1; skill_ev[skill] += 1
    n_ev = sum(1 for e in ev if e['evidence'])
    tot_lessons += len(lessons); tot_evidence += n_ev
    distinct = len(set(str(t.get('skill')) for t in lessons))
    if len(lessons) >= 5 and distinct >= 3: m1_seeds += 1
    if not j.get('gameOver') and (j.get('aliveAt40') or 0) >= 1: m3_seeds += 1
    starv = [d for d in (j.get('deaths') or []) if any(w in str(d.get('cause') or '').lower() for w in ('starvat', 'hunger', 'thirst'))]
    if not starv: m4_seeds += 1
    print(f'\n=== seed {seed} (endDay {j.get("endDay")}, over {j.get("gameOver")}, aliveEnd {j.get("aliveEnd")}, aliveAt40 {j.get("aliveAt40")}, wave {j.get("waveReached")}, pantryEnd {j.get("pantryKcalEnd")}, playerVid {player_vid}) ===')
    print(f'  LESSONS: {len(lessons)} distinctSkills={distinct} {dict(Counter(str(t.get("skill")) for t in lessons))}')
    print(f'  SKILL_USED rows: {sum(1 for t in tele if t.get("type") == "skill_used")} ({dict(Counter(str(t.get("skill")) for t in tele if t.get("type") == "skill_used"))}) ability_used: {sum(1 for t in tele if t.get("type") == "ability_used")}')
    print(f'  STRICT-USE: {n_ev}/{len(lessons)} cats={dict(Counter(e["evidence"][0] for e in ev if e["evidence"]))} noopp={sum(1 for e in ev if e["noopp"])} learnerDead={sum(1 for e in ev if e["learnerDead"])}')
    for e in ev:
        L = e['lesson']
        nm = (census.get(str(L.get('learner')), {}) or {}).get('name', L.get('learner'))
        print(f'    {"EV " if e["evidence"] else "-- "}{nm}:{L.get("skill")}@d{L.get("day")} seq{L.get("seq")} -> {e["evidence"] or "-"} {"(noopp)" if e["noopp"] else ""}')
    print(f'  deaths={len(j.get("deaths") or [])} starv={len(starv)} contests={j.get("contestCounts")} npcCraftAttempts={sum(1 for x in (j.get("npcCraftLog") or []) if x.get("attempted"))} armorEnd={[(c["name"], c.get("ownedArmor"), [x for x in (c.get("equipped") or []) if "armor" in x]) for c in (j.get("census") or []) if c.get("ownedArmor") or any("armor" in x for x in (c.get("equipped") or []))]}')
print(f'\nPANEL: lessons={tot_lessons} strictEvidence={tot_evidence} rate={(tot_evidence/tot_lessons if tot_lessons else 0):.2f} cats={dict(cat_tot)}')
print(f'  per-skill: ' + '; '.join(f'{s} {skill_ev[s]}/{skill_tot[s]}' for s in sorted(skill_tot)))
print(f'  M1 LESSONS-FLOOR {m1_seeds}/4 | M3 SURVIVAL-42 {m3_seeds}/4 | M4 PANTRY {m4_seeds}/4')
print(f'  M2 VERDICT: {"USE-VISIBLE" if tot_lessons and tot_evidence/tot_lessons >= 1/3 else "USE-INVISIBLE"}')
