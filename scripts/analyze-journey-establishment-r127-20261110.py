#!/usr/bin/env python3
"""r127 specialist-ladder-PACE analyzer. Reads the BEFORE panel
(r127-before files, all 16 seeds — FRESH band 2101-2116 on current master)
and the AFTER panel (r127-after files, all 16 seeds), plus the matching
-convo-seed{seed}.txt people-check transcripts.
- DRIVER-NEUTRALITY is proven by the proof test's det-gate (the r127
  driver vs the r118 driver on 5d seed 2101: funnel keys identical), not
  by this analyzer — the driver changes are a tag rename + a read-only
  snapshot fallback, so any trajectory difference is the fix, not the
  driver. The analyzer does NOT compare before/after trajectories seed
  by seed; the panel comparison is aggregate (alive/pantry/wave/deaths/
  skill movement), as in r116.
- Q1: SPECIALIST LADDER PACE — specialist 0->positive moves on the AFTER
  panel (per seed, from the practice snapshots d1->dEnd). Bar: GO iff
  moves on >=8/16 seeds AND villagers reaching specialist 3 from 0 in
  the 42 days number <=4 on the AFTER panel (r118 BEFORE: 7). Plus PACE
  count ((villager, spec-task) cells 0 at d1 -> 3 at dEnd, before and
  after), LADDER-BY-TASK (foodXp accrual per task per window), GRANT
  EVENTS (rack resolutions / hunt kills with a foodXp delta, from the
  driver wraps; rack XP total = sum of cookLog fx deltas),
  TIME-TO-FIRST-MOVE split into specialist-only vs foodXp-only,
  LADDER-BY-WINDOW (spec moves per window, before and after — a mid-leg
  move that dies still counts), SKILL DISTRIBUTION at dEnd per task.
- Q2 (standing): INVITATIONS — every NPC-offered invitation THEM line in
  the after-panel convo files with its following lines; driver answers
  (YOU: [betrayal:accept] / [betrayal:decline]) counted. Denominator fix
  (r118 metric review): offered = answers + spoken lines followed by
  silence — a menu presented at convo start from a pending invite (no
  fresh spoken line) still counts as offered, because the answer line
  proves the menu was presented. Bar: answered >= 80% of offered.
- Q3 (standing): NULL LINES — 0 literal THEM: (null) lines across the 16
  after-panel people-check transcripts (bar 0).
- M3/M4: survival + pantry guardrails, bars 12/16 (r111's 3/4, scaled).
Usage: python3 scripts/analyze-journey-establishment-r127-20261110.py [EVIDDIR]
"""
import json, os, re, sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
EVID = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'evidence', '2026-11-10')
SEEDS = list(range(2101, 2117))

TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend']
SPECS = ['butcher', 'cook', 'preserver', 'spotter', 'builder']
# r127 Q2: invitation patterns are the r116/r118 shapes ("walk ... with
# me", "come see", "come with", "come get", "join me", "walk with me")
# plus any THEM line ending in '?' that contains 'with me' / 'come' /
# 'join'.
INVITE_RE = re.compile(r'(walk\b.*\bwith me|walk my trap line|help me haul|come get air|come see what i found|come with|come get|join me|come along|follow me)', re.I)

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
    """Skill 0->positive moves + npcSkills gained between two snapshots.
    r116: pos counts both kinds (unchanged); spec_pos counts specialist
    0->positive only and fx_pos counts foodXp 0->positive only, so the
    first-move window can be split (r113's line fired on foodXp moves
    too and misled)."""
    pos = 0; spec_pos = 0; fx_pos = 0; gained = []
    if a is None or b is None:
        return {'pos': None, 'spec_pos': None, 'fx_pos': None, 'gained': gained, 'missing': True}
    for vid, va in a.items():
        vb = b.get(vid)
        if not vb:
            continue
        for t in SPECS:
            sa = (va.get('specialist') or {}).get(t)
            sb = (vb.get('specialist') or {}).get(t)
            if sa == 0 and sb is not None and sb > 0:
                pos += 1; spec_pos += 1; gained.append(f"{vb.get('name') or vid}:{t} specialist {sa}->{sb}")
            fa = (va.get('foodXp') or {}).get(t) or 0
            fb = (vb.get('foodXp') or {}).get(t) or 0
            if fa == 0 and fb > 0:
                pos += 1; fx_pos += 1; gained.append(f"{vb.get('name') or vid}:{t} foodXp 0->{fb}")
        ka = set(va.get('npcSkills') or []); kb = (vb.get('npcSkills') or [])
        for s in kb:
            if s not in ka:
                gained.append(f"{vb.get('name') or vid}: skill {s}")
    return {'pos': pos, 'spec_pos': spec_pos, 'fx_pos': fx_pos, 'gained': gained, 'missing': False}

