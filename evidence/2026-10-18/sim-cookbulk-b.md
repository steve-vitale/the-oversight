# sim-cookbulk-b v2 — commons batch-cook layer (loop B, run fleshout-loop-b-20261018T1030Z, axis food-economy)

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE sims)

- PRIMARY: cooked beans/rice kcal per side (mean over 16 pilot sides) >= 50,000
  armed vs ~0 control. (Control never batch-cooks; the 2026-10-17 census
  pinned 0/16 runs, and the v1 pilot confirmed 0 control.)
- GO threshold: mean cooked kcal/side >= 50k across the 8-seed × 2-policy
  pilot (16 sides), with guardrails met. A miss is NO-GO, never re-scored
  mid-run. KILL FAST if the mechanism cannot engage at scale.
- GUARDRAILS (standard): starvation deaths armed <= control+2 (per-pair
  collapse-aware); median survival >= control-10d; no new death mode;
  national >= control-2; no laundering (kcal gains must be honest, not
  accounting artifacts); det-gate byte-identical with gate OFF.
- HORIZON: 180d death-aware (runDays stops on village death +10d tail).
  SEEDS: 9214–9221 (fresh; verified unused — 9214/9215/9217/9218/9219/9220/9221
  matches in evidence/ were kcal values inside s33 JSONs, not seeds; 9216
  zero matches).
- POLICIES: {leadfeast, belongfeast} (FEASTSCALE_R13=1 substrate),
  SEATDRIVE=0 EXPLICIT. Own in-sweep control, identical seeds.
  8 seeds × 2 policies × {control,armed} = 32 runs (pilot).
- PROOF FIRST: scripts/test-cookbulk-b.js — RED-verified, GREEN post-edit;
  det-gate byte-identical gate-off; SMOKE green. (v2 updates the trigger;
  v1 pins kept as regression.)
- §15: per-seed panel-schema JSONs; scripts/build-cookbulk-panels-v2.js;
  scripts/balance-panel.js compare --before/--after; compare .md attached.
  The panel is the instrument, the pre-registered threshold is the judge.
- BASE: 01fd8945 (2026-10-18). The v1 layer (5be97f4f, 2026-10-17) is an
  ancestor; v2 modifies scripts/policies/cookbulk-b.js in place.

## Context

Finding #483's named next (evidence/2026-10-17/sim-camptasks-b.md): the
camp-task census measured 13.8k/lean-day of cookableRaw with ZERO scholar
cook-verb firings. The v1 layer (lean-day-only trigger) landed 2026-10-17
with GO under its own threshold (>=4 firings AND >=1k kcal): 17 firings,
31,866 kcal total across 16 sides (~2k/side, max 13,950/side).

This run's pre-registered bar (>=50k/side) is ~25x the v1 mean. The v1
trigger (lean day + no ready pack food + knowledge + fire + water + time)
fired ~1x/run. A 2026-10-18 engagement census (probe3-cookbulk-b.js, fresh
seeds 9210-9213) showed the scholar is at Haven with fire+water+time on
~110-180 days/run with a 2.3k-7.5k kcal pantry pool — the lean trigger
starves the mechanism. v2 fires on ANY Haven day with a pool >= 1,000 kcal
(commons batch-cooking, not just self-feeding), and drops the hard knowledge
gate (the engine teaches 'cook' on the first blind attempt — food.js
learnTechnique('cook','trial'); canon: "the attempt teaches the technique").

## Canon read

- docs/CANON.md: the ladder cleaned < cooked < smoked < rendered < pemmican;
  "If you don't know, it doesn't show" (knowledge gates surfaces — but the
  engine's cook verb teaches on first attempt, so the layer allows the
  attempt); no silent actions (the engine voices every batch).
- docs/PRESERVATION.md: cooked = 100% known yield, safe, ~5d shelf; cooking
  never destroys calories senselessly (Steve 2026-10-09); smoking pace 16
  ticks (the batch costs an honest 16 ticks via the engine).

## The lever (v2)

`scripts/policies/cookbulk-b.js` (COOKBULK=1, default OFF), `withCookBulk`
wrapper on the scholar upkeep. v2 replaces the v1 `leanCookDay` trigger with
`cookDay`: fires on ANY Haven day where the reachable cookable pool
(pack + prep stash + pantry, Haven stores access) is >= POOL_MIN_KCAL (1000 —
"a pot worth lighting the fire for", 16 honest ticks via the engine's
cookAll). NOT gated on hunger ("a person cooks when there's food to cook
and time to cook it, not only when starving") and NOT gated on "no ready
pack food" (commons batch-cooking, not self-feeding). The hard knowledge
gate is dropped: the engine teaches 'cook' on the first blind attempt
(food.js learnTechnique('cook','trial')), so the scholar learns by doing.
Once-per-day guard; gate-off the layer is inert (det-gate 16/16
byte-identical).

## Proof (scripts/test-cookbulk-b.js) — 27/27 GREEN (v2)

- PART A (gate-logic units, 21/21): v1 leanCookDay pins kept as regression;
  new v2 cookDay pins: not-hungry + 1500kcal pool fires; empty pool / small
  pool (<1000) / not-at-Haven do not; timeToSpare, fire, splitForWater,
  layerOn-OFF, cookPass gate-off inert all hold.
- PART B (RED->GREEN fixture, live engine): RED — base belongfeast upkeep
  leaves counter beans raw. GREEN — wrapped upkeep (COOKBULK=1) batch-cooks
  the 10u bean stack via the engine's honest cookAll (needsCooking cleared,
  safe, kcalEach preserved); firing counted on ctx; once/day guard holds;
  gate-off wrapped leaves beans raw.
