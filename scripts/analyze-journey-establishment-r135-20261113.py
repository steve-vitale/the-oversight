#!/usr/bin/env python3
"""r135 analyzer: rung-2/3 visibility (Q1) + field-ask gate (Q2).
Reads the BEFORE panel (r135-before files, all 16 seeds — band 2601-2616,
the r135 driver on the fix-off tree, current master) and the AFTER panel
(r135-after files, all 16 seeds), plus the matching -convo-seed{seed}.txt
people-check transcripts. The BEFORE panel is generated in-run (Amendment-1
pattern: the fix does not exist yet when BEFORE runs, so no file juggling).
- DRIVER-NEUTRALITY is proven by the proof test's det-gate (the SAME r135
  driver on the field-gate-fixed tree vs the unfixed tree, 5d seed 2601:
  byte-identical outputs), not by this analyzer. The driver is the r134
  driver with a tag rename only.
- Q1 (primary — RUNG-2 VISIBILITY, no new sims): does anyone reach rung 2
  inside 42 days, and how close is the nearest cohort? Computed from the
  committed r134-after JSONs (loaded separately as jr134 from
  evidence/2026-11-12 — the rung panel). Rung math from code (food.js
  specialistSkill + game.js grantFoodXpCredit): rung 1 at foodXp >=5,
  rung 2 at >=15, rung 3 at >=30; above 5 XP, XP accrues 2:1, so rung 2
  needs 25 granting units from 0, rung 3 needs 55. Per specialty per
  window: R2X (spec 1->2), R3X (spec 2->3), foodXp 15/30 crossings,
  XP-per-worker (median/max gained), NEAR-MISS-2 pool (5-14 foodXp at
  d28, ending <15). Verdict (binding, prereg): R2-REACHABLE iff >=1
  spec-2 crossing panel-wide; else R2-BEYOND-LEG (+ nearest foodXp to
  15 at dEnd and the granting-days math).
- REGRESSION (DESCRIPTIVE, not equality — the gate changes which menu
  choice the driver picks in dry sittings, so trajectories may diverge
  slightly): ladder metrics BEFORE vs AFTER per window (spec0pos,
  foodXp0pos, foodXpEnd, pace03, win). Any large divergence is
  investigated, not re-scored.
- Q2 (people-check dial — THE FIELD ASK FIRES DRY): field-ask picks,
  closers ("There's more, but that's for another fire." + the two honest
  closers), and lessons taught (monster/plant/place/generic), BEFORE vs
  AFTER transcripts. Bars (binding): Q2a closer "There's more" on AFTER
  = 0; Q2b field-ask lessons AFTER >= BEFORE - 1 (no lesson hidden);
  Q2c every field ask picked on AFTER ends in a lesson. Q2c honesty is
  a sense-read in the run note.
- Q2d guards carried: INVITATIONS answered >=80% (denominator fix r118),
  NULL LINES 0, M3 survival-42 >=12/16, M4 0 starvation deaths >=12/16,
  SPOTTER foodXp total 0.
Usage: python3 scripts/analyze-journey-establishment-r135-20261113.py [EVIDDIR]
"""
import json, os, re, sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
EVID = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'evidence', '2026-11-13')
R134EVID = os.path.join(ROOT, 'evidence', '2026-11-12')  # Q1 rung panel lives here
SEEDS = list(range(2601, 2617))
R134_SEEDS = list(range(2501, 2517))  # r134-after band, positional pair with SEEDS (the rung panel's own seeds, not r135's)

TASKS = ['hunt', 'forage', 'garden', 'fish', 'wood', 'stone', 'deadfall', 'water', 'scout', 'patrol', 'cook', 'tend', 'teach', 'mend']
SPECS = ['butcher', 'cook', 'preserver', 'spotter', 'builder']
# r132 Q2: invitation patterns are the r116/r118 shapes ("walk ... with
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
    out = {'spec0pos': 0, 'foodXp0pos': 0, 'plus1pool': 0, 'stepped': 0, 'wastedXp': 0, 'foodXpEnd': 0, 'occSkillCells': 0, 'specMoves': [], 'foodXpByTask': {}, 'pace03': 0, 'pace03Moves': [],
           'spec0posByTask': {}, 'pace03ByTask': {}}
    for t in SPECS:
        out['foodXpByTask'][t] = 0
        out['spec0posByTask'][t] = 0
        out['pace03ByTask'][t] = 0
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
                out['spec0posByTask'][t] += 1
                out['specMoves'].append(f"{vb.get('name') or vid}:{t} {sa}->{sb} (foodXp {fa}->{fb})")
            if sa == 0 and sb == 3:
                out['pace03'] += 1
                out['pace03ByTask'][t] += 1
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

