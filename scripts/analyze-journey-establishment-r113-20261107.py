#!/usr/bin/env python3
"""r113 specialist-ladder-PACE analyzer. Reads the BEFORE panel
(r113-before files, all 16 seeds — FRESH on current master, because src/js/
moved since the r112 fix: conversation.js, game.js, party.js,
villager-build.js) and the AFTER panel (r113-after files, all 16 seeds),
plus the matching -convo-seed{seed}.txt people-check transcripts.
- DRIVER-NEUTRALITY (seed 1502 only): the r113-before seed-1502 file (r113
  driver on the UNFIXED engine) must reproduce the r112-driver-on-master
  seed-1502 funnel keys EXACTLY (file tag r112-master42) — the driver
  changes are a tag rename only, so any difference is driver drift, not
  the fix. A divergence stops the verdict.
- BEFORE/AFTER (all 16 seeds, aggregate by design): the fix moves
  trajectories through real skill effects (rack rates, duty mults), so the
  panel comparison is aggregate (alive/pantry/wave/deaths/skill movement),
  not a funnel-repro.
- Q1: SPECIALIST LADDER PACE — specialist 0->positive moves on the AFTER
  panel (per seed, from the practice snapshots d1->dEnd). Bar: GO iff
  moves on >=8/16 seeds. Plus LADDER-BY-TASK (foodXp accrual per task per
  window), GRANT EVENTS (rack resolutions / hunt kills with a foodXp delta,
  from the driver wraps), TIME-TO-FIRST-MOVE (earliest window with a
  spec 0->positive move), SKILL DISTRIBUTION at dEnd per task.
- Q2 (standing): menu:more NULL LINES — 0 literal THEM: (null) lines
  across the 16 after-panel people-check transcripts (bar 0).
- M3/M4: survival + pantry guardrails, bars 12/16 (r111's 3/4, scaled).
Usage: python3 scripts/analyze-journey-establishment-r113-20261107.py [EVIDDIR]
"""
import json, os, re, sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
EVID = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'evidence', '2026-11-07')
MATCHED = [1502, 1504, 1603, 1604]
NEW = list(range(17101, 17113))
SEEDS = MATCHED + NEW

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
    """Same as r110 (Amendment 1): a '(no pick — winding down)' is a clean
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

def normalize_nav(body):
    """Navigation turns: r110 logs THEM: (null) after a menu:more pick;
    r111 logs THEM: (menu page turned). Both are the same event — a
    pagination tap with no new NPC line — so they normalize to one token.
    ONLY immediately after a menu:more pick; a (null) anywhere else is a
    real difference and is NOT normalized (a genuine null line after any
    other pick still diverges the compare)."""
    lines = body.split('\n')
    out = []
    prev_pick = None
    for ln in lines:
        if ln.startswith('YOU: ['):
            m = re.match(r'YOU: \[([^\]]+)\]', ln)
            prev_pick = m.group(1) if m else None
            out.append(ln)
        elif ln in ('THEM: (null)', 'THEM: (menu page turned)') and prev_pick == 'menu:more':
            out.append('THEM: (nav-turn)')
            prev_pick = None
        else:
            if ln.startswith('THEM:'):
                prev_pick = None
            out.append(ln)
    return '\n'.join(out)

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

def ladder_stats(a, b):
    """Specialist-ladder moves between two snapshots (same villager id in
    both; died/left excluded). spec0pos: specialist 0->positive; foodXp0pos:
    foodXp 0->positive. plus1pool: (villager, task) cells with occupation
    skill>0 AND foodXp>=5 at the later snapshot (the +1 rung's addressable
    pool); stepped: pool cells whose skill actually rose. wastedXp:
    0-skill cells holding foodXp>0 at the later snapshot — XP the gate can
    never spend. foodXpEnd/occSkillCells are filled by the caller from the
    later snapshot."""
    out = {'spec0pos': 0, 'foodXp0pos': 0, 'plus1pool': 0, 'stepped': 0, 'wastedXp': 0, 'foodXpEnd': 0, 'occSkillCells': 0, 'specMoves': [], 'foodXpByTask': {}}
    for t in SPECS:
        out['foodXpByTask'][t] = 0
    if a is None or b is None:
        out['missing'] = True
        return out
    out['missing'] = False
    for vid, va in a.items():
        vb = b.get(vid)
        if not vb:
            continue
        for t in SPECS:
            sa = (va.get('specialist') or {}).get(t)
            sb = (vb.get('specialist') or {}).get(t)
            fa = (va.get('foodXp') or {}).get(t) or 0
            fb = (vb.get('foodXp') or {}).get(t) or 0
            if sa == 0 and sb is not None and sb > 0:
                out['spec0pos'] += 1
                out['specMoves'].append(f"{vb.get('name') or vid}:{t} {sa}->{sb} (foodXp {fa}->{fb})")
            out['foodXpByTask'][t] += max(0, fb - fa)
            if fa == 0 and fb > 0:
                out['foodXp0pos'] += 1
            if (sa or 0) > 0 and fb >= 5:
                out['plus1pool'] += 1
                if (sb or 0) > (sa or 0):
                    out['stepped'] += 1
            if (sa or 0) == 0 and fb > 0:
                out['wastedXp'] += 1
    return out

funnel_rows = []
repro = {}
practice_panel = {'seeds': 0, 'missing_snaps': [], 'win': {}}
for w in ('d1-d14', 'd14-d28', 'd28-dEnd'):
    practice_panel['win'][w] = {'moved': 0, 'attributed': 0, 'tasks': Counter(), 'seeds_with_move': 0, 'seeds_attributed': 0}
practice_panel['skill_pos'] = 0
practice_panel['skills_gained'] = []
practice_panel['reps_end'] = 0
ladder_panel = {}
ladder_before = {}
fx_task_after = {t: 0 for t in SPECS}
fx_task_before = {t: 0 for t in SPECS}
grant_events = {'rack': 0, 'rackKcal': 0, 'huntKill': 0, 'huntKillFx': 0, 'rackSeeds': set(), 'huntSeeds': set()}
first_move_window = {}
skill_dist_end = {t: {0: 0, 1: 0, 2: 0, 3: 0} for t in SPECS}
neutrality = {}
q2panel = {'null_lines': 0, 'nav_turns': 0, 'rows': []}
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

for seed in SEEDS:
    before_tag = 'r113-before'
    try:
        jb = load(before_tag, seed)
    except Exception as e:
        print(f'seed {seed}: BEFORE PANEL MISSING/UNREADABLE ({before_tag}) {e}'); jb = None
    try:
        j = load('r113-after', seed)
    except Exception as e:
        print(f'seed {seed}: AFTER PANEL MISSING/UNREADABLE {e}'); continue
    ca = parse_convos(load_convo('r113-after', seed))
    jr = jb  # funnel_rows compare before vs after (aggregate, descriptive)
    # --- DRIVER-NEUTRALITY (seed 1502 only): r112-driver-on-master
    # (r112 driver, unfixed engine, tag r112-master42) must reproduce the
    # r113-before seed-1502 funnel keys EXACTLY — the driver changes are
    # a tag rename only.
    # --- BEFORE/AFTER (all seeds): aggregate rows, descriptive.
    diffs = []
    if seed == 1502:
        try:
            jn = load('r112-master42', seed)
        except Exception as e:
            diffs.append(f'r112-master42 neutrality file missing: {e}'); jn = None
        if jn is not None and jb is not None:
            for k in ('endDay', 'aliveEnd', 'aliveAt40', 'waveReached', 'pantryKcalEnd'):
                if jn.get(k) != jb.get(k):
                    diffs.append(f'{k}: r112-master42={jn.get(k)} r113-before={jb.get(k)}')
            for k in ('deaths', 'popAlive', 'pantryKcal'):
                if (jn.get('guardrails') or {}).get(k) != (jb.get('guardrails') or {}).get(k):
                    diffs.append(f'guardrails.{k}: r112-master42={(jn.get("guardrails") or {}).get(k)} r113-before={(jb.get("guardrails") or {}).get(k)}')
            if (jn.get('c3') or {}).get('starvationDeaths') != (jb.get('c3') or {}).get('starvationDeaths'):
                diffs.append('c3.starvationDeaths differs')
            if json.dumps(jn.get('deaths'), sort_keys=True) != json.dumps(jb.get('deaths'), sort_keys=True):
                diffs.append('deaths list differs')
            if (jn.get('teleTypes') or {}) != (jb.get('teleTypes') or {}):
                diffs.append('teleTypes differ')
            if (jn.get('skillCounts') or {}) != (jb.get('skillCounts') or {}):
                diffs.append('skillCounts differ')
            hs, hsr = (jn.get('huntStaff') or {}), (jb.get('huntStaff') or {})
            if (hs.get('assignments') or 0) != (hsr.get('assignments') or 0):
                diffs.append(f"huntStaff.assignments: r112-master42={hs.get('assignments')} r113-before={hsr.get('assignments')}")
            if len(hs.get('refusalLog') or []) != len(hsr.get('refusalLog') or []):
                diffs.append('huntStaff.refusalLog length differs')
            if len(hs.get('woundLog') or []) != len(hsr.get('woundLog') or []):
                diffs.append('huntStaff.woundLog length differs')
            if len(hs.get('prepLog') or []) != len(hsr.get('prepLog') or []):
                diffs.append('huntStaff.prepLog length differs')
            if json.dumps(jn.get('daily'), sort_keys=True) != json.dumps(jb.get('daily'), sort_keys=True):
                diffs.append('daily rows differ')
            _cn = load_convo('r112-master42', seed)
            _cb = load_convo('r113-before', seed)
            if (_cn is None) != (_cb is None):
                diffs.append('convo file presence differs (neutrality)')
            elif _cn is not None:
                if normalize_nav('\n'.join(_cn.split('\n')[1:])) != normalize_nav('\n'.join(_cb.split('\n')[1:])):
                    diffs.append('convo transcript differs (neutrality — driver drift, NOT the fix)')
        neutrality[seed] = diffs
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
    def pantry_of(x):
        g = (x or {}).get('guardrails') or {}
        return g.get('pantryKcal') if g.get('pantryKcal') is not None else (x or {}).get('pantryKcalEnd')
    funnel_rows.append({
        'seed': seed,
        'endDay_ref': jb.get('endDay') if jb else None, 'endDay': j.get('endDay'),
        'alive_ref': jb.get('aliveEnd') if jb else None, 'alive': j.get('aliveEnd'),
        'pantry_ref': pantry_of(jb), 'pantry': pantry_of(j),
        'over_ref': jb.get('gameOver') if jb else None, 'over': j.get('gameOver'),
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
        if ((h.get('fxButcherAfter') or 0) > (h.get('fxButcherBefore') or 0)):
            grant_events['huntKillFx'] += 1
            grant_events['huntSeeds'].add(seed)
        if (h.get('kcal') or 0) > 0:
            grant_events['huntKill'] += 1
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
        if ((ck.get('fxPreserverAfter') or 0) > (ck.get('fxPreserverBefore') or 0)):
            grant_events['rack'] += 1
            grant_events['rackKcal'] += max(0, (ck.get('preservedKcalAfter') or 0) - (ck.get('preservedKcalBefore') or 0))
            grant_events['rackSeeds'].add(seed)
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
    # --- Q1 LADDER (r113): before + after specialist/foodXp moves.
    lad = ladder_stats(m1, mEnd)
    if mEnd:
        lad['foodXpEnd'] = sum(sum((v.get('foodXp') or {}).values()) for v in mEnd.values())
        lad['occSkillCells'] = sum(1 for v in mEnd.values() for t in SPECS if ((v.get('specialist') or {}).get(t) or 0) > 0)
        for t in SPECS:
            for v in mEnd.values():
                skill_dist_end[t][min(3, max(0, ((v.get('specialist') or {}).get(t) or 0)))] += 1
    ladder_panel[seed] = lad
    for t in SPECS:
        fx_task_after[t] += lad.get('foodXpByTask', {}).get(t, 0)
    # first-move window: earliest window with a spec 0->positive move
    for wkey, a, b in (('d1-d14', m1, m14), ('d14-d28', m14, m28), ('d28-dEnd', m28, mEnd)):
        _sm = skill_moves(a, b)
        if not _sm['missing'] and _sm['pos'] > 0 and seed not in first_move_window:
            first_move_window[seed] = wkey
    # before-panel ladder (same snapshots; jb may be None on a missing file)
    if jb is not None:
        _bp = jb.get('practice') or {}
        _b1d, _bm1 = snap_of(_bp, 'd1')
        _bEd, _bmE = snap_of(_bp, 'dEnd')
        _blad = ladder_stats(_bm1, _bmE)
        if _bmE:
            _blad['foodXpEnd'] = sum(sum((v.get('foodXp') or {}).values()) for v in _bmE.values())
            _blad['occSkillCells'] = sum(1 for v in _bmE.values() for t in SPECS if ((v.get('specialist') or {}).get(t) or 0) > 0)
        ladder_before[seed] = _blad
        for t in SPECS:
            fx_task_before[t] += _blad.get('foodXpByTask', {}).get(t, 0)
    # --- Q2 MENU:MORE NULL LINES (r113): count literal (null) THEM lines
    # in the r113-after people-check transcripts (bar 0) + navigation turns.
    ca_txt = load_convo('r113-after', seed)
    if ca_txt:
        for ln in ca_txt.split('\n'):
            if ln == 'THEM: (null)':
                q2panel['null_lines'] += 1
                q2panel['rows'].append((seed, ln))
            elif ln == 'THEM: (menu page turned)':
                q2panel['nav_turns'] += 1
    print(f'\n=== seed {seed} (endDay {j.get("endDay")}, over {j.get("gameOver")}, aliveEnd {j.get("aliveEnd")}, wave {j.get("waveReached")}, pantryGuardrails {pantry_of(j)}, pantryEnd {j.get("pantryKcalEnd")}) ===')
    if seed == 1502:
        _nd = neutrality.get(seed)
        print(f'  DRIVER-NEUTRALITY vs r112-driver-on-master: {"UNVERIFIED (no neutrality file)" if _nd is None else ("NEUTRAL" if not _nd else "DRIFT: " + "; ".join(_nd))}')
    _lb = ladder_before.get(seed) or {}
    print(f'  LADDER before={before_tag}: spec0pos={_lb.get("spec0pos", 0)} foodXp0pos={_lb.get("foodXp0pos", 0)} foodXpEnd={_lb.get("foodXpEnd", 0)} | after: spec0pos={lad.get("spec0pos", 0)} foodXp0pos={lad.get("foodXp0pos", 0)} foodXpEnd={lad.get("foodXpEnd", 0)} firstMove={first_move_window.get(seed)}')
    for _mv in lad.get('specMoves', []):
        print(f'    move: {_mv}')
    print(f'  convos: {ca["convos"]} (stalls {ca["stalls"]}, wound-down {ca["wound_down"]}, ended-engine {ca["ended_engine"]})')
    for sm in ca['stall_menus']:
        print(f'  STALL seed {seed} menu: {sm}')
    print(f'  before/after (DESCRIPTIVE): endDay before {funnel_rows[-1]["endDay_ref"]} / after {funnel_rows[-1]["endDay"]} | alive before {funnel_rows[-1]["alive_ref"]} / after {funnel_rows[-1]["alive"]} | pantry(guardrails) before {funnel_rows[-1]["pantry_ref"]} / after {funnel_rows[-1]["pantry"]} | over before {funnel_rows[-1]["over_ref"]} / after {funnel_rows[-1]["over"]}')
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
    print(f'  guardrails={j.get("guardrails")} c3={j.get("c3")}')

print(f'\nPANEL: livingVillagersEnd={panel_living}')
print(f'  DRIVER-NEUTRALITY (r112-master42 seed 1502 vs r113-before seed 1502):')
if neutrality.get(1502) is None:
    print('    seed 1502: NO NEUTRALITY FILE — driver neutrality UNVERIFIED, do not judge Q1')
elif not neutrality[1502]:
    print('    seed 1502: NEUTRAL (driver changes are pure reads)')
else:
    print(f'    seed 1502: DRIFT: {"; ".join(neutrality[1502])} — STOP, diagnose before judging Q1')
print(f'  Q1 LADDER FIX (specialist 0->pos on the AFTER panel):')
for seed in SEEDS:
    L = ladder_panel.get(seed) or {}
    B = ladder_before.get(seed) or {}
    print(f"    ladder seed {seed}: BEFORE spec0pos={B.get('spec0pos', 0)} foodXp0pos={B.get('foodXp0pos', 0)} foodXpEnd={B.get('foodXpEnd', 0)} | AFTER spec0pos={L.get('spec0pos', 0)} foodXp0pos={L.get('foodXp0pos', 0)} foodXpEnd={L.get('foodXpEnd', 0)} plus1pool={L.get('plus1pool', 0)} stepped={L.get('stepped', 0)} wastedXp={L.get('wastedXp', 0)} occSkillCells={L.get('occSkillCells', 0)} firstMove={first_move_window.get(seed)}")
    for _mv in L.get('specMoves', []):
        print(f'      move: {_mv}')
for wkey in ('d1-d14', 'd14-d28', 'd28-dEnd'):
    w = practice_panel['win'][wkey]
    print(f'    {wkey}: moved={w["moved"]} attributed={w["attributed"]} seedsWithMove={w["seeds_with_move"]}/16 seedsAttributed={w["seeds_attributed"]}/16 tasks={dict(w["tasks"])}')
print(f'    skill0->pos (all windows)={practice_panel["skill_pos"]} practiceReps(dEnd)={practice_panel["reps_end"]}')
for g in practice_panel['skills_gained']:
    print(f'    skill: {g}')
if practice_panel['missing_snaps']:
    print(f'    MISSING SNAPSHOTS (instrument gap): {practice_panel["missing_snaps"]}')
ladder_seeds = sum(1 for seed in SEEDS if (ladder_panel.get(seed) or {}).get('spec0pos', 0) >= 1)
tot_fx = sum((ladder_panel.get(x) or {}).get('foodXpEnd', 0) for x in SEEDS)
tot_fx_b = sum((ladder_before.get(x) or {}).get('foodXpEnd', 0) for x in SEEDS)
tot_pool = sum((ladder_panel.get(x) or {}).get('plus1pool', 0) for x in SEEDS)
tot_step = sum((ladder_panel.get(x) or {}).get('stepped', 0) for x in SEEDS)
tot_waste = sum((ladder_panel.get(x) or {}).get('wastedXp', 0) for x in SEEDS)
print(f'  Q1 ladder detail: foodXpEnd total BEFORE={tot_fx_b} AFTER={tot_fx} plus1pool={tot_pool} stepped={tot_step} wastedXp={tot_waste}')
print(f'  Q1 foodXp by task AFTER: {fx_task_after} (BEFORE: {fx_task_before})')
print(f'  Q1 grant events AFTER: rack resolutions granting preserver XP={grant_events["rack"]} (rack kcal {grant_events["rackKcal"]}, seeds {len(grant_events["rackSeeds"])}), hunt kills={grant_events["huntKill"]} of which granted butcher XP={grant_events["huntKillFx"]} (seeds {len(grant_events["huntSeeds"])})')
print(f'  Q1 skill distribution at dEnd (AFTER, per task, skill 0/1/2/3): {skill_dist_end}')
print(f'  Q1 first-move windows: {first_move_window}')
if ladder_seeds >= 8:
    print(f'  Q1 verdict: GO (seeds with >=1 specialist 0->positive move: {ladder_seeds}/16)')
elif ladder_seeds == 0:
    print(f'  Q1 verdict: NO-GO (0 ladder moves on 16/16 seeds)')
else:
    print(f'  Q1 verdict: NO-GO (ladder moves on only {ladder_seeds}/16 seeds, bar 8/16)')
print(f'  Q2 MENU:MORE NULL LINES: nullThemLines={q2panel["null_lines"]} navTurns={q2panel["nav_turns"]}')
if q2panel['null_lines'] == 0:
    print(f'  Q2 verdict: FIXED (0 null THEM lines on the panel)')
else:
    print(f'  Q2 verdict: OPEN ({q2panel["null_lines"]} null THEM lines — see rows)')
    for row in q2panel['rows']:
        print(f'    null: seed {row[0]} line {row[1]}')
print(f'  Q2 PREPLOG SPLIT (r113-after panel): no-teacher rows={prep_panel["no_teacher"]} split classes={dict(prep_panel["split_classes"])} whys={dict(prep_panel["whys"])}')
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
print(f'  M3 SURVIVAL-42 {m3_seeds}/16 (bar 12/16) | M4 PANTRY {m4_seeds}/16 (bar 12/16)')
if hunter_wound_deaths:
    print(f'  HUNTER-WOUND DEATHS (§14c): {hunter_wound_deaths}')
