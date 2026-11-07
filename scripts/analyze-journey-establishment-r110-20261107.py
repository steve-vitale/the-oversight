#!/usr/bin/env python3
"""r110 second-month-practice analyzer. Reads evidence/2026-11-07/journey-establishment-r110-seed{1502,1504,1603,1604}.json
(the r110 panel: r110 driver on current master) and the r109 after-panel
evidence/2026-11-07/journey-establishment-r109-seed{seed}.json (funnel
reference — the r110 driver is trajectory-identical to r109's except for
pure-read practice snapshots, so every funnel key must reproduce exactly),
plus the matching -convo-seed{seed}.txt people-check transcripts.
- FUNNEL-REPRO: per-seed funnel keys (endDay/aliveEnd/aliveAt40/wave/
  pantryKcalEnd/guardrails/c3/deaths/teleTypes/skillCounts/huntStaff
  counts/daily rows) must EQUAL the r109 after-panel, and the convo
  transcripts must be byte-identical. A divergence is investigated, not
  waved (prereg).
- Q1: SECOND-MONTH PRACTICE — attributed moved competence cells d28->dEnd
  per seed (same villager id in both snaps; attributed iff practice reps
  > 0 in that task at the later snap). Bar: GO iff >=1 attributed moved
  cell d28->dEnd on >=3/4 seeds. NO-GO iff 0 on >=2 seeds. Missing d28 or
  dEnd snapshots count that seed as 0 moves and are flagged as an
  instrument gap.
- Q2: HOLDER-SINCE DATING — every living dEnd field_dressing holder dated
  to a <=14-day window (telemetry villager_skill day, else snapshot
  bracket d1 seeded / (d1,d14] / (d14,d28] / (d28,dEnd]). Bar: GO iff 0
  undatable AND >=1 gain in the d14-dEnd window. UNEXERCISED if 0 gains
  in-window.
- M1b/M2/M3/M4: r108/r109 continuity on the r110 panel (use
  classification, care visibility, survival + pantry guardrails, bars 3/4).
Usage: python3 scripts/analyze-journey-establishment-r110-20261107.py [EVIDDIR]
"""
import json, os, re, sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
EVID = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'evidence', '2026-11-07')
SEEDS = [1502, 1504, 1603, 1604]

TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend']
SPECS = ['butcher', 'cook', 'preserver', 'spotter', 'builder']

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
    """Same as r109 (Amendment 1): a '(no pick — winding down)' is a clean
    ending, NOT a stall. Only a plain '(no pick)' / '(choices empty)' while
    open and not winding down counts."""
    if text is None:
        return {'convos': 0, 'stalls': 0, 'wound_down': 0, 'stall_menus': [], 'ended_engine': 0, 'names': [], 'missing': True}
    names = re.findall(r'^-- (.+?) \([^)]+\) occ=', text, flags=re.M)
    stalls = len(re.findall(r'^\(no pick\)$', text, flags=re.M)) + len(re.findall(r'^\(choices empty\)$', text, flags=re.M))
    wound_down = len(re.findall(r'^\(no pick \u2014 winding down\)$', text, flags=re.M))
    stall_menus = re.findall(r'^\(stall menu: (.*)\)$', text, flags=re.M)
    ended_engine = len(re.findall(r'^\(ended by engine\)$', text, flags=re.M))
    return {'convos': len(names), 'stalls': stalls, 'wound_down': wound_down, 'stall_menus': stall_menus,
            'ended_engine': ended_engine, 'names': names, 'missing': False}

def snap_of(practice, key):
    """practice[key] is {day, snap} or None. Returns (day, {id: villager})."""
    if not practice:
        return None, None
    entry = practice.get(key)
    if not entry or not entry.get('snap'):
        return None, None
    return entry.get('day'), {str(v['id']): v for v in entry['snap']}

def count_moves(a, b):
    """Moved competence cells between two snapshots (same villager id in
    both; died/left excluded). Attributed iff practice reps > 0 in that
    task at the later snapshot."""
    moved = 0; attributed = 0; tasks = Counter(); lines = []
    if a is None or b is None:
        return {'moved': None, 'attributed': None, 'tasks': tasks, 'lines': lines, 'missing': True}
    for vid, va in a.items():
        vb = b.get(vid)
        if not vb:
            continue
        for t in TASKS:
            ca = (va.get('competence') or {}).get(t)
            cb = (vb.get('competence') or {}).get(t)
            if ca is None or cb is None or cb == ca:
                continue
            moved += 1
            tasks[t] += 1
            reps = ((vb.get('practice') or {}).get(t) or 0)
            if reps > 0:
                attributed += 1
            lines.append(f"  {vb.get('name') or vid} {t}: {ca} -> {cb} (reps {reps})")
    return {'moved': moved, 'attributed': attributed, 'tasks': tasks, 'lines': lines, 'missing': False}