def invert_preserver_units(xp_before, carry_before, fx_delta):
    """Invert one preserver grant event's fx delta back to units through
    the grant math (first 5 XP 1:1, then 1 XP per 2 units, odd unit
    carried in foodXpRemainder). Returns (units_low, units_high,
    carry_low, carry_high): the 2:1 part's gain g means carry+u2 in
    {2g, 2g+1}, so the true unit count lies in [low, high] and the
    carry after is 0 on the low bound, 1 on the high bound. A delta
    inside the 1:1 headroom inverts exactly (carry unchanged), except
    on the boundary (delta == headroom, carry 0) where one more unit
    can hide in the carry. Only called on granting rows (delta > 0):
    a delta-0 row can hide 1 unit above the rung, but the driver row
    cannot tell it from granting nothing, so both bounds count
    fx-visible units only — the low bound stays a true lower bound."""
    if fx_delta <= 0:
        return (0, 0, carry_before, carry_before)
    head = max(0, 5 - xp_before)
    if fx_delta < head:
        return (fx_delta, fx_delta, carry_before, carry_before)
    if fx_delta == head:
        # Boundary: the delta exactly fills the 1:1 headroom. One more
        # unit can hide in the carry (a 1-unit spill at 2:1 with carry 0
        # gains 0 XP but sets the carry) — so the count is head or head+1.
        if carry_before == 0:
            return (head, head + 1, 0, 1)
        return (head, head, carry_before, carry_before)
    g = fx_delta - head
    u_low = head + 2 * g - carry_before
    return (u_low, u_low + 1, 0, 1)

def stall_window(a, b):
    """r135 Q1: per-specialty stall measures between two snapshots (same
    villager id in both; died/left excluded — the ladder_stats convention).
    G = foodXp gained in the window; W = distinct villagers with G>0;
    NEW = spec 0->positive crossings. Returns {task: {'G':, 'W':, 'NEW':}}."""
    out = {t: {'G': 0, 'W': 0, 'NEW': 0} for t in SPECS}
    if a is None or b is None:
        return out
    for vid, va in a.items():
        vb = b.get(vid)
        if not vb:
            continue
        for t in SPECS:
            fa = (va.get('foodXp') or {}).get(t) or 0
            fb = (vb.get('foodXp') or {}).get(t) or 0
            if fb > fa:
                out[t]['G'] += fb - fa
                out[t]['W'] += 1
            sa = (va.get('specialist') or {}).get(t)
            sb = (vb.get('specialist') or {}).get(t)
            if sa == 0 and sb is not None and sb > 0:
                out[t]['NEW'] += 1
    return out

def rung_window(a, b):
    """r135 Q1: rung-2/3 crossings between two snapshots (same villager id
    in both; died/left excluded — the ladder_stats convention). Rung math
    from code: spec 1 at foodXp >=5, spec 2 at >=15, spec 3 at >=30
    (food.js specialistSkill; holders get +1 at 5 XP, so spec crossings
    are reported alongside raw foodXp 15/30 crossings, which are the
    holder-independent measure). Returns {task: {'R2X': spec 1->2,
    'R3X': spec 2->3, 'fx15': foodXp <15 -> >=15, 'fx30': foodXp <30 ->
    >=30, 'xp_gains': [foodXp gained per worker with G>0]}}."""
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
before_cook_practice = {}
fx_task_after = {t: 0 for t in SPECS}
fx_task_before = {t: 0 for t in SPECS}
grant_events = {'rack': 0, 'rackKcal': 0, 'rackXp': 0, 'huntKill': 0, 'huntKillFx': 0, 'rackSeeds': set(), 'huntSeeds': set(),
                'cook': 0, 'cookXp': 0, 'cookSeeds': set(), 'mend': 0, 'mendXp': 0, 'mendSeeds': set()}
