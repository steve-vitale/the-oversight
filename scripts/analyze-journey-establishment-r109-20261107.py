#!/usr/bin/env python3
"""r109 thin-beat analyzer. Reads evidence/2026-11-07/journey-establishment-r109-before-seed{1502,1504,1603,1604}.json
(the BEFORE-panel: r109 driver on the pre-fix engine) and
evidence/2026-11-07/journey-establishment-r109-seed{1502,1504,1603,1604}.json
(the AFTER-panel: same driver, same seeds, post-fix engine), plus the
-matching -convo-seed{seed}.txt people-check transcripts.
- Q1: THIN-BEAT STALL — stalls per seed before vs after (a stall is a held
  convo whose loop ends with no pick while still open: '(no pick)' or
  '(choices empty)' in the transcript, with the '(stall menu: ...)' line
  naming the offered menu). Bar: GO iff after stalls == 0 AND before
  stalls >= 1. Funnel deltas are DESCRIPTIVE only (shared-RNG divergence
  bars them from the verdict); pantry is judged on
  guardrails.pantryKcal (pre-people-check, the pure funnel number).
- Q2: prepLog 'no-teacher' split — after-panel why values must be one of
  teacher-away / teacher-unseeded / no-teacher-anywhere, with >=1 row in
  at least two classes; before-panel whys stay 'no-teacher' (proving the
  split is the Q2 change).
- M1b/M2/M3/M4: r108 continuity on the AFTER-panel (use classification,
  care visibility, survival + pantry guardrails, bars 3/4).
Usage: python3 scripts/analyze-journey-establishment-r109-20261107.py [EVIDDIR]
"""
import json, os, re, sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
EVID = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'evidence', '2026-11-07')
SEEDS = [1502, 1504, 1603, 1604]

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

def load(tag, seed, d=None):
    p = os.path.join(d or EVID, f'journey-establishment-{tag}-seed{seed}.json')
    return json.load(open(p))

def load_convo(tag, seed, d=None):
    p = os.path.join(d or EVID, f'journey-establishment-{tag}-convo-seed{seed}.txt')
    try:
        return open(p).read()
    except Exception as e:
        return None

INERT = {'diplomat', 'herbal_remedy', 'preserve_food', 'wound_care'}
AWARE = {'field_dressing', 'triage'}
SPLIT_WHY = {'teacher-away', 'teacher-unseeded', 'no-teacher-anywhere'}

def parse_convos(text):
    """Return {convos, stalls, stall_menus, ended_engine, names} from a -convo txt."""
    if text is None:
        return {'convos': 0, 'stalls': 0, 'stall_menus': [], 'ended_engine': 0, 'names': [], 'missing': True}
    names = re.findall(r'^-- (.+?) \([^)]+\) occ=', text, flags=re.M)
    stalls = len(re.findall(r'^\(no pick\)$', text, flags=re.M)) + len(re.findall(r'^\(choices empty\)$', text, flags=re.M))
    stall_menus = re.findall(r'^\(stall menu: (.*)\)$', text, flags=re.M)
    ended_engine = len(re.findall(r'^\(ended by engine\)$', text, flags=re.M))
    return {'convos': len(names), 'stalls': stalls, 'stall_menus': stall_menus,
            'ended_engine': ended_engine, 'names': names, 'missing': False}

funnel_rows = []
stall_before, stall_after = {}, {}
convo_before, convo_after = {}, {}
prep_panel = {'attempts': 0, 'lessons_ok': 0, 'already_holds': 0, 'no_teacher': 0,
              'whys': Counter(), 'split_classes': Counter(), 'rows': []}
prep_before_whys = Counter()
hunt = {'prep_calls': 0, 'prep_kills': 0, 'prep_kills_held': 0, 'prep_kills_notheld': 0,
        'prep_kcal_held': [], 'prep_kcal_notheld': [],
        'by_aid': defaultdict(lambda: {'held': [], 'notheld': []})}
held = defaultdict(list)
uses = defaultdict(list)
care = {'calls': 0, 'tends': 0, 'medics_seen': set(),
        'triage_medics': [], 'herbal_medics': [], 'healer_rounds': [],
        'treat_ticks': 0, 'treat_changed': 0, 'treat_healers': Counter()}
cook = {'calls': 0, 'rack_events': 0, 'holder_cooks': [], 'holder_blind': 0,
        'spec_cooks': 0, 'kept_weeks': 0, 'kept_couple': 0}
m3_seeds = m4_seeds = 0
panel_living = 0
hunter_wound_deaths = []
prep_fires_by_seed = {}

