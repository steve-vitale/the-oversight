# SHAREPOL — pilot (fleshout-b ARM 2: attack sharing directly)
2026-10-14 (run 2026-10-14T06:30Z) | axis: food-economy | arm: sim-sharepol-b

## Context
The production-throttle lever is LANDED (afb736e6) but its confirm was NO-GO on
survival cost (median −14d, starvation +12). Sim-findings #115 names the mechanism:
the starvation cost is DISTRIBUTIONAL — when hungryStreak>0 AND the pantry holds
>4 fresh days, the bind is trust-gated SHARING, not total food. The sibling arm
(sim-hungerdepth-b) tests the depth-gated throttle exemption; this arm tests the
other named direction: attack sharing directly.

The sibling's hunger-exempt arm (evidence/2026-10-14/sim-hungerexempt-b.md) was
KILLED AT PILOT: exempting the redirect while hungryStreak>0 fed the buffer and
starved the sharing (starve/100vd 1.241→1.853, +49%). Its candidate mechanism:
less trust → less sharing → more under-eating → more exemptions (feedback loop).
This arm runs the loop in the virtuous direction instead: the scholar proactively
feeds hungry villagers person-to-person via the honest engine verb
Game.giveFood(vid,'meal'), earning substance-scaled trust — more trust → more
surplus sharing into the pantry (trustFactor 0.2/0.5/0.8/1.0) → fuller shelves →
fewer under-eating days → fewer starvation deaths.

## The lever
scripts/policies/sharepol.js — a policy-side layer (opt-in SHAREPOL=1, default OFF),
layered on leadcourt/belongseek via withShare(base). The share pass runs BEFORE the
base daily (proactive sharing gets first pick of the pack):
- Gate: villager hunger (Game.npcNeeds(vid).hunger) > 70 — the engine's own 'hungry'
  threshold (drive state game.js:15659, food-request trigger game.js:16027).
- Asked-first (pending food requests answered first), then hungriest, vid tiebreak
  (deterministic — no Math.random in the layer).
- Verb: Game.giveFood(vid,'meal') — up to 3 pack units, hunger −60, substance-scaled
  progressive trust + bonds, honest narration, 1 tick. No invented mechanics.
- Caps: 2 gifts/day; scholar kcal floor 800 (never starves the scholar); skips dead/
  non-roster; stands down when nobody is hungry.
- The base policies already donate surplus to the PANTRY (competent donateHaul);
  nothing feeds a hungry villager person-to-person. That is the blank this fills.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any sweep spend
- Question: does proactive person-to-person sharing shrink the throttle's starvation
  cost (fewer starvation deaths per villager-day) without hurting survival/scale?
- CONTROL: landed throttle on current tip + BARE leadcourt/belongseek (SHAREPOL unset).
- ARMED: same tree + withShare layer (SHAREPOL=1). Same tree, identical seeds, env-var only.
- PRIMARY: starvation deaths per 100 villager-days, armed <= control (ONE-SIDED
  improvement). Noise floor: the DETERM gate (below) failed on 1/2 pairs
  (leadcourt-s11 diverged d180/starve0 vs d121/starve1 in-process); the A/A
  invocation spread on the primary is 1.241 (sibling) vs 1.292 (this run's
  control) = 0.051. Per the pre-registered determinism caveat, the effect must
  exceed the spread to be resolvable: GO requires armed <= control − 0.051.
- GUARDRAILS:
  - median survival: armed_median >= control_median − 3d (A/A calibrated, one-sided)
  - national: armed >= control − 2
  - exiled: armed − control <= 0
- Horizon: 180d death-aware (dead villages stop, 10d tail); 180d is the pacing-law max.
- Seeds: 11/22/33/44/55/66/77/88 x leadcourt/belongseek, IDENTICAL seeds both sides
  (16 runs/side). This 16-run pilot IS the gate (no confirm spend this run).
