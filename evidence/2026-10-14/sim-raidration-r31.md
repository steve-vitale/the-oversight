# RAID-AWARE RATION LEVER — policy arm (scale-onramp r31 ARM 3, 2026-10-14)

Axis: scale-onramp. Policy-side arm, default OFF (RAIDRATION=1), zero game-code changes.
Steered by r30's unloaddiv diagnostic (evidence/2026-10-14/sim-unloaddiv.md):
"recovered trust buys a faster death under siege" — faster trust recovery moves
the ceiling (table 0→3/16) more than the floor, because full rations drain the
pantry faster under nightly raids. This arm tests whether behavior, not trust
math, is the survivable response to predation: when the village is under siege,
tighten the pantry — pause feasts, refuse aid begs honestly, feed the watch
from the scholar's own pack, narrate every shift (no silent actions).

Canon read: docs/CANON.md (no silent actions — every suppression narrates;
knowledge gates surfaces — not touched by this arm). No canon doc covers
siege rationing specifically; the design below is ordinary village survival
logic (a village under siege tightens its pantry), documented here for
Steve to overrule. Defender-meal note: the engine's meal is trust-gated
(game.js villageMeal: half ration <30, full 30+, bonus 60+) with NO defender
knob — the policy-side honest equivalent is Game.giveFood(vid,'meal') from
the scholar's own pack to the night watch (patrol assignment). Hunger eases
and trust warms; hunger has no engine combat-stat effect, so the survival
mechanism is the feast pause + beg refusal (pantry savings), not fed-defender
DPS. Documented as designed.

## Pre-registered header (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any sims

- **HYPOTHESIS**: on predation-positive seeds, pausing discretionary pantry
  outflows (policy feasts, aid begs) while the treeline is held slows the
  pantry drain and buys survival days vs the leadfeast baseline.
- **MEASUREMENT**: identical seeds, post-fix code BOTH sides. Baseline:
  leadfeast (FEASTSCALE_R13 unset... — see note) + predation-lib telemetry.
  Armed: leadfeast + scripts/policies/raidration.js (RAIDRATION=1) +
  predation-lib telemetry. Gate-off side delegates byte-identically (proof
  RED phase pins it).
  - NOTE: leadfeast is the named export of feastscale.js; the baseline runs
    FEASTSCALE_R13=1 (the r13 feast layer ON) on both sides — the ration
    layer wraps the full leadfeast policy including its feast machinery.
- **SEEDS/POLICIES**: 11/22/33/44/55/66/77/88 × leadfeast, 180d death-aware,
  identical seeds armed vs baseline.
- **DET-GATE FIRST**: 8/8 identical per side required (two in-process
  invocations per combo, day-hash compare). A diverged seed is EXCLUDED from
  the before/after comparison, documented here (per det-gate.js's own rule:
  "do NOT trust a before/after comparison on this seed"). >2 diverged seeds
  → the comparison is untrustworthy → KILL as unmeasurable.
  (Known risk, det-gate.js header: timestamp-based villager IDs leak into
  contest RNG on fight-heavy seeds — leadfeast s44 is the documented case.)
