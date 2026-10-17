# SIM-HARVSTOP — scholar harvest stand-down on pinned pantries (ARM sim-harvstop-b, loop B, food-economy)

Date: 2026-10-17 · Loop: oversight-flesh-out-loop-b · Run: fleshout-loop-b-20261017T0630Z · Worker tree: sim-harvstop-b
Axis: food-economy (scale-wall lens) — the #444 (sim-trig6-b) named next: "decouple the drain from village-enriching side-effects (drain without buffs/politics), or trigger on FLOW (income rate) not STOCK." This arm tests the FLOW-triggered stand-down: when the pantry pins near cap and the income-rate runs hot, the scholar's own surplus forage trips stand down — the food stays wild.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: sim-trig6-b (2026-10-17, KILLED/NO-GO) proved a stock-triggered drawdown enriches faster than it drains — feast buffs, aid→trust→tribute, longer survival all outran the drain ("YOU CANNOT DRAIN A PANTRY THE LEVER ITSELF KEEPS FILLING"). Its metric review prescribed: decouple the drain from enrichment, or trigger on FLOW not STOCK. The engine ALREADY stands down villager duty forage/garden/fish when the pantry holds >4 fresh days (PRODTHROTTLE, 2026-10-13, game.js) — but the SCHOLAR's own forage trips (competent needTrip → forageTripSeedFirst → doAction('forage')) keep running on the courtship substrate. Does standing down the scholar's surplus trips cut the waste rate without the trig6 enrichment channels?
- **ENGINE CHECK** (pre-registered boundary, verified in code before sims): the engine does NOT model field-side spoil for unharvested food. Tile stock caps at tGroundCap (vigor-capped) and regrowTiles() only tops up when stock < cap — unharvested food persists on the tile; nothing rots in the field. The arm's effect is therefore inflow-avoidance at the pantry door / harvest-avoidance in the field; the rot reduction is measured at the pantry door, never as destroyed field food. "Leave it in the field" is honest: the food stays wild and persists.
- **Lever**: scripts/policies/harvstop.js (HARVSTOP=1, default OFF; wraps leadfeast→harvlead, belongfeast→harvbelong — the FEASTSCALE_R13=1 substrate). Policy-side only, zero src/js. The layer arms a per-day stand-down when BOTH hold: (1) the engine's own prodThrottleEngaged() (pantryFreshDays() > 4 — the village's duty foragers have already stood down; one truth, no parallel definition), AND (2) the trailing-7d pantry income-rate runs hot (>= 2x the trailing-7d burn from v.burnHistory). While armed, the scholar's doAction('forage') is declined with a voiced beat (once/day) — the trip still travels (the scholar checks the grounds) but harvests nothing; workTraplineSet does not fire (only on success). No buffs, no politics, no enrichment — decoupled from the trig6 failure mode by construction. Gate-off: byte-identical delegation (proof RED phase pins it).
- **SUBSTRATE**: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (pre-seat); base courtship policies only. 180d death-aware; dead villages stop (+10d tail max). Assert env up front; SWEEP STOPS on mismatch.
- **SEEDS**: 8 FRESH seeds 4401-4408 x {leadfeast, belongfeast} x {control, armed} = 32 runs, IDENTICAL seeds both sides. Verified against the coordinator's banned list before running (no hits — sweep stops if any is banned).
- **VOLUME-SANITY CHECK** (pre-registered, runs BEFORE the pilot — per #444: "an unachievable bar wastes a sweep"): max theoretical harvest-reduction = the scholar's pantry-inflow kcal on trigger-days (donations) + the scholar's pantry-draw displacement on stand-down days (consumption shifted from own haul to pantry). Required delta = 0.25 × control rot-per-pantry-kcal × control pantry-kcal-days (the 0.75x bar). If max-theoretical < required delta, the PRIMARY is NO-COVERAGE (honest, not a kill — #444) and no pilot runs; the run reports the boundary + the lever's measurable prize (harvest-avoidance volume, guardrails, beats).
- **PRIMARY** (gated on the volume check): rot-per-pantry-kcal (waste rate) armed <= 0.75x control. (The trig6 lesson: absolute rot is confounded by enrichment-driven trajectory divergence; the rate is the honest prize.)
- **Guardrails**: starvation deaths armed <= control+2; national >= control-2; median survival >= control-10d; no new death mode; dehydration <= control+1; wins 0=0 both sides (pre-seat); exiled 0 both sides.
- **MECHANISM-ENGAGEMENT CHECKS** (vacuous-pass protection): (a) stand-down days >= 20 armed-side; (b) declined forage verbs >= 20 armed-side; (c) trigger-day counter honest (pin-days and hot-flow-days counted separately). If the mechanism never engages, the run is a KILL (invisible effect), not a GO.
- **HETEROGENEITY LENS**: max per-seed starvation delta (armed-control) <= +3; report scholar harvest kcal left wild per run.
- **Measure every run**: win rate, vesting/national reach, Arc reach, wave reach (1–5), four-realm formation, median/max survival, death-cause shares.
- **Det-gate**: bit-identical reruns both sides before trusting comparisons (r27 rule); SMOKE=1 honesty gate proving the layer actually ran.
- **Metric-review note (§14)**: the trig6 co-primary (absolute rot) was miscalibrated for its lever; this run pre-registers the RATE and the volume-sanity gate up front. If the rate proves wrong, it goes under "metric review" for the next run.

## Proof results (run BEFORE any sims)

scripts/test-harvstop-20261017.js — RED (HARVSTOP unset) + GREEN (HARVSTOP=1), one process per phase. PROOF GREEN, all checks passed (re-run green on 3 seeds: 4401, 4501, 4601):
- R1 gate-off byte-identical: harvlead == leadfeast and harvbelong == belongfeast per-day hashes, 40d, IDENTICAL both policies. (Caught a proof bug mid-run: the first R1 compared different seeds — fixed to identical seeds, then green.)
- R2: no stand-down gate-off on the pinned+hot fixture; gate-off delegates (R1 pins byte-identity).
- G1 trigger: stand-down ARMS on pinned pantry + hot income-rate (hsPinDays counted).
- G2 decline: doAction('forage') returns null while armed (3 verbs declined across the trip's tile attempts), voiced beat exactly once per stand-down day, counted (hsDeclined).
- G3: no pin on thin pantry. G4: no hot-flow on cold inflow.
- G5/G5b: inflow instrument records stockPantry kcal; flowHot reads the history honestly.
- G6 armed determinism: 40d x 2 byte-identical day hashes.
- G7 hunger exemption inherited: hungryStreak >= 3 → pinEngaged false even on a pinned pantry (the engine's exemption, never overridden).
- G8: a full armed daily on the pinned fixture completes; the declined trip returns foraged=0, no crash, tiles keep their stock.

Sense-read of the beat (deterministic, no RNG in copy):
> "The shelves are pinned — ~19 days of fresh on hand, and the crew's already stood down from the fields. You walk the creek, look at what's growing, and leave it standing. The pantry can't take more; the wild will keep."
PASS — reads as a person making a sensible call (names the real fresh-day count, the crew's prior stand-down, the patch walked, the honest reason). Not a robot skipping work.

## Volume-sanity check (pre-pilot diagnostic — scripts/probe-harvvol-20261017.js)

4 control runs (seeds 4402-4403 x {belongfeast, leadfeast}, 180d death-aware, FEASTSCALE_R13=1, SEATDRIVE=0), instruments only:

| run | days | throttleDays | trips (on-throttle) | scholar donations | scholar harvest on-throttle | pack rot | pantry fresh rot |
|---|---|---|---|---|---|---|---|
| belongfeast s4402 | 159 | 122 | 398 (313) | 0 | 46,150 | 15,625 | 123,570 |
| leadfeast s4402 | 130 | 95 | 316 (239) | 0 | 36,100 | 19,255 | 110,098 |
| belongfeast s4403 | 176 | 75 | 471 (200) | 0 | 23,430 | 27,668 | 117,415 |
| leadfeast s4403 | 140 | 112 | 389 (311) | 0 | 29,895 | 19,365 | 536,831 |

Robust pattern: the scholar donates ~NOTHING to the pantry on the courtship substrate (0 kcal on all 4 runs — confirms the r13 diagnosis); the scholar harvests 23-46k kcal on throttle-engaged days and eats it pack-first; 15-28k rots in the pack.

Max-theoretical vs required delta (pre-registered formula): donations (0) + draw-displacement (scholar's own-haul consumption shifted to pantry on stand-down days, ~23-46k). Required: 0.25 x control rot. On s4402-belongfeast: 46k displacement vs 35k required — PASSES, but thin, and it assumes displacement reduces fresh rot 1:1. HONEST CAVEAT (metric review): competentEat draws from the pantry preserved-first (cooked/smoked/rendered score 10, raw plants 2), while the village's nightly pantryDraw is fresh-first — the scholar's extra pantry draw does NOT directly touch the about-to-rot fresh pool. The attributable channel is the pack-rot avoided (~8-11k, the throttle-day share) plus an indirect channel via the smoke racks (scholar eats preserved → preserved pool shrinks → racks-full guard lifts → more smoking). The pilot measures the real rate; the check passes on the pre-registered formula but the mechanism is thinner than the formula assumes.

Trigger-engagement diagnostic (scripts/diag-harvengage-20261017.js, HARVSTOP=1, 60d, seed 4401): pinDays=59, hotDays=48, standDowns=48, declined=97. The TRUE income-rate (stockPantry + stockSurplus + donations) runs hot — median inflow7/burn7 = 2.87x, p90 = 21.8x. The 2x flow bar is well-calibrated (fires on 48/59 pin days). Design fix during build (documented, not a mid-run re-score): the inflow wrappers must be installed persistently in setup, not per-daily — the villagers' surplus inflow (stockSurplus) resolves in Game.sleep() AFTER the policy's daily returns, so a per-daily wrap recorded nothing (first diagnostic: hotDays=0). The wrappers are pure measurement; gate-off never installs them (R1 still pins byte-identity).

## Sweep results

Pilot: 8 fresh seeds 4401-4408 x {leadfeast, belongfeast} x {control, armed} = 32 runs, 180d death-aware, identical seeds both sides. SMOKE gate green. Det-gate (proof G6/R1) green.

| metric | control (n=16) | armed (n=16) | pre-reg |
|---|---|---|---|
| rot-per-pantry-kcal (**PRIMARY**) | 0.07178 | 0.05736 | **MISS** (ratio 0.799, need ≤ 0.75) |
| fresh-rot kcal (absolute) | 7,527k | 4,923k | (info: 0.654x) |
| starvation deaths | 11 | 11 | **PASS** (≤ 13) |
| national | 13/16 | 12/16 | **PASS** (≥ 11) |
| median survival | 162d | 172d | **PASS** (≥ 152d) |
| dehydration | 4 | 2 | **PASS** (≤ 5) |
| table | 13/16 | 12/16 | (info) |
| wins | 0/16 | 0/16 | **PASS** (pre-seat) |
| exiled | 0/16 | 0/16 | **PASS** |
| max wave | 4 | 3 | (info — wave 4 reached on 1 control seed) |
| arc ≥ 3 | 16/16 | 16/16 | — |
| stand-downs / declined verbs | 0 / 0 | 1167 / 3382 | mechanism (a)(b) **PASS** (≥ 20) |
| pin-days / hot-flow-days | 0 / 0 | 1690 / 1372 | mechanism (c) **PASS** |

Paired rot-per-pantry-kcal ratios (armed/control): 0.615, 1.370, 0.175, 0.722, 0.648, 0.698, 0.892, 1.562, 1.461, 2.341, 0.579, 1.080, 0.485, 1.095, 0.536, 1.000. Median 0.807. 9/16 pairs improve, 6 worsen, 1 ties.

**Verdict: NO-GO — KILLED** (primary miss: 0.799x vs the ≤0.75x bar). The mechanism ENGAGED at high volume (1167 stand-down days, 3382 declined forage verbs, 1690 pin-days) — this is a real NO-GO on an engaged mechanism, not a vacuous kill. Per the kill protocol the layer file is deleted zero-trace; instruments (proof, sweep, probe, diagnostic, per-seed JSONs) and this evidence are kept.

## Why the bar was missed (heterogeneity, not mechanism failure)

The layer works in the right direction (0.80x aggregate, 0.81x median paired) but the 0.75x bar was too ambitious for the heterogeneity:
- The best pairs (0.175, 0.485) are early-collapse or shorter-survival armed runs — less time, less rot. Not a lever win.
- The worst pairs (2.341, 1.562, 1.461) are armed runs that lived LONGER (148 vs 130d, 180 vs 127d) — more rot-days. The rate normalizes by pantry-kcal-days, but longer-lived villages accumulate rot in ways the rate doesn't fully capture.
- The scholar's stand-down shrinks the pantry (pkd consistently lower on armed: 3486k vs 4757k on s4401-belongfeast), which mechanically raises the rate even as absolute rot falls (0.654x). The rate and the absolute move in opposite directions on shrunken pantries.

The s4403-belongfeast-armed early collapse (day 46 vs 176 control, 20 stand-downs) was investigated: starvation 1 vs 1 (delta 0, passes the heterogeneity lens ≤ +3). The village was lost to non-starvation causes; the scholar's 20-day harvest avoidance (~8k kcal) is small against a 100k+ pantry. Judged trajectory divergence, not layer-caused harm. Documented.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 13/16 | 13/16 | 0/16 | 1/16 | 0/16 | 162d | 180d |
| armed | 12/16 | 12/16 | 0/16 | 0/16 | 0/16 | 172d | 180d |

Exiled: 0 everywhere. Wave 4: 1/16 control (single seed), 0/16 armed — the readiness gate holds wave 4 shut on the pre-seat courtship substrate (established). The scale wall is untouched by this arm (as expected — the lever is food-economy, not scale).

## Village assessment (plain words)

Thirty-two villages, sixteen twinned. The armed twins stand down the scholar's surplus harvest on 1167 days — the scholar walks the grounds, looks at what's growing, and leaves it standing. The pantry runs leaner (the scholar eats from it instead of around it), absolute rot falls by a third (4.9M vs 7.5M kcal), but the waste RATE only improves to 0.80x because the pantry itself shrinks. Villages live slightly longer (172 vs 162d median), starve the same (11 vs 11), reach national at the same clip (12 vs 13). Nothing about the stand-down reads as harmful or robotic — but the prize (waste rate ≤ 0.75x) was missed, so the layer is killed.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

The stand-down beat (48 firings on the 60d diagnostic, seed 4401):
> "The shelves are pinned — ~36 days of fresh on hand, and the crew's already stood down from the fields. You walk the creek, look at what's growing, and leave it standing. The pantry can't take more; the wild will keep."
**PASS** on meaning — it reads as a person making a sensible call (names the real fresh-day count, the crew's prior stand-down, the patch walked, the honest reason). **FINDING** (not chased — layer killed): the frame is fixed; only the count and patch vary. Over 48 repetitions ("You walk the creek" 5 days running) it goes robotic — the same repetition class as the peoplefood-b feast-prose finding. A future arm should use a deterministic rotation (keyed on count, never RNG).

The pilot's beat capture was contaminated: my HS_BEAT_RE also matched the engine's throttle beats, and the slice(0,12) kept only engine beats. The standalone beat-cap diagnostic verified the layer's copy. Filed as an instrument note.

## Blanks filled / documented

- **FILLED (finding)**: the scholar's surplus harvest on throttle-engaged days is 23-46k kcal/run (4 control runs) — food the engine's prodthrottle doesn't touch (it covers villagers, not the scholar). The scholar donates ~nothing (0 kcal on all 4 runs); the harvest is eaten pack-first or rots in the pack (15-28k pack rot).
- **FILLED (finding)**: the TRUE pantry income-rate (stockPantry + stockSurplus + donations) runs hot on pinned pantries — median inflow7/burn7 = 2.87x. The 2x flow bar is well-calibrated (fires on 48/59 pin days). The villagers' surplus inflow (stockSurplus) resolves in Game.sleep() AFTER the policy's daily — a per-daily inflow wrap records nothing; the wrap must be persistent in setup.
- **FILLED (finding)**: the engine models NO field-side spoil — tile stock persists at the vigor cap; "leave it in the field" is honest (the food waits, it is not destroyed).
- **DOCUMENTED (metric review)**: the 0.75x bar on rot-per-pantry-kcal was too ambitious for the heterogeneity (paired ratios 0.175–2.341). The layer achieves ~0.80x in the right direction with no harm. A future arm could re-test with a 0.85x bar or a paired-median primary. The absolute rot falls to 0.654x — the rate and absolute diverge when the pantry shrinks.
- **DOCUMENTED (metric review)**: the volume-sanity formula's draw-displacement term assumes 1:1 displacement of fresh rot, but competentEat draws preserved-first while the village eats fresh-first. The attributable channel is thinner than the formula. A future volume check should use the pack-rot share + a racks-channel estimate, not raw displacement.

## Metric review (§14)

- The primary (armed ≤ 0.75x control on rot-per-pantry-kcal) missed at 0.799x. Per §14 this is NO-GO, not re-scored. The bar was set from the trig6 0.75x precedent on absolute rot; the rate metric on this lever's heterogeneity (early collapses, longer survivals, shrunken pantries) needed a wider bar.
- The "no new death mode" guardrail: no new death mode observed (death causes: combat, monster, expedition, contest, dehydration, starvation — same set both sides). The s4403-belongfeast-armed day-46 collapse is trajectory divergence (starvation delta 0), not a new mode.
- The median-survival guardrail (≥ control-10d) passed at +10d (172 vs 162). Per the #223 precedent, movement away from harm doesn't fire the guardrail.
- Metric lesson (carrying forward): pre-register the volume-sanity check AND a heterogeneity-aware primary (paired median, not just aggregate ratio) for any future drawdown arm. An aggregate ratio on 16 heterogeneous pairs is noisy.

## Coordinator note response (root-cause-first, 2026-10-17)

The sibling sim-flowrate-b diagnostic found villagers already doing flow-aware forage stand-down in-beat. Verified: this is the engine's PRODTHROTTLE (2026-10-13), and it IS the real substrate — my layer was designed as its scholar-side complement, not a duplicate.

- **What verb fires it**: `resolveOneAssignment(vid, a)` (game.js:6249) — the duty-assignment resolver. When a villager's assigned task is forage/garden/fish and the throttle is engaged, the task is swapped to a round-robin alt (wood/water/stone) and re-resolved; the villager does real alt work (own haul + trust). Voiced beat + `v.throttleRedirects` counter.
- **What gates it**: `prodThrottleEngaged()` (game.js:14468) = `pantryFreshDays() > 4` AND `hungryStreak < 3` (the hunger exemption). One truth — my layer reused it directly rather than defining a parallel pin.
- **Why it doesn't move the rot needle**: (1) It engages LATE — the pantry already holds >4 fresh-days; fresh shelves are ~2 days, so the rot is the existing overhang burning off and stopping inflow doesn't remove it. (2) It covers ONLY duty assignments — not the scholar's own trips (23-46k kcal/run on throttle days, the gap my killed layer targeted), and not the ambient meal-loop surplus to the extent it comes from non-duty production. (3) In equilibrium the throttle is a stabilizer, not a drain — inflow ≈ outflow, the pantry stays pinned.

**Design implication**: a future stand-down arm should be GATE-TUNING on the prodthrottle (e.g., engage earlier at >3 fresh-days, or cover the scholar via the same gate) rather than a new verb. The scholar-side gap is real (my pilot: 1167 stand-down days, 0.80x rate, no harm) but needs a recalibrated bar. The engine's beat copy ("leaves the forage standing... the wild will keep") is the established voice — my layer echoed its register deliberately.

## Convergence state

**killed** (NO-GO on the engaged primary — 0.799x vs the 0.75x bar). The food-economy axis is not converged. The scholar-stand-down direction is promising (~0.80x, no harm, engaged at volume) and documented for a future arm with a recalibrated bar. The #444 line now points to: (a) waste-rate metrics that handle pantry-shrink, (b) the racks-channel (scholar eats preserved → guard lifts → more smoking) as a named mechanism.
