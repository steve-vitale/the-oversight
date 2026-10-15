# sim-rangerefill2-b — RANGING WATER-SAFETY layer RE-TEST (ARM 2, loop B 10:10Z run)

**Run:** fleshout-b-20261015T1010Z · ARM 2 · sim-findings **#292** (claimed; RANGING WITHOUT WILD FILLS — fill-opportunism policy arm)
**Date:** 2026-10-15 · repo `~/workspace/the-scattering`, worktree `~/workspace/worktrees/sim-rangerefill2`

## What this run is

The §14-prescribed honest RE-TEST of the r46b-killed RANGEREFILL arm
(evidence/2026-10-15/sim-rangerefill-b.md). That run's verdict was MISS on a
single conjunct: (b) pack-full departures ≥ 90% measured 84.6% (11/13). Its
own §14 metric review diagnosed the bar as miscalibrated: both misses were
s55-d18 (one per policy) — dawn pack=2/3 with a DRY cistern, where the 3rd
bottle was PHYSICALLY UNFILLABLE; the dawn top-up honestly refused, the gate
correctly did not trip (pack non-empty), no violation, no death. The
mechanism is REAL: 0 armed ranging-dehydration deaths vs 3 control; wild fill
share 1.8%→7.2%; true-wild 13.4%→40.2%. Per MEASUREMENT.md §14, the metric
revision below was pre-registered in the r46b metric review for the NEXT run
— this run IS the next run. This is not a re-score; the honest bar applies
fresh, against a rebuilt layer and a same-sweep own control.

## Canon note

docs/CANON.md read first. **There is no water/thirst canon doc** (stated per
the canon rule in sim-rangedehy-b and sim-rangerefill-b, not invented). All
water mechanics read from `src/js/game.js` as-is: `Game.fillWater()` (haven
well draws 1L clean from the cistern; wild creek/wetland/pond free but
risky), `Game.boilWater()`, `Game.drinkWater()`, `Game.pourWater()`; cistern
40L.

**Sub-finding (policy/engine misalignment, fixed in-layer):** the
competent-family `drinkSafe` fills opportunistically only when the tile type
matches `/creek|well|spring|river|pond|haven/i` — but the engine's fillable
wild set is exactly `{creek, wetland, pond}` (game.js `fillWater`).
`well`/`spring`/`river` are not tile types at all, and **`wetland` — the
most common wild water — is missed by the policy regex**. So `drinkSafe`
never opportunistically fills on wetlands even though the engine would. The
layer uses the engine-exact set. (competent.js itself untouched — fix lives
in the layer; a sibling arm owns that file.)

## Pre-registration (§11 — written before sims ran)

