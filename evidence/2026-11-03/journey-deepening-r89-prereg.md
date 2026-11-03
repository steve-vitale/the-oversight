# Journey leg: DEEPENING (days 40–80) R89 — "MONSTER MEAT TO DINNER" — 2026-11-03

## Pre-registration (written BEFORE any seed runs)

Rotation read 2 (deepening) at run start; r89 plays deepening, writes 2->3
at closeout. Base: master at worktree creation (recorded in run note).
Policy: competent (pinned, r88 driver lineage). Seeds: fresh 93201–93204
(fresh-band check before the main run; r88 used 93101–93104, r87 93001–93004).
Horizon: DAYCAP=100, death-aware stop. Smoke seed 93200 (outside the main
band) x DAYCAP=45 proves instruments before the main run; smoke outputs
deleted after the check.

Context: Steve 2026-10-27 ruled villagers test and cook monster meat —
haul -> reveal -> test -> cook channel. The channel code landed in pieces
through 2026-11-02 (village-cook batch claim, counter-flesh test beat,
use-it-or-lose-it ordering), and the 2026-11-02 ship notes call it live.
But the standing friction is "monster meat still never becomes dinner."
This run is a WILD check of the whole chain under natural competent play
in the deepening window (waves 2–3, where monster kills actually happen),
not a re-proof of any single ship item. It does NOT re-run r87/r88 metrics.

## Leg question

Under natural competent play in the deepening window, does monster meat
complete the chain from kill to dinner — and if it stalls, at which stage?

Chain stages (instrumented, harness-only wraps/reads, zero gameplay effect):
  KILL: monsterMeatEntry calls (a carcass exists on a corpse).
  HAUL: meat_* items in scholar inventory / village pantry / prep counter
    at deed checkpoints (50/70/85/100) and seed end, by foodState.
  TEST: villagerExperimentBeat before/after diffs on codex.monsters
    foodSafe / foodTested (a tester tried it, safe or poison verdict).
  REVEAL: markMonsterFoodSafe calls (how: tested / other).
  DINNER: trackMealExposure draws of a meat_* item at a village meal
    (foodState + cooked flag recorded per draw).

## Binding metrics (NO-GO never re-scored; revisions go to "metric review")

- MEAT-DINNER — GO iff >=1 trackMealExposure draw of a monster-gated
  meat_* item on >=1 seed. The draw is dinner served, not a promise.
- MEAT-STAGE (diagnostic, always reported even on a dinner GO): per-seed
  counts KILL / HAUL / TEST / REVEAL / DINNER. A 0 at any stage is reported
  with its denominator (e.g. kills with no haul, hauled items with no test)
  before any defect claim: a stage with no opportunity is not a broken stage.
- M4 people — >=10 transcripts sense-read (days 45/60/80), 0 senseless.
  Bar: the NPC wants something, options engage or deflect it, endings
  resolve/plant/owe; no fabricated shared history, no filler loops.
- M5 winnable (descriptive, not a gate) — villages alive at end.
- STAY-GREEN: death-honesty mislabels == 0 (deadCheck at checkpoints).

## What would count as interesting

- A monster-meat dinner draw with its foodState cooked in the log.
- A test-beat verdict (safe or poison) landing on a monster id the
  village actually killed, with the tester's name in a capture.
- A stall with a clear stage: e.g. carcasses created but never hauled
  (loot action never taken), hauled but never tested (beat never sees
  counter flesh), tested-safe but never drawn at a meal (pantry order).
- Any stage that fires only for animal meat, never monster meat.

## Fix gate

A fix is pursued only if a stall stage shows a code defect (not a policy
artifact: the competent bot's choices are the player's choices here, so a
bot that never loots is a coverage limit, reported as such, not a game
fix). Any fix ships a before/after proof test in scripts/test-*.js and
re-runs the affected seeds.

## Harness

scripts/journey-deepening-r89-20261103.js (r88 lineage: policy, convo
picker, census, deed checkpoints byte-identical except filenames, seed
band, EVIDIR date, and the meat instruments below). Analyzer:
scripts/analyze-journey-deepening-r89-20261103.js. Proof:
scripts/test-journey-deepening-r89-instruments-20261103.js (static marker
checks + analyzer verdict fixtures; live smoke run separately).

Meat instruments (harness-only):
- monsterMeatEntry wrap: {day, mid, kcal}.
- markMonsterFoodSafe wrap: {day, mid, how}.
- villagerExperimentBeat wrap: codex.monsters foodSafe/foodTested diff.
- trackMealExposure wrap: {day, plantId, foodState, cooked} for meat_*
  items only.
- meatCensus() at deed checkpoints + seed end: meat_* items by container
  (inventory / pantry / counter) x foodState, plus foodSafe id set.

## Metric review

(empty at pre-registration; filled only if a metric proves wrong mid-run)
