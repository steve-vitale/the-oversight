#!/usr/bin/env python3
"""r107 hunt-staffing analyzer. Reads evidence/2026-11-06/journey-establishment-r107-seed{1501..1504}.json
(the ARM: competent-hunt, HUNTSTAFF=1) and the same-base CONTROL
(r105 driver, unmodified, re-run on the current base; pass its dir via
R107_CONTROL_DIR) plus the committed r105 panel for the base-move record.
- M0: r107 driver gate-off (HUNTSTAFF unset) reproduces the control exactly
  — checked separately on the pilot seed (see run note); this analyzer
  prints the control-vs-committed-r105 base-move comparison for the record.
- M1: hunt-staffing arm-vs-control: assignments, hunt calls/kills/kcal,
  field_dressing fires, pantry + survival deltas per seed.
- M2: care visibility (r105 continuity). M3/M4: survival + pantry guardrails
  (M4 keywords now include 'dehydrat' per the r105 correction).
Usage: R107_CONTROL_DIR=<dir> python3 scripts/analyze-journey-establishment-r107-20261106.py [EVIDDIR]
"""
import json, os, sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
EVID = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'evidence', '2026-11-06')
SEEDS = [1501, 1502, 1503, 1504, 1601, 1602, 1603, 1604]

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

THRESHOLDS = [18, 48, 96, 192, 384]
TRACKS = ['combat', 'field', 'social', 'craft', 'strange']

def level_for(xp):
    return sum(1 for t in THRESHOLDS if (xp or 0) >= t)

def load(tag, seed):
    p = os.path.join(EVID, f'journey-establishment-{tag}-seed{seed}.json')
    return json.load(open(p))

# r107: the committed r105 panel lives in evidence/2026-11-05 (EVID now
# points at 2026-11-06); load it from its own dir. Seeds 1601-1604 have
# no committed panel — MISSING there is expected, control is the reference.
R105_DIR = os.path.join(ROOT, 'evidence', '2026-11-05')

def load_r105(seed):
    p = os.path.join(R105_DIR, f'journey-establishment-r105-seed{seed}.json')
    return json.load(open(p))

# Static census (prereg): villager-aware read sites?
#   field_dressing: YES (villagerHuntResolve frac 0.60->0.78)
#   triage: YES (villagerCareTick reach 2, occupation-medics only)
#   diplomat: NO (all reads are the player bearer's abilityLevel)
#   herbal_remedy: NO (treatDisease/treatVillager player-only; care gates on occupation)
#   preserve_food: NO (cook duty uses specialistSkill = occupation + foodXp only)
#   wound_care: NO (only a player-side skillKnown read)
INERT = {'diplomat', 'herbal_remedy', 'preserve_food', 'wound_care'}
AWARE = {'field_dressing', 'triage'}

# --- M0 reference: the r105-driver CONTROL on the current base ---
# The r105 PANEL ran on fc8390511; master has moved since (r108 landing,
# r143 Ruth fix, r102 scale), so the panel is a stale reference. The control
# (r105 driver, unmodified, re-run on the current base) is the binding
# reference for the ARM. Pass its dir via R107_CONTROL_DIR. The stale panel
# is still loaded for a printed base-move comparison.
CONTROL_DIR = os.environ.get('R107_CONTROL_DIR') or ''
r105 = {}
for seed in SEEDS:
    try:
        r105[seed] = load_r105(seed)
    except Exception as e:
        print(f'r105 panel seed {seed}: MISSING {e}')
r105ctl = {}
for seed in SEEDS:
    if not CONTROL_DIR:
        continue
    try:
        r105ctl[seed] = json.load(open(os.path.join(CONTROL_DIR, f'journey-establishment-r105-seed{seed}.json')))
    except Exception as e:
        print(f'r105 control seed {seed}: MISSING {e}')

m0_seeds = []  # kept for shape; M0 (gate-off) is checked separately on the pilot seed
funnel_rows = []  # per-seed arm-vs-control funnel deltas (M1)
hs_panel = {'assignments': 0, 'assign_rows': [], 'refusals': [], 'wounds': [],
            'hunt_calls_arm': 0, 'hunt_kills_arm': 0, 'hunt_kcal_arm': 0,
            'hunt_calls_ctl': 0, 'hunt_kills_ctl': 0, 'hunt_kcal_ctl': 0,
            'hunter_wound_deaths': []}