def skill_moves(a, b):
    """Skill 0->positive moves + npcSkills gained between two snapshots."""
    pos = 0; gained = []
    if a is None or b is None:
        return {'pos': None, 'gained': gained, 'missing': True}
    for vid, va in a.items():
        vb = b.get(vid)
        if not vb:
            continue
        for t in SPECS:
            sa = (va.get('specialist') or {}).get(t)
            sb = (vb.get('specialist') or {}).get(t)
            if sa == 0 and sb is not None and sb > 0:
                pos += 1; gained.append(f"{vb.get('name') or vid}:{t} specialist {sa}->{sb}")
            fa = (va.get('foodXp') or {}).get(t) or 0
            fb = (vb.get('foodXp') or {}).get(t) or 0
            if fa == 0 and fb > 0:
                pos += 1; gained.append(f"{vb.get('name') or vid}:{t} foodXp 0->{fb}")
        ka = set(va.get('npcSkills') or []); kb = (vb.get('npcSkills') or [])
        for s in kb:
            if s not in ka:
                gained.append(f"{vb.get('name') or vid}: skill {s}")
    return {'pos': pos, 'gained': gained, 'missing': False}

funnel_rows = []
repro = {}
practice_panel = {'seeds': 0, 'missing_snaps': [], 'win': {}}
for w in ('d1-d14', 'd14-d28', 'd28-dEnd'):
    practice_panel['win'][w] = {'moved': 0, 'attributed': 0, 'tasks': Counter(), 'seeds_with_move': 0, 'seeds_attributed': 0}
practice_panel['skill_pos'] = 0
practice_panel['skills_gained'] = []
practice_panel['reps_end'] = 0
dating = {'holders': 0, 'undatable': [], 'gains_in_window': 0, 'dated': []}
prep_panel = {'attempts': 0, 'lessons_ok': 0, 'already_holds': 0, 'no_teacher': 0,
              'whys': Counter(), 'split_classes': Counter(), 'rows': []}
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
q1_seeds_attributed = 0

