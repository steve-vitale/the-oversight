# sim-flowrate-b — flow-rate diagnostic instrument (food-economy axis)

Date: 2026-10-17 · Loop: oversight-flesh-out-loop-b · Run: fleshout-loop-b-20261017T0630Z · Worker tree: sim-flowrate-b
Axis: food-economy (scale-wall lens) — the calibration sim-trig6-b's metric review prescribed.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: sim-trig6-b (KILLED/NO-GO, 2026-10-17) proved a stock-triggered drawdown cannot beat a pantry the lever itself keeps filling ("YOU CANNOT DRAIN A PANTRY THE LEVER ITSELF KEEPS FILLING"), and its metric review prescribed that future drawdown arms must (a) pre-register a volume-sanity check (max theoretical drawdown vs the prize's required delta), (b) consider triggering on FLOW (income rate) not STOCK (pantry size), and (c) score the prize as rot-per-pantry-kcal (waste rate), not absolute rot. No instrument measures these. This run builds the calibration: a read-only diagnostic on the base substrate.
- **Instrument**: scripts/flowrate-instrument-20261017.js — layered OUTSIDE the proven wasterate instrument (conservation |rel|=0.00% in vivo, sim-wasterate-b). Adds: (1) per-day pantry income-rate attribution (t.inflowByDay; must equal WR's pantryInKcal exactly), (2) per-item provenance tags (_frF/_frS/_frU = flow/stock/unknown units; seed stock tagged at snapshot, inflow tagged by identity-diff incl. merge paths), (3) rot provenance via outer wraps on sweepSpoiled + drawSpoiled (partial-unit aware), in the phantomfood phantomBand pattern (lt100/b100_200/ge200). ZERO game code, ZERO policy changes — pure read + call-through.
- **SUBSTRATE**: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (pre-seat); base courtship policies only (leadfeast/belongfeast). 180d death-aware; dead villages stop (+10d tail max). Assert env up front; SWEEP STOPS on mismatch.
- **SEEDS**: 8 FRESH seeds 4401-4408 × {leadfeast, belongfeast} = 16 runs. Verified fresh: not on the coordinator's banned list (in-script check), not in recent sets (4101-4108 trig6, 4201-4208 banned, 4301-4308 wasterate, 4313, 5103-5104).
- **DIAGNOSTIC GO** (the pre-registered bar): 100% of pantry rot attributed to flow/stock/rounding components on 16/16 runs — rotRounding ≤ 1% of rotTotal per run (the instrument may not hide real rot in rounding), AND the attribution reconciles with the WR books (attrResidual == 0; sweep/desperation/day parities == 0). COMPLETENESS: conservation |rel| ≤ 3% on all 16 (WR method).
- **DELIVERABLES**: (1) per-day pantry income-rate distribution; (2) rot decomposed flow/stock/rounding (+ bands); (3) rot-per-pantry-kcal baseline; (4) max-theoretical-drawdown volume table for flow-trigger thresholds X ∈ {250..16000}.
- **GUARDRAILS** (diagnostic — no lever, but the substrate must look sane): national ≥ 10/16 pooled; no crash; instrument errors 0; wrap failures none.
- **Measure every run**: win rate, national/table reach, Arc reach, wave reach 1-5, four-realm formation, median/max survival, death-cause shares.
- **Det-gate**: bit-identical 40d reruns WITH the instrument before the sweep (r27 rule); SMOKE=1 honesty gate.
- **Metric-review note (§14)**: this is a diagnostic, not a lever — the GO bar is attribution completeness, not an outcome. A miss means the instrument is dishonest (NO-GO), never re-scored.

## Proof results (run BEFORE any sims)

scripts/test-flowrate-20261017.js — PROOF GREEN on 3 seed-shifts (4401, 4501, 4601), 31 checks:
- R1 read-only: instrumented 40d run byte-identical to clean (n=40/40 day-hashes). RED foil: a kcal-adding probe on the live stockSurplus funnel breaks identity from day 3 — the comparison discriminates. (First foil attempt probed depositPantryPieces — 0 calls/40d, a dead path on this substrate; repointed to stockSurplus, 290 calls/40d.)
- R2/R3: seed stock tagged stock (n=5 pantry items); new deposits tagged flow; stockSurplus merge credits added units as flow (dF=dU=5).
- G1: rot attribution exact on fixtures (stock 300 / flow 400, rounding 0, sweep parity 0).
- G2: per-day inflow exact (d5=600, d6=700; inflowDayAttributed == pantryInKcal == 1300).
- G3: drawSpoiled partial-unit attribution follows the tag ratio (160/240 on a 2:3 mixed stack; desperation parity 0).
- G4 (RED-pin for the GO bar): an untagged spoiled item lands in rotRounding (300) and bumps rotUntaggedItems — gaps are detected, never hidden.
- G5: 15d live run — conservation rel=0.00%, all parities 0, no wrap failures, no instrument errors.
- G6: band decomposition exact and sums to the attributed total.

## Sweep results

16/16 runs, no crash, SMOKE green, det-gate green (re-verified after re-launch; see infra note).

**DIAGNOSTIC GO: GREEN.** roundingShare max = 0.000% (≤1% bar) on 16/16; attrResidual == 0 exact; all FR-vs-WR scan parities 0; conservation |rel| max = 0.000% (≤3% bar); zero instrument errors; zero wrap failures. Every rotted pantry kcal is attributed.

Infra note: the first full-sweep launch (SMOKE+DET green, 3/16 runs done) was killed at ~07:15 UTC by a service restart that wiped /tmp and took the background session with it (AGENTS.md lesson re-applied: logs now live under ~/workspace/flowrate-logs/). The 3 completed per-seed JSONs survived (in-repo evidence dir). Re-launched the remaining 13 runs with SKIP_DET=1 (det-gate already green twice on this code+seed — documented, not skipped blind).

### (2) Rot decomposition — the headline

Pooled 7,607k pantry rot = **flow 100.0% + stock 0.0% + rounding 0.00%**. 15 of 16 runs show literally 0 kcal of stock rot; the single exception (leadfeast/s4405) shows 0.2%. Untagged items: 0 on all runs.

The mechanism is the fresh-first draw: the nightly meal eats soonest-spoiling first, and the oldest food in the pantry is always the seed stock — so the stock is eaten long before it can rot. Everything that rots arrived during the run and sat past its spoil clock. **Rot is a FLOW problem, not a STOCK problem.** This confirms the trig6 prescription at the mechanism level: a stock-triggered drain (fd > 6) fires on pantries whose rot comes from inflow, not from the stock it measures — the trigger watches the wrong variable.

Bands (phantomfood pattern): ge200 = 7,600k over 2,079 items (99.9% of rot); b100_200 = 6k/42 items; lt100 = 1k/12 items. Rot is bulk-item rot, not crumb evaporation — the ≤500-kcal piece split is not the rot driver.

### (1) Income-rate distribution

2,293 run-days, 99.2% with income. Median 6,185 kcal/day; p25 3,750; p75 10,488; p90 15,658; p95 19,423; p99 25,659; max 42,180. Income is bursty but near-daily — the pantry is fed by a constant stream of small-to-medium hauls, not rare windfalls.

### (3) Waste-rate baseline

Pooled mean 30.0%, median 31.7%, range 0.8–68.7% (n=16). Independent agreement with sim-wasterate-b's 32% mean on different seeds (4301-4308): the ~1-in-3 floor is substrate, not policy, not seed set. Paired leadfeast−belongfeast diff: dbar=+12.45pp, SE=6.79pp, |dbar|/SE=1.84 < 2 → SUBSTRATE-FLAT per the wasterate-b verdict rule (replicates).

### (4) Max-theoretical-drawdown volume table

For a flow-triggered honest drain (trigger: income-rate > X kcal/day). Reference: median rot/run = 464k.

| X (kcal/d) | triggerDays med | surplusOnTrigger med/run | pooled surplus vs pooled rot |
|---|---|---|---|
| 250 | 159 | 1,198k | 225% |
| 500 | 158 | 1,161k | 218% |
| 1,000 | 155 | 1,082k | 203% |
| 2,000 | 147 | 930k | 175% |
| 4,000 | 121 | 633k | 126% |
| 8,000 | 59 | 249k | 62% |
| 16,000 | 6 | 15k | 13% |

Reading for the next arm's pre-registration: at X ≤ 4,000 the honest-drain volume exceeds the median rot — the volume-sanity check passes with headroom. At X=8,000 the median drainable surplus (249k) is ~0.5× the median rot — marginal, and the p10 (31k) is negligible. At X=16,000 the trigger almost never fires (median 6 days/run) — no coverage. **A flow-triggered drawdown needs X in the ~2,000–8,000 band to have both engagement and volume; above ~8,000 the prize is unachievable by construction** (the same class of error that killed trig6's 0.75× bar).