m3_seeds = m4_seeds = 0
panel_living = 0
# per-id panel accumulators
held = defaultdict(list)      # id -> [(seed, name)]
uses = defaultdict(list)      # id -> [(seed, kind, detail)]
# care visibility
care = {'calls': 0, 'tends': 0, 'tended_pairs': [], 'medics_seen': set(),
        'triage_medics': [], 'herbal_medics': [], 'healer_rounds': [],
        'treat_ticks': 0, 'treat_changed': 0, 'treat_healers': Counter()}
hunt = {'calls': 0, 'kills': 0, 'kills_held': 0, 'kills_notheld': 0,
        'kcal_held': [], 'kcal_notheld': [], 'by_aid': defaultdict(lambda: {'held': [], 'notheld': []})}
cook = {'calls': 0, 'rack_events': 0, 'holder_cooks': [], 'holder_blind': 0,
        'spec_cooks': 0, 'kept_weeks': 0, 'kept_couple': 0}
for seed in SEEDS:
    try:
        j = load('r107', seed)
    except Exception as e:
        print(f'seed {seed}: MISSING/UNREADABLE {e}'); continue
    tele = j.get('teleAll') or []
    census = {str(c['id']): c for c in (j.get('census') or [])}
    hold_end = j.get('holdingsEnd') or []
    hold_start = {str(h['id']): h for h in (j.get('holdingsStart') or [])}
    # r104 correction: the roster INCLUDES the current bearer (the player),
    # whose skills/abilities live in player stores (codex / scholar), not
    # npc stores. Exclude the end-player (r103 codex-skills match) from
    # villager counts.
    codex = j.get('playerCodexSkills') or {}
    player_vid = None
    for cid, c in census.items():
        if c.get('skills') is not None and set(c['skills']) == set(codex.keys()) and len(codex) > 0:
            player_vid = cid; break
    hold_end_v = [h for h in hold_end if str(h['id']) != str(player_vid)] if player_vid else hold_end
    # --- ARM vs r105 CONTROL (binding reference) + stale panel (printed) ---
    # M0 (gate-off == control) is checked separately on the pilot seed; here
    # a DIFFERENCE arm-vs-control is the signal under test, not a failure.
    ref = r105ctl.get(seed) or r105.get(seed)
    ref_label = 'control' if r105ctl.get(seed) else 'PANEL-STALE'
    m0_panel = None
    lesson_note = ''
    funnel = None
    if ref:
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
        lk106 = lesson_keyset(j)
        lkref = lesson_keyset(ref)
        diff = (lk106 - lkref) + (lkref - lk106)
        lesson_note = f'lessons arm={sum(lk106.values())} {ref_label}={sum(lkref.values())} diff={dict(diff) if diff else "none"}'
        funnel = {
            'seed': seed,
            'endDay_arm': j.get('endDay'), 'endDay_ctl': ref.get('endDay'),
            'alive_arm': j.get('aliveEnd'), 'alive_ctl': ref.get('aliveEnd'),
            'pantry_arm': j.get('pantryKcalEnd'), 'pantry_ctl': ref.get('pantryKcalEnd'),
            'over_arm': j.get('gameOver'), 'over_ctl': ref.get('gameOver'),
        }
        funnel_rows.append(funnel)
        # stale-panel comparison (record only, never gates)
        pref = r105.get(seed)
        if pref and ref is not pref:
            psame = (j.get('endDay') == pref.get('endDay') and j.get('aliveEnd') == pref.get('aliveEnd')
                     and j.get('pantryKcalEnd') == pref.get('pantryKcalEnd'))
            lkpanel = lesson_keyset(pref)
            pdiff = (lk106 - lkpanel) + (lkpanel - lk106)
            m0_panel = psame and not pdiff
    # --- holdings (villagers only) for the six ids ---
    living = [h for h in hold_end_v if not h.get('dead')]
    panel_living += len(living)
    for h in living:
        owned = set(h.get('owned') or [])
        skills = set(h.get('skills') or [])
        # diplomat: granted ability (owned union). herbal: skill OR ability.
        # field_dressing / preserve_food: skill in npcSkills (the ability id
        # doubles as the skill id). wound_care: skill; triage: ability.
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
    # --- duty-use logs ---
    for h in (j.get('huntLog') or []):
        hunt['calls'] += 1
        if (h.get('kcal') or 0) > 0:
            hunt['kills'] += 1
            aid = h.get('aid') or '?'
            if h.get('heldFieldDressing'):
                hunt['kills_held'] += 1
                hunt['kcal_held'].append(h['kcal'])
                hunt['by_aid'][aid]['held'].append(h['kcal'])
                uses['field_dressing'].append((seed, 'hunt-kill', f"{h.get('name')} {aid} {h['kcal']}kcal"))
            else:
                hunt['kills_notheld'] += 1
                hunt['kcal_notheld'].append(h['kcal'])
                hunt['by_aid'][aid]['notheld'].append(h['kcal'])
    for c in (j.get('careLog') or []):
        care['calls'] += 1
        care['tends'] += c.get('tends') or 0
        meds = c.get('medics') or []
        # Triage USE (tight bar): exactly one medic present, holding triage,
        # and TWO tends in the one tick — both must be that medic's reach-2.
        # (Two medics tending 1 each is not a triage use.)
        if len(meds) == 1 and meds[0].get('heldTriage') and (c.get('tends') or 0) >= 2:
            uses['triage'].append((seed, 'care-reach-2', f"{meds[0].get('name')} tended 2 in one tick (reach 2)"))
        for m in meds:
            care['medics_seen'].add((seed, m.get('name')))
            if m.get('heldTriage'):
                care['triage_medics'].append((seed, m.get('name')))
            if m.get('heldHerbalRemedy'):
                care['herbal_medics'].append((seed, m.get('name')))
        for t in (c.get('tended') or []):
            care['tended_pairs'].append((seed, t.get('name'), t.get('before'), t.get('after')))
    for hr in (j.get('healerLog') or []):
        # NOTE: healerRounds does NOT read triage/herbal_remedy holdings
        # (campHealerId picks by occupation) — a round by a holder is M2
        # actor evidence, never a USE of the holding.
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
            # NOTE: a holder-cook running the racks at the blind rate is
            # evidence of NON-use (the holding changed nothing) — never a USE.
            # A preserve_food USE would need the holding to change the rate,
            # which the static census says cannot happen (rate = occupation).
            if (ck.get('specPreserver') or 0) == 0:
                cook['holder_blind'] += 1
        if (ck.get('specPreserver') or 0) > 0:
            cook['spec_cooks'] += 1
    # M1 hunt-staff capture (arm) + control-side hunt counts for the delta.
    hs = j.get('huntStaff') or {}
    # r107 FIX 2: ever-substrate join — end snapshot masks dead hunters, so
    # join the per-dawn ever-capture with the assign/refusal log names.
    ever_sub = [e.get('name') for e in (j.get('huntEligEver') or [])]
    ever_from_logs = sorted(set([a.get('name') for a in (hs.get('assignLog') or []) if a.get('name')]
                               + [r.get('name') for r in (hs.get('refusalLog') or []) if r.get('name')]))
    hs_panel['assignments'] += hs.get('assignments') or 0
    for a in (hs.get('assignLog') or []):
        hs_panel['assign_rows'].append((seed, a.get('day'), a.get('name'), a.get('occ')))
    for r in (hs.get('refusalLog') or []):
        hs_panel['refusals'].append((seed, r.get('day'), r.get('name'), r.get('reason')))
    for w in (hs.get('woundLog') or []):
        hs_panel['wounds'].append((seed, w.get('day'), w.get('vid'), w.get('dmg'), w.get('hp')))
    hs_panel['hunt_calls_arm'] += len(j.get('huntLog') or [])
    hs_panel['hunt_kills_arm'] += sum(1 for h in (j.get('huntLog') or []) if (h.get('kcal') or 0) > 0)
    hs_panel['hunt_kcal_arm'] += sum((h.get('kcal') or 0) for h in (j.get('huntLog') or []))
    if ref:
        hs_panel['hunt_calls_ctl'] += len(ref.get('huntLog') or [])
        hs_panel['hunt_kills_ctl'] += sum(1 for h in (ref.get('huntLog') or []) if (h.get('kcal') or 0) > 0)
        hs_panel['hunt_kcal_ctl'] += sum((h.get('kcal') or 0) for h in (ref.get('huntLog') or []))
    # M3 / M4
    if not j.get('gameOver') and (j.get('aliveAt40') or 0) >= 1:
        m3_seeds += 1
    starv = [d for d in (j.get('deaths') or []) if any(w in str(d.get('cause') or '').lower() for w in ('starvat', 'hunger', 'thirst', 'dehydrat'))]
    if not starv:
        m4_seeds += 1
    # §14c co-primary: villager (non-player) combat deaths in-panel.
    for d in (j.get('deaths') or []):
        if not d.get('player') and 'hunt' in str(d.get('cause') or '').lower():
            hs_panel['hunter_wound_deaths'].append((seed, d.get('day'), d.get('who'), d.get('cause')))
    print(f'\n=== seed {seed} (endDay {j.get("endDay")}, over {j.get("gameOver")}, aliveEnd {j.get("aliveEnd")}, wave {j.get("waveReached")}, pantryEnd {j.get("pantryKcalEnd")}) ===')
    if funnel:
        print(f'  ARM vs {ref_label}: endDay {funnel["endDay_arm"]} vs {funnel["endDay_ctl"]} | alive {funnel["alive_arm"]} vs {funnel["alive_ctl"]} | pantry {funnel["pantry_arm"]} vs {funnel["pantry_ctl"]} (d{funnel["pantry_arm"] - funnel["pantry_ctl"]:+}) | over {funnel["over_arm"]} vs {funnel["over_ctl"]} | {lesson_note}' + (f' | vs stale r105-panel: {"SAME" if m0_panel else "DIFF"} (record only)' if m0_panel is not None else ''))
    print(f'  huntStaff: assignments={hs.get("assignments") or 0} refusals={len(hs.get("refusalLog") or [])} wounds={len(hs.get("woundLog") or [])} huntLog={len(j.get("huntLog") or [])} fieldDressingKills={sum(1 for h in (j.get("huntLog") or []) if (h.get("kcal") or 0) > 0 and h.get("heldFieldDressing"))}')
    print(f'  everSubstrate={ever_sub} logNames={ever_from_logs} guardrails={j.get("guardrails")} c3={j.get("c3")}')
    print(f'  wraps: hunt={j.get("huntWrap")} care={j.get("careWrap")}({j.get("careCalls")} calls) healer={j.get("healerWrap")}({j.get("healerCalls")} calls) treat={j.get("treatWrap")}({j.get("treatCalls")} calls) cook={j.get("cookWrap")}')
    print(f'  huntLog={len(j.get("huntLog") or [])} careLog={len(j.get("careLog") or [])} healerLog={len(j.get("healerLog") or [])} treatLog={len(j.get("treatLog") or [])} cookLog={len(j.get("cookLog") or [])}')
    print(f'  skill_used rows: {sum(1 for t in tele if t.get("type") == "skill_used")} ability_used: {sum(1 for t in tele if t.get("type") == "ability_used")}')