# r133 CAP CHECK: granted preserver units per (seed, vid, day) —
# AFTER read off the driver's live foodXpDay.preserverUnits fields
# (max unitsAfter over granting rows that day — the counter is
# monotonic within the day and resets at the day roll, so the max is
# the day's total; a stale Before on the first row of a new day makes
# After-Before wrong, max does not care). BEFORE has no units fields
# (unfixed engine), so its room is shown by inverting fx deltas back
# to units through the grant math (first 5 XP 1:1, then 1 XP per 2
# units, odd unit carried), with per-villager carry tracking in both
# bounds. cap_after_units_max / cap_after_over are the AFTER verdict;
# cap_before_over_low is the conservative (low-bound) room count.
cap_after_units = defaultdict(int)
cap_after_missing = 0
cap_before_units_low = defaultdict(int)
cap_before_units_high = defaultdict(int)
first_move_window = {}
first_move_window_spec = {}
first_move_window_fx = {}
ladder_win_after = {w: {'spec0pos': 0, 'seeds': 0} for w in ('d1-d14', 'd14-d28', 'd28-dEnd')}
ladder_win_before = {w: {'spec0pos': 0, 'seeds': 0} for w in ('d1-d14', 'd14-d28', 'd28-dEnd')}
skill_dist_end = {t: {0: 0, 1: 0, 2: 0, 3: 0} for t in SPECS}
# r135 Q1 RUNG: per-window R2X/R3X/fx15/fx30/XP-per-worker per specialty
# + NEAR-MISS-2 pool, all from the r134-after JSONs (the rung panel).
# The stall G/W/NEW tables are kept as context (same panel, same windows).
stall = {w: {t: {'G': 0, 'W': 0, 'NEW': 0, 'RES': 0} for t in SPECS} for w in ('d1-d14', 'd14-d28', 'd28-dEnd')}
stall_pantry = {'d1': [], 'd14': [], 'd28': []}
stall_nearmiss = {t: 0 for t in SPECS}
stall_nearmiss_rows = []
rung = {w: {t: {'R2X': 0, 'R3X': 0, 'fx15': 0, 'fx30': 0, 'xp_gains': []} for t in SPECS} for w in ('d1-d14', 'd14-d28', 'd28-dEnd')}
rung_nearmiss2 = {t: 0 for t in SPECS}
rung_nearmiss2_rows = []
rung_nearest15 = {t: [] for t in SPECS}  # (foodXp at dEnd, seed, name) for workers 5-14 at dEnd
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
    before_tag = 'r135-before'
    try:
        jb = load(before_tag, seed)
    except Exception as e:
        print(f'seed {seed}: BEFORE PANEL MISSING/UNREADABLE ({before_tag}) {e}'); jb = None
    try:
        jr134 = load('r134-after', R134_SEEDS[SEEDS.index(seed)], R134EVID)
    except Exception as e:
        print(f'seed {seed}: RUNG PANEL MISSING/UNREADABLE (r134-after) {e}'); jr134 = None
    try:
        j = load('r135-after', seed)
    except Exception as e:
        print(f'seed {seed}: AFTER PANEL MISSING/UNREADABLE {e}'); continue
    ca = parse_convos(load_convo('r135-after', seed))
    jr = jb  # funnel_rows compare before vs after (aggregate, descriptive)
    # DRIVER-NEUTRALITY is proven by the proof test's det-gate (same r133
    # driver fix-off vs fix-on, 5d seed 2601: funnel keys + practice
    # snapshots identical except foodXp preserver deltas), not here —
    # the driver changes are a tag rename + the withDelegate layer +
    # read-only wraps.
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
            # r133 CAP CHECK (AFTER): the day's granted units are the
            # counter's max over granting rows that day (see the
            # cap_after_units comment — max, not After-Before, because
            # the first row of a new day still carries yesterday's
            # counter in Before). Null units = the field is absent.
            # Only After-null is missing data: Before-null is the
            # counter not yet created (a villager's first-ever grant —
            # zero units granted so far that day, by construction).
            _ua = ck.get('fxPreserverUnitsAfter')
            if _ua is None:
                cap_after_missing += 1
            else:
                _k = (seed, ck.get('vid'), ck.get('day'))
                cap_after_units[_k] = max(cap_after_units[_k], _ua)
            grant_events['rack'] += 1
            grant_events['rackKcal'] += max(0, (ck.get('preservedKcalAfter') or 0) - (ck.get('preservedKcalBefore') or 0))
            grant_events['rackXp'] += (ck.get('fxPreserverAfter') or 0) - (ck.get('fxPreserverBefore') or 0)
            grant_events['rackSeeds'].add(seed)
        if ((ck.get('fxCookAfter') or 0) > (ck.get('fxCookBefore') or 0)):
            grant_events['cook'] += 1
            grant_events['cookXp'] += (ck.get('fxCookAfter') or 0) - (ck.get('fxCookBefore') or 0)
            grant_events['cookSeeds'].add(seed)
    for md in (j.get('mendLog') or []):
        if ((md.get('fxBuilderAfter') or 0) > (md.get('fxBuilderBefore') or 0)):
            grant_events['mend'] += 1
            grant_events['mendXp'] += (md.get('fxBuilderAfter') or 0) - (md.get('fxBuilderBefore') or 0)
            grant_events['mendSeeds'].add(seed)
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
        # r133 CAP CHECK (BEFORE): no units fields on the unfixed
        # engine, so invert fx deltas back to units through the grant
        # math, with per-villager carry tracking in both bounds (the
        # low bound is the conservative room count).
        _carry_low = {}
        _carry_high = {}
        for _ck in (jb.get('cookLog') or []):
            _fxb = _ck.get('fxPreserverBefore') or 0
            _fxa = _ck.get('fxPreserverAfter') or 0
            if _fxa > _fxb:
                _vid = _ck.get('vid')
                _ul, _, _cl2, _ = invert_preserver_units(_fxb, _carry_low.get(_vid, 0), _fxa - _fxb)
                _, _uh, _, _ch2 = invert_preserver_units(_fxb, _carry_high.get(_vid, 0), _fxa - _fxb)
                _carry_low[_vid] = _cl2
                _carry_high[_vid] = _ch2
                _k = (seed, _vid, _ck.get('day'))
                cap_before_units_low[_k] += _ul
                cap_before_units_high[_k] += _uh
        # r132 BEFORE-VALIDITY input: cook practice reps at dEnd on BEFORE
        # (the work happens) — the gap is work-without-XP, not no-work.
        if _bmE:
            before_cook_practice[seed] = sum(((v.get('practice') or {}).get('cook') or 0) for v in _bmE.values())
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
        # --- r135 Q1 RUNG (rung panel = r134-after, committed):
        # G/W/NEW per window per specialty from the snaps; RES from the
        # logs by day (windows cut on this seed's actual snap days);
        # pantry at window starts from the daily rows; NEAR-MISS (rung 1)
        # + NEAR-MISS-2 (rung 2) from d28->dEnd; R2X/R3X/fx15/fx30/XP-per-
        # worker from rung_window. Reads jr134, NOT jb: the rung question
        # is diagnosed on the r134 panel; jb is the matched r135-before
        # for the Q2 comparison.
        if jr134 is None:
            print(f'seed {seed}: RUNG skipped (r134-after panel missing)')
            _sm1 = _sm14 = _sm28 = _smE = None
            _s1d = _s14d = _s28d = _sEd = None
        else:
            _sp = jr134.get('practice') or {}
            _s1d, _sm1 = snap_of(_sp, 'd1')
            _s14d, _sm14 = snap_of(_sp, 'd14')
            _s28d, _sm28 = snap_of(_sp, 'd28')
            _sEd, _smE = snap_of(_sp, 'dEnd')
        _d14 = _s14d or 14
        _d28 = _s28d or 28
        for wkey, a, b in (('d1-d14', _sm1, _sm14), ('d14-d28', _sm14, _sm28), ('d28-dEnd', _sm28, _smE)):
            _sw = stall_window(a, b)
            _rw = rung_window(a, b)
            for t in SPECS:
                stall[wkey][t]['G'] += _sw[t]['G']
                stall[wkey][t]['W'] += _sw[t]['W']
                stall[wkey][t]['NEW'] += _sw[t]['NEW']
                rung[wkey][t]['R2X'] += _rw[t]['R2X']
                rung[wkey][t]['R3X'] += _rw[t]['R3X']
                rung[wkey][t]['fx15'] += _rw[t]['fx15']
                rung[wkey][t]['fx30'] += _rw[t]['fx30']
                rung[wkey][t]['xp_gains'].extend(_rw[t]['xp_gains'])
        def _wkey_of(day):
            try:
                d = int(day or 0)
            except Exception:
                return None
            if d <= _d14:
                return 'd1-d14'
            if d <= _d28:
                return 'd14-d28'
            return 'd28-dEnd'
        for _ck in ((jr134 or {}).get('cookLog') or []):
            _wk = _wkey_of(_ck.get('day'))
            if _wk is None:
                continue
            if ((_ck.get('fxPreserverAfter') or 0) > (_ck.get('fxPreserverBefore') or 0)):
                stall[_wk]['preserver']['RES'] += 1
            if ((_ck.get('fxCookAfter') or 0) > (_ck.get('fxCookBefore') or 0)):
                stall[_wk]['cook']['RES'] += 1
        for _md in ((jr134 or {}).get('mendLog') or []):
            _wk = _wkey_of(_md.get('day'))
            if _wk is None:
                continue
            if ((_md.get('fxBuilderAfter') or 0) > (_md.get('fxBuilderBefore') or 0)):
                stall[_wk]['builder']['RES'] += 1
        for _hl in ((jr134 or {}).get('huntLog') or []):
            _wk = _wkey_of(_hl.get('day'))
            if _wk is None:
                continue
            if ((_hl.get('fxButcherAfter') or 0) > (_hl.get('fxButcherBefore') or 0)):
                stall[_wk]['butcher']['RES'] += 1
        _daily = {r.get('day'): r.get('pantryKcal') for r in ((jr134 or {}).get('daily') or [])}
        for _k, _day in (('d1', _s1d or 1), ('d14', _d14), ('d28', _d28)):
            _pk = _daily.get(_day)
            if _pk is None:
                # daily rows start at day 2 on some seeds; take the nearest.
                _near = [d for d in sorted(_daily) if d is not None and abs(d - _day) <= 2]
                _pk = _daily.get(_near[0]) if _near else None
            if _pk is not None:
                stall_pantry[_k].append(_pk)
        if _sm28 and _smE:
            for _vid, _v28 in _sm28.items():
                _vE = _smE.get(_vid)
                if not _vE:
                    continue
                for t in SPECS:
                    _f28 = (_v28.get('foodXp') or {}).get(t) or 0
                    _fE = (_vE.get('foodXp') or {}).get(t) or 0
                    _s28 = (_v28.get('specialist') or {}).get(t) or 0
                    _sE = (_vE.get('specialist') or {}).get(t) or 0
                    if 1 <= _f28 <= 4 and _s28 == 0 and _sE == 0:
                        stall_nearmiss[t] += 1
                        stall_nearmiss_rows.append((seed, _vE.get('name') or _vid, t, _f28, _fE))
                    # r135 Q1 NEAR-MISS-2: at 5-14 foodXp at d28, still <15 at dEnd.
                    if 5 <= _f28 <= 14 and _fE < 15:
                        rung_nearmiss2[t] += 1
                        rung_nearmiss2_rows.append((seed, _vE.get('name') or _vid, t, _f28, _fE))
                    # Nearest to rung 2 at dEnd: workers sitting 5-14 foodXp.
                    if 5 <= _fE <= 14:
                        rung_nearest15[t].append((_fE, seed, _vE.get('name') or _vid))
    # --- Q2 INVITATIONS (r132, denominator fix) + Q3 NULL LINES: count
    # literal (null) THEM lines in the r135-after people-check transcripts
    # (bar 0) + navigation turns; invitation lines are counted in the
    # panel section below (invite_panel), where the following lines are
    # also visible for the answered-vs-silence adjudication.
    ca_txt = load_convo('r135-after', seed)
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
print('  DRIVER-NEUTRALITY: proven by the proof-test det-gate (same r135 driver fix-off vs fix-on, 5d seed 2601: funnel keys + practice snapshots identical except foodXp preserver deltas) — see the proof test, not this analyzer.')
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
print(f'  Q1 PACE (specialist 0->3 in 42d): BEFORE={pace03_before} AFTER={pace03_after} (bar AFTER 0)')
for _pm in pace03_moves_after:
    print(f'    pace03: {_pm}')