def ladder_stats(a, b):
    """Specialist-ladder moves between two snapshots (same villager id in
    both; died/left excluded). spec0pos: specialist 0->positive; foodXp0pos:
    foodXp 0->positive. plus1pool: (villager, task) cells with occupation
    skill>0 AND foodXp>=5 at the later snapshot (the +1 rung's addressable
    pool); stepped: pool cells whose skill actually rose. wastedXp:
    0-skill cells holding foodXp>0 at the later snapshot — XP the gate can
    never spend. foodXpEnd/occSkillCells are filled by the caller from the
    later snapshot."""
    out = {'spec0pos': 0, 'foodXp0pos': 0, 'plus1pool': 0, 'stepped': 0, 'wastedXp': 0, 'foodXpEnd': 0, 'occSkillCells': 0, 'specMoves': [], 'foodXpByTask': {}, 'pace03': 0, 'pace03Moves': []}
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
            if sa == 0 and sb == 3:
                out['pace03'] += 1
                out['pace03Moves'].append(f"{vb.get('name') or vid}:{t} 0->3 (foodXp {fa}->{fb})")
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
grant_events = {'rack': 0, 'rackKcal': 0, 'rackXp': 0, 'huntKill': 0, 'huntKillFx': 0, 'rackSeeds': set(), 'huntSeeds': set()}
first_move_window = {}
first_move_window_spec = {}
first_move_window_fx = {}
ladder_win_after = {w: {'spec0pos': 0, 'seeds': 0} for w in ('d1-d14', 'd14-d28', 'd28-dEnd')}
ladder_win_before = {w: {'spec0pos': 0, 'seeds': 0} for w in ('d1-d14', 'd14-d28', 'd28-dEnd')}
skill_dist_end = {t: {0: 0, 1: 0, 2: 0, 3: 0} for t in SPECS}
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
    before_tag = 'r127-before'
    try:
        jb = load(before_tag, seed)
    except Exception as e:
        print(f'seed {seed}: BEFORE PANEL MISSING/UNREADABLE ({before_tag}) {e}'); jb = None
    try:
        j = load('r127-after', seed)
    except Exception as e:
        print(f'seed {seed}: AFTER PANEL MISSING/UNREADABLE {e}'); continue
    ca = parse_convos(load_convo('r127-after', seed))
    jr = jb  # funnel_rows compare before vs after (aggregate, descriptive)
    # DRIVER-NEUTRALITY is proven by the proof test's det-gate (r127 driver
    # vs r118 driver, 5d seed 2101: funnel keys identical), not here — the
    # driver changes are a tag rename + a read-only snapshot fallback.
    diffs = []
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
            grant_events['rackXp'] += (ck.get('fxPreserverAfter') or 0) - (ck.get('fxPreserverBefore') or 0)
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
    # --- Q1 LADDER (r116): before + after specialist/foodXp moves.
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
    # first-move window, SPLIT (r116): earliest window with a specialist
    # 0->positive move vs earliest window with a foodXp-only move.
    for wkey, a, b in (('d1-d14', m1, m14), ('d14-d28', m14, m28), ('d28-dEnd', m28, mEnd)):
        _sm = skill_moves(a, b)
        if not _sm['missing'] and _sm['pos'] > 0 and seed not in first_move_window:
            first_move_window[seed] = wkey
        if not _sm['missing'] and (_sm['spec_pos'] or 0) > 0 and seed not in first_move_window_spec:
            first_move_window_spec[seed] = wkey
        if not _sm['missing'] and (_sm['fx_pos'] or 0) > 0 and seed not in first_move_window_fx:
            first_move_window_fx[seed] = wkey
    # ladder moves BY WINDOW (r116): a mid-leg move that dies with its
    # mover still counts here, unlike the d1->dEnd survivor-filtered count.
    _win_after = {}
    for wkey, a, b in (('d1-d14', m1, m14), ('d14-d28', m14, m28), ('d28-dEnd', m28, mEnd)):
        _wl = ladder_stats(a, b)
        _win_after[wkey] = _wl.get('spec0pos', 0)
        ladder_win_after[wkey]['spec0pos'] += _wl.get('spec0pos', 0)
        if _wl.get('spec0pos', 0) >= 1:
            ladder_win_after[wkey]['seeds'] += 1
    lad['win'] = _win_after
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
        _win_before = {}
        _bbp = jb.get('practice') or {}
        _bb1d, _bbm1 = snap_of(_bbp, 'd1')
        _bb14d, _bbm14 = snap_of(_bbp, 'd14')
        _bb28d, _bbm28 = snap_of(_bbp, 'd28')
        for wkey, a, b in (('d1-d14', _bbm1, _bbm14), ('d14-d28', _bbm14, _bbm28), ('d28-dEnd', _bbm28, _bmE)):
            _wl = ladder_stats(a, b)
            _win_before[wkey] = _wl.get('spec0pos', 0)
            ladder_win_before[wkey]['spec0pos'] += _wl.get('spec0pos', 0)
            if _wl.get('spec0pos', 0) >= 1:
                ladder_win_before[wkey]['seeds'] += 1
        _blad['win'] = _win_before
    # --- Q2 INVITATIONS (r127, denominator fix) + Q3 NULL LINES: count
    # literal (null) THEM lines in the r127-after people-check transcripts
    # (bar 0) + navigation turns; invitation lines are counted in the
    # panel section below (invite_panel), where the following lines are
    # also visible for the answered-vs-silence adjudication.
    ca_txt = load_convo('r127-after', seed)
    if ca_txt:
        for ln in ca_txt.split('\n'):
            if ln == 'THEM: (null)':
                q2panel['null_lines'] += 1
                q2panel['rows'].append((seed, ln))
            elif ln == 'THEM: (menu page turned)':
                q2panel['nav_turns'] += 1
    print(f'\n=== seed {seed} (endDay {j.get("endDay")}, over {j.get("gameOver")}, aliveEnd {j.get("aliveEnd")}, wave {j.get("waveReached")}, pantryGuardrails {pantry_of(j)}, pantryEnd {j.get("pantryKcalEnd")}) ===')
    _lb = ladder_before.get(seed) or {}
    print(f'  LADDER before={before_tag}: spec0pos={_lb.get("spec0pos", 0)} foodXp0pos={_lb.get("foodXp0pos", 0)} foodXpEnd={_lb.get("foodXpEnd", 0)} | after: spec0pos={lad.get("spec0pos", 0)} foodXp0pos={lad.get("foodXp0pos", 0)} foodXpEnd={lad.get("foodXpEnd", 0)} firstMove={first_move_window.get(seed)} firstMoveSpec={first_move_window_spec.get(seed)} firstMoveFx={first_move_window_fx.get(seed)} winAfter={lad.get("win")} winBefore={_lb.get("win")}')
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
print('  DRIVER-NEUTRALITY: proven by the proof-test det-gate (r127 driver vs r118 driver, 5d seed 2101: funnel keys identical) — see the proof test, not this analyzer.')
print(f'  Q1 LADDER FIX (specialist 0->pos on the AFTER panel):')
for seed in SEEDS:
    L = ladder_panel.get(seed) or {}
    B = ladder_before.get(seed) or {}
    print(f"    ladder seed {seed}: BEFORE spec0pos={B.get('spec0pos', 0)} foodXp0pos={B.get('foodXp0pos', 0)} foodXpEnd={B.get('foodXpEnd', 0)} | AFTER spec0pos={L.get('spec0pos', 0)} foodXp0pos={L.get('foodXp0pos', 0)} foodXpEnd={L.get('foodXpEnd', 0)} plus1pool={L.get('plus1pool', 0)} stepped={L.get('stepped', 0)} wastedXp={L.get('wastedXp', 0)} occSkillCells={L.get('occSkillCells', 0)} firstMove={first_move_window.get(seed)} firstMoveSpec={first_move_window_spec.get(seed)} firstMoveFx={first_move_window_fx.get(seed)} winAfter={L.get('win')} winBefore={B.get('win')} pace03Before={B.get('pace03', 0)} pace03={L.get('pace03', 0)}")
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
pace03_after = sum((ladder_panel.get(x) or {}).get('pace03', 0) for x in SEEDS)
pace03_before = sum((ladder_before.get(x) or {}).get('pace03', 0) for x in SEEDS)
pace03_moves_after = [m for x in SEEDS for m in (ladder_panel.get(x) or {}).get('pace03Moves', [])]
print(f'  Q1 ladder detail: foodXpEnd total BEFORE={tot_fx_b} AFTER={tot_fx} plus1pool={tot_pool} stepped={tot_step} wastedXp={tot_waste}')
print(f'  Q1 PACE (specialist 0->3 in 42d): BEFORE={pace03_before} AFTER={pace03_after} (bar AFTER<=4)')
for _pm in pace03_moves_after:
    print(f'    pace03: {_pm}')