for seed in SEEDS:
    try:
        jb = load('r109-before', seed)
    except Exception as e:
        print(f'seed {seed}: BEFORE-PANEL MISSING/UNREADABLE {e}'); jb = None
    try:
        j = load('r109', seed)
    except Exception as e:
        print(f'seed {seed}: AFTER-PANEL MISSING/UNREADABLE {e}'); continue
    cb = parse_convos(load_convo('r109-before', seed))
    ca = parse_convos(load_convo('r109', seed))
    stall_before[seed] = cb['stalls']; stall_after[seed] = ca['stalls']
    convo_before[seed] = cb; convo_after[seed] = ca
    tele = j.get('teleAll') or []
    census = {str(c['id']): c for c in (j.get('census') or [])}
    hold_end = j.get('holdingsEnd') or []
    codex = j.get('playerCodexSkills') or {}
    player_vid = None
    for cid, c in census.items():
        if c.get('skills') is not None and set(c['skills']) == set(codex.keys()) and len(codex) > 0:
            player_vid = cid; break
    hold_end_v = [h for h in hold_end if str(h['id']) != str(player_vid)] if player_vid else hold_end
    holder_since = {}
    for t in tele:
        if t.get('skill') != 'field_dressing':
            continue
        learner = str(t.get('learner') or t.get('vid') or '')
        if not learner or learner == 'player':
            continue
        d = t.get('day')
        if d is None:
            continue
        if learner not in holder_since or d < holder_since[learner]:
            holder_since[learner] = d
    def pantry_of(x):
        g = (x or {}).get('guardrails') or {}
        return g.get('pantryKcal') if g.get('pantryKcal') is not None else (x or {}).get('pantryKcalEnd')
    funnel_rows.append({
        'seed': seed,
        'endDay_before': jb.get('endDay') if jb else None, 'endDay_after': j.get('endDay'),
        'alive_before': jb.get('aliveEnd') if jb else None, 'alive_after': j.get('aliveEnd'),
        'pantry_before': pantry_of(jb), 'pantry_after': pantry_of(j),
        'pantryEnd_before': jb.get('pantryKcalEnd') if jb else None, 'pantryEnd_after': j.get('pantryKcalEnd'),
        'over_before': jb.get('gameOver') if jb else None, 'over_after': j.get('gameOver'),
    })
    living = [h for h in hold_end_v if not h.get('dead')]
    panel_living += len(living)
    for h in living:
        owned = set(h.get('owned') or [])
        skills = set(h.get('skills') or [])
        checks = {
            'diplomat': 'diplomat' in owned,
            'herbal_remedy': ('herbal_remedy' in owned) or ('herbal_medicine' in skills),
            'field_dressing': ('field_dressing' in owned) or ('field_dressing' in skills),
            'preserve_food': 'preserve_food' in skills,
            'wound_care': 'wound_care' in skills,
            'triage': 'triage' in owned,
        }
        for iid, has in checks.items():
            if has:
                held[iid].append((seed, h.get('name')))
    for h in (j.get('huntLog') or []):
        hunt['prep_calls'] += 1
        if (h.get('kcal') or 0) > 0:
            hunt['prep_kills'] += 1
            aid = h.get('aid') or '?'
            if h.get('heldFieldDressing'):
                hunt['prep_kills_held'] += 1
                hunt['prep_kcal_held'].append(h['kcal'])
                hunt['by_aid'][aid]['held'].append(h['kcal'])
                uses['field_dressing'].append((seed, 'hunt-kill', f"{h.get('name')} {aid} {h['kcal']}kcal"))
            else:
                hunt['prep_kills_notheld'] += 1
                hunt['prep_kcal_notheld'].append(h['kcal'])
                hunt['by_aid'][aid]['notheld'].append(h['kcal'])
    prep_fires_by_seed[seed] = sum(1 for h in (j.get('huntLog') or []) if (h.get('kcal') or 0) > 0 and h.get('heldFieldDressing'))
    hs = j.get('huntStaff') or {}
    for p in (hs.get('prepLog') or []):
        prep_panel['rows'].append((seed, p.get('day'), p.get('hunterName'), p.get('teacherName'), p.get('kind'), p.get('ok'), p.get('why')))
        if p.get('kind') == 'lesson':
            prep_panel['attempts'] += 1
            if p.get('ok'):
                prep_panel['lessons_ok'] += 1
            else:
                prep_panel['whys'][str(p.get('why'))] += 1
        elif p.get('kind') == 'already-holds':
            prep_panel['already_holds'] += 1
        elif p.get('kind') == 'no-teacher':
            prep_panel['no_teacher'] += 1
            w = str(p.get('why'))
            prep_panel['whys'][w] += 1
            if w in SPLIT_WHY:
                prep_panel['split_classes'][w] += 1
    if jb:
        hsb = jb.get('huntStaff') or {}
        for p in (hsb.get('prepLog') or []):
            if p.get('kind') == 'no-teacher':
                prep_before_whys[str(p.get('why'))] += 1
    for c in (j.get('careLog') or []):
        care['calls'] += 1
        care['tends'] += c.get('tends') or 0
        meds = c.get('medics') or []
        if len(meds) == 1 and meds[0].get('heldTriage') and (c.get('tends') or 0) >= 2:
            uses['triage'].append((seed, 'care-reach-2', f"{meds[0].get('name')} tended 2 in one tick (reach 2)"))
        for m in meds:
            care['medics_seen'].add((seed, m.get('name')))
            if m.get('heldTriage'):
                care['triage_medics'].append((seed, m.get('name')))
            if m.get('heldHerbalRemedy'):
                care['herbal_medics'].append((seed, m.get('name')))
    for hr in (j.get('healerLog') or []):
        care['healer_rounds'].append((seed, hr.get('caregiverName'), hr.get('patientName'),
                                       hr.get('hpBefore'), hr.get('hpAfter'),
                                       hr.get('caregiverHeldHerbalRemedy'), hr.get('caregiverHeldTriage')))
    for t in (j.get('treatLog') or []):
        care['treat_ticks'] += 1
        if t.get('changed'):
            care['treat_changed'] += 1
            care['treat_healers'][str(t.get('healer'))] += 1
    for ck in (j.get('cookLog') or []):
        cook['calls'] += 1
        rack = ck.get('rackLines') or []
        if rack:
            cook['rack_events'] += 1
            for line in rack:
                if 'for weeks' in line:
                    cook['kept_weeks'] += 1
                elif 'couple of weeks' in line:
                    cook['kept_couple'] += 1
        if ck.get('holdsPreserveFood'):
            cook['holder_cooks'].append((seed, ck.get('name'), ck.get('specPreserver'), len(rack)))
            if (ck.get('specPreserver') or 0) == 0:
                cook['holder_blind'] += 1
        if (ck.get('specPreserver') or 0) > 0:
            cook['spec_cooks'] += 1
    if not j.get('gameOver') and (j.get('aliveAt40') or 0) >= 1:
        m3_seeds += 1
    starv = [d for d in (j.get('deaths') or []) if any(w in str(d.get('cause') or '').lower() for w in ('starvat', 'hunger', 'thirst', 'dehydrat'))]
    if not starv:
        m4_seeds += 1
    for d in (j.get('deaths') or []):
        if not d.get('player') and 'hunt' in str(d.get('cause') or '').lower():
            hunter_wound_deaths.append((seed, d.get('day'), d.get('who'), d.get('cause')))
    print(f'\n=== seed {seed} (after endDay {j.get("endDay")}, over {j.get("gameOver")}, aliveEnd {j.get("aliveEnd")}, wave {j.get("waveReached")}, pantryGuardrails {pantry_of(j)}, pantryEnd {j.get("pantryKcalEnd")}) ===')
    print(f'  convos: before {cb["convos"]} (stalls {cb["stalls"]}, ended-engine {cb["ended_engine"]}) | after {ca["convos"]} (stalls {ca["stalls"]}, ended-engine {ca["ended_engine"]})')
    for sm in cb['stall_menus']:
        print(f'  STALL-BEFORE seed {seed} menu: {sm}')
    for sm in ca['stall_menus']:
        print(f'  STALL-AFTER seed {seed} menu: {sm}')
    print(f'  2-leg funnel (DESCRIPTIVE): endDay before {funnel_rows[-1]["endDay_before"]} / after {funnel_rows[-1]["endDay_after"]} | alive before {funnel_rows[-1]["alive_before"]} / after {funnel_rows[-1]["alive_after"]} | pantry(guardrails) before {funnel_rows[-1]["pantry_before"]} / after {funnel_rows[-1]["pantry_after"]} | over before {funnel_rows[-1]["over_before"]} / after {funnel_rows[-1]["over_after"]}')
    print(f'  huntStaff: assignments={(hs.get("assignments") or 0)} refusals={len(hs.get("refusalLog") or [])} wounds={len(hs.get("woundLog") or [])} huntLog={len(j.get("huntLog") or [])} fieldDressingKills={prep_fires_by_seed[seed]} prepLog={len(hs.get("prepLog") or [])}')
    print(f'  holder-since field_dressing: {dict(sorted(holder_since.items(), key=lambda kv: kv[1]))}')
    print(f'  guardrails={j.get("guardrails")} c3={j.get("c3")}')

