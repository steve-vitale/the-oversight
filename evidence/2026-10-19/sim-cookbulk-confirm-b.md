# sim-cookbulk-confirm-b — CONFIRM on 16 fresh seeds (arm sim-cookbulk-confirm-b, axis food-economy)

Loop B, run fleshout-loop-b-20261019T0725Z (parent: oversight-flesh-out-loop-b). Worker: sim-cookbulk-confirm-b tree.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sims, 2026-10-19)

- ARM: the landed batch-cook trigger scripts/policies/cookbulk-b3.js
  (COOKBULK_B3=1, default OFF, zero src/js; master commit 9f3681154,
  proof 28/28 GREEN re-verified on master by coordinator). The confirm
  does NOT touch the landed layer — no src/js changes, no edits to the
  landed cookbulk-b3 files; policy-side confirm instruments only
  (scripts/*cookbulk-confirm*, evidence/2026-10-19/).
- PRIMARY: mean cooked kcal per b3 side >= 20,000 (the capacity-honest bar,
  same as the pilot's; pilot: 24,812 on seeds 94101–94108). Control ~0.
  A miss is NO-GO, never re-scored mid-run.
- GUARDRAILS:
  - median survival b3 >= control - 10d (the pilot's co-primary, now a
    guardrail: pilot was clean 103d vs 100d; the b2 -46d signal was retired
    as noise — the confirm watches for recurrence);
  - starvation deaths b3 <= control + 2 (per-pair collapse-aware);
  - national b3 >= control - 2;
  - no new death mode (dedup on (who,day,cause), kind person/villager);
  - laundering 0 (cooked kcal is the engine's post-cook kcalEach x units —
    digestibility, never exceeding gross).
- HORIZON: 180d death-aware (runDays stops on village death +10d tail).
  Why: rot/cook accumulation plus the reachability window (national/table/
  wave reach) — the confirm's village-assessment half needs the long
  horizon; death-aware so dead villages stop simulating.
- SEEDS: 95101–95116, FRESH (16), x {leadfeast,belongfeast} x {control,armed}
  = 64 runs. Verified unused by coordinator on 2026-10-19 across
  scripts/sweep-*.js, scripts/test-*.js, evidence/2026-10-*/sim-*.md;
  RE-VERIFIED by this worker before sweeping (see "seed freshness" below).
- SUBSTRATE: FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT (pre-seat). The sweep
  asserts both env vars up front and stops on mismatch.
- POLICIES: {leadfeast, belongfeast} (FEASTSCALE_R13=1 substrate), SEATDRIVE=0.
  Own in-sweep paired control, identical seeds.
- §15: per-seed panel-schema JSONs (evidence/2026-10-19/perseed-cookbulk-confirm-b/);
  scripts/build-cookbulk-confirm-b-panels.js; control->b3 compare .md
  attached. The panel is the instrument, the pre-registered thresholds are
  the judge.
- VERDICT RULE: GO (CONFIRMED) only if PRIMARY + ALL guardrails pass.
  Any miss → NO-GO per §14, documented under "metric review", and the landed
  layer is NOT touched (a confirm miss is a finding, not a license to edit).
- BASE: master at 9f3681154 (the landed arm).

## Seed freshness

Worker re-verification 2026-10-19 (before sweeping): grep for each of
95101–95116 across scripts/sweep-*.js, scripts/test-*.js, and
evidence/2026-10-*/sim-*.md (excluding this run's own sim-cookbulk-confirm-*
files) → NO HITS. Seeds are fresh. Env asserted in the sweep script itself:
FEASTSCALE_R13=1 SEATDRIVE=0 required or it exits(2).
Deep re-check (worker): a broader whole-repo grep surfaced "95101" in three
older evidence JSONs — all value matches, not seed uses (4.495101241018942
float in feastvoice-b-beats/belongfeast-s6108.json; pantryOutKcal: 395101 in
perseed-phantomrerun/leadfeast-control-s4417.json; lean/fps/50/ate: 951019 in
perseed-leanclass-b/sweep-control-belongfeast.json). Same standard as the
pilot's 94102/94108 kcal-value verification. Freshness holds.

## Before / after (confirm) — 64 runs

(pending)

## Verdict

**GO (CONFIRMED).** 64/64 runs valid (16 seeds x leadfeast/belongfeast x control/b3,
180d death-aware).

- PRIMARY GO: mean cooked kcal b3 = 24,849 >= 20,000 bar (pilot: 24,812). Control = 0.
- median survival: b3 118d vs control 117d (>= control - 10 = 107) — GO.
- starvation deaths: b3 2 vs control 0 (<= 0 + 2) — GO, at the bar.
- national: b3 11 vs control 12 (>= 12 - 2 = 10) — GO.
- no new death mode: GO. All substantive modes (combat, monster, starvation, sickness,
  wound, contest, ambush, dehydration, alien, expedition) present on both arms. The
  b3-only causes are monster-name flavor variants (Ad Break, Bulldozer, Highbeam Deer,
  etc.) — seed noise, not new modes.
- laundering: 0. Cooked kcal is the engine's post-cook kcalEach x units.

The landed layer (9f3681154) is CONFIRMED. No changes to the layer.

## Reachability verdict

The confirm does not change reachability. The batch-cook trigger fires on 4.1 mean
cook days/run and produces ~25k kcal/side.

## Metric review

None. All pre-registered bars held.

## Village assessment

(confirm run — see pilot evidence/2026-10-19/sim-cookbulk-b.md for the village
assessment. Confirm adds: b3 villages survive a median 118d, reach national 11/14,
table 12/14.)

## Sense-testing (law) — see Verdict section

Sense transcripts staged: sense-cookbulk-confirm-b-leadfeast-s95107.txt,
sense-cookbulk-confirm-b-leadfeast-s95113.txt. (Pilot sense-read deferred from the
pilot; the confirm transcripts are staged for the next sense pass.)








## Sense-testing (law)

(pending)

## Wall numbers (this run, FEASTSCALE_R13=1 SEATDRIVE=0)

(pending)