print(f'  Q1 foodXp by task AFTER: {fx_task_after} (BEFORE: {fx_task_before})')
print(f'  Q1 grant events AFTER: rack resolutions granting preserver XP={grant_events["rack"]} (rack kcal {grant_events["rackKcal"]}, preserver XP granted via racks {grant_events["rackXp"]}, seeds {len(grant_events["rackSeeds"])}), hunt kills={grant_events["huntKill"]} of which granted butcher XP={grant_events["huntKillFx"]} (seeds {len(grant_events["huntSeeds"])})')
print(f'  Q1 skill distribution at dEnd (AFTER, per task, skill 0/1/2/3): {skill_dist_end}')
print(f'  Q1 first-move windows: {first_move_window}')
print(f'  Q1 first-move windows (specialist-only): {first_move_window_spec}')
print(f'  Q1 first-move windows (foodXp-only): {first_move_window_fx}')
for wkey in ('d1-d14', 'd14-d28', 'd28-dEnd'):
    print(f"  Q1 ladder moves by window {wkey}: AFTER spec0pos={ladder_win_after[wkey]['spec0pos']} on {ladder_win_after[wkey]['seeds']}/16 seeds | BEFORE spec0pos={ladder_win_before[wkey]['spec0pos']} on {ladder_win_before[wkey]['seeds']}/16 seeds")