- Instrument-honesty: SMOKE=1 gate before any sweep spend; named-export policy
  unwrap (no Object.assign({}, require(...)) — #69); per-side shape assertion
  (SIDE=control requires SHAREPOL unset, SIDE=armed requires SHAREPOL=1);
  sweep logs + per-seed JSON to evidence/2026-10-14/ (never /tmp).
- A miss is NO-GO — never re-scored against a friendlier metric mid-run.
  Metric doubts go under "metric review", revisions apply to the NEXT run.

## Proof (scripts/test-sharepol-20261014.js)
- RED (SHAREPOL unset): withShare(base).daily byte-identical to base.daily —
  no gifts, hunger/trust/requests/pack/narration all identical. ALL GREEN.
- GREEN (SHAREPOL=1): sharePass on a synthetic hungry-villager fixture —
  2 gifts fired (cap); INTAKE measured: hunger 84→24 and 92→32 (exactly −60,
  the meal relief); trust +15.0 on both recipients; food request answered
  (deleted, gratitude beat); unasked gift narrated ("You press 3 portions of
  Smoked fish into their hands. No one sees."); pack 10→4 units (real cost);
  gifts remembered ('gift' + 'private_gift' memories — a person deciding, not
  a dispenser). Integration: layered.daily fires gifts in the real flow.
  Scholar kcal floor (no gifts below 800) and stand-down (no hunger>70) GREEN.
  ALL GREEN (22/22).

## Instrument-honesty gate
- `SMOKE=1 node scripts/measure-sharepol-20261014.js`: ALL GREEN (8/8) — both
  policies unwrap to a real `daily`, withShare keeps daily a function, harness
  invokes it (meanCalls/day 4.5), >=1 policy-origin deliberate act fires
  (policyActs=2132 both policies). The suite cannot run policy-less.
- Per-side shape assertion: control side ran with SHAREPOL unset (refused
  otherwise), armed side with SHAREPOL=1 (refused otherwise).

## Determinism gate (DETERM=1, #113)
- belongseek-s44: bit-identical in-process (d180/starve0 both runs). PASS.
- leadcourt-s11: DIVERGED in-process (d180/starve0 vs d121/starve1, Δdays=−59).
  FAIL — the #113 per-run nondeterminism class (fight-heavy trajectories carry
  an unseeded entropy source; bisect pins onset mid-run).
- A/A spread on the primary across invocations: sibling control 1.241
  (17/1370vd) vs this run's control 1.292 (17/1316vd) — identical starvation
  counts, spread 0.051 on the rate. Median survival spread is larger
  (121d vs 98d, Δ=23d) — the median guardrail's −3d band is TIGHTER than the
  measured A/A noise; see metric review.
- Consequence (pre-registered): the identical-seed comparison is not fully
  controlled; the primary effect must exceed 0.051 to be resolvable.

## Results

| metric | control (landed throttle, bare policies) | armed (SHAREPOL=1) | delta | pre-reg |
|---|---|---|---|---|
| starve deaths / 100 villager-days (PRIMARY) | 1.292 (17/1316vd) | 1.278 (17/1330vd) | −0.014 | GO ≤1.241 ✗ |
| starvation deaths | 17 | 17 | 0 (identical) | — |
| villager-days | 1316 | 1330 | +14 | — |
| leadcourt sp100 | 1.294 (8/618vd) | 1.278 (8/626vd) | −0.016 | — |
| belongseek sp100 | 1.289 (9/698vd) | 1.278 (9/704vd) | −0.011 | — |
| median survival (guardrail) | 98d | 124d | +26d | ≥95d ✓ |
| max survival | 180d | 180d | 0 | — |
| national (guardrail) | 9/16 | 9/16 | 0 | ≥7 ✓ |
| table | 0/16 | 1/16 | +1 | report only |
| wins | 0/16 | 0/16 | 0 | — |
| exiled (guardrail) | 0 | 0 | 0 | Δ≤0 ✓ |
| wave-4 reach | 4/16 | 5/16 | +1 | — |
| wave-5 reach | 0/16 | 0/16 | 0 | — |
| hungryDays | 28 | 38 | +10 | report only |
| fresh-rot kcal | 2146.6k | 2626.9k | +22% | report only |
| share gifts (mechanism) | 0 | 298 (max 2/day, cap respected) | fires | — |

Per-seed (days / starve / sp100 | gifts):
- control: lead-11 121/1/1.05, lead-22 158/2/1.91, lead-33 159/0/0, lead-44 96/1/1.27, lead-55 115/0/0, lead-66 95/1/1.92, lead-77 79/0/0, lead-88 52/2/4.76, belo-11 146/1/1.05, belo-22 180/0/0, belo-33 33/5/17.24, belo-44 180/0/0, belo-55 180/0/0, belo-66 137/1/1.02, belo-77 47/2/5.26, belo-88 29/1/5.00
- armed: lead-11 46/0/0 (g9), lead-22 79/1/2.04 (g10), lead-33 99/3/4.41 (g29), lead-44 125/0/0 (g11), lead-55 129/1/1.03 (g14), lead-66 180/0/0 (g15), lead-77 33/1/3.45 (g5), lead-88 124/2/2.15 (g49), belo-11 42/1/3.03 (g16), belo-22 140/0/0 (g17), belo-33 52/1/2.22 (g18), belo-44 180/0/0 (g20), belo-55 180/0/0 (g9), belo-66 33/2/8.00 (g13), belo-77 180/0/0 (g42), belo-88 34/5/16.67 (g21)

Per-seed JSON: evidence/2026-10-14/sharepol-control-perseed/*.json,
sharepol-armed-perseed/*.json. Aggregates: sharepol-control.json,
sharepol-armed.json. Sweep logs: sharepol-control.log, sharepol-armed.log.

## Verdict: NO-GO (killed-at-pilot — effect unresolvable under the noise floor)
The PRIMARY missed the pre-registered resolvability bar: armed 1.278 vs control
1.292 — a numerical improvement of 0.014, but the GO required armed ≤ 1.241
(control − the 0.051 A/A spread), and the armed side's own re-run spread was
0.151 (1.127 → 1.278 between invocations). Three facts compound the miss:
1. Starvation deaths are IDENTICAL (17 vs 17, both policies 8/9 each side) —
   the 0.014 rate delta is denominator-only (1330 vs 1316 villager-days from
   slightly longer survival), not fewer starvations. The 298 gifts did not
   prevent a single starvation death.
2. The effect (0.014) is an order of magnitude below the measured invocation
   spread (0.051–0.151). Claiming GO on it would be noise-chasing — exactly
   what the pre-registered determinism caveat was written to prevent.
3. Guardrails pass (median +26d, national 9=9, exiled 0), but per §14 the
   primary binds: a GO met on guardrails with the primary unresolvable is
   still NO-GO. (The median's +26d is itself inside the median's ±23d A/A
   noise — see metric review.)
Per the kill protocol the policy layer (scripts/policies/sharepol.js) is
DELETED; instruments (proof/sweep/sense scripts) and this evidence are retained.
No confirm spend.

## Wall numbers (scale wall — report every run)
Control: national 9/16, table 0, wins 0, exiled 0, wave4 4/16, wave5 0/16,
median/max 98/180d, hungryDays 28.
Armed: national 9/16, table 1/16, wins 0, exiled 0, wave4 5/16, wave5 0/16,
median/max 124/180d, hungryDays 38.
The mortality wall still rules: 13/16 control and 12/16 armed runs end
village-lost/village-dead. Nobody won on either side. The arm did not move the
wall — one table reach (leadcourt-s66, 180d survivor) is the lone bright spot,
inside noise.

## Village assessment (plain words)
These are villages where the scholar now walks around handing food to hungry
people — 298 gifts over 16 runs, every one through the honest giveFood verb,
every one narrated. And it changed nothing about who starves. The starvation
deaths are identical seed-for-seed in aggregate: the villages that starve
(belo-88: 5 deaths in 34 days; belo-33: 5 in 33; lead-33: 3 in 99) are in
acute village-scale production collapse, and two meals a day from the scholar's
pack cannot fix a commons that isn't producing. The #115 feedback loop
(less trust → less sharing → more under-eating) is real, but the virtuous
direction needs more trust than 0.2 gifts/villager-day can buy — or the bind
isn't trust at all on the seeds that actually starve, but raw production.
The villages that did well (lead-66, belo-44/55/77: 180d survivors, 0
starvations both sides) didn't need the sharing; the villages that needed it
were past sharing's reach. The arm's theory — that proactive trust-earning
reverses the distributional bind — is not disproven, but it is unmeasurable
at this dose on this horizon. A future arm would need to test a much stronger
dose (or a different mechanism: the scholar's gifts treat hunger, not the
production shortfall).

## Sense-test (sharing beats — read, judge meaning and honesty)
Sampled leadcourt seed 33 armed, 60 days (26 sharing beats):
- The beats read as a person deciding: "Just you and Nikolai. You press 3
  portions of Muscadine Grapes into their hands. No one sees. That matters,
  somehow." (private); "You give Greta 3 portions of Muscadine Grapes, with
  the village watching. They look at you differently now." (public);
  "Tariq eats like it's the first time. 'Thank you,' they say, quiet.
  'I won't forget this.'" (answered ask). Gifts are remembered
  ('gift'/'private_gift' memories on recipients).
- BUT the pattern is dispenser-like: the same villagers get fed day after day
  (Catalina 4×, Alba 4×, Nina 4× in 60 days; one villager accumulated 8 gift
  memories). The hunger>70 gate re-fires on the same structurally-under-eating
  villagers because giveFood's −60 hunger relief is erased by the next day's
  +25–40 rise when the village isn't producing enough for them. The scholar
  becomes their daily meal ticket — a band-aid on a structural wound, not a
  fix for the distribution bind. Generosity reads as a person deciding in each
  beat, but the week reads as a dispenser route. This is the mechanism's
  boundary: person-to-person sharing treats hunger, not the production
  shortfall that causes it.

## Metric review (§14 — mandatory)
- The median guardrail (−3d one-sided) is TIGHTER than the measured A/A noise:
  control median moved 121d (sibling) → 98d (this run), Δ=23d, on identical
  seeds/policies/code. A ±3d band cannot survive contact with the #113
  nondeterminism class. Proposed for the next run: calibrate the median
  guardrail from A/A data (e.g. armed ≥ control − p90|A/A Δ|) or drop the
  median as a guardrail on fight-heavy seed sets and keep it as report-only.
- The primary (starve/100vd) proved relatively stable across invocations
  (identical death counts 17/17; spread 0.051–0.151 on the rate), but the
  armed re-run spread (0.151) exceeded the pre-registered 0.051 noise floor —
  the floor was estimated from too few invocations. Proposed: estimate the
  noise floor from ≥2 invocations of EACH side before fixing the GO bar, or
  pre-register the bar as a multiple of the measured spread (e.g. effect ≥ 2×
  spread).
- hungryDays as report-only was correct: it moved +10 (28→38) in the wrong
  direction while starvation deaths were flat — it measures under-eating
  incidence, not the starvation outcome, and the layer's own feeding changes
  hunger dynamics without changing deaths.
- No metric changes apply to this run (anti-drift): the verdict above is
  judged against the header as written.

## Convergence
killed-at-pilot.

## Telemetry
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-10-14/sharepol-armed-perseed/*.json' --metrics national,table,wins,exiled`: QUIET (16 files, 4 metrics, no large deviations). No baseline roll (policy-experiment convention).