print(f'\nPANEL: livingVillagersEnd={panel_living}')
print(f'  M0 INSTRUMENT-NEUTRALITY: checked separately on the pilot seed (gate-off driver vs control; see run note — NOT this analyzer)')
print(f'  M1 HUNT-STAFFING (arm vs same-base control, per seed):')
for fr in funnel_rows:
    print(f'    seed {fr["seed"]}: endDay {fr["endDay_arm"]} vs {fr["endDay_ctl"]} | alive {fr["alive_arm"]} vs {fr["alive_ctl"]} | pantry {fr["pantry_arm"]} vs {fr["pantry_ctl"]} (d{fr["pantry_arm"] - fr["pantry_ctl"]:+}) | over {fr["over_arm"]} vs {fr["over_ctl"]}')
pantry_up = [fr['seed'] for fr in funnel_rows if fr['pantry_arm'] > fr['pantry_ctl']]
surv_up = [fr['seed'] for fr in funnel_rows if fr['alive_arm'] > fr['alive_ctl'] or ((not fr['over_arm']) and fr['over_ctl'])]
surv_down = [fr['seed'] for fr in funnel_rows if fr['alive_arm'] < fr['alive_ctl'] or (fr['over_arm'] and (not fr['over_ctl']))]
fd_fires = len(uses.get('field_dressing', []))
print(f'  huntStaff panel: assignments={hs_panel["assignments"]} huntCalls arm={hs_panel["hunt_calls_arm"]} vs ctl={hs_panel["hunt_calls_ctl"]} kills arm={hs_panel["hunt_kills_arm"]} vs ctl={hs_panel["hunt_kills_ctl"]} kcal arm={hs_panel["hunt_kcal_arm"]} vs ctl={hs_panel["hunt_kcal_ctl"]}')
for a in hs_panel['assign_rows'][:20]:
    print(f'    assigned: seed {a[0]} d{a[1]} {a[2]} ({a[3]})')