if ladder_seeds >= 8 and pace03_after <= 4:
    print(f'  Q1 verdict: GO (moves {ladder_seeds}/16, pace03 {pace03_after}, bars moves>=8 pace<=4)')
elif ladder_seeds == 0:
    print(f'  Q1 verdict: NO-GO (moves 0/16, pace03 {pace03_after} — no ladder moves)')
elif ladder_seeds < 8:
    print(f'  Q1 verdict: NO-GO (moves {ladder_seeds}/16, pace03 {pace03_after} — moves bar missed, bar 8/16)')
else:
    print(f'  Q1 verdict: NO-GO (moves {ladder_seeds}/16, pace03 {pace03_after} — pace bar missed, bar <=4)')
print(f'  Q2 INVITATIONS (AFTER panel, denominator fix — offered = answers + spoken lines followed by silence):')
invite_lines = 0
invite_accepted = 0
invite_declined = 0
invite_unanswered_spoken = 0
for seed in SEEDS:
    p = os.path.join(EVID, f'journey-establishment-r127-after-convo-seed{seed}.txt')
    try:
        _lines = open(p).read().split('\n')
    except Exception:
        continue
    for _ln in _lines:
        if _ln.startswith('YOU: [betrayal:accept]'):
            invite_accepted += 1
        elif _ln.startswith('YOU: [betrayal:decline]'):
            invite_declined += 1
    for i, line in enumerate(_lines):
        if not line.startswith('THEM:'):
            continue
        text = line[5:].strip().strip('"')
        if INVITE_RE.search(text):
            invite_lines += 1
            nxt = _lines[i + 1:i + 3]
            answered = any(l.startswith('YOU: [betrayal:accept]') or l.startswith('YOU: [betrayal:decline]') for l in nxt)
            print(f"--- seed {seed} line {i + 1}: THEM: {text} [{'ANSWERED' if answered else 'UNANSWERED'}]")
            for j in range(i + 1, min(i + 3, len(_lines))):
                if _lines[j].strip():
                    print(f'    {_lines[j].strip()[:160]}')
            if not answered:
                invite_unanswered_spoken += 1