for seed in SEEDS:
    try:
        jr = load('r109', seed)
    except Exception as e:
        print(f'seed {seed}: R109 REFERENCE MISSING/UNREADABLE {e}'); jr = None
    try:
        j = load('r110', seed)
    except Exception as e:
        print(f'seed {seed}: R110 PANEL MISSING/UNREADABLE {e}'); continue
    cr = load_convo('r109', seed)
    ca = parse_convos(load_convo('r110', seed))
    # --- FUNNEL REPRODUCTION (r110 vs r109 after-panel) ---
    diffs = []
    if jr is None:
        diffs.append('r109-reference-missing')
    else:
        for k in ('endDay', 'aliveEnd', 'aliveAt40', 'waveReached', 'pantryKcalEnd'):
            if j.get(k) != jr.get(k):
                diffs.append(f'{k}: r110={j.get(k)} r109={jr.get(k)}')
        for k in ('deaths', 'popAlive', 'pantryKcal'):
            if (j.get('guardrails') or {}).get(k) != (jr.get('guardrails') or {}).get(k):
                diffs.append(f'guardrails.{k}: r110={(j.get("guardrails") or {}).get(k)} r109={(jr.get("guardrails") or {}).get(k)}')
        if (j.get('c3') or {}).get('starvationDeaths') != (jr.get('c3') or {}).get('starvationDeaths'):
            diffs.append(f"c3.starvationDeaths: r110={(j.get('c3') or {}).get('starvationDeaths')} r109={(jr.get('c3') or {}).get('starvationDeaths')}")
        if json.dumps(j.get('deaths'), sort_keys=True) != json.dumps(jr.get('deaths'), sort_keys=True):
            diffs.append('deaths list differs')
        if (j.get('teleTypes') or {}) != (jr.get('teleTypes') or {}):
            diffs.append('teleTypes differ')
        if (j.get('skillCounts') or {}) != (jr.get('skillCounts') or {}):
            diffs.append('skillCounts differ')
        hs, hsr = (j.get('huntStaff') or {}), (jr.get('huntStaff') or {})
        if (hs.get('assignments') or 0) != (hsr.get('assignments') or 0):
            diffs.append(f"huntStaff.assignments: r110={hs.get('assignments')} r109={hsr.get('assignments')}")
        if len(hs.get('refusalLog') or []) != len(hsr.get('refusalLog') or []):
            diffs.append('huntStaff.refusalLog length differs')
        if len(hs.get('woundLog') or []) != len(hsr.get('woundLog') or []):
            diffs.append('huntStaff.woundLog length differs')
        if len(hs.get('prepLog') or []) != len(hsr.get('prepLog') or []):
            diffs.append('huntStaff.prepLog length differs')
        if json.dumps(j.get('daily'), sort_keys=True) != json.dumps(jr.get('daily'), sort_keys=True):
            diffs.append('daily rows differ')
        if (cr is None) != (load_convo('r110', seed) is None):
            diffs.append('convo file presence differs')
        elif cr is not None and cr != load_convo('r110', seed):
            diffs.append('convo transcript differs (NOT byte-identical)')
    repro[seed] = diffs
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
        'endDay_ref': jr.get('endDay') if jr else None, 'endDay': j.get('endDay'),
        'alive_ref': jr.get('aliveEnd') if jr else None, 'alive': j.get('aliveEnd'),
        'pantry_ref': pantry_of(jr), 'pantry': pantry_of(j),
        'over_ref': jr.get('gameOver') if jr else None, 'over': j.get('gameOver'),
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
    # --- Q1 PRACTICE ---
    practice = j.get('practice') or {}
    d1day, m1 = snap_of(practice, 'd1')
    d14day, m14 = snap_of(practice, 'd14')
    d28day, m28 = snap_of(practice, 'd28')
    dEndday, mEnd = snap_of(practice, 'dEnd')
    practice_panel['seeds'] += 1
    if m1 is None or m28 is None or mEnd is None:
        practice_panel['missing_snaps'].append((seed, {'d1': d1day, 'd14': d14day, 'd28': d28day, 'dEnd': dEndday}))
    win_results = {}
    for wkey, a, b in (('d1-d14', m1, m14), ('d14-d28', m14, m28), ('d28-dEnd', m28, mEnd)):
        r = count_moves(a, b)
        win_results[wkey] = r
        if not r['missing']:
            practice_panel['win'][wkey]['moved'] += r['moved']
            practice_panel['win'][wkey]['attributed'] += r['attributed']
            for t, n in r['tasks'].items():
                practice_panel['win'][wkey]['tasks'][t] += n
            if r['moved'] > 0:
                practice_panel['win'][wkey]['seeds_with_move'] += 1
            if r['attributed'] > 0:
                practice_panel['win'][wkey]['seeds_attributed'] += 1
    r28e = win_results['d28-dEnd']
    if not r28e['missing'] and r28e['attributed'] >= 1:
        q1_seeds_attributed += 1
    for wkey, a, b in (('d1-d14', m1, m14), ('d14-d28', m14, m28), ('d28-dEnd', m28, mEnd)):
        sm = skill_moves(a, b)
        if not sm['missing']:
            practice_panel['skill_pos'] += sm['pos']
            for g in sm['gained']:
                practice_panel['skills_gained'].append(f'seed {seed} {wkey}: {g}')
    if mEnd:
        for vid, v in mEnd.items():
            for t in TASKS:
                practice_panel['reps_end'] += ((v.get('practice') or {}).get(t) or 0)
    # --- Q2 HOLDER DATING (field_dressing) ---
    if mEnd:
        # name/id lookup for telemetry learner matching (tele rows carry ids
        # or names; snapshots carry both).
        id2name = {vid: (v.get('name') or vid) for vid, v in mEnd.items()}
        name2id = {v.get('name'): vid for vid, v in mEnd.items() if v.get('name')}
        for vid, v in mEnd.items():
            if v.get('alive') is False:
                continue
            if 'field_dressing' not in (v.get('npcSkills') or []):
                continue
            dating['holders'] += 1
            nm = v.get('name') or vid
            # telemetry day: learner key may be the id or the name.
            tele_day = None
            for key in (vid, nm):
                if key in holder_since:
                    d = holder_since[key]
                    tele_day = d if tele_day is None else min(tele_day, d)
            # snapshot bracket: earliest snapshot holding the skill.
            bracket = None
            for key, snapmap in (('d1', m1), ('d14', m14), ('d28', m28), ('dEnd', mEnd)):
                if snapmap and vid in snapmap and 'field_dressing' in (snapmap[vid].get('npcSkills') or []):
                    bracket = {'d1': 'seeded (d1)', 'd14': '(d1,d14]', 'd28': '(d14,d28]', 'dEnd': '(d28,dEnd]'}[key]
                    bracket_key = key
                    break
            if tele_day is not None:
                dating['dated'].append((seed, nm, f'telemetry d{tele_day}', bracket))
                if tele_day > 14:
                    dating['gains_in_window'] += 1
            elif bracket is not None:
                dating['dated'].append((seed, nm, f'snapshot {bracket}', bracket))
                if bracket_key in ('d14', 'd28', 'dEnd'):
                    dating['gains_in_window'] += 1
            else:
                dating['undatable'].append((seed, nm))
    print(f'\n=== seed {seed} (endDay {j.get("endDay")}, over {j.get("gameOver")}, aliveEnd {j.get("aliveEnd")}, wave {j.get("waveReached")}, pantryGuardrails {pantry_of(j)}, pantryEnd {j.get("pantryKcalEnd")}) ===')
    print(f'  FUNNEL-REPRO vs r109: {"REPRODUCED" if not repro[seed] else "DIVERGED: " + "; ".join(repro[seed])}')
    print(f'  convos: {ca["convos"]} (stalls {ca["stalls"]}, wound-down {ca["wound_down"]}, ended-engine {ca["ended_engine"]})')
    for sm in ca['stall_menus']:
        print(f'  STALL seed {seed} menu: {sm}')
    print(f'  2-leg funnel (DESCRIPTIVE): endDay ref {funnel_rows[-1]["endDay_ref"]} / r110 {funnel_rows[-1]["endDay"]} | alive ref {funnel_rows[-1]["alive_ref"]} / r110 {funnel_rows[-1]["alive"]} | pantry(guardrails) ref {funnel_rows[-1]["pantry_ref"]} / r110 {funnel_rows[-1]["pantry"]} | over ref {funnel_rows[-1]["over_ref"]} / r110 {funnel_rows[-1]["over"]}')
    print(f'  practice snaps: d1 day={d1day} n={len(m1) if m1 else None} | d14 day={d14day} n={len(m14) if m14 else None} | d28 day={d28day} n={len(m28) if m28 else None} | dEnd day={dEndday} n={len(mEnd) if mEnd else None}')
    for wkey in ('d1-d14', 'd14-d28', 'd28-dEnd'):
        r = win_results[wkey]
        if r['missing']:
            print(f'  practice {wkey}: MISSING SNAPSHOT (instrument gap)')
        else:
            print(f'  practice {wkey}: moved={r["moved"]} attributed={r["attributed"]} tasks={dict(r["tasks"])}')
            for l in r['lines']:
                print(l)
    print(f'  huntStaff: assignments={(hs.get("assignments") or 0)} refusals={len(hs.get("refusalLog") or [])} wounds={len(hs.get("woundLog") or [])} huntLog={len(j.get("huntLog") or [])} fieldDressingKills={prep_fires_by_seed[seed]} prepLog={len(hs.get("prepLog") or [])}')
    print(f'  holder-since field_dressing: {dict(sorted(holder_since.items(), key=lambda kv: kv[1]))}')
    print(f'  guardrails={j.get("guardrails")} c3={j.get("c3")}')