print(f'  Q1 foodXp by task AFTER: {fx_task_after} (BEFORE: {fx_task_before})')
print(f'  Q1 grant events AFTER: rack resolutions granting preserver XP={grant_events["rack"]} (rack kcal {grant_events["rackKcal"]}, preserver XP granted via racks {grant_events["rackXp"]}, seeds {len(grant_events["rackSeeds"])}), hunt kills={grant_events["huntKill"]} of which granted butcher XP={grant_events["huntKillFx"]} (seeds {len(grant_events["huntSeeds"])}), cook resolutions granting cook XP={grant_events["cook"]} (cook XP granted {grant_events["cookXp"]}, seeds {len(grant_events["cookSeeds"])}), mend resolutions granting builder XP={grant_events["mend"]} (builder XP granted {grant_events["mendXp"]}, seeds {len(grant_events["mendSeeds"])})')
print(f'  Q1 skill distribution at dEnd (AFTER, per task, skill 0/1/2/3): {skill_dist_end}')
print(f'  Q1 first-move windows: {first_move_window}')
print(f'  Q1 first-move windows (specialist-only): {first_move_window_spec}')
print(f'  Q1 first-move windows (foodXp-only): {first_move_window_fx}')
for wkey in ('d1-d14', 'd14-d28', 'd28-dEnd'):
    print(f"  Q1 ladder moves by window {wkey}: AFTER spec0pos={ladder_win_after[wkey]['spec0pos']} on {ladder_win_after[wkey]['seeds']}/16 seeds | BEFORE spec0pos={ladder_win_before[wkey]['spec0pos']} on {ladder_win_before[wkey]['seeds']}/16 seeds")