invite_offered = invite_accepted + invite_declined + invite_unanswered_spoken
print(f'  Q2 invitations: spoken={invite_lines} answers accept={invite_accepted} decline={invite_declined} unanswered-spoken={invite_unanswered_spoken} offered={invite_offered}')
if invite_offered == 0:
    print('  Q2 verdict: NO-DATA (0 invitations offered — report, do not pass or fail)')
elif (invite_accepted + invite_declined) * 5 >= invite_offered * 4:
    print(f'  Q2 verdict: PASS (answered {invite_accepted + invite_declined}/{invite_offered} = {(invite_accepted + invite_declined) / invite_offered:.0%}, bar >=80%)')
else:
    print(f'  Q2 verdict: FAIL (answered {invite_accepted + invite_declined}/{invite_offered}, bar >=80%)')
print(f'  Q3 NULL LINES: nullThemLines={q2panel["null_lines"]} navTurns={q2panel["nav_turns"]}')
if q2panel['null_lines'] == 0:
    print('  Q3 verdict: PASS (0 null THEM lines on the panel)')
else:
    print(f'  Q3 verdict: FAIL ({q2panel["null_lines"]} null THEM lines — see rows)')
    for row in q2panel['rows']:
        print(f'    null: seed {row[0]} line {row[1]}')
print(f'  Q2 PREPLOG SPLIT (r127-after panel): no-teacher rows={prep_panel["no_teacher"]} split classes={dict(prep_panel["split_classes"])} whys={dict(prep_panel["whys"])}')
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
_held_kcal = sum(hunt['prep_kcal_held']); _notheld_kcal = sum(hunt['prep_kcal_notheld'])
_ratio = f"{_held_kcal / _notheld_kcal:.2f}" if _notheld_kcal else 'n/a (no notheld kills)'
print(f'  held/notheld kcal ratio: held={_held_kcal} kcal ({hunt["prep_kills_held"]} kills) vs notheld={_notheld_kcal} kcal ({hunt["prep_kills_notheld"]} kills) → ratio {_ratio}')
print(f'  M3 SURVIVAL-42 {m3_seeds}/16 (bar 12/16) | M4 PANTRY {m4_seeds}/16 (bar 12/16)')
if hunter_wound_deaths:
    print(f'  HUNTER-WOUND DEATHS (§14c): {hunter_wound_deaths}')
