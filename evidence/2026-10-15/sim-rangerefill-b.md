# sim-rangerefill-b — RANGING WATER-SAFETY layer (ARM 3, loop B r46b)

**Run:** fleshout-b-20261015T0430Z · ARM 3 · sim-findings **#292** (claimed; RANGING WITHOUT WILD FILLS — fill-opportunism policy arm)
**Date:** 2026-10-15 · repo `~/workspace/the-scattering`, worktree `~/workspace/worktrees/sim-rangerefill`

## Canon note

docs/CANON.md read first. **There is no water/thirst canon doc** (stated per the canon rule in sim-rangedehy-b, not invented). All water mechanics read from `src/js/game.js` + `src/js/engine/calories.js` as-is; the scholar's water verbs are `Game.fillWater()` (haven well draws 1L clean from the cistern; wild creek/wetland/pond free but risky), `Game.boilWater()`, `Game.drinkWater()`, `Game.pourWater()`.

**Sub-finding (policy/engine misalignment, fixed in-layer):** the competent-family `drinkSafe` fills opportunistically only when the tile type matches `/creek|well|spring|river|pond|haven/i` — but the engine's fillable wild set is exactly `{creek, wetland, pond}` (game.js `fillWater`). `well`/`spring`/`river` are not tile types at all, and **`wetland` — the most common wild water — is missed by the policy regex**. So `drinkSafe` never opportunistically fills on wetlands even though the engine would. The layer uses the engine-exact set. (competent.js itself untouched — fix lives in the layer.)

## Pre-registration (§11 — written before sims ran)

