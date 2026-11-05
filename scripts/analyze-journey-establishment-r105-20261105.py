#!/usr/bin/env python3
"""r105 duty-use analyzer. Reads evidence/2026-11-05/journey-establishment-r105-seed{1501..1504}.json
and the r104 panel for M0.
- M0: r105 reproduces r104 endDay/aliveEnd/pantryKcalEnd exactly; lesson sets
  identical modulo wall-clock-id'd learners (teacher/skill/day, learner by name).
- M1: use classification for the six duty/craft/social ids (diplomat,
  herbal_medicine/herbal_remedy, field_dressing, preserve_food, wound_care,
  triage): USED / HELD-UNUSED / NEVER-HELD, plus the STRUCTURALLY-INERT flag
  from the prereg static census (diplomat, herbal_remedy, preserve_food,
  wound_care skill) vs villager-aware (field_dressing, triage).
- M2: care visibility — tends, healer rounds, treat ticks, with actors.
- M3/M4: survival + pantry guardrails (same as r104).
Usage: python3 scripts/analyze-journey-establishment-r105-20261105.py [EVIDDIR]
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

THRESHOLDS = [18, 48, 96, 192, 384]
TRACKS = ['combat', 'field', 'social', 'craft', 'strange']

def level_for(xp):
    return sum(1 for t in THRESHOLDS if (xp or 0) >= t)

def load(tag, seed):
    p = os.path.join(EVID, f'journey-establishment-{tag}-seed{seed}.json')
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

# --- r104 panel: M0 reference ---
r104 = {}
for seed in SEEDS:
    try:
        r104[seed] = load('r104', seed)
    except Exception as e:
        print(f'r104 seed {seed}: MISSING {e}')

m0_seeds = []
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
        j = load('r105', seed)
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
    # --- M0 vs r104 ---
    ref = r104.get(seed)
    m0 = None
    lesson_note = ''
    if ref:
        same = (j.get('endDay') == ref.get('endDay') and j.get('aliveEnd') == ref.get('aliveEnd')
                and j.get('pantryKcalEnd') == ref.get('pantryKcalEnd'))
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
        lk105 = lesson_keyset(j)
        lk104 = lesson_keyset(ref)
        diff = (lk105 - lk104) + (lk104 - lk105)
        lesson_note = f'lessons r105={sum(lk105.values())} r104={sum(lk104.values())} diff={dict(diff) if diff else "none"}'
        m0 = same and not diff
        m0_seeds.append(m0)
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
    # M3 / M4
    if not j.get('gameOver') and (j.get('aliveAt40') or 0) >= 1:
        m3_seeds += 1
    starv = [d for d in (j.get('deaths') or []) if any(w in str(d.get('cause') or '').lower() for w in ('starvat', 'hunger', 'thirst'))]
    if not starv:
        m4_seeds += 1
    print(f'\n=== seed {seed} (endDay {j.get("endDay")}, over {j.get("gameOver")}, aliveEnd {j.get("aliveEnd")}, wave {j.get("waveReached")}, pantryEnd {j.get("pantryKcalEnd")}) ===')
    print(f'  M0 vs r104: {"PASS" if m0 else "FAIL"} {lesson_note}')
    print(f'  wraps: hunt={j.get("huntWrap")} care={j.get("careWrap")}({j.get("careCalls")} calls) healer={j.get("healerWrap")}({j.get("healerCalls")} calls) treat={j.get("treatWrap")}({j.get("treatCalls")} calls) cook={j.get("cookWrap")}')
    print(f'  huntLog={len(j.get("huntLog") or [])} careLog={len(j.get("careLog") or [])} healerLog={len(j.get("healerLog") or [])} treatLog={len(j.get("treatLog") or [])} cookLog={len(j.get("cookLog") or [])}')
    print(f'  skill_used rows: {sum(1 for t in tele if t.get("type") == "skill_used")} ability_used: {sum(1 for t in tele if t.get("type") == "ability_used")}')

print(f'\nPANEL: livingVillagersEnd={panel_living}')
print(f'  M0 INSTRUMENT-NEUTRALITY: {sum(1 for x in m0_seeds if x)}/{len(m0_seeds)} seeds exact vs r104')
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
print(f'  M1 verdict: {verdict} (aware-held-unused={n_dead} inert-held-unused={n_decor})')
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
print(f'  M3 SURVIVAL-42 {m3_seeds}/4 | M4 PANTRY {m4_seeds}/4')