Caveat (heterogeneity): the p10 column is the poor-run bound — s4408-type trajectories (starving at 46d/36d) have near-zero surplus. A flow drain needs a starvation guard or it taxes villages that are already hungry. The volume table is a ceiling, not a target.

## Wall numbers (every run)

| side | n | national | table | wins | w4 | w5 | median | max | starvation |
|---|---|---|---|---|---|---|---|---|---|
| leadfeast | 8 | 7/8 | 7/8 | 0/8 | 1/8 | 0/8 | 142.0d | 167d | 6 |
| belongfeast | 8 | 6/8 | 6/8 | 0/8 | 0/8 | 0/8 | 178.0d | 182d | 5 |
| pooled | 16 | 13/16 | 13/16 | 0/16 | 1/16 | 0/16 | 161.0d | 182d | 11 |

Exiled: 0. Arc2 16/16, arc3 16/16, arc4 13/16. Four-realm: 0/16. Guardrail national ≥ 10/16: PASS (13/16).

Death-cause shares (pooled, 765 deaths): combat 62.2%, villager combat 17.4%, monster 7.9%, sickness 3.5%, expedition 2.7%, contest 1.7%, "a wound that wouldn't close" 1.4%, starvation 1.4%. Combat dominates; starvation is rare (11/765).

