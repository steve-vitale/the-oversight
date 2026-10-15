# SIM-BELONGFEAST — belong-road feast verb instrumented (loop B, food-economy)

Date: 2026-10-15 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-belongfeast
Axis: food-economy (scale-wall lens) — claims sim-findings #259 (THE STARVATION CHANNEL IS NOT THE FLOOR ALONE).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: sim-overdrawfloor was KILLED AT PILOT on the starvation guardrail (1→8 vs ≤3), the elevation belong-road-concentrated (1→7; lead 0→1). The belong road has no primary-haven links, so the aid verb never fires there — the FEAST is its only drawdown verb and the remaining suspect. #259's named next: "instrument the belong-road feast verb directly, not add more gates to the drawdown." This is an INSTRUMENT-ONLY diagnostic arm: it does not try to fix the elevation, it answers GUILTY or INNOCENT for the belong-road feast verb.
- **Instrument**: the overdrawfloor fresh-first drawdown layer rebuilt from the preserved spec (evidence/2026-10-15/sim-overdrawfloor-b.md) as scripts/policies/overdrawfloor.js (OVERDRAWFLOOR=1, default OFF; named exports overleadfloor/overbelongfloor + maxDrawdownKcal/burnAt/preDraw), run on belongseek with per-villager meal telemetry (scripts/sharcensus-20261014.js pattern) + per-feast drawdown event logging (day, kcal, pantry fresh-days before/after). Starved villager-days (ate < 0.6×need, the engine's own starvation branch condition) are attributed to feast-proximity windows (≤3d after a feast drawdown) vs the census cause classes (empty-pantry, spoiled-insufficient, crumbs-left, away-pack-empty/short, other-short).
- **PRIMARY** (diagnostic): share of starved villager-days carrying a DETERMINED cause class (anything except the 'other-short' residual). GO threshold: ≥ 80% determined AND a feast-proximity × starvation breakdown that answers #259. A miss is NO-GO per §14, never re-scored. If 0 starved villager-days occur, the question is unanswerable → INFO-SKIP (exit 0), not a verdict.
- **SECONDARY**: starvation deaths armed vs control (the breached guardrail), hungryDays, feast event counts/kcal, wall numbers (national/table/wins, wave 4-5 reach, median survival), death-cause shares.
- **Horizon**: 180d death-aware (pacing-law max); the elevation appeared on this horizon in the overdrawfloor pilot. Dead villages stop (+10d tail).
- **Seeds**: 11/22/33/44/55/66/77/88 × belongseek, IDENTICAL seeds control vs armed. Control = belongseek (layer off), armed = overbelongfloor (OVERDRAWFLOOR=1). Own control in the SAME sweep — never inherit a baseline. Control RE-MEASURED on current tip (#247).
- **Det-gate**: 16 combos (8 seeds × 2 sides) bit-identical before trusting comparisons (r27 rule); SMOKE=1 instrument-honesty gate (named-export unwrap + live drive check) both sides.
- **Proof**: scripts/test-belongfeast-20261015.js — RED (R1 gate-off byte-identical, R2 gate-off instrument inert, R3 control parity) + GREEN (G1 feast fires on the belong road + honest event log + cause after the engine beat, G2 rigged feast-then-starve: a REAL villageEats starves a villager and attribution fires feast-proximity, far starvation keeps its own class, G4 armed determinism). All green pre-sims, independently re-run. The preserved-spec proof scripts/test-overdrawfloor-20261015.js (R1–R3, G1–G12) also green against the rebuild.

## Proof results

(pre-sims, independently re-run — full transcripts in the log)

**This arm's proof** (scripts/test-belongfeast-20261015.js):
- RED (gate off): R1 overbelongfloor == belongseek byte-identical 40d (n=40/40); R2 no verbs/cause-lines/feast-events on the overstock fixture; R3 control parity (no feast, no events).
- GREEN (OVERDRAWFLOOR=1): G1 feast fires on the belong road (osFeasts=1, 5000 kcal, event {day:30, kcal:5000, fdBefore:6.27, fdAfter:6.06}, cause line AFTER the engine feast beat, 3-day floor respected); G2 rigged feast-then-starve — a REAL villageEats on the drained pantry starves a villager (Raj, d31) and attribution fires feast-proximity, while a far-from-feast starvation keeps its own class (empty-pantry); G4 armed determinism 40d×2 bit-identical.
- **Preserved-spec proof** (scripts/test-overdrawfloor-20261015.js) against the rebuild: R1–R3 RED green, G1–G12 GREEN green — the rebuild is verb-for-verb with the killed arm's spec (aid 1500 kcal fresh-first, 3-day floor, fragility gate 4 sub-tests, siege gate 3 sub-tests, pre-draw rollback, aid>feast both orders, tribute untouched, fresh-first ordering A 96→93).

**Method gates**: det-gate 16/16 bit-identical (8 seeds × control + 8 seeds × armed, 40d); SMOKE=1 instrument-honesty green both sides (named-export unwrap + live drive check).

**Process note (honest)**: the first full sweep ran WITHOUT `OVERDRAWFLOOR=1` in the environment — the armed side's layer gate was off and the run measured control twice (armed == control byte-identically, feasts=0). Caught by a debug run (seed 22 fired 3 feasts with the env var set), the invalid data was discarded (never reported as results), and the sweep was re-run properly per side (control without the var, armed with it), identical seeds. The SMOKE gate does not catch this class of error — it verifies the policy object drives, not that the env-gated layer inside it is live. Future env-gated arms should assert a layer-live marker (e.g. a ctx flag after the first armed daily) in the sweep itself.

## Sweep results

8 seeds × belongseek, 180d death-aware, identical seeds both sides. Control = belongseek (layer off); armed = overbelongfloor (OVERDRAWFLOOR=1).

| metric | control | armed | pre-reg |
|---|---|---|---|
| starved villager-days | 25 | 37 | — |
| determined share (**PRIMARY**) | 1.000 | **1.000** | **GO** (≥ 0.80) |
| feast-proximity (≤3d) starved VD | 0/25 | **0/37** | — |
| feast events (drawdowns) | 0 | 28 (73.7k kcal) | mechanism fires |
| starvation deaths | 5 | 6 | guardrail ref (≤ 7) |
| hungryDays | 18 | 25 | — |
| starved-VD cause classes (armed) | — | empty-pantry 22, spoiled-insufficient 7, away-pack-empty 5, away-pack-short 3, other-short 0 | — |
| starved-VD cause classes (control) | away-pack-short 4, away-pack-empty 5, empty-pantry 12, spoiled-insufficient 4, other-short 0 | — | — |
| siege-gate holds / fragile-holds | 0 / 0 | 0 / 0 | — (see blanks: holds not counted on the feast path) |
| national | 4/8 | 2/8 | — |
| table | 0/8 | **4/8** | — (feast-as-table-door, 7th replication) |
| wins | 0/8 | 0/8 | — |
| wave-4 / wave-5 | 2/8 / 0/8 | 3/8 / 1/8 | — |
| median survival | 106d | 106d | — |

Per-seed (armed): s11 0f/2VD/1☠, s22 3f/4VD/1☠, s33 0f/11VD/1☠, s44 12f/1VD/0☠, s55 0f/0VD/0☠, s66 8f/2VD/1☠, s77 5f/12VD/1☠, s88 0f/5VD/1☠. (f = feasts, VD = starved villager-days, ☠ = starvation deaths.)

**Lag analysis** (the #259 answer): 28 feasts fired; starved villager-days sit at lags 4d (1), 15–44d (4), 19–28d (12), 24–25d (2) after the nearest feast — or with NO feast at all in the run (18/37: s11, s33, s88 fired zero feasts). Reversed: 27/28 feasts have ZERO starved villager-days in the following 14 days; the single exception (s44 d75) is followed by 1 VD at +7d on the suite's healthiest run (180d survived, 0 starvation deaths). Feasts fire on deep pantries (fdBefore 5–32, median ~10+) and respect the 3-day floor (min fdAfter 3.39).

**Verdict: PRIMARY GO — and #259 is ANSWERED: the belong-road feast verb is INNOCENT.** No proximate feast→starvation channel exists in 28 drawdowns: 0/37 starved villager-days within the pre-registered 3d window, the starvation that occurs is genuine-shortage starvation (the pantry is actually empty when villagers starve — transcript-confirmed), distributed across feast and feast-free runs alike. The small elevation (25→37 starved VD, 5→6 starvation deaths, 18→25 hungryDays) sits inside the guardrail (≤ control+2 = 7) and carries the perturbation signature (#223): 4 seeds byte-identical (0 feasts), 2 better for armed (s44 survived 180d vs died 156d; s66 lived 128d vs 103d), 2 worse (s22, s77). The feast's RNG footprint (broadcast beats, guest rolls) moves trajectories; the kcal removal (~1.5–5k from 100k+ pantries, ~2–5%) does not starve anyone.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed s77 (the worst divergence): the feast beats read as a village celebrating real surplus — "🍖 FEAST 📺 — Valentina opens the pantry wide: 8× Foraged food… eat until the fire burns low. Somebody laughs so hard they cry. For one evening, nobody is surviving — they're just together. (−3,696 kcal from the pantry)". The layer's cause line follows the engine beat honestly ("🍖 The shelves groan — ~N days of fresh on hand, and the rot is already circling. We eat the mountain tonight, or it eats itself."). The mid-game hunger (d40: "The bins are echoing. We vote half rations") happens with ~24–34 days of fresh ON THE SHELVES — the meal beat says why: "Village meal: +1050 kcal… (Half ration — they don't trust you yet.)" Villagers go hungry while the pantry is full because distribution is trust-throttled — a DISTRIBUTION starvation channel, not a quantity one, and nothing to do with the feast. The end-run starvation (d115+: "⚠ Haven's pantry is empty. Day 1 of hunger.", "💀 Aisha starved. Slowly. The village is 7 now.") is genuine empty-pantry starvation 19+ days after the last feast. Nothing reads robotic; the village narrates its own tightening and its own end.

**PASS.**

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 4/8 | 0/8 | 0/8 | 2/8 | 0/8 | 106d | 180d |
| armed | 2/8 | 4/8 | 0/8 | 3/8 | 1/8 | 106d | 180d |

Exiled: 0 everywhere (not tracked this run — no exile signal in the suite). The scale wall is not broken by this arm. The feast-as-table-door secondary is now 7× replicated (armed 4/8 vs control 0/8).

## Death-cause shares

Control (107 deaths): combat 64 (60%), villager combat 10 (9%), sickness 10 (9%), monster 6 (6%), contest 6 (6%), starvation 5 (5%), wound 4, lockjaw 1, Buffering 1. Armed (59): combat 26 (44%), villager combat 9 (15%), sickness 9 (15%), starvation 6 (10%), monster 2, contest 4, wound 2, Buffering 1. No new death mode. Note: armed combat deaths fell 64→26 — the feast's FEASTED buff ("strikes & abilities uplifted, devotion ×1.5") is a real combat mechanism, not just perturbation; the scholar fights better the morning after.

## Village assessment (plain words)

Eight villages on the belong road, each measured twice — once with the feast verb live, once without. Four villages never feasted at all (their pantries never cleared the contribution bar) and lived byte-identical lives both ways. Four feasted: one feasted twelve times on a deep pantry and lived the full 180 days, healthier than its twin; one feasted eight times and outlived its twin by 25 days; two diverged worse, dying 57–79 days before their twins. In none of the 28 feasts did anyone go hungry at the table's aftermath: the starved villager-days sit weeks after the feasts or in villages that never feasted, and when the census says "empty-pantry" the transcript agrees — "Haven's pantry is empty. Day 1 of hunger." The feast is innocent. What the instrument found instead, mid-read: a village voting half-rations with a month of food on the shelves, because the meal ladle is trust-throttled — "Half ration — they don't trust you yet." Hunger with full shelves is a distribution story, and it's filed below as a new finding. The belong road's starvation is genuine shortage plus that distribution throttle; the feast verb is not the channel.

## Blanks filled / documented

- **FILLED (instrument)**: the rebuilt overdrawfloor layer — scripts/policies/overdrawfloor.js (OVERDRAWFLOOR=1, default OFF; named exports overleadfloor/overbelongfloor + maxDrawdownKcal/burnAt/preDraw; the preserved spec verb-for-verb incl. 3-day floor, fragility gate, siege gate, fresh-first pre-draw + rollback, aid>feast priority, cause-lines-after-confirmed-verbs, __odfSink attribution). Proof scripts/test-belongfeast-20261015.js (RED: gate-off byte-identical/inert/parity; GREEN: feast fires + honest event log, rigged feast-then-starve attribution fires on a REAL villageEats, far starvation keeps its class, armed determinism) + the preserved-spec proof scripts/test-overdrawfloor-20261015.js (R1–R3, G1–G12, independently re-run). Sweep scripts/measure-belongfeast-20261015.js (SMOKE gate, share census, feast-event log, say-beat transcripts, per-seed JSONs with row-level attribution) + scripts/compare-belongfeast-20261015.js + det-gate scripts/det-gate-belongfeast-20261015.js (16/16). Evidence + per-seed JSONs + transcripts under evidence/2026-10-15/. Zero src/js changes (policy-side only).
- **DOCUMENTED (instrument gap)**: the sweep's osGateHeld/osFragileHeld counters only increment on the AID path — the feast candidacy returns null on a held gate without counting it (0/0 this run may undercount gate activity on feast-eligible days). A future instrument should count holds on both paths.
- **DOCUMENTED (process)**: the first sweep ran without OVERDRAWFLOOR=1 and measured control twice (data discarded, never reported). The SMOKE gate verifies the policy object drives, not that an env-gated layer inside it is live — future env-gated arms should assert a layer-live marker in the sweep.
- **DOCUMENTED (new finding)**: trust-throttled half-rations — villagers go hungry with 24–34 fresh-days on the shelves ("Half ration — they don't trust you yet") — filed to sim-findings.
- **DOCUMENTED (secondary)**: feast-as-table-door 7th replication (armed 4/8 vs control 0/8); FEASTED-buff combat effect (combat deaths 64→26).

## Metric review (§14)

1. **PRIMARY GO: determinedShare = 1.000 ≥ 0.80 on the armed side, and the feast-proximity × starvation breakdown answers #259 (INNOCENT).** 37 starved villager-days, 0 in the 'other-short' residual, 0/37 within 3d of a feast drawdown.
2. **The 3d window was the pre-registered proximity definition; the wider lag analysis confirms the verdict is robust to the window choice** — at 14d only 1/28 feasts is followed by any starvation (1 VD, on the healthiest run), and the end-run starvation sits 19+ days after the last feast with a genuinely empty pantry. No re-scoring was needed or done.
3. **The elevation (25→37 starved VD, 5→6 starvation deaths) is real but inside the guardrail (≤ control+2 = 7) and carries the perturbation signature**, not a harm channel: the feast's kcal removal is ~2–5% of deep pantries, and the s44 counter-example (12 feasts, 35.9k kcal, 180d survived, 0 starvation deaths) shows heavy feasting coexisting with health. Per §14 the guardrail is reported, not re-scored.
4. **A long-lag indirect channel (feast thins surplus → later lean period) cannot be excluded by proximity alone**, but the feast sizes make a 19d-later causal link implausible and no such pattern appears in the lag histogram (lags are flat at 15–44d, not clustered at a plausible depletion horizon). Recorded as a review note, not a re-score.

## Convergence state

food-economy: **diagnostic GO** (sim-belongfeast). Sim-findings #259 ANSWERED: the belong-road feast verb does not drive the starvation elevation — 28 drawdowns instrumented, 0/37 starved villager-days in feast proximity, starvation is genuine-shortage (empty-pantry/spoiled-insufficient/away-pack) across feast and feast-free runs alike. The overdrawfloor lineage's starvation channel remains unidentified, but the feast is eliminated as the suspect; the remaining candidates are perturbation-amplified shortage and the trust-throttled distribution channel (new finding, filed). prodthrottle (landed) remains the only landed rot lever. The feast-as-table-door secondary is 7× replicated (already claimed #226).