- **Primary metric (conjunction):** (a) ranging-dehydration deaths on the ARMED side == 0, AND (b) pack-water-full departures ≥ 90% of armed rangings, AND (c) zero armed departures with empty pack + dry cistern. (Control had 3 ranging-dehydration deaths/16 on this run's own control — a thin baseline, which is why the mechanism conjuncts are co-primaries.)
  - "Ranging-dehydration death" = `cause === 'dehydration'` AND `player === true` AND scholar away from haven at the death beat (the rangedehy attribution).
  - "Departure"/"ranging" = a dawn-transition departure: dawn snapshot at-haven → next dawn away (the rangedehy departure definition). Pack at departure: armed side = the layer's dawn log (post-top-up / post-fallback); control side = the dawn snapshot pack. "Pack-full" = ≥ 3 bottles (the competent-family standard). "Violation" = pack 0 AND cistern clean 0 at the departure dawn.
- **Guardrails:** median survival ≥ control − 10d; national ≥ control − 2/16; no new death mode (n ≥ 3) absent on control.
- **GO →** run a 12–16 seed confirm. **MISS →** layer deleted per kill protocol, evidence-only landing.
- **Horizon + why:** 180 days, death-aware (§10 — the deaths sit early but ranging trajectories and the wall need the full horizon; dead villages stop simulating, +10d tail max).
- **Seeds:** 11, 22, 33, 44, 55, 66, 77, 88 — exact literals, identical both sides.
- **Policies:** `leadcourt` + `belongseek` (the courtship substrate; the finding's deaths were measured there).
- **Baseline:** OWN control in the SAME sweep (CONTROL BASELINE DRIFT #247 — never inherited, even on identical seeds). One side per process invocation (the RANGEREFILL gate is process-wide env); same script, same seeds, same code.
- **SMOKE=1 gate + #69 unwrap + det-gate BEFORE any sim spend:** sweep refuses to start unless the named policy exports carry a callable `daily`; instruments (rangedehy + routetile) proven trajectory-neutral by test-rangerefill-20261015.js PART E (byte-identical 40d, seeds 11/22).

## What was built (policy-side layer — zero src/js changes)

- `scripts/policies/rangerefill.js` (gate `RANGEREFILL=1`; unset exports the base policies unchanged — same objects):
  1. **Departure precondition:** at every haven dawn, BEFORE the base policy's daily (so before any departure), top the pack to 3 bottles from the haven well. Honest `Game.fillWater()` — 10 kcal + 1 tick per bottle, engine refusals honored.
  2. **Gate fallback (the Violet Pang state):** dawn at haven with EMPTY pack + DRY cistern → haul from the nearest personally-visited water tile (creek/wetland/pond — the engine's own refusal suggests "Haul from a creek (risky water)"), hop-by-hop via the honest walkTo pattern, then fill. Voiced once: "The cistern's dry and your bottles are empty — you haul water from the creek before ranging out." If no water tile is honestly known, recorded unresolvable and the day proceeds (measured residual).
  3. **En-route fills:** `Game.travelTo` wrapped (installed in `setup`, gate-on only): after every non-combat arrival on a creek/wetland/pond tile with room in the pack, fill toward full. Uses the engine-exact set (fixes the drinkSafe/wetland misalignment in-layer). Skips combatExit arrivals (nobody stops to fill mid-flee) and mid-combat travel.
  4. Auditable dawn log on ctx (`_rfDawnLog`: day, packBefore/After, cisternClean, gateTripped, packAfterFallback) for the GO measurement.
- `scripts/routetile-lib-20261015.js` — route tile-type instrument closing the #292 gap: wraps `Game.travelTo` (arrivals: day, from/to, dest tile type, pack at travel) and `Game.fillWater` (position + pack before/after; refusal = no bottle gained, no say-wrap needed). Joins visits to fills with a monotonic travel counter: a water-tile visit is FILLED iff a gained fill happened at the same tile before the next travel.
- `scripts/test-rangerefill-20261015.js` — proof with REAL RED phases (patch-swap `~/workspace/rangerefill-red-20261015.patch`, never stash): gate-off inert (same objects, #69 unwrap), dawn top-up (pack 0→3, cistern −3), en-route fill on wetland arrival, gate fallback (creek-haul, unresolvable variant), SMOKE, 40d instrument det-gate. 11/11 gate-off, 32/32 gate-on; RED run: 9 failures across B/C/D, no crashes; restored GREEN. Kill-protocol INFO-SKIP (exit 0) if the layer is deleted.
- `scripts/sweep-rangerefill-20261015.js` — 16+16 runs, both sides instrumented, A/A pristine twins on control (leadcourt s11/s22, full-horizon byte-identical).
- `scripts/analyze-rangerefill-20261015.js` — before/after + GO verdict printer.
- `scripts/sense-rangerefill-20261015.js` — sense-test probe (real fill-beat transcripts on seed 55).

## Results

### Proof tests — GREEN
- Gate-off: 11/11 (exports are the base objects; #69 unwrap; instruments byte-identical 40d × seeds 11/22).
- Gate-on: 32/32 (dawn top-up, en-route fill, gate fallback + unresolvable variant, SMOKE).
- RED: 9 failures with topUpPack neutered (no crashes); GREEN on restore.

### Sweeps (16 control + 16 armed, 180d death-aware, identical seeds)

- **A/A sanity (control):** leadcourt s11/s22 pristine twins BYTE-IDENTICAL at full horizon (35d and 148d) — both instruments trajectory-neutral.
- **Instrument errors:** 0 on all 32 runs.
- **Control:** 3 ranging-dehydration deaths (belongseek-s22 d102 Theo Lindqvist; belongseek-s55 d12 Violet Pang; leadcourt-s55 d12 Violet Pang — the s55 pair is one deterministic trajectory under both policies, so n=2 independent events), coverage 3/3 = 100%. 9 departures, 7 pack-full (77.8%), 0 violations.
- **Armed:** 0 ranging-dehydration deaths. 13 departures, 11 pack-full (84.6%), 0 violations. Layer counters: gateTrips 2, gateHauls 2, gateHaulBottles 0 (accounting note below), gateUnresolvable 0, filledDawn 26, filledEnroute 37.

**Correction to the #290 separating factor:** the original evidence said Violet "departed on day 7 with zero pack water." On current master (diagnostic re-run, belongseek s55): dawn d7 pack=3, cistern 0/0 — she departed with a FULL pack (3 bottles), drank them d7→d10, then did zero wild fills d10–d12 and died d12. The "departed empty" factor does not reproduce; the binding mechanism is the WILD-FILL gap, not the departure state. The layer's en-route fill is the lifesaving half; the departure precondition was already ~satisfied by the base policy (control pack-full 77.8%).

### GO verdict: MISS (§14 — not re-scored)

| conjunct | result | verdict |
|---|---|---|
| (a) armed ranging-dehydration deaths == 0 | 0 (control 3) | HOLD |
| (b) pack-full departures ≥ 90% | 11/13 = 84.6% (control 7/9 = 77.8%) | **MISS** |
| (c) zero empty-pack+dry-cistern departures | 0 (control 0) | HOLD |
| (d) median ≥ control−10d | 156d vs 147d | HOLD |
| (e) national ≥ control−2/16 | 10/16 vs 5/16 | HOLD |
| (f) no new death mode (n≥3) | none | HOLD |

**The 2 misses:** both s55-d18 (one per policy): dawn pack=2/3, cistern dry. The dawn top-up could not fill (dry cistern — refills honestly refused), and the gate correctly did not trip (pack non-empty). The scholar departed with 2 bottles, not 0 — no violation, no death (both survived the range). The ≥90% bar demanded a full pack in a state where the 3rd bottle was physically unfillable. Per §14 the miss stands; the layer is DELETED per kill protocol (evidence-only landing). See metric review for the miscalibration analysis and the next-run prescription.

**Accounting note (gateHaulBottles=0):** not a mechanism failure. In the gate fallback, `walkTo` to the creek passes through the layer's own travelTo wrap, whose en-route fill tops the pack on arrival — so the fallback's explicit `topUpPack` finds the pack already full and gains 0. The 3 bottles WERE hauled (dawn log packAfterFallback=3 on the probe; departures show pack=3 after gate days). The credit was attributed to `filledEnroute` instead of `filledGatehaul`. Counter bug only; mechanism verified by the dawn log + transcripts.

### The #292 question, answered with tile types

Were wild water tiles on-route and unfilled, or never on-route? **On-route and unfilled** — decisively:

| side | water-tile visits | filled | unfilled | fill share |
|---|---|---|---|---|
| control | 497 | 9 | 488 | 1.8% |
| armed | 767 | 55 | 712 | 7.2% |

True-wild only (Manhattan dist from haven > 1, excluding the at-haven halo where `playerAtHaven()` ≤ 1):

| side | visits | filled | unfilled | fill share |
|---|---|---|---|---|
| control | 67 | 9 | 58 | 13.4% |
| armed | 122 | 49 | 73 | 40.2% |

The "unfilled" visits on the armed side are mostly pack-already-full arrivals (no fill needed) — the instrument counts visits, not need. The control's 1.8% is the #292 gap in full: rangers walk past water all the time and never fill. (havenFills 608 vs wildFills 17 on control — "rangers fill only at haven," exactly as #292 framed it.)

### Sense-test (SENSE-TESTING LAW)

Real beats from seed 55 (leadcourt, RANGEREFILL=1) — the Violet Pang trajectory, day 14. The gate tripped (pack 0, cistern 0 at the haven dawn):

> d14: The cistern's dry and your bottles are empty — you haul water from the creek before ranging out.
> d14: Filled 1L (risky — Creek source (unknown)). 1L carried (1kg). (-10 kcal hauling, 1 tick.)
> d14: Filled 1L (risky — Creek source (unknown)). 2L carried (2kg). (-10 kcal hauling, 1 tick.)
> d14: Filled 1L (risky — Creek source (unknown)). 3L carried (3kg). (-10 kcal hauling, 1 tick.)

This reads as a person being careful: the intent is voiced once ("you haul water from the creek before ranging out"), then the honest per-bottle accounting. Not a dispenser — a deliberate decision with named costs.

The risky-water tradeoff is also honest and voiced (d15/d21):

> d15: Drank risky water (Creek source (unknown)). Got lucky this time.
> d21: Drank risky water (Creek source (unknown)). Stomach cramps within the hour — something's wrong in the gut. (-5 health. Boil it next time.)

The layer trades dehydration risk for disease risk and the engine says so aloud. A person hauling creek water because the cistern is dry and getting gut cramps is exactly the survival-logistics texture Steve wants — the beats judge as people, not mechanisms.

Routine dawn top-ups are quiet (the engine's own "Filled 1L (clean — Haven well)... Cistern: 7L left." lines) — correct: routine care doesn't need narration, the deliberate creek-haul does.

### Wall numbers (the standing scale-wall report)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 5/16 | 1/16 | 0/16 | 4/16 | 0/16 | 147d | 182d |
| armed | 10/16 | 0/16 | 0/16 | 7/16 | 0/16 | 156d | 182d |

No wins, no w5 — the wall stands. The armed national 10/16 vs control 5/16 is noted but not claimed: the layer only touches water, and the per-seed pattern (gains on s11/s22/s44/s55) is consistent with healthier scholars courting better, but n=16 cannot separate that from noise. Guardrail (e) held with margin.

### Death-cause shares

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

Ranging-dehydration (the rangedehy attribution, subset of the above): control 3, armed 0. No `thirst`. No new death mode ≥3 on armed. (monster:combat 60 vs 38 is higher but the same mode, and the armed scholars range more/longer — exposure, not a new mode.)

## Village assessment (plain words)

Thirty-two villages lived under the two instruments and the instruments touched nothing (A/A byte-identical). On the control side, three scholars died the ranging-dehydration death — including Violet Pang on seed 55 under both policies, the deterministic trajectory #290 named. The re-measurement corrected the story: she didn't depart empty (dawn d7 pack=3, cistern dry); she departed full, drank the three bottles over three days, and then walked past water for days without filling — 497 wild water-tile visits across the control suite, 9 filled. The village that loses a ranger to thirst doesn't change its water behavior (that blank is #291, still open).

On the armed side, nobody died of thirst while ranging. The scholars filled at haven before departing (26 dawn fills), filled at creeks and wetlands as they walked past (37 en-route fills, true-wild fill share 13%→40%), and twice — both on the s55 trajectory — walked out to a creek at dawn because the cistern was dry and their bottles were empty, and came back carrying water. The one thing the layer couldn't do was conjure the third bottle on a dry-cistern dawn when the pack held two — those two departures (s55 d18, both policies) are the miss, and they're honest: the scholar left with water, just not a full pack.

The villages look the same otherwise — people haul water ("Jesse returns with 7L of creek water"), the cistern breathes with the rain, scholars drink and sometimes get gut cramps from creek water they didn't boil. The fill beats read as care, not machinery.

## Blanks filled / documented

- **FILLED (tooling): the route tile-type instrument** (`scripts/routetile-lib-20261015.js`) — closes the #292 instrument gap (verbs→tile types). Proven trajectory-neutral (40d det-gate byte-identical); 0 instrument errors across 32 runs.
- **DOCUMENTED (measurement): the #292 gap, quantified** — control 1.8% wild-fill share (9/497); the lever moved true-wild to 40.2% and eliminated the deaths, but missed the ≥90% pack-full bar on the dry-cistern boundary. Full numbers above.
- **DOCUMENTED (correction): the #290 separating factor** — "departed with an empty pack while the cistern was dry" does not reproduce on current master (dawn d7 pack=3). The binding mechanism is the wild-fill gap.
- **FILED (open): drinkSafe/wetland misalignment** — new sim-findings item (policy regex misses `wetland`, names phantom types).
- **KILLED: the rangerefill layer** — deleted per kill protocol; proof degrades to INFO-SKIP (verified exit 0 after deletion).

## Metric review (§14 — mandatory)

1. **The (b) bar was miscalibrated for the dry-cistern boundary — the miss is real but the bar demanded the impossible.** "Pack-full departures ≥ 90%" implicitly assumes water is available at dawn. Both misses (s55 d18, both policies) were dawn pack=2/3 + cistern 0: the top-up was honestly refused ("The cistern is dry"), the gate correctly didn't trip (pack non-empty), and the scholar departed with 2 bottles — no violation, no death. The bar should have been scoped: "pack-full departures ≥ 90% *when the cistern is non-dry at dawn*" (11/11 = 100% on that scope), or the gate should trip on pack<3 rather than pack==0. Per §14 the miss stands for this run; the revision is for the NEXT run, not this one.
2. **The (a) phenomenon is thinner than the bar assumed, and the separating factor didn't reproduce.** The control produced 3 ranging-dehydration deaths (not 2), but the "departed empty" factor from sim-rangedehy-b did not reproduce on current master (Violet departed d7 with pack=3). Pre-registered mechanism conjuncts are only as good as the phenomenon description; the diagnostic re-run (dbg-dep) corrected it before the sweep, and the evidence records the correction rather than defending the old story.
3. **Departure-pack operationalization has a dawn-state granularity limit.** Pack at departure is read from the dawn log (post-top-up), but a scholar who detours to a creek mid-day before truly ranging would read as the dawn state. On this suite it didn't matter (no such detours outside the gate fallback, which the log captures via packAfterFallback), but a future bar on "pack at the moment of ranging" needs travel-level pack tracking (the routetile instrument already snapshots pack per travel — the join key exists).
4. **The gateHaulBottles counter misattributes.** The fallback's walk triggers the layer's own en-route fill on arrival, so bottles gained at the creek credit `filledEnroute`, leaving `gateHaulBottles=0` despite packAfterFallback=3. Counter bug only (mechanism verified); a future layer should credit the fallback explicitly or drop the counter.
5. **National 10/16 vs 5/16 is an observation, not a finding.** The layer touches only water; the per-seed gains are consistent with healthier scholars courting better, but n=16 cannot separate mechanism from noise. Noted for the convergence tracker, not claimed.
6. **Metrics held otherwise.** Identical seeds, death-aware horizons, own-control baseline, A/A byte-identicality at full horizon, pre-registered conjunction, REAL RED phases — all honored; the MISS is on the merits of the bar as written.

## Convergence state

**KILLED AT PILOT-equivalent (full-suite MISS on primary conjunct (b), §14).** The lever eliminated ranging-dehydration deaths (3→0) and moved the wild-fill share (true-wild 13%→40%), but missed the pre-registered ≥90% pack-full bar (84.6%) on the dry-cistern boundary state. Layer deleted per kill protocol; instruments and evidence land. #292 stays open with a measured gap (1.8% wild-fill on control), a filed sub-blank (drinkSafe/wetland misalignment), and a next-arm prescription: gate on pack<3 when cistern dry; re-scope (b) to fillable dawns. The food-economy axis keeps the #292 gap as live work.