print(f'\nPANEL: livingVillagersEnd={panel_living}')
print(f'  FUNNEL-REPRO (r110 vs r109 after-panel, same driver base + pure-read snapshots):')
all_repro = True
for seed in SEEDS:
    d = repro.get(seed)
    if d is None:
        print(f'    seed {seed}: NO R110 PANEL')
        all_repro = False
    elif not d:
        print(f'    seed {seed}: REPRODUCED')
    else:
        print(f'    seed {seed}: DIVERGED: {"; ".join(d)}')
        all_repro = False
print(f'  FUNNEL-REPRO verdict: {"REPRODUCED" if all_repro else "DIVERGED — investigate before judging Q1/Q2"}')
print(f'  Q1 SECOND-MONTH PRACTICE (d28->dEnd attributed moved cells):')
for wkey in ('d1-d14', 'd14-d28', 'd28-dEnd'):
    w = practice_panel['win'][wkey]
    print(f'    {wkey}: moved={w["moved"]} attributed={w["attributed"]} seedsWithMove={w["seeds_with_move"]}/4 seedsAttributed={w["seeds_attributed"]}/4 tasks={dict(w["tasks"])}')
print(f'    skill0->pos (all windows)={practice_panel["skill_pos"]} practiceReps(dEnd)={practice_panel["reps_end"]}')
for g in practice_panel['skills_gained']:
    print(f'    skill: {g}')
