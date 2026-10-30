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

scripts/test-vestcounter-b.js — 22/22 green (planted-state proofs +
live-engine day-0 checks through the real harness, seeded before eval):

- F1 (scholar read): itemId pack vest counts 1; itemId equipped vest
  counts 1; old `.id`-form pack vest still counts 1; string entry
  counts 1; non-vests read 0; empty state reads 0. The pre-fix
  algorithm reproduced inline as a reference reads 0 on both itemId
  forms — the blind spot, reproduced, then fixed.
- F2 (villager read): one worn villager vest (pack + equipped) counts
  as ONE pair; two villagers with different vests count 2; dead holder
  excluded; scholar person record excluded; stashed entry not held;
  off-roster person excluded; two vest ids on one villager count 2.
- F3 (read-only): snapshot twice identical; planted state byte-equal
  before/after; values vests 1 / vestsVillager 1 on the planted state.
- F4 (live engine, day 0, real harness): seed 9915 → vests 0,
  vestsVillager 1 (Grace Obi swat); seed 9911 → 0/0 (nothing dealt);
  seed 9912 → 0/1 (Lena Ruiz military). All three match the
  sim-vests-b census day-0 rows exactly.

scripts/test-vests-b.js — 25/25 green after ONE deliberate assertion
update in the same fix: its F3 previously asserted the blind spot
itself (`snap.vests === 0` on a planted itemId-form scholar vest);
with the fix the snapshot reads 1, so the assertion now asserts the
fixed behavior (`snap.vests === 1`). The intermediate run is on
record: before the assertion update, the suite failed exactly on
that one check with `snap.vests=1` — the fix working, the old
assertion stale. No assertion was loosened; the stale expectation
was replaced with the correct one, and the change is noted here.

## Judged legs (panels rebuilt with the fix)

Two single-policy balanced panels, rebuilt from scratch with the fixed
instrument (0 cached jobs each — the changed sweep-compare.js digest
invalidated old cases, so no stale 0 could be reused). Both valid:
sourcesStable true, neutrality proof match true with 0 warnings on
the proof seed, per panel. Cases/ caches deleted after the build
(never committed), panel.json.gz + logs retained.

- sim-vestcounter-b-panel-competent (seeds 9911–9918, days 180):
  panel vests per seed: 9911:0, 9912:1, 9913:0, 9914:0, 9915:0,
  9916:1, 9917:0, 9918:0. vestsVillager (run-max simultaneous
  distinct villager-held pairs): 9912:1, 9915:1, 9916:1, rest 0.
- sim-vestcounter-b-panel-leanlink (LEANLINK=1, same seeds/days):
  panel vests per seed: identical pattern 9912:1, 9916:1, rest 0.
  vestsVillager: 9912:1, 9915:1, 9916:1, rest 0.
- Cross-check (not a re-score): panel days, wave reach, max rank and
  national reproduce the census rows EXACTLY on all 16 cases, so the
  rebuilt panels are the same runs measured honestly, not new
  trajectories. (Panel `table` is ever-invited by definition; the
  census row carries end-state tableWaiting, so table is compared
  only as a set: invited seeds 9911/9913/9916/9918 leanlink, none
  competent — the same set the census evidence reports.)
- vestsVillager reading note: it is a run-MAX simultaneous count,
  not an ever-held count. Leanlink 9912 is the proof: two different
  villagers hold vests over that run (Lena's military, then Naran's
  swat), but never simultaneously, so vv reads 1 while ever-held
  pairs are 2. Do not cite vv as "vests ever held by villagers."

## Before / after

| case set | before (old panel read) | after (fixed panel read) | census ground truth |
|---|---|---|---|
| competent 9912, 9916 (scholar-wearing) | 0, 0 | 1, 1 | 1, 1 |
| leanlink 9912, 9916 (scholar-wearing) | 0, 0 | 1, 1 | 1, 1 |
| all other 12 cases (scholar never held) | 0 | 0 | 0 |
| TOTAL matches | 12/16 (all four misses are scholar-wearing cases) | 16/16 | — |

Old panel aggregate vests: 0 per column. New panel aggregate vests:
2 per column (one per scholar-wearing seed). The fix changes no
other panel field: days/wave/rank/national identical to the census
rows on all 16 cases, and the neutrality proofs still match, so the
instrument change moved only the vest read — as an instrument fix
must.

## Verdict

GO — 16/16 cases match ground truth, exceeding the pre-registered
bar of 15/16, including all 4 scholar-wearing seeds that previously
read 0 (9912 and 9916 in both columns). No metric was re-scored
mid-run: the bar, the ground-truth definition and the match rule
were written in the pre-registration above before the judged panels
were built.