- **PRE-SCREEN / THRESHOLD** (the r30 PREDATION-POSITIVE DROUGHT caveat):
  the baseline suite runs FIRST with predation-lib. The siege threshold is
  picked from the baseline trailing-14d gorge-night distribution, documented
  below before the armed side is built:
  - Threshold rule: T=4 default. If ≥2 baseline seeds peak at trailing-14d
    gorge-nights ≥4 while the rest peak <2, T=4 stands. If the baseline
    distribution is flat at 0–1 (the phenomenon doesn't occur on this road),
    KILL the arm as UNMEASURABLE (not disproven), per the r25 wave5cond
    precedent — evidence only, no invented predation.
- **PREDATION-POSITIVE seed** (measurement classification, pre-registered):
  total gorge nights ≥3 AND total gorged kcal ≥6000 (the preddisc #163
  criterion, sim-findings.md). Classified on the BASELINE side.
- **PRIMARY**: mean survival days on predation-positive seeds, armed −
  baseline ≥ +20d.
- **GO**: primary met AND guardrails clean — national ≥ baseline−2, median
  survival ≥ baseline−10d, exiled = 0.
- **KILL**: no predation-positive seeds → UNMEASURABLE (not disproven);
  primary missed → NO-GO per §14 (never re-scored); guardrail miss → NO-GO.
- **Instruments**: scripts/sweep-raidration-20261014.js (SIDE=baseline|armed,
  --invocations=2 det-gate mode); scripts/test-raidration-20261014.js
  (RED: gate-off byte-identical trajectories; GREEN: fires only at/above
  threshold, honest beats). SMOKE=1 instrument-honesty gate on the proof.
- **Wall numbers reported every run**: national / table / wins, wave 4-5
  unlocks, median survival (both sides).
- **Per-seed JSON**: emitted under evidence/2026-10-14/raidration-per-seed/
  for scripts/telemetry-check.js vs the scale-wall baseline.

## Ration verbs (pre-registered design — Steve can overrule)

Siege ENGAGED when trailing-14-day distinct gorge-days ≥ T (T from pre-screen,
default 4); DISENGAGED when the trailing-14d count drops below ceil(T/2).
All verbs policy-side; the engine's ration math (trust-gated half rations) is
untouched. Tribute/tend are DELIBERATELY untouched (the scale engine — a
ration call that breaks the courtship road isn't a ration call, it's a
surrender). Donations (donateHaul) are untouched (inflow — the scholar keeps
feeding the pantry; the scholar tightens WITH the village, not ON it).

1. FEAST PAUSE: while engaged, Game.hostFeast is refuse-through during the
   base upkeep (finally-restored wrap) → both eveningFeast (competent) and
   scaleFeast (feastscale) are suppressed. Each refused feast narrates
   honestly (it genuinely would have fired — the gates passed).
2. BEG REFUSAL: while engaged, Game.answerAidBeg is force-refuse during the
   base daily (finally-restored wrap), narrated per refusal with the begging
   village's name. Aid OFFERS still accepted (inflow).
3. DEFENDERS EAT FIRST: while engaged, once/day the scholar gives a pack
   'meal' (Game.giveFood, real pack kcal) to each villager on patrol
   assignment (the night watch), capped at 3/day, only while the scholar is
   topped up (kcal > 1.2×cap — the scholar doesn't starve themselves to feed
   the watch). Narrated per meal.
4. NO SILENT ACTIONS: engage/disengage beats + one beat per suppressed
   outflow. Beats must read as a village under siege making hard calls
   (sense-tested by reading).

## Det-gate

Baseline (SIDE=baseline, leadfeast FEASTSCALE_R13=1, --invocations=2): **8/8
IDENTICAL** — 11: 180d, 22: 167d, 33: 34d, 44: 140d, 55: 180d, 66: 53d,
77: 88d, 88: 39d. Even leadfeast s44 gated clean (the det-gate.js KNOWN ISSUE
— timestamp-ID contest nondeterminism on fight-heavy seeds — did not bite
this run). predation-lib instrument errors: 0 on all 16 invocations.
Armed-side gate: see Before/after section.

## Pre-screen: baseline raid distribution (SIDE=baseline, --invocations=2)

leadfeast × 8 seeds, 180d death-aware, predation-lib gorge telemetry:

| seed | days | end | gorgeN | gorgeK | peak14d |
|---|---|---|---|---|---|
| 11 | 180 | survived | 15 | 26,746 | 6 |
| 22 | 167 | village-lost | 1 | 1,468 | 1 |
| 33 | 34 | village-lost | 5 | 14,240 | 5 |
| 44 | 140 | village-lost | 2 | 3,095 | 2 |
| 55 | 180 | survived | 0 | 0 | 0 |
| 66 | 53 | village-lost | 0 | 0 | 0 |
| 77 | 89 | village-lost | 4 | 12,198 | 4 |
| 88 | 39 | village-lost | 3 | 9,099 | 3 |

Predation-positive (pre-registered: ≥3 gorge nights AND ≥6000 kcal):
**s11, s33, s77, s88 — 4/8 seeds.** The phenomenon OCCURS on this road —
the arm is MEASURABLE (the r30 PREDATION-POSITIVE DROUGHT does not apply to
the 11–88 seed set on leadfeast; the preddisc arm's drought was its own
44/22/55/88 subset, and even there this run shows s88 positive on leadfeast).
Notable: s11 absorbed 15 gorge nights / 26.7k kcal and still survived 180d;
s33 died at 34d with only 5 nights (14.2k kcal) — the drain's context matters,
not just its size.

## Threshold choice

Peak14d distribution: 6, 1, 5, 2, 0, 0, 4, 3. The pre-registered default was
T=4 ("≥2 seeds peak ≥4 while the rest peak <2 → T=4 stands"). The actual
distribution shows a clean natural split one step lower: the 4
predation-positive seeds peak at 3, 4, 5, 6; the 4 quiet seeds peak at
0, 0, 1, 2. **T=3** — the value that separates the positive class from the
quiet class exactly. T=4 would leave s88 (predation-positive, village lost at
d39, 9,099 kcal gorged) un-rationed — the very seed-shape the lever exists
for. Disengage at ceil(3/2)=2. Documented before the armed side was built;
no armed data informed the choice (pre-registration preserved).
Design note: "halve discretionary outflows" is implemented as PAUSE while the
binary siege state is engaged (feasts refused, begs refused) — half-measures
on begs are the quiet-day 3x/1.5x threshold's job (competent.js
answerAidBeats). Steve can overrule.