tot_cb = sum(c['convos'] for c in convo_before.values())
tot_ca = sum(c['convos'] for c in convo_after.values())
tot_sb = sum(stall_before.values())
tot_sa = sum(stall_after.values())
print(f'\nPANEL: livingVillagersEnd(after)={panel_living}')
print(f'  Q1 THIN-BEAT STALL (matched before/after, same driver, same seeds):')
print(f'    convos sampled: before {tot_cb} | after {tot_ca}')
print(f'    stalls: before {tot_sb} {dict(sorted(stall_before.items()))} | after {tot_sa} {dict(sorted(stall_after.items()))}')
if tot_sb >= 1 and tot_sa == 0:
    q1 = 'GO'
elif tot_sb == 0:
    q1 = 'SUBSTRATE-MISSING (defect did not reproduce pre-fix — no fix judged)'
elif tot_sa > 0:
    q1 = 'NO-GO (stalls persist post-fix)'
else:
    q1 = 'NO-GO'
print(f'  Q1 verdict: {q1}')
print(f'  Q2 PREPLOG SPLIT (after-panel): no-teacher rows={prep_panel["no_teacher"]} split classes={dict(prep_panel["split_classes"])} whys={dict(prep_panel["whys"])}')
print(f'    before-panel no-teacher whys (must stay old-style): {dict(prep_before_whys)}')
for r in prep_panel['rows']:
    print(f'    prep: seed {r[0]} d{r[1]} hunter={r[2]} teacher={r[3]} kind={r[4]} ok={r[5]} why={r[6]}')
