# Orphan-adoption run — fleshout-loop-b-20261022T1630Z (axis food-economy)

**Coordinator:** oversight-flesh-out-loop-b. **Situation:** the 1530Z run's coordinator died (lock 84m stale, registry heartbeats stale) leaving BOTH arm workers as live orphans. This run adopted the trees (registry run_id rewritten, heartbeats refreshed), waited out the orphans WITHOUT racing them (writes <15m old = live workers per the 2026-10-21 orphan lesson), then verified + landed.

Claim: hidden_files/lever-claims/fleshout-loop-b-20261022T1630Z.json (deleted at closeout). 1530Z claim marked .DEAD. Stale lock deleted, new lock created/deleted per protocol.

Loop A LIVE on scale-onramp throughout (claim fleshout-20261022T1515Z.json; sim-stagemuster worker active) → axis = next non-converged down: food-economy. Zero file overlap: both arms evidence/instrument-side, zero src/js; loop A policy-side on scale-onramp.

## Arm 1 — sim-huntfix-adopt-b: re-confirm of the hunt-detector wiring fix on current master

**Verdict: GO ON THE PRIMARY — KEEP THE LAYER.** Staffing-channel hunt kcal/run: control mean 16,806 vs armed mean 23,187 → **1.380× ≥ 1.15 bar**, absolute 23,187 ≥ 10,000. Fourth consecutive GO across three fresh corpora (10-19 pilot 2.096×, 10-19 confirm 1.357×, today pilot 1.742×, today confirm 1.380×). 64/64 paired (seeds 66401–66416 × {leadfeast,belongfeast} × {control,armed}), 180d death-aware, HUNTSTAFF_LAYER=1/FEASTSCALE_R13=1/SEATDRIVE=0, anchor cd68e6dd3.

**Adoption finding:** the layer was ALREADY ON MASTER (verified byte-identical to the eca77f139 landing; occHuntTier md5 match, both detector reads present). The arm is therefore a re-confirm on current master per §14 anti-drift, not a fresh apply — this landing is EVIDENCE-ONLY (panels, evidence md, instruments, control-revert tree), zero src/js.

**Guardrails:** starvation ≤ control+1 PASS (0 failures; the 10-19 s31813 miss did NOT reproduce — metric-review item 1 answered, it was a one-corpus jackpot entanglement). Median survival FAIL (−14d: ctl 154d → armed 140d), root-caused per kill discipline: the loss lives ENTIRELY in hunt-active pairs where the #643 task-lead jackpot channel fired (−32d there); in hunt-active pairs WITHOUT task-lead days the lever's own staffing channel is +14d BETTER. Killing the wiring fix would restore ghost-occupation dead code and change nothing about the jackpot — miss stands as a miss per §14, lever judged concept-sound. New death modes: "alien" 3 events flagged on the ≥2-event rule, judged sample-noise lottery (existing cause; 5ctl/4armed on the 10-19 corpus). Wave-4 within ±2/16.

**WATCH FLAG LOUD:** task-lead kcal armed 16.3× control on task-lead days this corpus; third corpus in a row with armed > control on task-lead days — the competence boost plausibly feeds the #643 jackpot channel. The #643 steve-call (portion law for villager butchering) is the load-bearing fix for that channel, still pending.

**Sense:** 40d transcript on s66402-armed — the right people hunt (Vasyl Shevchenko, tier 1.4, steady killer; dockworker Santos misses plausibly), village beats coherent. **Canon flag:** d33 bear stalk-kill (+25,200 kcal, no fight) makes the #674 conflict (villagerHuntResolve's bear stalk vs docs/BEAR.md "the bear is a FIGHT") LIVE in the wild — #674 steve-call appended, more urgent.

**§15 balanced panel:** review_required (screen default); every paired delta no_material_signal. Zero broad-balance footprint.

**Backlog:** #642 → fixed (re-confirmed on current master). #643 steve-call open, amplified.

## Arm 2 — sim-deathcause-b: death-cause census + starvation-channel attribution (DIAG, instrument-only)

**Verdict: census DIAG-GO (233/233 deaths named, 100.0%, 0 unexplained); channel NO-GO (5/13 starvation deaths to named channels, 38.5% vs ≥95% bar).** Per §14 the miss binds as written — never re-scored. Root cause named: TAXONOMY miss, not instrument failure — the pre-registered channel list had no name for the corpus's dominant pattern (trail-starvation) or for wound-compounded starvation; every one of the 8 unattributed deaths has a complete meal history and a characterized story.