The scale wall is untouched on this substrate (pre-seat): villages reach national/table but never win; wave 4 unlocked once (leadfeast/s4403, day ~141); wave 5 never. Consistent with every recent pre-seat census.

## Village assessment (plain words)

Sixteen villages, eight of them twinned by seed. The belongfeast twins mostly lived longer (three survived the full 182 days; median 178d vs 152.5d) and rotted less per run, but the waste-rate verdict says that's noise, not policy.

Two villages tell the two stories of this economy. On s4404-leadfeast the village got rich and stayed rich: 2,063k kcal flowed in over 143 days, the nightly meal couldn't keep up, and 1,529k rotted — a 68.7% waste rate, the highest measured. The village didn't starve (0 starvations); it drowned in surplus. On s4408 (both policies) the mirror: the pantry hit zero, 5 villagers starved by day 46 (leadfeast), rot was 2k — nothing sat long enough to rot. Same substrate, same policies; the difference is the land's generosity on those seeds. A drawdown lever that can't tell these two villages apart will tax the starving one.

The s4404/s4405-leadfeast pair (68.7%/64.2% waste) also shows the trig6 "rich get richer" dynamic from the other side: these villages are so productive that even perfect eating leaves most of the inflow to rot. The rot isn't a stockpile problem — it's the spoil clock (freshDay = day+3) outrunning consumption on a 6k-median daily income.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

