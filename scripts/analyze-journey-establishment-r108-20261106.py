#!/usr/bin/env python3
"""r108 hunt-prep analyzer. Reads evidence/2026-11-06/journey-establishment-r108-seed{1502,1504,1603,1604}.json
(the PREP-ARM: competent-hunt, HUNTSTAFF=2), the same-base REF-ARM
(r107 driver, HUNTSTAFF=1 — the r107 lever as measured; pass its dir via
R108_REFARM_DIR) and the same-base CONTROL (r107 driver, gate-off; pass its
dir via R108_CONTROL_DIR).
- M0: r108 driver gate-off reproduces the control exactly, and r108 driver
  HUNTSTAFF=1 reproduces the ref-arm exactly — checked separately on the
  pilot seed (see run note); this analyzer prints the three-leg table.
- M1: PREP-DELIVERY — field_dressing fires at kill time (prep-arm vs
  ref-arm, same seeds), prep attempts/successes/whys, held-vs-notheld
  kcal means, hunter holder-since vs kill days. Funnel deltas are
  DESCRIPTIVE only (the r106/r107 re-roll confound bars them from the
  verdict). Pantry is judged on guardrails.pantryKcal (pre-people-check,
  the pure funnel number); pantryKcalEnd is reported separately.
- M2: care visibility (r105 continuity). M3/M4: survival + pantry
  guardrails (bars scaled 6/8 -> 3/4 for the 4-seed pilot).
Usage: R108_CONTROL_DIR=<dir> R108_REFARM_DIR=<dir> python3 scripts/analyze-journey-establishment-r108-20261106.py [EVIDDIR]
"""
import json, os, sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
EVID = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'evidence', '2026-11-06')
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

CONTROL_DIR = os.environ.get('R108_CONTROL_DIR') or ''
REFARM_DIR = os.environ.get('R108_REFARM_DIR') or ''

def load(tag, seed, d=None):
    p = os.path.join(d or EVID, f'journey-establishment-{tag}-seed{seed}.json')
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

funnel_rows = []
prep_panel = {'attempts': 0, 'lessons_ok': 0, 'already_holds': 0, 'no_teacher': 0,
              'whys': Counter(), 'rows': []}