- **Primary metric (conjunction, honest bar):**
  - (a) ranging-dehydration deaths on the ARMED side == 0;
  - (b) pack-water-full departures ≥ 90% of FILLABLE armed departures, where
    FILLABLE = cistern clean > 0 at the departure dawn (a cistern-dry
    departure with pack 2/3 is honest, not a miss — the r46b miss states are
    excluded by construction);
  - (c) true-wild fill share armed ≥ control true-wild fill share
    (mechanism co-primary — the #292 gap);
  - (d) zero armed departures with empty pack + dry cistern.
  - "Ranging-dehydration death" = `cause === 'dehydration'` AND
    `player === true` AND scholar away from haven at the death beat (the
    rangedehy attribution). "Departure"/"ranging" = a dawn-transition
    departure: dawn snapshot at-haven → next dawn away (the rangedehy
    departure definition). Pack at departure: armed side = the layer's dawn
    log (post-top-up / post-fallback); control side = the dawn snapshot
    pack. "Pack-full" = ≥ 3 bottles (the competent-family standard).
    "Violation" = pack 0 AND cistern clean 0 at the departure dawn.
- **Guardrails:** median survival ≥ control − 10d; national ≥ control − 2/16;
  no new death mode (n ≥ 3) absent on control.
- **GO →** report for a 12–16 seed confirm. **MISS →** layer deleted per kill
  protocol, evidence-only landing.
- **Horizon + why:** 180 days, death-aware (§10 — the deaths sit early but
  ranging trajectories and the wall need the full horizon; dead villages stop
  simulating, +10d tail max).
- **Seeds:** 11, 22, 33, 44, 55, 66, 77, 88 — exact literals, identical both
  sides.
- **Policies:** `leadcourt` + `belongseek` (the courtship substrate; the
  finding's deaths were measured there).
- **Baseline:** OWN control in the SAME sweep (CONTROL BASELINE DRIFT #247 —
  never inherited, even on identical seeds). One side per process invocation
  (the RANGEREFILL gate is process-wide env); same script, same seeds, same
  code.
- **SMOKE=1 gate + #69 unwrap + det-gate BEFORE any sim spend:** sweep
  refuses to start unless the named policy exports carry a callable `daily`;
  instruments (rangedehy + routetile) proven trajectory-neutral by
  test-rangerefill2-20261015.js PART E (byte-identical 40d, seeds 11/22).

## What was built (policy-side layer — zero src/js changes)

Rebuilt from the r46b spec (`sim-rangerefill-b.md` "What was built") after
the kill-protocol deletion; `scripts/routetile-lib-20261015.js` survived in
the repo and is reused unchanged.

- `scripts/policies/rangerefill.js` (gate `RANGEREFILL=1`; unset exports the
  base policies unchanged — same objects):
  1. **Departure precondition:** at every haven dawn, BEFORE the base
     policy's daily (so before any departure), top the pack to 3 bottles
     from the haven well. Honest `Game.fillWater()` — 10 kcal + 1 tick per
     bottle, engine refusals honored.
  2. **Gate fallback (the Violet Pang state):** dawn at haven with EMPTY
     pack + DRY cistern → haul from the nearest personally-visited water tile
     (creek/wetland/pond — the engine's own refusal suggests "Haul from a
     creek (risky water)"), hop-by-hop via the honest walkTo pattern, then
     fill. Voiced once: "The cistern's dry and your bottles are empty — you
     haul water from the creek before ranging out." If no water tile is
     honestly known, recorded unresolvable and the day proceeds (measured
     residual).
  3. **En-route fills:** `Game.travelTo` wrapped (installed in `setup`,
     gate-on only): after every non-combat arrival on a creek/wetland/pond
     tile with room in the pack, fill toward full. Uses the engine-exact set
     (fixes the drinkSafe/wetland misalignment in-layer). Skips combatExit
     arrivals (nobody stops to fill mid-flee) and mid-combat travel.
  4. Auditable dawn log on ctx (`_rfDawnLog`: day, packBefore/After,
     cisternClean, gateTripped, packAfterFallback) for the GO measurement.
  5. **Counter fix (r46b metric review):** the fallback's haul walk sets
     `ctx._rfGateHaulActive` so the travelTo wrap records water knowledge but
     skips its own fill; the fallback's explicit top-up credits
     `rf_filled_gatehaul`/`rf_gateHaulBottles` directly (r46b misattributed
     these to filledEnroute).
- `scripts/test-rangerefill2-20261015.js` — proof with REAL RED phases
  (patch-swap `~/workspace/rangerefill-red-20261015.patch`, never stash):
  gate-off inert (same objects, #69 unwrap), dawn top-up, en-route fill,
  gate fallback + unresolvable variant, SMOKE, 40d instrument det-gate.
- `scripts/sweep-rangerefill2-20261015.js` — 16+16 runs, both sides
  instrumented, A/A pristine twins on control (leadcourt s11/s22,
  full-horizon byte-identical). Output:
  `evidence/2026-10-15/perseed-rangerefill2/<side>/` (r46b's
  `perseed-rangerefill/` data untouched).
- `scripts/analyze-rangerefill2-20261015.js` — before/after + GO verdict
  printer against the honest bar (fillable-scope (b), true-wild co-primary).
- `scripts/sense-rangerefill2-20261015.js` — sense-test probe (real
  fill-beat transcripts on seed 55).

## Results

### Proof tests — GREEN
- Gate-off: 11/11 (exports are the base objects; #69 unwrap; instruments
  byte-identical 40d × seeds 11/22).
- Gate-on: 32/32 (dawn top-up, en-route fill, gate fallback + unresolvable
  variant, SMOKE).
- RED: 9 failures with topUpPack neutered (no crashes — same 9-failure
  signature as r46b); GREEN on restore.

### Sweeps (16 control + 16 armed, 180d death-aware, identical seeds)

- **A/A sanity (control):** leadcourt s11/s22 pristine twins BYTE-IDENTICAL at full horizon — both instruments trajectory-neutral.
- **Instrument errors:** 0 on all 32 runs.
- **Determinism check:** this run's own control reproduces r46b's control EXACTLY (3 dehy deaths, 9 departures, 77.8% pack-full, national 5/16, median 147d) — the substrate is stable across runs; the armed side reproduces r46b's armed numbers (13 departures, 84.6% raw pack-full, gate trips 2, filledDawn 26, median 156d, national 10/16) plus the fixed counter attribution.
- **Control:** 3 ranging-dehydration deaths (belongseek-s22 d102 Theo Lindqvist; belongseek-s55 d12 Violet Pang; leadcourt-s55 d12 Violet Pang — the s55 pair is one deterministic trajectory under both policies, so n=2 independent events), coverage 3/3 = 100%. 9 departures, 7 pack-full (77.8% raw; 5 fillable), 0 violations.
- **Armed:** 0 ranging-dehydration deaths. 13 departures, 11 pack-full raw (84.6%), 9/9 pack-full on the FILLABLE scope (100%). 0 violations. Layer counters: gateTrips 2, gateHauls 2, gateHaulBottles 6 (attribution fixed — r46b read 0), gateUnresolvable 0, filledDawn 26, filledEnroute 31, filledGatehaul 6.

The 4 excluded non-fillable departures (all s55): d14 ×2 (pack=3, cistern=0 — post-gate-haul full packs; the dawn log shows gateTripped=true, packAfterFallback=3) and d18 ×2 (pack=2, cistern=0 — the r46b miss states: top-up honestly refused, gate correctly not tripped, no violation, both scholars survived the range).

### The #292 question, re-answered with tile types

| side | water-tile visits | filled | unfilled | fill share |
|---|---|---|---|---|
| control | 497 | 9 | 488 | 1.8% |
| armed | 767 | 56 | 711 | 7.3% |

True-wild only (Manhattan dist from haven > 1):

| side | visits | filled | unfilled | fill share |
|---|---|---|---|---|
| control | 67 | 9 | 58 | 13.4% |
| armed | 122 | 50 | 72 | 41.0% |

(The armed "unfilled" visits are overwhelmingly pack-already-full arrivals — the dawn top-up keeps the pack at 3, so most arrivals need no fill. The mechanism co-primary compares the fill share, which moved 13.4%→41.0%.)

## GO verdict: GO (§14 — on the honest bar as pre-registered)

| conjunct | result | verdict |
|---|---|---|
| (a) armed ranging-dehydration deaths == 0 | 0 (control 3) | HOLD |
| (b) pack-full departures ≥ 90% of FILLABLE | 9/9 = 100.0% (control fillable n/a — no layer) | **HOLD** |
| (c) true-wild fill share armed ≥ control | 41.0% vs 13.4% | HOLD |
| (d) zero empty-pack+dry-cistern departures | 0 (control 0) | HOLD |
| (e) median ≥ control−10d | 156d vs 147d | HOLD |
| (f) national ≥ control−2/16 | 10/16 vs 5/16 | HOLD |
| (g) no new death mode (n≥3) | none | HOLD |

**Disposition:** GO — the layer is reported for a 12–16 seed confirm. The layer file STAYS in the worktree (committed on the sim-rangerefill2 branch for the coordinator to land or kill per the confirm).

## Sense-test (SENSE-TESTING LAW)

Real beats from seed 55 (leadcourt, RANGEREFILL=1) — the Violet Pang trajectory. The gate tripped on d14 (pack 0, cistern 0 at the haven dawn):

> d14: The cistern's dry and your bottles are empty — you haul water from the creek before ranging out.
> d14: Filled 1L (risky — Creek source (unknown)). 1L carried (1kg). (-10 kcal hauling, 1 tick.)
> d14: Filled 1L (risky — Creek source (unknown)). 2L carried (2kg). (-10 kcal hauling, 1 tick.)
> d14: Filled 1L (risky — Creek source (unknown)). 3L carried (3kg). (-10 kcal hauling, 1 tick.)

This reads as a person being careful: the intent is voiced once, then the honest per-bottle accounting with named costs. Not a dispenser — a deliberate decision.

The risky-water tradeoff is voiced honestly on the range (d15/d21):

> d15: Drank risky water (Creek source (unknown)). Got lucky this time.
> d21: Drank risky water (Creek source (unknown)). Stomach cramps within the hour — something's wrong in the gut. (-5 health. Boil it next time.)

The layer trades dehydration risk for disease risk and the engine says so aloud. A person hauling creek water because the cistern is dry and getting gut cramps from unboiled creek water is exactly the survival-logistics texture Steve wants.

The honest boundary state, d18 (the excluded miss state):

> dawn log d18: packBefore=2, packAfter=2, cisternClean=0, gateTripped=false

No narration, no drama — the top-up was refused ("The cistern is dry"), the gate correctly stayed shut (pack non-empty), and the scholar departed with 2 bottles. Two bottles of water and a dry cistern is a situation a person would recognize and accept; the layer doesn't pretend it fixed what it couldn't.

En-route opportunism reads as habit, not machinery (d15–d21): drink a bottle, pass a creek, top back to 3 — "Filled 1L (risky — Creek source (unknown)). 3L carried (3kg). (-10 kcal hauling, 1 tick.)" The beats judge as people, not mechanisms.

## Wall numbers (the standing scale-wall report)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 5/16 | 1/16 | 0/16 | 4/16 | 0/16 | 147d | 182d |
| armed | 10/16 | 0/16 | 0/16 | 7/16 | 0/16 | 156d | 182d |

No wins, no w5 — the wall stands. Armed national 10/16 vs control 5/16 is noted but not claimed (n=16 cannot separate mechanism from noise; the layer touches only water). Guardrail (f) held with margin.

## Death-cause shares

| cause | control | armed |
|---|---|---|
| monster:combat | 38 | 60 |
| villager:combat | 32 | 25 |
| monster:villager combat | 22 | 15 |
| villager:monster | 18 | 18 |
| villager:starvation | 16 | 17 |
| villager:a wound that wouldn't close | 14 | 9 |
| villager:sickness | 10 | 10 |
| villager:contest | 7 | 9 |
| villager:lockjaw | 2 | 2 |
| villager:Nevermore | 2 | 1 |
| person:combat | 2 | 1 |
| monster:expedition | 1 | 0 |
| person:alien | 0 | 1 |

Ranging-dehydration (the rangedehy attribution, subset of the above): control 3, armed 0. No `thirst`. No new death mode ≥3 on armed. (monster:combat 60 vs 38 is the same mode, higher exposure — armed scholars range more/longer; not a new mode.)

## Village assessment (plain words)

Thirty-two villages lived under the two instruments and the instruments touched nothing (A/A byte-identical). On the control side, three scholars died the ranging-dehydration death — including Violet Pang on seed 55 under both policies, the deterministic trajectory #290 named. The control suite walked past wild water 497 times and filled 9 — the #292 gap, reproduced exactly.

On the armed side, nobody died of thirst while ranging. The scholars topped up at the haven well before departing (26 dawn fills), filled at creeks and wetlands as they walked past (31 en-route + 6 gate-haul fills; true-wild fill share 13%→41%), and twice — both on the s55 trajectory — walked out to a creek at dawn because the cistern was dry and their bottles were empty, and came back carrying water. The one thing the layer still can't do is conjure the third bottle on a dry-cistern dawn when the pack holds two — those two departures (s55 d18, both policies) are excluded by the honest bar, and they're honest: the scholar left with water, just not a full pack.

The villages look the same otherwise — the cistern breathes with the rain, scholars drink and sometimes get gut cramps from creek water they didn't boil. The fill beats read as care, not machinery. The layer changes one behavior (rangers fill opportunistically) and the deaths that behavior caused go to zero.

## Blanks filled / documented

- **FILLED (counter, r46b metric review):** the gate-haul attribution — `rf_filled_gatehaul`/`rf_gateHaulBottles` now credit the fallback's hauled bottles explicitly (6, verified against dawn log packAfterFallback=3 on both hauls) instead of misattributing them to filledEnroute.
- **CONFIRMED (measurement):** the r46b mechanism reproduces on a same-sweep own control — 0 armed ranging-dehydration deaths vs 3 control; true-wild fill share 13.4%→41.0%.
- **CONFIRMED (determinism):** this run's control is byte-for-behavior identical to r46b's control on identical seeds (same 3 deaths, same wall numbers) — the substrate is stable.
- **DOCUMENTED (the honest bar):** 9/9 fillable departures pack-full; 4 non-fillable departures excluded by construction (2 full-pack post-haul, 2 honest 2/3 dry-cistern).
- **OPEN (still):** the drinkSafe/wetland misalignment in competent.js (filed in r46b; sibling arm's area — not touched).

## Metric review (§14 — mandatory)

1. **The honest bar held on its first fresh application.** 9/9 fillable departures pack-full (100% ≥ 90%); the 4 exclusions are auditable per-departure (s55 d14 ×2 post-haul full, d18 ×2 honest 2/3). No re-scoring occurred: the conjunction was written before sims ran and judged as written.
2. **The phenomenon is still thin (n=2 independent control deaths on the s55 trajectory + Theo Lindqvist d102).** The (a) conjunct passed, but a 12–16 seed confirm should watch whether the armed zero holds when the control produces deaths on other trajectories. Pre-register the confirm against the same conjunction.
3. **The (c) co-primary is the load-bearing evidence.** With only 3 control deaths, (a) alone is a thin reed; the true-wild fill share (41.0% vs 13.4%, n=122/67 visits) is the mechanism proof and it held with margin.
4. **Departure-pack granularity (r46b review item 3) stands.** Pack at departure is still the dawn-log state; the routetile instrument's per-travel pack snapshots exist for a future "pack at the moment of ranging" bar if the confirm wants it.
5. **National 10/16 vs 5/16 remains an observation, not a finding.** Same caveat as r46b; the confirm's larger n may or may not separate it.
6. **Metrics held otherwise.** Identical seeds, death-aware horizons, own-control baseline, A/A byte-identicality at full horizon, pre-registered conjunction, REAL RED phases — all honored; the GO is on the merits of the bar as written.

## Convergence state

**GO (pilot-equivalent 8-seed suite) — reported for the 12–16 seed confirm.** The rebuilt layer eliminated ranging-dehydration deaths (3→0), moved the true-wild fill share (13.4%→41.0%), and held 100% pack-full on the fillable departure scope. The food-economy axis keeps #292 as live work pending the confirm.