60d sense probe on leadfeast/s4403 (the wave-4 village), 1,170 food beats captured. **PASS** — the economy narrates honestly:
- Knowledge gating holds on rot: the scholar's pack rot names "unknown nuts" / descriptor-style plants ("dusty-green diamond leaves with white mealy underside") — "if you don't know, it doesn't show," even in loss.
- The pantry spoil voicing condenses correctly after the first teaching ("The village threw out spoiled stores: Foraged food. (pantry)").
- Villagers already modulate intake against the pantry: "Nancy checks the pantry before heading out — the shelves are full, ~12 days of fresh on hand… leaves the forage standing and turns to the wood run instead. The pantry can't take more; the wild will keep." A flow-aware stand-down exists in the village agency — the harvstop-b sibling arm is formalizing observed behavior, not inventing it.
- Trust-gated rations read socially ("Half ration — they don't trust you yet."), and forager returns name person-descriptors, not IDs.

One narration finding filed (not chased): day-1 "⚠ STARVING: health and energy falling. The spiral has started." fires while the village is still establishing — the spiral framing on day 1 reads as alarm where the fiction is just an empty stomach. Filed in sim-findings.md.

## Blanks filled / documented

- **FILLED (instrument)**: the calibration sim-trig6-b's metric review prescribed now exists — scripts/flowrate-instrument-20261017.js (+ proof, sweep, analyzer). Future drawdown arms get: per-day income-rate distribution, rot(flow) vs rot(stock) decomposition, rot-per-pantry-kcal baseline, and the max-theoretical-drawdown volume table for their pre-registered sanity check.
- **FILLED (finding)**: rot is 100.0% flow-driven on the base substrate (fresh-first draw eats the seed stock before it can rot). The trigger variable for drawdown work is income rate, not pantry stock — measured, not argued.
- **FILLED (finding)**: the volume table's operating band — X ∈ ~2,000–8,000 kcal/day has both engagement and volume; above ~8,000 the prize is unachievable by construction; below ~2,000 the trigger fires ~daily (not a trigger, a tax).
- **DOCUMENTED (finding)**: waste-rate floor replicates — 30% mean here vs 32% in sim-wasterate-b on different seeds; paired policy diff SUBSTRATE-FLAT (replicates). The rot line stays parked.
- **DOCUMENTED (design note)**: the village agency already does flow-aware forage stand-down in-beat (Nancy, d33) — harvstop-b should wire to that existing behavior, not bolt on a parallel one (root-cause-first: question what exists).
- **DOCUMENTED (metric)**: paired waste-rate diffs are noisy (±35pp swings on rich seeds) — future waste-rate primaries need the volume-sanity check even when the metric is right, because trajectory divergence swamps small levers.

## Metric review (§14)

- The DIAGNOSTIC GO (100% attribution: roundingShare ≤ 1%, attrResidual == 0, all parities 0, conservation |rel| ≤ 3%) is GREEN on 16/16 — max roundingShare 0.000%, max |rel| 0.000%. No re-scoring was needed; the bar was met as written.
- Metric lesson for the next arm: the volume table shows that a 0.75×-style absolute-rot bar is achievable only if the arm's max theoretical drawdown (from this table at its trigger X) exceeds 25% of the typical rot (464k median). Pre-register the check as: `surplusOnTrigger_p10(X) >= 0.25 × medianRot` — p10, not median, because the prize must survive poor runs. (trig6's bar failed this test: its ~80k max drawdown was <15% of typical rot.)
- The guardrail "national ≥ 10/16" passed (13/16) — no substrate anomaly on the fresh seed set.
- One metric-review note on the instrument itself: the "stock" component is ~0 by mechanism (fresh-first), not by luck — on a substrate where the draw order changes, the decomposition could look very different. The instrument measures; the interpretation belongs to the substrate.

## Convergence state

**converged** (diagnostic). The instrument is proven honest (31-check proof × 3 seed-shifts + RED foil), the GO bar is green on 16/16 runs, and all four calibration products are delivered. The food-economy axis itself is not converged — but the next drawdown arm now has its calibration. Recommended next: sim-harvstop-b (this run's sibling arm) consumes the volume table for its pre-registration.