unclassified = [r for r in prep_panel['rows'] if r[4] == 'no-teacher' and r[6] not in SPLIT_WHY]
if not unclassified and len(prep_panel['split_classes']) >= 2:
    q2 = 'GO'
elif unclassified:
    q2 = 'NO-GO (unclassified no-teacher rows remain)'
elif len(prep_panel['split_classes']) < 2:
    q2 = 'NO-GO (split did not discriminate: <2 classes fired)'
else:
    q2 = 'NO-GO'
print(f'  Q2 verdict: {q2} (unclassified={len(unclassified)}, classes fired={len(prep_panel["split_classes"])})')
print(f'  M1b USE-CLASSIFICATION (after-panel):')
verdict_classes = {}
for iid in ['diplomat', 'herbal_remedy', 'field_dressing', 'preserve_food', 'wound_care', 'triage']:
    holders = held.get(iid, [])
    us = uses.get(iid, [])
    cls = 'USED' if us else ('HELD-UNUSED' if holders else 'NEVER-HELD')
    verdict_classes[iid] = cls
    flag = 'STRUCTURALLY-INERT (no villager-aware read site)' if iid in INERT else 'villager-aware read site'
    print(f'    {iid}: {cls} | {flag} | holders={len(holders)} {holders if holders else ""} | uses={len(us)}')
    for u in us[:6]:
        print(f'      use: {u}')
print(f'  M2 CARE-VISIBILITY (after): careTicks={care["calls"]} tends={care["tends"]} medicsSeen={len(care["medics_seen"])} triageMedics={care["triage_medics"]} herbalMedics={care["herbal_medics"]}')
print(f'    healerRounds={len(care["healer_rounds"])} treatTicks={care["treat_ticks"]} treatChanged={care["treat_changed"]} treatHealers={dict(care["treat_healers"])}')
for hr in care['healer_rounds'][:10]:
    print(f'    round: seed {hr[0]} {hr[1]} -> {hr[2]} {hr[3]}->{hr[4]}HP heldHerbal={hr[5]} heldTriage={hr[6]}')
print(f'  cook/racks (after): cookDutyCalls={cook["calls"]} rackEvents={cook["rack_events"]} specCooks={cook["spec_cooks"]} holderCooks={len(cook["holder_cooks"])} holderBlind={cook["holder_blind"]} keepsWeeks={cook["kept_weeks"]} keepsCouple={cook["kept_couple"]}')
print(f'  M3 SURVIVAL-42 (after) {m3_seeds}/4 (bar 3/4) | M4 PANTRY (after) {m4_seeds}/4 (bar 3/4)')
if hunter_wound_deaths:
    print(f'  HUNTER-WOUND DEATHS (§14c): {hunter_wound_deaths}')