for r in hs_panel['refusals'][:10]:
    print(f'    refused: seed {r[0]} d{r[1]} {r[2]} ({r[3]})')
for w in hs_panel['wounds'][:10]:
    print(f'    wound: seed {w[0]} d{w[1]} {w[2]} dmg={w[3]} hp={w[4]}')
if hs_panel['hunter_wound_deaths']:
    print(f'    HUNTER-WOUND DEATHS (§14c): {hs_panel["hunter_wound_deaths"]}')
moved_seeds = set(pantry_up) | set(surv_up) | set(surv_down)
if hs_panel['hunter_wound_deaths'] or len(surv_down) >= 4:
    m1_verdict = 'HUNT-HURTS'
elif len(surv_up) >= 4 and fd_fires >= 1:
    m1_verdict = 'HUNT-CHANGES-FUNNEL'
elif len(pantry_up) >= 4 and len(surv_down) == 0 and fd_fires >= 1:
    m1_verdict = 'HUNT-FEEDS-ONLY'
elif len(moved_seeds) == 1 and fd_fires >= 1:
    m1_verdict = 'HUNT-MOVED-ONE-SEED'
elif not moved_seeds and fd_fires == 0:
    m1_verdict = 'HUNT-NO-CHANGE'
else:
    m1_verdict = 'HUNT-MIXED'