## Proof test (scripts/test-raidration-20261014.js)

30/30 checks green (SMOKE=1 instrument-honesty gate; RED at 30d; RED additionally
verified at 180d — byte-identical trajectories, seed 44, survived both).
- RED: gate-off raidration policy vs raw leadfeast, seed 44 — trajectories
  byte-identical (30d, survived both). The wrapper delegates purely when
  RAIDRATION is unset.
- G1: 2 gorge-days → not engaged, no beat; 3rd gorge-day (T=3) → engaged +
  honest engage beat. G2: window expires → disengaged + lift beat.
- G3: engaged feast refusal — {ok:false, 'under siege' reason}, narrated,
  pantry untouched by the refusal, verb restored after.
- G4: engaged beg force-refused, narrated with the beggar named (Testville).
- G5: engaged watch fed via real Game.giveFood (pack 4000→1600 kcal — the
  pantry, not the scholar's bank, is spared; trust/hunger/bond effects real);
  skipped when the scholar is thin (no self-starvation).
- SENSE-TEST (read, not counted): the beats read as a village under siege
  making hard calls, not dispenser text. "Ellie calls it plainly at the fire:
  the pantry tightens. No feasts while we're besieged. Beggars get an honest
  no. The watch eats first — from my own pack." Names the count (3 gorge
  nights), names the pantry (44,850 kcal in the stores), names the cost
  ("They'll remember this" on the refused beg). The disengage beat re-opens
  the fire honestly. Verdict: reads like people deciding.

## Before/after on identical seeds

Armed (SIDE=armed, RAIDRATION=1, RAIDRATION_T=3, --invocations=2): **8/8
IDENTICAL** — the det-gate is met on both sides; cross-side deltas are
deterministic consequences of the layer, not noise. predation-lib instrument
errors: 0 on all 32 invocations. Post-fix code both sides.

