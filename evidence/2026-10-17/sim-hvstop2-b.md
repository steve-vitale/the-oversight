# SIM-HVSTOP2 — scholar harvest stand-down, §14 escape-hatch re-run (ARM sim-hvstop2-b, loop B, food-economy)

Date: 2026-10-17 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-hvstop2-b
Axis: food-economy (scale-wall lens) — §14 escape-hatch re-run of the killed
sim-harvstop-b arm (NO-GO 0.799x vs 0.75x bar, mechanism engaged at volume:
1167 stand-down days, no harm). The original NO-GO stands, never re-scored.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: sim-harvstop-b proved a scholar-side surplus stand-down moves the waste rate in the right direction (0.799x aggregate / 0.807x paired-median, no harm, engaged at volume) but was killed by a bar its own metric review called too tight for the heterogeneity (paired ratios 0.175–2.341). Does the same mechanism clear a CORRECTED bar — paired-median ≤ 0.85x — as a new run? The layer is rebuilt (scripts/policies/hvstop2.js, HVSTOP2=1 default OFF; the old file was deleted zero-trace per kill protocol) with the coordinator-note fixes: persistent inflow wrap in setup(), scholar-side complement via the prodthrottle pin (one truth) checked at trip-dispatch, voiced beat in the established register with deterministic rotation (the harvstop sense-testing finding).
- **ENGINE CHECK** (inherited, still true): the engine does NOT model field-side spoil for unharvested food — tile stock persists at the vigor cap; "leave it in the field" is honest.
- **Lever**: scripts/policies/hvstop2.js (HVSTOP2=1, default OFF; wraps leadfeast→hvlead, belongfeast→hvbelong — the FEASTSCALE_R13=1 substrate). Policy-side only, zero src/js. The layer stands down the scholar's SURPLUS forage trip when ALL hold: (1) the engine's own prodThrottleEngaged() (pantryFreshDays() > 4 AND hungryStreak < 3 — the village's duty foragers have already stood down; one truth, no parallel definition), (2) the trailing-7d TRUE pantry income-rate runs hot (>= 2x the trailing-7d burn from v.burnHistory; inflow = stockPantry kcal + stockSurplus returns, wrapped persistently in setup because stockSurplus resolves in Game.sleep() AFTER the policy daily), (3) the scholar is topped up (>= 50% kcalCap — surplus-only; a genuinely hungry scholar's trip is never declined). While armed, the day's doAction('forage') is declined with a voiced beat (once/day, deterministic 4-frame rotation keyed on the stand-down count, never RNG) — the trip still travels (the scholar checks the grounds) but harvests nothing; workTraplineSet does not fire (only on success). No buffs, no politics, no enrichment. Gate-off: byte-identical delegation (proof R1 pins it).
- **SUBSTRATE**: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (pre-seat); base courtship policies only. 180d death-aware; dead villages stop (+10d tail max). Assert env up front; SWEEP STOPS on mismatch.
- **SEEDS**: 8 FRESH seeds 4501-4508 x {leadfeast, belongfeast} x {control, armed} = 32 runs, IDENTICAL seeds both sides. Banned/used sets: 4201-4208 (wallcensus), 4301-4308 (wasterate), 4401-4408 (harvstop pilot) — verified no overlap before running (sweep stops on any banned hit).
- **VOLUME-SANITY CHECK** (pre-registered, runs BEFORE the pilot): max theoretical attributable rot reduction vs required delta. Ceiling = the scholar's throttle-day harvest left wild (probe-measured on fresh seeds) + pack-rot avoided. Required delta = 0.15 x control rot (the 0.85x bar). If ceiling < required, PRIMARY is NO-COVERAGE (honest, not a kill) and the pilot does not run. (The old arm's metric-review caveat carries: the attributable channel is the pack-rot share + racks channel, thinner than raw draw-displacement.)
- **PRIMARY** (binding): paired-median waste-rate ratio (armed/control per identical seed+policy pair) <= 0.85x. (Heterogeneity-aware: the old arm's metric review showed the aggregate ratio is noisy on heterogeneous pairs — early collapses, longer survivals, shrunken pantries.)
- **SECONDARY**: aggregate rot-per-pantry-kcal ratio <= 0.85x.
- **COVERAGE GATE**: stand-down days > 0 on >= 6/8 seeds, else no-coverage diagnostic (not a kill).
- **Guardrails**: starvation deaths armed <= control+1; national >= control-2; median survival >= control-10d; no new death mode; dehydration <= control+1; wins 0=0 both sides (pre-seat); exiled 0 both sides.
- **MECHANISM-ENGAGEMENT CHECKS** (vacuous-pass protection): (a) stand-down days >= 20 armed-side; (b) declined forage verbs >= 20 armed-side; (c) trigger-day counters honest (pin-days and hot-flow-days counted separately). Mechanism never engages => KILL (invisible effect), not GO.
- **HETEROGENEITY LENS**: max per-seed starvation delta (armed-control) reported; scholar harvest kcal left wild per run (info).
- **Measure every run**: win rate, vesting/national reach, Arc reach, wave reach (1-5), four-realm formation, median/max survival, death-cause shares.
- **Det-gate**: bit-identical reruns both sides before trusting comparisons (proof G6/R1); SMOKE=1 honesty gate proving the layer actually ran.
- **Metric-review note (§14)**: the harvstop primary (0.75x aggregate) was miscalibrated for its lever's heterogeneity. This run pre-registers the paired-median primary at 0.85x plus the volume-sanity gate up front. If the paired-median proves wrong, it goes under "metric review" for the next run.

## Proof results (run BEFORE any sims)

scripts/test-hvstop2-20261017.js — RED (HVSTOP2 unset) + GREEN (HVSTOP2=1), one process per phase; SMOKE=1 live-run honesty gate. PROOF GREEN on 3 seeds (4501, 4502, 4503):
- R1 gate-off byte-identical: hvlead == leadfeast and hvbelong == belongfeast per-day hashes, 40d, IDENTICAL both policies.
- R2/R2b: no stand-down gate-off on the pinned+hot fixture; gate-off installs no inflow wrap (setup pure-delegates).
- G1/G1b/G2/G2b trigger+decline: stand-down ARMS on pinned pantry + hot income-rate (pin-days and hot-days counted separately); doAction('forage') returns null while armed (3 verbs declined across the trip's tile attempts), voiced beat exactly once per stand-down day, stand-down day counted.
- G3: hot flow + thin pantry -> no stand-down (the pin binds; the probe-inflow stacks are lifted back out — the village ate the haul, the pantry is thin NOW).
- G4: pinned pantry + cold flow -> no stand-down (pin holds, hot false).
- G5/G5b/G5c: the PERSISTENT setup wrap records stockPantry kcal and stockSurplus returns into ctx._hvInflow (the sleep-time path); flowHot reads the recorded history honestly (360k >= 2x168k).
- G6 armed determinism: 40d x 2 byte-identical day hashes.
- G7 hunger exemption inherited: hungryStreak >= 3 -> pinEngaged false even on a pinned pantry (the engine's exemption, never overridden).
- G7b surplus-only: a scholar hungry AT GATE-CHECK TIME is not stood down (the dawn meal runs before the policy daily, so the fixture forces kcal low inside the daily just before the gate reads — standDowns 0, declined 0, the trip goes).
- G8: a full armed daily on the pinned fixture completes; the declined trip harvests nothing, no crash, tiles keep their stock.
- G9/G9b beat rotation: 4 distinct frames, wraps on the 5th, identical on re-run (no RNG); the beat names the real fresh-day count and the patch.

Sense-read of the rotation (deterministic, count-keyed, no RNG in copy):
> "The shelves are pinned — ~19 days of fresh on hand, and the crew's already stood down from the fields. You walk the creek, look at what's growing, and leave it standing. The pantry can't take more; the wild will keep."
> "You check the pantry before heading out — ~19 days of fresh on hand, more than the village can eat before it turns. The foragers took up wood and water this morning; you leave the thicket standing too. The wild will keep."
> "Full shelves — ~19 days of fresh, and today's haul would only crowd them. You skip the grove and turn to haven work instead; what's growing out there keeps growing."
> "The pantry's pinned at ~19 days of fresh. Nobody's pulling from the meadow today — not the crew, not you. The shelves can't take more; the wild will keep."
PASS — the established register (the engine's PRODTHROTTLE voice, second-person scholar-side), each frame names the real count, the crew's prior stand-down, the patch walked, the honest reason. The rotation answers the harvstop sense-testing finding (fixed frame 48 days running -> robotic).

## Volume-sanity check (pre-pilot diagnostic — scripts/probe-harvvol-20261017.js)

4 control runs (seeds 4501-4502 x {belongfeast, leadfeast}, 180d death-aware, FEASTSCALE_R13=1, SEATDRIVE=0), instruments only:

| run | days | throttleDays | trips (on-throttle) | scholar donations | scholar harvest on-throttle | pack rot | pantry fresh rot |
|---|---|---|---|---|---|---|---|
| belongfeast s4501 | 109 | 82 | 234 (182) | 0 | 39,870 | 29,710 | 9,201 |
| leadfeast s4501 | 179 | 135 | 391 (301) | 0 | 56,765 | 31,289 | 124,350 |
| belongfeast s4502 | 180 | 97 | 449 (239) | 0 | 43,730 | 24,049 | 111,485 |
| leadfeast s4502 | 129 | 95 | 321 (237) | 0 | 42,000 | 25,290 | 82,353 |

Robust pattern (same as the harvstop probe, stronger): the scholar donates ~NOTHING on the courtship substrate (0 kcal on all 4 runs); the scholar harvests 40-57k kcal on throttle-engaged days (vs 23-46k on the old seed set) and eats it pack-first; 24-31k rots in the pack.

Max-theoretical vs required delta: ceiling = throttle-day harvest left wild (40-57k/run) + pack-rot avoided (~20k throttle-day share). Required = 0.15 x control rot (the 0.85x bar). The old arm MEASURED 0.807x paired-median on the same mechanism — a 19.3% reduction, already past the 15% bar — and the fresh-seed substrate carries MORE throttle-day harvest than the old seed set. The ceiling reaches the bar. **PROCEED to pilot.** (Honest caveat carried from harvstop-b: the attributable channel is the pack-rot share + racks channel, thinner than raw draw-displacement; the pilot measures the real rate.)

## Sweep results

Pilot: 8 fresh seeds 4501-4508 x {leadfeast, belongfeast} x {control, armed} = 32 runs, 180d death-aware, identical seeds both sides. SMOKE gate green. Det-gate (sweep-level, 40d reruns both sides, byte-identical) green. Banned-check clean.

| metric | control (n=16) | armed (n=16) | pre-reg |
|---|---|---|---|
| paired-median waste-rate ratio (**PRIMARY**) | — | **0.964** | **MISS** (need ≤ 0.85) |
| aggregate rot-per-pantry-kcal (**SECONDARY**) | 0.04514 | 0.04943 | **MISS** (ratio 1.095, need ≤ 0.85) |
| fresh-rot kcal (absolute) | 2,791k | 3,736k | (info: 1.339x) |
| starvation deaths | 12 | 8 | **PASS** (≤ 13) |
| national | 11/16 | 14/16 | **PASS** (≥ 9) |
| median survival | 132d | 156.5d | **PASS** (≥ 122d) |
| dehydration | 0 | 3 | **FAIL** (need ≤ 1) |
| table | 13/16 | 13/16 | (info) |
| wins | 0/16 | 0/16 | **PASS** (pre-seat) |
| exiled | 0/16 | 0/16 | **PASS** |
| max wave | 3 | 4 | (info — wave 4 on 1 armed seed) |
| arc ≥ 4 | 13/16 | 13/16 | — |
| stand-downs / declined verbs | 0 / 0 | 1089 / 2909 | mechanism (a)(b) **PASS** (≥ 20) |
| pin-days / hot-flow-days | 0 / 0 | 1580 / 1344 | mechanism (c) **PASS** |
| coverage | — | 8/8 seeds | **PASS** (need ≥ 6) |

Paired rot-per-pantry-kcal ratios (armed/control), sorted: 0.29, 0.36, 0.58, 0.69, 0.75, 0.76, 0.78, 0.82, 1.11, 1.17, 1.36, 1.50, 2.01, 2.42, 2.90, 9.48. Proper median (mean of 8th+9th): **0.964**. 8/16 pairs improve, 8/16 worsen — a coin flip.

**Verdict: NO-GO — KILLED** (primary miss: 0.964 vs the ≤ 0.85x bar; secondary also misses at 1.095x). The mechanism ENGAGED at volume (1089 stand-down days, 2909 declined verbs, 8/8 seeds coverage) — this is a real NO-GO on an engaged mechanism, not a vacuous kill. Per the kill protocol the layer file is deleted zero-trace; instruments (proof, sweep, evidence, per-seed JSONs, log) are kept.

## Why the bar was missed (the effect doesn't replicate)

The old arm measured 0.807x paired-median on seeds 4401-4408; this re-run measures 0.964x on seeds 4501-4508 with the same mechanism (plus the surplus-only gate and beat rotation). The two distributions overlap heavily (old: 0.175–2.341; new: 0.29–9.48). Combined across both runs, 17/32 pairs improve — chance. The waste-rate effect is **not robust to seed-set**; it is dominated by trajectory heterogeneity:

- The worst pairs are armed runs that lived LONGER and built BIGGER pantries (4506-leadfeast armed: survived 180d, pkd 11,989k vs control 4,630k, rot 1,062k vs 142k — ratio 2.90; 4508-belongfeast armed: d158 vs d123, rot 61k vs 4k — ratio 9.48 on a near-zero-rot control). The rate normalizes by pantry-kcal-days, but longer-lived villages accumulate rot in ways the rate doesn't fully capture (the old arm's metric review flagged exactly this).
- The new seed set's controls rot much less per pantry-kcal (0.04514 vs the old 0.07178) — the baseline moved, not just the arm.
- The 4508-belongfeast 9.48 pair is driven by a near-zero control denominator (4k rot over 123 days) — an extreme-heterogeneity pair, not a lever signal.
- The s4507-belongfeast armed early collapse (d38, starv 2 vs control d64 starv 0) was investigated: both twins collapsed early (bad seed, early crisis); the 7 stand-downs fired while the pin held (pantry > 4 fresh-days by construction — the hunger exemption would have stood the pin down in genuine hunger). Judged trajectory divergence, not layer-caused harm. Max per-seed starvation delta +2 (reported, no threshold pre-registered).

The dehydration guardrail letter-miss (3 vs 0+1): three dehydration deaths on armed runs that lived longer (median +24d). No mechanistic channel identified — the scholar still travels on stand-down days (the decline is verb-level, mid-trip), and the old arm showed the reverse pattern (control 4, armed 2). Judged exposure-time noise, but the letter binds: FAIL. Documented, not chased (the primary already misses).

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 11/16 | 13/16 | 0/16 | 0/16 | 0/16 | 132d | 180d |
| armed | 14/16 | 13/16 | 0/16 | 1/16 | 0/16 | 156.5d | 180d |

Exiled: 0 everywhere. Arc 4: 13/16 both sides. Wave 4: 1/16 armed (s4508 leadfeast, d178) — the readiness gate holds wave 4 shut on the pre-seat courtship substrate (established). The scale wall is untouched by this arm (as expected — the lever is food-economy, not scale).

## Village assessment (plain words)

Thirty-two villages, sixteen twinned. The armed twins stand down the scholar's surplus harvest on 1089 days — the scholar checks the pantry, sees the crew already stood down, and leaves the grounds standing. The armed villages live LONGER (156.5 vs 132d median), reach national MORE (14 vs 11), and starve LESS (8 vs 12) — but they rot MORE in absolute terms (3.7M vs 2.8M kcal) because longer-lived, bigger-pantry villages accumulate rot. The pantry does NOT run leaner on this seed set (armed pkd 75.6M vs control 61.8M) — the old arm's "shrunken pantry" pattern didn't replicate either. Nothing about the stand-down reads as harmful or robotic — the scholar eats from the pantry instead of around it, the village carries on — but the prize (waste rate ≤ 0.85x paired-median) was missed, so the layer is killed.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

The rotation fires in live context (17 beats captured over 60d on seed 4502, all 4 frames cycling d20→d23 with real counts):
> d20: "You check the pantry before heading out — ~28 days of fresh on hand, more than the village can eat before it turns. The foragers took up wood and water this morning; you leave the thicket standing too."
> d21: "Full shelves — ~31 days of fresh, and today's haul would only crowd them. You skip the grove and turn to haven work instead; what's growing out there keeps growing."
> d22: "The pantry's pinned at ~28 days of fresh. Nobody's pulling from the meadow today — not the crew, not you. The shelves can't take more; the wild will keep."
> d23: "The shelves are pinned — ~23 days of fresh on hand, and the crew's already stood down from the fields. You walk the creek, look at what's growing, and leave it standing. The pantry can't take more; the wild will keep."
**PASS** on meaning — each frame reads as a person making a sensible call (real count, the crew's prior stand-down, the patch, the honest reason), and the rotation answers the harvstop finding (no more fixed frame 48 days running). **INSTRUMENT FIX** (not chased — layer killed): the sweep's beat regex only matched 1 of the 4 frames ("shelves are pinned" appears only in frame 1); fixed to match all four frame signatures while still excluding the engine's PRODTHROTTLE copy.

## Blanks filled / documented

- **DOCUMENTED (finding)**: the scholar-stand-down direction does NOT robustly move the waste rate — 0.807x (old seeds) → 0.964x (fresh seeds), 17/32 pairs improve combined. The effect is heterogeneity-dominated, not lever-driven. Do not re-run this direction on the waste rate without a heterogeneity-robust design (e.g., within-run crossover, or a metric that conditions on survival/pantry trajectory).
- **FILLED (instrument)**: the sweep's beat-capture regex must match all rotation-frame signatures (fixed in sweep-hvstop2-20261017.js).
- **FILLED (instrument)**: the sweep analyzer's median must average the two middle values for even n (fixed; the pilot's printed 1.107 is corrected to 0.964 — both miss).
- **DOCUMENTED (metric review)**: the waste-rate metric (rot-per-pantry-kcal) is confounded by trajectory divergence — longer-lived armed villages accumulate rot the rate doesn't normalize, and near-zero-rot controls blow up paired ratios. The paired-median was supposed to be robust; with 16 heterogeneous pairs it isn't.
- **DOCUMENTED (metric review)**: the dehydration guardrail (≤ control+1) fired on 3 vs 0 — likely exposure-time noise on longer-lived armed runs (the old arm showed the reverse), no mechanism identified. A rare-event guardrail on 16 runs is noisy; future arms should pre-register exposure-normalized rare-event guardrails or wider bands.

## Metric review (§14)

- The primary (paired-median ≤ 0.85x) missed at 0.964x. Per §14 this is NO-GO, not re-scored. The §14 escape-hatch re-run has served its purpose: it tested whether the old 0.80x replicates with a corrected bar. It does not — the direction is not robust.
- Kill classification (the taxonomy): METRIC-DOMINATED, concept-weak. The mechanism engages at volume with no starvation harm (starvation 8 vs 12, national 14 vs 11 — the layer is not harmful), but the waste-rate prize evaporates on fresh seeds. The lever is killed; the direction is documented, not re-queued.
- The "no new death mode" guardrail: not fully instrumented this run (death classes not saved to per-seed JSONs); endReasons are village-lost/survived both sides, starvation/dehydration counted, no exotic causes flagged in the run log. Filed as an instrument gap.

## Convergence state

**killed** (NO-GO on the engaged primary — 0.964x vs the ≤ 0.85x bar; secondary 1.095x also misses). The food-economy axis is not converged. The scholar-stand-down direction is closed: two runs, 64 villages, the effect doesn't replicate. The #444 line now points to: (a) the racks-channel (scholar eats preserved → guard lifts → more smoking) as a named mechanism — never directly tested; (b) heterogeneity-robust waste metrics before any further drawdown arms.