16/16 (seeds 66049–66056 × {leadfeast,belongfeast}), 180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0, anchor cd68e6dd3. The d100–150 cluster REPRODUCES (6/9 losses, median loss 123d). Proof scripts/test-deathcause-b.js 32/32 GREEN (env Usage honored — FEASTSCALE_R13=1/SEATDRIVE=0).

**Where the hunger comes from (all 13 starvation deaths characterized):** Shape 1 — inflow-failure famine 5/13 (s66050-leadfeast, genuine village famine, pantry 6,000→0); Shape 2 — trail-starvation 6/13 (THE TAXONOMY MISS: away-majority windows, expedition production CLIFFS 80–95% overnight, pack draws 700–1,000/d vs ~2,000 need, village pantry AMPLE at death — nobody recalls the villager, the pack is the only buffer); Shape 3 — pantry-crash on ~100% production 2/13 (only ~20% of production ever pools; the scholar draws ~2,000–2,200 kcal/day from the pooled surplus = 50–91% of everything the village shared; the pool drains under fixed costs while the village "produces enough"). Nobody died of the feast. Nobody died of the trim (it's gone). They died of empty trails and thin pools. Wound-compounding is the cross-cutting amplifier (transcript-confirmed in 4/13; the engine's 'starvation' cause is the honest proximate last hit).

**Metric review:** (1) bar binds, NO-GO, taxonomy miss; (2) census closes the (a) question on this substrate; (3) mean-coverage vs spikes — channels must key off below-60-day counts, not means; (4) ROT SENSOR PHASE BUG — dawn scan races Game.sweepSpoiled (game.js:30900), read 0 across 16 runs while the game narrates rot; fix: wrap sweepSpoiled; (5) pantry-at-death join needs nearest-dawn ≤ death-day; (6) `drawn` conflates pantry/pack draws — analyzer fix; (7) depositgate-eased intake unmeasured in coverage. Named next: re-run with extended taxonomy (trail-starvation, wound-compounded, net-based inflow-failure) + sweepSpoiled-phase rot sensor — the meal-row corpus already exists to develop the classifier offline.

**Findings filed:** #815 trail-starvation channel (open, named next w/ extended taxonomy), #816 scholar = largest pooled-pantry customer (open), #817 rot sensor phase bug (open), #818 wound-compounded starvation (open), #819 drawn=0 final-day mystery (open).

## Telemetry deviation check (§10, coordinator)

Baseline: hidden_files/telemetry-baselines/scale-wall.json (winseat, 16/16 wins — its own _regime note FORBIDS non-winseat comparison).

- deathcause corpus (n=16): 1 LOUD — wins 16→0, classified REGIME artifact (FEASTSCALE_R13=1/SEATDRIVE=0, wins structurally 0). national/table/exiled silent (15/16 national-ever, 14/16 table — in regime).
- huntfix corpus (n=64): 3 LOUD — national 12→41, table 16→42, wins 16→0, all classified REGIME artifacts (n=64 non-seat; within-corpus armed-vs-control: national 21/32→20/32, table 21/32→21/32, wins 0/32 both — identical).

Baseline NOT rolled. Authoritative numbers are the workers' within-corpus comparisons.

## Wall numbers (every run, per the standing directive)

- deathcause census (n=16): national(ever) 15/16, national(end) 5/16, table 14/16, wins 0/16, wave4 14/16, wave5 0/16, median 172d, max 181d.
- huntfix confirm (n=64): national 41/64, table 42/64, wins 0/64, wave4 53/64, wave5 0/64, median 154d ctl / 140d armed, max 181d both.

The wave-5 door remains the binding wall (0/48 unlocks across today's food-economy corpora). The d100–150 village-death cluster reproduces under the new food-economy code (SURPLUSFEED gone, depositgate + plentydepri live).

## Convergence state

food-economy: **converging**. The storage half is CONFIRMED-GO (depositgate-b2, c63c58c95); the hunt-detector wiring fix is re-confirmed GO on current master (#642 fixed); the d100–150 hunger question is answered (feast exonerated, hunger = inflow famine / trail-starvation / thin-pool drain) with the trail-starvation taxonomy as the live open line; the #643 portion-law steve-call and the expedition-recall design question are the named nexts. Nothing today moved the wave-5 wall.