if practice_panel['missing_snaps']:
    print(f'    MISSING SNAPSHOTS (instrument gap): {practice_panel["missing_snaps"]}')
if q1_seeds_attributed >= 3:
    q1 = 'GO'
elif q1_seeds_attributed <= 1 and practice_panel['win']['d28-dEnd']['attributed'] == 0:
    q1 = 'NO-GO (movement stalls in month 2: 0 attributed d28->dEnd cells panel-wide)' if q1_seeds_attributed == 0 else 'NO-GO (attributed d28->dEnd movement on <3/4 seeds)'
else:
    q1 = 'NO-GO (attributed d28->dEnd movement on <3/4 seeds)'
print(f'  Q1 verdict: {q1} (seeds with >=1 attributed d28->dEnd cell: {q1_seeds_attributed}/4)')
print(f'  Q2 HOLDER-SINCE DATING (field_dressing, living dEnd holders):')
print(f'    holders={dating["holders"]} undatable={len(dating["undatable"])} gains in d14-dEnd window={dating["gains_in_window"]}')
for row in dating['dated']:
    print(f'    dated: seed {row[0]} {row[1]} via {row[2]} (bracket {row[3]})')
for row in dating['undatable']:
    print(f'    UNDATABLE: seed {row[0]} {row[1]}')
if dating['undatable']:
    q2 = 'NO-GO (undatable holders remain)'
elif dating['gains_in_window'] >= 1:
    q2 = 'GO'
elif practice_panel['missing_snaps']:
    q2 = 'UNEXERCISED (snapshot gap — dEnd holders not visible, dating cannot be judged)'
else:
    q2 = 'UNEXERCISED (0 gains in d14-dEnd window — not a failure, report as such)'
print(f'  Q2 verdict: {q2}')
print(f'  Q2 PREPLOG SPLIT (r110 panel): no-teacher rows={prep_panel["no_teacher"]} split classes={dict(prep_panel["split_classes"])} whys={dict(prep_panel["whys"])}')
print(f'    lesson attempts={prep_panel["attempts"]} lessons_ok={prep_panel["lessons_ok"]} already_holds={prep_panel["already_holds"]}')
for r in prep_panel['rows']:
    print(f'    prep: seed {r[0]} d{r[1]} hunter={r[2]} teacher={r[3]} kind={r[4]} ok={r[5]} why={r[6]}')
print(f'  M1b USE-CLASSIFICATION:')
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
print(f'  M2 CARE-VISIBILITY: careTicks={care["calls"]} tends={care["tends"]} medicsSeen={len(care["medics_seen"])} triageMedics={care["triage_medics"]} herbalMedics={care["herbal_medics"]}')
print(f'    healerRounds={len(care["healer_rounds"])} treatTicks={care["treat_ticks"]} treatChanged={care["treat_changed"]} treatHealers={dict(care["treat_healers"])}')
for hr in care['healer_rounds'][:10]:
    print(f'    round: seed {hr[0]} {hr[1]} -> {hr[2]} {hr[3]}->{hr[4]}HP heldHerbal={hr[5]} heldTriage={hr[6]}')
print(f'  cook/racks: cookDutyCalls={cook["calls"]} rackEvents={cook["rack_events"]} specCooks={cook["spec_cooks"]} holderCooks={len(cook["holder_cooks"])} holderBlind={cook["holder_blind"]} keepsWeeks={cook["kept_weeks"]} keepsCouple={cook["kept_couple"]}')
print(f'  M3 SURVIVAL-42 {m3_seeds}/4 (bar 3/4) | M4 PANTRY {m4_seeds}/4 (bar 3/4)')
if hunter_wound_deaths:
    print(f'  HUNTER-WOUND DEATHS (§14c): {hunter_wound_deaths}')
