# sim-vestcounter-b — sweep/panel vest counter blind-spot fix (INSTRUMENT ONLY)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1130Z.
Arm: sim-vestcounter-b — backlog item 2 from sim-vests-b (2026-10-30).
Branch: sim-vestcounter-b (worker never pushes/bumps; coordinator merges).
Scope: INSTRUMENT fix only. No src/js behavior change, no policy-default
flips, no game-code change. The only touched game-adjacent file is
scripts/sweep-compare.js (the standard sweep + balanced-panel instrument);
plus one new proof script and this evidence file.

## Pre-registration (written BEFORE any judged leg; judged exactly as written)

- Primary metric: the balanced panel's per-case `vests` field
  (sweep-compare `stdSnapshot` scholar pack/equipped count, max over the
  run's daily snapshots + end snapshot), rebuilt with the fix on the
  vests-b corpus.
- Ground truth: the sim-vests-b census `vestsSweepMax` per case (scholar
  pack/equipped maximum, itemId-aware, from
  evidence/2026-10-30/sim-vests-b-corpus-{competent,leanlink}.json).
  Ground-truth table (scholar-held max; 0 = scholar never held a vest):
  competent — 9911:0, 9912:1, 9913:0, 9914:0, 9915:0, 9916:1, 9917:0,
  9918:0; leanlink — identical pattern 9911:0, 9912:1, 9913:0, 9914:0,
  9915:0, 9916:1, 9917:0, 9918:0.
- GO threshold (from the task brief, not re-scored): the fixed panel
  vest read matches ground truth on at least 15/16 cases, including
  EVERY scholar-wearing seed that previously read 0 (9912 and 9916 in
  both columns — 4 cases). A miss is NO-GO, never re-scored against a
  friendlier metric.
- Horizon: 180d death-aware (same as the vests-b corpus; dead villages
  stop simulating, per the sweep driver).
- Seeds: fresh band 9911–9918 (8 seeds). Policies: competent + leanlink
  (leanlink behind LEANLINK=1, as in the corpus run). Cases: 16.
- Secondary (optional, NOT part of the GO count): a new `vestsVillager`
  snapshot field — distinct (holder, vestId) pairs held by live roster
  villagers in pack or equipped at snapshot time, bearer excluded
  (the bearer is the scholar, counted in `vests`), dead holders
  excluded, stashed / generation-pool / armory-pile holdings excluded.
  Dedupe note: a worn villager vest appears in BOTH pack and equipped
  in this engine (census day-0 for Grace Obi, 9915, shows pack +
  equipped for one swat vest), so pack+equipped entries for the same
  (holder, vestId) count ONCE. The scholar field does not need this
  dedupe: a scholar-worn vest appears equipped-only in the census
  (9912/9916 scholar first-seen is equipped-only), and the fix keeps
  the existing pack-units + equipped-slot counting for `vests`.
- What counts as a match: panel case `vests` (run max) EQUALS census
  `vestsSweepMax` for that policy+seed. Sampling-note: the sweep
  snapshots daily before the policy daily + at end; the census
  snapshots day-0 + daily + end. A vest held only between two daily
  snapshots in one driver but not the other would be a sampling
  difference, not a counter difference, and would be reported as such
  rather than silently counted either way.

## The blind spot (mechanism, from sim-vests-b)

scripts/sweep-compare.js `stdSnapshot` counted vests only from the
scholar's pack/equipped, reading entry `.id`. Inventory entries are
stored under `.itemId` (game.js alienLootGrant, marketDeliveryEntry,
capstone grant) and equipped slots store `{itemId, name, ...}`
(equipment.js — never `.id`). Result, measured in the sim-vests-b
panels: panel `vests` read 0 on all 16 cases, including the 4
scholar-wearing cases. The fix reads `itemId || id` (string entries
pass through) for both pack and equipped.

## Fix (instrument only)

- scripts/sweep-compare.js `stdSnapshot`: vest entry id =
  `typeof e === 'string' ? e : (e.itemId || e.id)`. Scholar pack
  keeps the existing `(units || 1)` counting; equipped slots count 1
  each. Old `.id`-form entries still count (backward compatible).
- New `vestsVillager` snapshot field (see pre-registration for the
  definition) + `maxVestsVillager` run history + per-run
  `vestsVillager` + per-policy aggregate sum, mirroring the existing
  `vests` plumbing exactly. No other field's meaning changes.
- No change to scripts/balance-panel.js: panel rows come from
  `runComparison`, so the fixed read flows into panels automatically.
  The panel's source digest covers scripts/sweep-compare.js, so the
  fixed file invalidates old cached cases (no stale 0s reused).
- Out of scope, noted not fixed: other scripts carry their own
  `.id`-only vest counts (e.g. bankxp-pilot, craftxp, food-coupling's
  vestCount) — they are local copies, not the sweep/panel instrument,
  and are listed here so a later run can sweep them if wanted.

## Proof test

scripts/test-vestcounter-b.js — planted-state proofs (no sim needed)
plus live-engine day-0 checks through the real harness:

- (to be filled on run)

## Judged legs (panels rebuilt with the fix)

- (to be filled on run)

## Before / after

- (to be filled on run)

## Verdict

- (to be filled on run)

## Metric review

- (to be filled on run)

## Blanks filled or documented

- (to be filled on run)

## Evidence files (all under evidence/2026-10-30/ in this worktree)

- sim-vestcounter-b.md (this file)
- sim-vestcounter-b-panel-competent/panel.json.gz (+ log)
- sim-vestcounter-b-panel-leanlink/panel.json.gz (+ log)
- scripts/test-vestcounter-b.js (proof script, committed with the fix)