hunt = {'prep_calls': 0, 'prep_kills': 0, 'prep_kills_held': 0, 'prep_kills_notheld': 0,
        'prep_kcal_held': [], 'prep_kcal_notheld': [],
        'ref_calls': 0, 'ref_kills': 0, 'ref_kills_held': 0, 'ref_kcal': 0,
        'ctl_calls': 0, 'ctl_kills': 0, 'ctl_kcal': 0,
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
ref_fires_by_seed = {}

for seed in SEEDS:
    try:
        j = load('r108', seed)
    except Exception as e:
        print(f'seed {seed}: PREP-ARM MISSING/UNREADABLE {e}'); continue
    ctl = ref = None
    if CONTROL_DIR:
        try: ctl = load('r107', seed, CONTROL_DIR)
        except Exception as e: print(f'seed {seed}: CONTROL MISSING {e}')
    if REFARM_DIR:
        try: ref = load('r107', seed, REFARM_DIR)
        except Exception as e: print(f'seed {seed}: REF-ARM MISSING {e}')
    tele = j.get('teleAll') or []
    census = {str(c['id']): c for c in (j.get('census') or [])}
    hold_end = j.get('holdingsEnd') or []
    codex = j.get('playerCodexSkills') or {}
    player_vid = None
    for cid, c in census.items():
        if c.get('skills') is not None and set(c['skills']) == set(codex.keys()) and len(codex) > 0:
            player_vid = cid; break
    hold_end_v = [h for h in hold_end if str(h['id']) != str(player_vid)] if player_vid else hold_end
    # r108 metric-review fix (c): holder-since join — first day each
    # villager held field_dressing, from skill_lesson learner rows and
    # villager_skill rows (NOT from end-state holdings alone).
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
    # --- three-leg funnel (DESCRIPTIVE; pantry on guardrails.pantryKcal) ---
    def pantry_of(x):
        g = (x or {}).get('guardrails') or {}
        return g.get('pantryKcal') if g.get('pantryKcal') is not None else (x or {}).get('pantryKcalEnd')
    funnel = {
        'seed': seed,
        'endDay_prep': j.get('endDay'), 'endDay_ref': ref.get('endDay') if ref else None, 'endDay_ctl': ctl.get('endDay') if ctl else None,
        'alive_prep': j.get('aliveEnd'), 'alive_ref': ref.get('aliveEnd') if ref else None, 'alive_ctl': ctl.get('aliveEnd') if ctl else None,
        'pantry_prep': pantry_of(j), 'pantry_ref': pantry_of(ref), 'pantry_ctl': pantry_of(ctl),
        'pantryEnd_prep': j.get('pantryKcalEnd'), 'pantryEnd_ref': ref.get('pantryKcalEnd') if ref else None, 'pantryEnd_ctl': ctl.get('pantryKcalEnd') if ctl else None,
        'over_prep': j.get('gameOver'), 'over_ref': ref.get('gameOver') if ref else None, 'over_ctl': ctl.get('gameOver') if ctl else None,
    }
    funnel_rows.append(funnel)
    # --- holdings (villagers only) for the six ids ---
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
    # --- duty-use logs (prep-arm) ---
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
    # --- ref-arm + control hunt counts ---
    for leg, key in ((ref, 'ref'), (ctl, 'ctl')):
        if not leg:
            continue
        for h in (leg.get('huntLog') or []):
            hunt[f'{key}_calls'] += 1
            if (h.get('kcal') or 0) > 0:
                hunt[f'{key}_kills'] += 1
                hunt[f'{key}_kcal'] += h['kcal']
                if h.get('heldFieldDressing'):
                    hunt[f'{key}_kills_held'] += 1
    prep_fires_by_seed[seed] = sum(1 for h in (j.get('huntLog') or []) if (h.get('kcal') or 0) > 0 and h.get('heldFieldDressing'))
    ref_fires_by_seed[seed] = sum(1 for h in ((ref or {}).get('huntLog') or []) if (h.get('kcal') or 0) > 0 and h.get('heldFieldDressing'))
    # --- prep log ---
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
            prep_panel['whys']['no-teacher'] += 1
    # --- care / healer / treat / cook (prep-arm, r105 continuity) ---
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
    # M3 / M4 (prep-arm)
    if not j.get('gameOver') and (j.get('aliveAt40') or 0) >= 1:
        m3_seeds += 1
    starv = [d for d in (j.get('deaths') or []) if any(w in str(d.get('cause') or '').lower() for w in ('starvat', 'hunger', 'thirst', 'dehydrat'))]
    if not starv:
        m4_seeds += 1
    for d in (j.get('deaths') or []):
        if not d.get('player') and 'hunt' in str(d.get('cause') or '').lower():
            hunter_wound_deaths.append((seed, d.get('day'), d.get('who'), d.get('cause')))
    print(f'\n=== seed {seed} (prep endDay {j.get("endDay")}, over {j.get("gameOver")}, aliveEnd {j.get("aliveEnd")}, wave {j.get("waveReached")}, pantryGuardrails {pantry_of(j)}, pantryEnd {j.get("pantryKcalEnd")}) ===')
    if funnel:
        print(f'  3-leg: endDay prep {funnel["endDay_prep"]} / ref {funnel["endDay_ref"]} / ctl {funnel["endDay_ctl"]} | alive prep {funnel["alive_prep"]} / ref {funnel["alive_ref"]} / ctl {funnel["alive_ctl"]} | pantry(guardrails) prep {funnel["pantry_prep"]} / ref {funnel["pantry_ref"]} / ctl {funnel["pantry_ctl"]} | pantryEnd prep {funnel["pantryEnd_prep"]} / ref {funnel["pantryEnd_ref"]} / ctl {funnel["pantryEnd_ctl"]} | over prep {funnel["over_prep"]} / ref {funnel["over_ref"]} / ctl {funnel["over_ctl"]}')
    print(f'  huntStaff: assignments={(hs.get("assignments") or 0)} refusals={len(hs.get("refusalLog") or [])} wounds={len(hs.get("woundLog") or [])} huntLog={len(j.get("huntLog") or [])} fieldDressingKills={prep_fires_by_seed[seed]} (ref-arm {ref_fires_by_seed[seed]}) prepLog={len(hs.get("prepLog") or [])}')
    print(f'  holder-since field_dressing: {dict(sorted(holder_since.items(), key=lambda kv: kv[1]))}')
    print(f'  guardrails={j.get("guardrails")} c3={j.get("c3")}')
    print(f'  wraps: hunt={j.get("huntWrap")} care={j.get("careWrap")}({j.get("careCalls")} calls) healer={j.get("healerWrap")}({j.get("healerCalls")} calls) treat={j.get("treatWrap")}({j.get("treatCalls")} calls) cook={j.get("cookWrap")}')
    print(f'  skill_used rows: {sum(1 for t in tele if t.get("type") == "skill_used")} ability_used: {sum(1 for t in tele if t.get("type") == "ability_used")}')

print(f'\nPANEL: livingVillagersEnd={panel_living}')
print(f'  M0 INSTRUMENT-NEUTRALITY: checked separately on the pilot seed (gate-off driver vs control; prep-off driver vs ref-arm — see run note, NOT this analyzer)')
print(f'  M1 PREP-DELIVERY (prep-arm vs ref-arm, same seeds):')
for fr in funnel_rows:
    print(f'    seed {fr["seed"]}: endDay {fr["endDay_prep"]}/{fr["endDay_ref"]}/{fr["endDay_ctl"]} | alive {fr["alive_prep"]}/{fr["alive_ref"]}/{fr["alive_ctl"]} | pantry(guardrails) {fr["pantry_prep"]}/{fr["pantry_ref"]}/{fr["pantry_ctl"]} (prep-ctl d{(fr["pantry_prep"] or 0) - (fr["pantry_ctl"] or 0):+}) | over {fr["over_prep"]}/{fr["over_ref"]}/{fr["over_ctl"]}')
prep_fires = sum(prep_fires_by_seed.values())
ref_fires = sum(ref_fires_by_seed.values())
fires_seeds = [s for s, n in prep_fires_by_seed.items() if n >= 1]
prep_success_rate = (prep_panel['lessons_ok'] / prep_panel['attempts']) if prep_panel['attempts'] else None
print(f'  prep panel: lessons attempted={prep_panel["attempts"]} ok={prep_panel["lessons_ok"]} already-holds={prep_panel["already_holds"]} no-teacher={prep_panel["no_teacher"]} whys={dict(prep_panel["whys"])} success-rate={prep_success_rate}')
for r in prep_panel['rows']:
    print(f'    prep: seed {r[0]} d{r[1]} hunter={r[2]} teacher={r[3]} kind={r[4]} ok={r[5]} why={r[6]}')
print(f'  hunt: prep calls={hunt["prep_calls"]} kills={hunt["prep_kills"]} held={hunt["prep_kills_held"]} notheld={hunt["prep_kills_notheld"]} | ref calls={hunt["ref_calls"]} kills={hunt["ref_kills"]} held={hunt["ref_kills_held"]} kcal={hunt["ref_kcal"]} | ctl calls={hunt["ctl_calls"]} kills={hunt["ctl_kills"]} kcal={hunt["ctl_kcal"]}')
print(f'  field_dressing fires: prep={prep_fires} on seeds {fires_seeds} (ref-arm {ref_fires})')
if prep_success_rate is not None and len(fires_seeds) >= 2 and prep_success_rate >= 0.5:
    m1_verdict = 'PREP-WORKS'
elif prep_fires >= 1:
    m1_verdict = 'PREP-PARTIAL'
else:
    m1_verdict = 'PREP-NO-FIRE'
print(f'  M1 verdict: {m1_verdict} (fires={prep_fires} on {len(fires_seeds)}/4 seeds, ref {ref_fires}; prep success-rate={prep_success_rate})')
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
if hunt['prep_kcal_held'] and hunt['prep_kcal_notheld']:
    import statistics
    print(f'    mean kcal/kill prep held={statistics.mean(hunt["prep_kcal_held"]):.0f} notheld={statistics.mean(hunt["prep_kcal_notheld"]):.0f} (frac 0.78 vs 0.60 predicts ~1.3x)')
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
print(f'  M3 SURVIVAL-42 {m3_seeds}/4 (bar 3/4) | M4 PANTRY {m4_seeds}/4 (bar 3/4)')
if hunter_wound_deaths:
    print(f'  HUNTER-WOUND DEATHS (§14c): {hunter_wound_deaths}')