| seed | days B/A | delta | gorgeN B/A | gorgeK B/A | siege days (armed) | verbs fired (armed) |
|---|---|---|---|---|---|---|
| 11 | 180/155 | −25 | 15/3 | 26746/4980 | 12 | 12 begs refused, watch skipped×12 (scholar thin) |
| 22 | 167/167 | 0 | 1/1 | 1468/1468 | 0 | — |
| 33 | 34/34 | 0 | 5/5 | 14240/14240 | 2 | 1 beg refused, watch skipped×2 |
| 44 | 140/140 | 0 | 2/2 | 3095/3095 | 0 | — |
| 55 | 180/180 | 0 | 0/0 | 0/0 | 0 | — |
| 66 | 53/53 | 0 | 0/0 | 0/0 | 0 | — |
| 77 | 89/89 | 0 | 4/4 | 12198/10714 | 1 | 1 feast refused, watch skipped×1 |
| 88 | 39/39 | 0 | 3/3 | 9099/9099 | 12 | watch skipped×12 (no begs came) |

PRIMARY (pre-registered: mean survival on baseline-classified predation-positive
seeds {11, 33, 77, 88}, armed − baseline ≥ +20d): baseline 85.5d, armed 79.25d
→ **−6.25d. PRIMARY MISSED → NO-GO per §14** (never re-scored).
Guardrails: national 5/8 both sides (≥ baseline−2 ✓); median 114.5d both sides
(≥ baseline−10d ✓); exiled 0/0 ✓. Guardrails clean, primary missed — NO-GO.

What the numbers say: the layer fired on all 4 positive seeds but moved only
one trajectory (s11, −25d); 7/8 seeds have byte-identical survival days. The
feast-pause verb fired exactly ONCE in 8×180d (s77) — policy feasts almost
never coincide with sieges. Beg refusals fired (12 on s11, 1 on s33) but the
pantry savings bought nothing. The watch was NEVER fed live
(rrWatchSkippedThin on every engaged day — the scholar is never topped up past
1.2×cap during a real siege; the defender-meal verb is unreachable in the
conditions it's designed for).

## Wall numbers

| metric | baseline | armed |
|---|---|---|
| national | 5/8 | 5/8 |
| table | 2/8 | 2/8 |
| wins | 0/8 | 0/8 |
| wave 4-5 unlocks | 4/8 | 4/8 |
| max wave | 5 | 5 |
| max Arc | IV | IV |
| median survival | 114.5d | 114.5d |
| vests | 0 | 0 |
| exiled | 0/8 | 0/8 |

The scale wall stands: 0 wins either side. The ration layer moves neither the
ceiling nor the floor.

## Village assessment

**s11 (the mover, 180→155d)** — the ration call came too late to matter. The
village's real story: fever took Chloe (d10), Davut (d28), Pamela (d42) —
population 12→8 by d42; Ashford split over blood (d25, The Bloodied walks);
The Bloodied raided the pantry (d55, d61–62, d93). The pantry hit empty at
d110; the siege engaged at d112 — two days INTO the hunger crisis — and the
layer then refused Stonebridge's beg 12 days straight (the same beg re-raised
daily; the beat repeats verbatim 12× — honest, but it reads like a dispenser,
not a decision-maker). Disengage at d124 ("1 gorge nights" — grammar nit,
documented not fixed). The village bled out to 1 by d149, lost at d155.
The armed trajectory faced a different raid pattern (3 gorge nights vs 15)
and died 25 days earlier; the ration verbs fired inside an already-empty
pantry and saved nothing. Baseline s11 absorbed 15 gorge nights / 26.7k kcal
and survived 180d — the gorge drain wasn't the killer on either side.

**s33/s77/s88 (positive, 0 delta)** — s33 (34d): 5 gorge nights / 14.2k kcal,
siege engaged for 2 days, 1 beg refused; the village was already dead at d34
(the r30 unloaddiv seed — dies fast under the combined tribute/feast/raid
drain; the ration call arrives mid-collapse). s77 (89d): 1 siege day, 1 feast
refused — the feast pause's only live firing in the whole suite. s88 (39d):
12 siege days, no begs came, watch unfed (scholar thin), village lost at d39
unchanged.