## Metric review

- The `vests` (scholar run-max) definition survives the fix
  unchanged in meaning — only its entry-id read was wrong. Future
  vest work can cite panel `vests` directly; the sim-vests-b
  census is no longer needed to correct it.
- `vestsVillager` is useful but must always be labeled "run-max
  simultaneous distinct pairs," never "ever held": the leanlink
  9912 case (vv 1 vs 2 ever-held villager vests) shows the gap in
  one seed. A true ever-held villager metric would need the census's
  daily first-seen accumulation, which a snapshot field cannot do.
- The scholar field needs no pack/equipped dedupe (scholar-worn
  vests appear equipped-only in the census), while the villager
  field does (villager-worn vests appear pack + equipped). If a
  future engine change makes scholar pack behave like villager
  items, the scholar field would double-count worn vests — worth
  one line in any future equipment-change review.
- Panel compare as a judge was not forced here (same structural
  reason as sim-vests-b: the two panels differ by policy by
  design). The judge is the pre-registered per-case ground-truth
  table, and both panels are valid single-policy §15 artifacts.

## Regression check (repo quick list)

`node scripts/check.js --quick` — 284 passed, 6 failed, on BOTH the
pre-fix-baseline run and the fixed run (second run captured in full
in sim-vestcounter-b-check-quick.log; the first run's failure list
was truncated by a `tail -15` pipe, so it was re-run with full
output). The 6 failures are PRE-EXISTING, proven by revert test:
with scripts/sweep-compare.js temporarily reverted to HEAD (fix
backed up outside the repo, restored byte-identical afterward —
verified by diff, then test-vestcounter-b re-run 22/22), all 6
failures reproduce exactly:

- godpath/test-measurement-proof-update.js (proof source inputs
  not current) + godpath/test-measurement-workflow.js (retained
  neutrality proof vs current inputs) — measurement-proof staleness
  family; present without the fix, so not caused by it. (Note: the
  proof was already stale on this base; refreshing it is a separate
  maintenance job, not part of this instrument fix.)
- godpath/test-mobile-combat-cadence.js (2 failed: announced-round
  Continue wrapping) — browser combat, no sweep-compare involvement.
- godpath/test-occupation-panels.js (real CLI workflow) — fails at
  the panel CLI step without the fix too; pre-existing fixture/CLI
  drift, not the vest read.
- godpath/test-phone-frame-proof.js (3 failed: retained browser
  input hashes stale) — no src/js or index.html touched here.
- test-establishment-r20-fixes-20261020.js (racks-full voice gate
  resets daily) — cook/racks voice, unrelated to vests.
- No green-listed script that consumes sweep-compare's stdSnapshot
  output fails, and the only green-listed vest-field scripts
  (test-vest-tracker, test-item-use, test-food-coupling-instrument)
  do not import sweep-compare; the first two re-run green here.

## Blanks filled or documented

- FILLED (instrument): scripts/sweep-compare.js `stdSnapshot` now
  reads `itemId || id` for scholar pack/equipped vests, plus the new
  `vestsVillager` snapshot field plumbed through run history,
  per-run rows and per-policy aggregates. scripts/test-vestcounter-b.js
  — 22/22 proof (planted states + live day-0 engine states).
  scripts/test-vests-b.js — 25/25 after the one deliberate F3
  assertion update documented in the proof section.
- DOCUMENTED (not fixed — out of this instrument's scope): other
  scripts carry their own local `.id`-only vest counts (bankxp-pilot,
  craftxp, food-coupling's vestCount, and similar local
  stdSnapshot copies) — they are not the sweep/panel instrument and
  were not touched; a later sweep could unify them. No game-code
  blank was filled: this arm changes no game behavior by design.
- NOTE (shared-tree hazard, hit once this run): after the prereg
  safe-commit, the main index showed the just-committed file as
  deleted + untracked (the known index-clobber class). Repaired via
  `git update-index --cacheinfo` from the HEAD blob; verified
  `git status` empty, `git diff HEAD` empty, worktree hash equals
  HEAD blob. The commit itself was correct throughout.

## Evidence files (all under evidence/2026-10-30/ in this worktree)

- sim-vestcounter-b.md (this file)
- sim-vestcounter-b-panel-competent/panel.json.gz (+ log)
- sim-vestcounter-b-panel-leanlink/panel.json.gz (+ log)
- sim-vestcounter-b-check-quick.log (full second quick-check run)
- scripts/test-vestcounter-b.js (proof script, committed with the fix)