# r135 REGRESSION (DESCRIPTIVE, prereg): the Q2 gate changes which menu
# choice the driver picks in dry sittings, so ladder metrics may diverge
# slightly between panels — the comparison below is reported, not judged
# as equality. The binding regression is Q2b (lessons conserved) + Q2d.
# The r133 Q1a-Q1e numbers below are DESCRIPTIVE here (the cap still
# holds on both panels).
preserver_moves_seeds = sum(1 for x in SEEDS if ((ladder_panel.get(x) or {}).get('spec0posByTask') or {}).get('preserver', 0) >= 1)
butcher_moves_seeds = sum(1 for x in SEEDS if ((ladder_panel.get(x) or {}).get('spec0posByTask') or {}).get('butcher', 0) >= 1)
before_butcher_moves_seeds = sum(1 for x in SEEDS if ((ladder_before.get(x) or {}).get('spec0posByTask') or {}).get('butcher', 0) >= 1)
preserver_pace03_after = sum(((ladder_panel.get(x) or {}).get('pace03ByTask') or {}).get('preserver', 0) for x in SEEDS)
butcher_pace03_after = sum(((ladder_panel.get(x) or {}).get('pace03ByTask') or {}).get('butcher', 0) for x in SEEDS)
cook_moves_seeds = sum(1 for x in SEEDS if ((ladder_panel.get(x) or {}).get('spec0posByTask') or {}).get('cook', 0) >= 1)
builder_moves_seeds = sum(1 for x in SEEDS if ((ladder_panel.get(x) or {}).get('spec0posByTask') or {}).get('builder', 0) >= 1)
pace03_cook_builder = sum(((ladder_panel.get(x) or {}).get('pace03ByTask') or {}).get('cook', 0) + ((ladder_panel.get(x) or {}).get('pace03ByTask') or {}).get('builder', 0) for x in SEEDS)
spotter_fx_after = fx_task_after.get('spotter', 0)
before_preserver_pace03 = sum(((ladder_before.get(x) or {}).get('pace03ByTask') or {}).get('preserver', 0) for x in SEEDS)
cap_after_max = max(cap_after_units.values()) if cap_after_units else 0
cap_after_over = sum(1 for v in cap_after_units.values() if v > 2)
cap_before_over_low = sum(1 for v in cap_before_units_low.values() if v > 2)
cap_before_over_high = sum(1 for v in cap_before_units_high.values() if v > 2)
print(f'  LADDER (descriptive, both panels fix-on): preserver pace03 AFTER {preserver_pace03_after} (BEFORE {before_preserver_pace03}) | preserver moves AFTER {preserver_moves_seeds}/16 | butcher AFTER {butcher_moves_seeds}/16 vs BEFORE {before_butcher_moves_seeds}/16 pace03 {butcher_pace03_after} | cook {cook_moves_seeds}/16 builder {builder_moves_seeds}/16 pace03 cook+builder {pace03_cook_builder} | spotter foodXp AFTER {spotter_fx_after}')
print(f'  CAP CHECK (descriptive): AFTER max granted preserver units/villager-day: {cap_after_max} (days over {cap_after_over}) | BEFORE inversion bounds: low {cap_before_over_low} high {cap_before_over_high} | AFTER granting rows missing unit data: {cap_after_missing}')
print(f'  Q1 ladder-wide (descriptive): moves {ladder_seeds}/16, pace03 {pace03_after}')
_reg_diffs = []
for _x in SEEDS:
    _L = ladder_panel.get(_x) or {}
    _B = ladder_before.get(_x) or {}
    for _k in ('spec0pos', 'foodXp0pos', 'foodXpEnd', 'pace03'):
        if (_L.get(_k, 0) or 0) != (_B.get(_k, 0) or 0):
            _reg_diffs.append((f'seed {_x}', _k, _B.get(_k, 0), _L.get(_k, 0)))
    if ((_L.get('win') or {}) != (_B.get('win') or {})):
        _reg_diffs.append((f'seed {_x}', 'win', _B.get('win'), _L.get('win')))
    # Trajectory equality on the funnel keys too (endDay/alive/pantry/over).
    for _r in funnel_rows:
        if _r['seed'] == _x:
            for _k, _rk in (('endDay', 'endDay_ref'), ('alive', 'alive_ref'), ('pantry', 'pantry_ref'), ('over', 'over_ref')):
                if _r.get(_k) != _r.get(_rk):
                    _reg_diffs.append((f'seed {_x}', 'funnel:' + _k, _r.get(_rk), _r.get(_k)))