**The pattern**: the lever addresses the wrong door. Sieges that kill do so
when the pantry is already empty (the ration call is a eulogy), and the
discretionary outflows it pauses barely exist during sieges (1 feast in
1440 seed-days). The villagers read as people throughout — grief, splits,
gossip, mourning holds on tending — but the ration beats themselves are the
most robotic text in the run (12 identical refusals).

## Blanks filled / documented

- **sim-findings #163 follow-up — KILLED per §14, NO-GO.** The raid-aware
  ration lever does not buy survival days on predation-positive seeds
  (−6.25d vs the +20d bar). Killed; policy file deleted per kill protocol
  (scripts + evidence + per-seed JSONs land).
- **New open blank: RATION-CALL TIMING** — the siege detector keys on gorge
  nights, but the killer sieges are the ones where the pantry is already
  empty when the call comes. A ration call needs a pantry-trajectory trigger
  (fresh-days falling), not a gorge counter. Filed to sim-findings.md.
- **New open blank: WATCH-MEAL UNREACHABLE** — the defender-meal verb never
  fired live: the scholar is never topped up >1.2×cap during a real siege.
  Feeding the watch from the scholar's pack assumes a fed scholar; sieges
  don't produce those. The verb's precondition contradicts its trigger.
  Filed to sim-findings.md.
- **Beat-quality finding (documented, not fixed — arm killed):** the beg-
  refusal beat repeats verbatim when the engine re-raises the same beg daily
  (12 identical beats on s11); a real village would say it once. And the
  disengage beat has a grammar nit ("1 gorge nights"). If the lever is ever
  rebuilt, dedupe + pluralize.
- **Feast/siege coincidence is ~zero:** 1 refused feast in 8×180d. Pausing
  feasts under siege sounds right and measures as nothing — the policy's
  feast gates (1.5× buffer, contribution bar) already avoid feasting into
  sieges.

## Metric review (§14, mandatory)

- PRIMARY (mean survival on baseline-classified predation-positive seeds,
  armed − baseline ≥ +20d): MISSED (−6.25d). NO-GO per §14 — not re-scored,
  not re-scored against a friendlier metric. The 7/8 identical-day
  trajectories are not "no signal" — they ARE the signal: the lever changes
  almost nothing.
- Det-gate 8/8 both sides: MET — cross-side deltas trustworthy.
- Threshold choice (T=3 from the baseline peak14d split): applied as
  pre-registered; the one deviation from the T=4 default is documented in
  "Threshold choice" above and was made before any armed data existed.
  T=4 would have left s88 un-rationed; with T=3 s88 engaged 12 days and
  still showed 0 delta — the threshold is not the binding miss.
- Predation-positive classification (≥3 nights AND ≥6000 kcal, baseline
  side): applied as pre-registered; 4/8 seeds. Note for the next arm: s11's
  armed side fell below the kcal bar (4980) — endogenous raid pressure again
  (r30 caveat). Classification stays baseline-side per the pre-registration.
- Guardrails (national ≥ baseline−2, median ≥ baseline−10d, exiled 0): all
  MET. The NO-GO is on the primary alone.
- Metric concern for the next arm: per-seed days are the right unit here,
  but the s11 −25d came with a changed raid pattern (15→3 gorge nights) —
  the next instrument arm (raid trigger) should model raid nights as a
  time-varying covariate, not a seed class (same note as r30's metric
  review).

## Convergence report

- Convergence: KILLED at the primary (NO-GO). Axis scale-onramp: still
  blocked (0/8 wins both sides; the ration layer moves neither ceiling nor
  floor).
- Wall numbers this run: national 5/8, table 2/8, wins 0/8, wave 4-5 on 4/8,
  median survival 114.5d — identical both sides.