print(f'  M1 verdict: {m1_verdict} (pantryUp={pantry_up} survUp={surv_up} survDown={surv_down} fieldDressingFires={fd_fires})')
print(f'  M1 USE CLASSIFICATION (per id: USED / HELD-UNUSED / NEVER-HELD + INERT flag):')
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
n_duty_works = (verdict_classes.get('field_dressing') == 'USED' and verdict_classes.get('triage') == 'USED')
n_dead = [i for i, c in verdict_classes.items() if c == 'HELD-UNUSED' and i in AWARE]
n_decor = [i for i, c in verdict_classes.items() if c == 'HELD-UNUSED' and i in INERT]
verdict = ('DUTY-WORKS' if n_duty_works else 'MIXED') if not (n_dead or n_decor) else (
    'DUTY-DEAD' if n_dead else 'HOLDINGS-DECORATIVE' if n_decor else 'MIXED')
if n_dead and n_decor:
    verdict = 'MIXED (DUTY-DEAD + HOLDINGS-DECORATIVE)'
print(f'  M1b USE-CLASSIFICATION verdict: {verdict} (aware-held-unused={n_dead} inert-held-unused={n_decor})')
print(f'  hunt: calls={hunt["calls"]} kills={hunt["kills"]} held={hunt["kills_held"]} notheld={hunt["kills_notheld"]}')
if hunt['kcal_held'] and hunt['kcal_notheld']:
    import statistics
    print(f'    mean kcal/kill held={statistics.mean(hunt["kcal_held"]):.0f} notheld={statistics.mean(hunt["kcal_notheld"]):.0f} (frac 0.78 vs 0.60 predicts ~1.3x)')
for aid, v in sorted(hunt['by_aid'].items()):
    if v['held'] and v['notheld']:
        import statistics
        print(f'    {aid}: held kcal={v["held"]} notheld kcal={v["notheld"]} (same-animal means: held {statistics.mean(v["held"]):.0f} vs notheld {statistics.mean(v["notheld"]):.0f})')
print(f'  M2 CARE-VISIBILITY: careTicks={care["calls"]} tends={care["tends"]} medicsSeen={len(care["medics_seen"])} triageMedics={care["triage_medics"]} herbalMedics={care["herbal_medics"]}')
print(f'    healerRounds={len(care["healer_rounds"])} treatTicks={care["treat_ticks"]} treatChanged={care["treat_changed"]} treatHealers={dict(care["treat_healers"])}')
for hr in care['healer_rounds'][:10]:
    print(f'    round: seed {hr[0]} {hr[1]} -> {hr[2]} {hr[3]}->{hr[4]}HP heldHerbal={hr[5]} heldTriage={hr[6]}')
print(f'  cook/racks: cookDutyCalls={cook["calls"]} rackEvents={cook["rack_events"]} specCooks={cook["spec_cooks"]} holderCooks={len(cook["holder_cooks"])} holderBlind={cook["holder_blind"]} keepsWeeks={cook["kept_weeks"]} keepsCouple={cook["kept_couple"]}')
for hc in cook['holder_cooks']:
    print(f'    holder-cook: seed {hc[0]} {hc[1]} spec={hc[2]} rackLines={hc[3]}')
print(f'  M3 SURVIVAL-42 {m3_seeds}/8 (bar 6/8) | M4 PANTRY {m4_seeds}/8 (bar 6/8)')