- PART C (det-gate): wrapped COOKBULK-unset vs unwrapped base, 60d x 8 seeds
  x 2 policies — 16/16 byte-identical, no layer-attributable divergence.
- PART D (SMOKE): 2 seeds x 2 policies x {control,armed}, 12d — 8/8 no
  exceptions.
- Full log: /tmp/proof-cookbulk-v2.log (transient); evidence log to be
  committed as evidence/2026-10-18/test-cookbulk-b-v2.log.

## Before / after (pilot)

32 runs (8 fresh seeds 9214–9221 × {leadfeast, belongfeast} × {control,
armed}), 180d death-aware, own in-sweep paired control. Per-seed JSONs:
evidence/2026-10-18/perseed-cookbulk-v2/ (32 files).

PRIMARY (binding): mean cooked beans/rice kcal per armed side.

| metric | armed (16 sides) | control (16 sides) | bar | verdict |
|---|---|---|---|---|
| mean cookedKcal/side | **23,570** | 0 | ≥ 50,000 | **NO-GO** |
| per-side cookedKcal | 9,335–43,660 (all 16 sides > 0) | 0 | — | mechanism engages |

v1 comparison: v1 (lean-day trigger) did 31,866 kcal TOTAL across 16 sides
(~2k/side, max 13,950/side). v2 does 23,570/side mean — ~12x the v1 mean,
every armed side cooks. The looser trigger works; the bar was ~25x the v1
mean and v2 reached ~47% of it.

Guardrails (all met):
- starvation deaths: armed 6 vs control 13 (armed ≤ control+2 ✓ — armed
  strictly better; cooked food is safe food)
- median survival: armed 139d vs control 93d (≥ control−10 ✓)
- national: armed 11/16 vs control 9/16 (≥ control−2 ✓)
- det-gate: 16/16 byte-identical gate-off (proof Part C) ✓
- §15 panel: compare attached (cookbulk-panel-v2.md); decision
  review_required. One flag: "Player deaths per run" regression_signal
  (4.375 → 9.125, paired +4.75, 8/8). Note: this counts mantle passes
  (player-character deaths with respawn as another villager), not village
  deaths — village-level starvation and survival both favor armed. The
  flag is recorded but does not change the primary-driven NO-GO.

## Reachability verdict

REACHABLE. The mechanism fires on all 16 armed sides (9,335–43,660
kcal/side); batch-cooking the commons' bulk is reachable in ordinary play
whenever the scholar is home at Haven with a ≥1,000 kcal cookable pool.
The knowledge path is honest: the engine teaches 'cook' on the first blind
attempt, so no scholar is locked out. What is NOT reached is the
pre-registered SCALE (50k/side) — the pool and the fire-time budget cap
throughput well below the bar on this substrate.

## Village assessment

Armed villages cook their bulk instead of letting it sit: 23.6k kcal/side
of beans/rice rendered safe and shelf-stable (~5d) through the engine's
honest cookAll. The food-safety dividend is visible in the guardrails —
armed villages starve less (6 vs 13 deaths) and live longer (139d vs 93d
median) than their paired controls. The scholar becomes the village's
cook by doing, not by prior knowledge. What the villages still lack is
throughput: a single scholar with one fire and 16-tick batches cannot
convert the full 2.3k–7.5k kcal pantry pools the engagement census found
into 50k/side. The bottleneck moved from trigger (v1's lean-day starvation)
to capacity (fire-time per batch).

## Sense-testing (law)

GAP — the committed sense transcript
(evidence/2026-10-18/sense-cookbulk-v2-s9218-leadfeast.txt) is empty (1
line, no content); the worker's 2+ transcript reads were not recorded
before the timeout. The engine voices every batch (no-silent-actions rule;
proof Part B RED→GREEN fixture exercises the voiced path), but no
transcript was preserved for a sense read. A revival run must keep the
transcripts.

## Metric review (mandatory)

The 50k/side bar was set at ~25x the v1 mean (~2k/side) on the theory that
the looser trigger would unlock the full pantry pool. v2 reached 23.6k/side
(~12x v1, 47% of bar) — the trigger was indeed the v1 bottleneck, but
fire-time capacity is the new one: one scholar, one fire, 16 ticks/batch.
Per §14 the bar binds this run (NO-GO stands, not re-scored). For the NEXT
run: either (a) lower the bar to a capacity-honest level (~20–25k/side),
or (b) change the lever to attack capacity (multiple fires, taught
helpers batch-cooking in parallel — the specialist economy the canon
already names), which is the actual binding constraint this run exposed.

## VERDICT

**KILLED — NO-GO at the pre-registered bar.** Mean 23,570 cooked kcal/side
vs bar ≥ 50,000 (control 0). All guardrails met; armed strictly better on
starvation (6 vs 13) and survival (139d vs 93d median). The mechanism
engages on 16/16 sides (~12x v1) but cannot reach the bar on fire-time
capacity. Kill protocol: layer (scripts/policies/cookbulk-b.js) deleted
zero-trace; instruments + evidence landed. Completed 2026-10-18 by the
finisher (run timed out before the worker wrote the verdict; numbers
computed from the 32 per-seed JSONs against the binding pre-registration).