if not _reg_diffs:
    print('  REGRESSION verdict: CLEAN (ladder + funnel keys identical BEFORE vs AFTER on all 16 seeds — the line-only fix moved nothing else)')
else:
    print(f'  REGRESSION verdict: DIVERGED ({len(_reg_diffs)} differing cells — investigate, do not re-score)')
    for _d in _reg_diffs[:40]:
        print(f'    regression: {_d}')
print(f'  Q2 INVITATIONS (AFTER panel, denominator fix — offered = answers + spoken lines followed by silence):')
invite_lines = 0
invite_accepted = 0
invite_declined = 0
invite_unanswered_spoken = 0
for seed in SEEDS:
    p = os.path.join(EVID, f'journey-establishment-r135-after-convo-seed{seed}.txt')
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
print(f'  Q2 PREPLOG SPLIT (r135-after panel): no-teacher rows={prep_panel["no_teacher"]} split classes={dict(prep_panel["split_classes"])} whys={dict(prep_panel["whys"])}')
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

# ================= r135 Q1 RUNG-2/3 VISIBILITY (binding, prereg) =================
# Instrument: the r134-after JSONs (16 seeds, band 2501-2516). Windows are snap-to-snap.
print('\n  Q1 RUNG-2/3 VISIBILITY (rung panel = r134-after, 16 seeds):')
print('    rung math (code): rung1 foodXp>=5, rung2 >=15, rung3 >=30; above 5 XP accrues 2:1, so rung2 needs 25 granting units from 0, rung3 needs 55.')
def _med(xs):
    xs = sorted(xs)
    return xs[len(xs) // 2] if xs else None
def _mx(xs):
    return max(xs) if xs else 0
for _w in ('d1-d14', 'd14-d28', 'd28-dEnd'):
    _parts = []
    for _t in ('butcher', 'cook', 'preserver', 'builder'):
        _d = rung[_w][_t]
        _g = _d['xp_gains']
        _parts.append(f"{_t} R2X={_d['R2X']} R3X={_d['R3X']} fx15={_d['fx15']} fx30={_d['fx30']} XP/worker med={_med(_g)} max={_mx(_g)} n={len(_g)}")
    print(f'    {_w}: ' + ' | '.join(_parts))
_tot_r2x = sum(rung[_w][_t]['R2X'] for _w in ('d1-d14', 'd14-d28', 'd28-dEnd') for _t in SPECS)
_tot_r3x = sum(rung[_w][_t]['R3X'] for _w in ('d1-d14', 'd14-d28', 'd28-dEnd') for _t in SPECS)
_tot_fx15 = sum(rung[_w][_t]['fx15'] for _w in ('d1-d14', 'd14-d28', 'd28-dEnd') for _t in SPECS)
_tot_fx30 = sum(rung[_w][_t]['fx30'] for _w in ('d1-d14', 'd14-d28', 'd28-dEnd') for _t in SPECS)
print(f'    panel totals: spec 1->2 crossings R2X={_tot_r2x} | spec 2->3 R3X={_tot_r3x} | foodXp 15-crossings={_tot_fx15} | foodXp 30-crossings={_tot_fx30}')
print(f'    NEAR-MISS-2 (5-14 foodXp at d28, still <15 at dEnd): {rung_nearmiss2} total={sum(rung_nearmiss2.values())}')
for _r in rung_nearmiss2_rows[:20]:
    print(f'      near-miss-2: seed {_r[0]} {_r[1]} {_r[2]} foodXp d28={_r[3]} dEnd={_r[4]}')
print(f'    NEAREST to rung 2 at dEnd (5-14 foodXp, per specialty, top 5):')
for _t in SPECS:
    _near = sorted(rung_nearest15[_t], reverse=True)[:5]
    print(f'      {_t}: {[(f, s, n) for (f, s, n) in _near]}')
print(f'    stall context (r134 panel, same windows): G/W/NEW per specialty:')
for _w in ('d1-d14', 'd14-d28', 'd28-dEnd'):
    _parts = []
    for _t in ('butcher', 'cook', 'preserver', 'builder'):
        _d = stall[_w][_t]
        _parts.append(f"{_t} G={_d['G']} W={_d['W']} NEW={_d['NEW']} RES={_d['RES']}")
    print(f'      {_w}: ' + ' | '.join(_parts))
if _tot_r2x >= 1:
    print(f'  Q1 RUNG verdict: R2-REACHABLE ({_tot_r2x} spec-2 crossings panel-wide; rung 2 IS reached inside the leg — see the per-window table for how often and where)')
else:
    print('  Q1 RUNG verdict: R2-BEYOND-LEG (0 spec-2 crossings panel-wide; rung 2 is beyond a 42-day leg at current rates — see NEAR-MISS-2 + nearest-to-15 for how close the cohort gets)')
print(f'  Q1 R3 (descriptive): {_tot_r3x} spec-3 crossings (expected 0 — 55 granting units exceeds the leg; a crossing would overturn the math and must be investigated)')


# ================= r135 Q2 FIELD-ASK COUNTER (binding, prereg) =================
# Counts, per panel, from the people-check transcripts: field asks picked,
# the closer that follows each ask (or the lesson line), expedition asks,
# and lessons taught. A field ask ends in a CLOSER iff the teach block
# taught nothing; it ends in a LESSON iff monster/plant/place/generic fired.
CLOSER_MORE = "There's more, but that's for another fire."
CLOSER_LINES = [CLOSER_MORE, "That's everything I brought back. The rest is just walking.", "I've told you everything I know about that."]
def _field_counts(tag):
    asks = 0
    closers = Counter()
    lessons = 0
    exp_asks = 0
    exp_closers = 0
    convo_n = 0
    for _seed in SEEDS:
        _txt = load_convo(tag, _seed)
        if not _txt:
            continue
        _names = re.findall(r'^-- (.+?) \([^)]+\) occ=', _txt, flags=re.M)
        convo_n += len(_names)
        _lines = _txt.split('\n')
        for _i, _ln in enumerate(_lines):
            if 'agency:ask_field' in _ln:
                asks += 1
                _nxt = _lines[_i + 1] if _i + 1 < len(_lines) else ''
                _hit = None
                for _c in CLOSER_LINES:
                    if _c in _nxt:
                        _hit = _c
                        break
                if _hit:
                    closers[_hit] += 1
                elif _nxt.startswith('THEM:'):
                    lessons += 1
            if 'ask_expedition' in _ln:
                exp_asks += 1
                _nxt = _lines[_i + 1] if _i + 1 < len(_lines) else ''
                if any(_c in _nxt for _c in CLOSER_LINES):
                    exp_closers += 1
    return {'asks': asks, 'closers': closers, 'lessons': lessons,
            'exp_asks': exp_asks, 'exp_closers': exp_closers, 'convos': convo_n}
print('\n  Q2 FIELD-ASK COUNTER:')
_bf = _field_counts('r135-before')
_af = _field_counts('r135-after')
print(f'    BEFORE (r135-before): field asks={_bf["asks"]} -> closers={dict(_bf["closers"])} (total {sum(_bf["closers"].values())}) lessons={_bf["lessons"]} | expedition asks={_bf["exp_asks"]} -> closers={_bf["exp_closers"]} | convos={_bf["convos"]}')
print(f'    AFTER (r135-after): field asks={_af["asks"]} -> closers={dict(_af["closers"])} (total {sum(_af["closers"].values())}) lessons={_af["lessons"]} | expedition asks={_af["exp_asks"]} -> closers={_af["exp_closers"]} | convos={_af["convos"]}')
_b_more = _bf['closers'].get(CLOSER_MORE, 0)
_a_more = _af['closers'].get(CLOSER_MORE, 0)
_q2a = (_a_more == 0)
_q2b = (_af['lessons'] >= _bf['lessons'] - 1)
_q2c = (_af['asks'] == 0) or (sum(_af['closers'].values()) == 0)
print(f'  Q2a CLOSER COUNT: "There\'s more" BEFORE={_b_more} AFTER={_a_more} (bar AFTER = 0) -> {"GO" if _q2a else "NO-GO"}')
print(f'  Q2b NO LESSON HIDDEN: field-ask lessons BEFORE={_bf["lessons"]} AFTER={_af["lessons"]} (bar AFTER >= BEFORE - 1) -> {"GO" if _q2b else "NO-GO"}')
print(f'  Q2c ASK->LESSON RATE: AFTER asks={_af["asks"]} closers={sum(_af["closers"].values())} (bar 0 closers) -> {"GO" if _q2c else "NO-GO"}')
print(f'  Q2 verdict: {"GO" if (_q2a and _q2b and _q2c) else "NO-GO"} (Q2c honesty is a sense-read in the run note; expedition asks are reported, not barred)')
