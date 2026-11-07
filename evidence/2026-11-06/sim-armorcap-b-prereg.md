# sim-armorcap-b — PREREGISTRATION (test maintenance, ZERO src/js)

Run: fleshout-loop-b-20261106T2300Z, arm sim-armorcap-b. Worktree
`~/workspace/worktrees/sim-armorcap-b`, branch `sim-armorcap-b`, base
`987766c0c` (local master at arm start; origin/master `b62ac120c` behind it,
ship loop pending).

## What is stale (finding #1832, sim-findings.md)

`scripts/test-armor-cap-20261009.js` reads 287 passed / 6 failed on the
landed armor-retune tip (`ba6d89846`, K=20→6). Five failures are
PRE-EXISTING on master (old test file on master code: 290 passed / 5 failed,
identical lines):

- unarmored-baseline HP-cost bands: hushwolf 7% not in [60,95], belltoad 0%
  not in [10,30], bulldozer 0% not in [2,12];
- hide-strictly-better checks: 0% vs 0% (belltoad, bulldozer — no hits
  landed, so there is no armor effect to compare).

P=0 paths cannot move under any K, so those bands were already stale before
the retune. The sixth failure (bulldozer tank: 0 hits absorbed in 4 fights)
is a brittle guard on a ~1-hit sample (master: exactly 1 hit [3]; belltoad
1 hit both legs; hushwolf 31) — sampling noise, not a lever regression.

## Arm

Re-baseline the cap test's field bands from a FRESH field corpus built on
current master with the test's own fight protocol. No `src/js` change. No
gate / price / deed change.

## Corpus protocol (fixed before any judged run)

Driver: `scripts/armorcap-corpus-20261106.js` — a line-for-line mirror of
the cap test's own harness (`loadAll` via the index.html script list minus
DOM-only files, `Math.random` seeded BEFORE eval, `freshScholar`,
`runPlayerFight`, `runTank`, Part 4 `fieldFight` spot-check; never stubs
`Game.save`). The mirror is stated in the driver's header so a later reader
can diff it against the test file.

- Seeds (8): `20261009` (the cap test's own default seed — included so the
  test's own run is one corpus batch), `7`, `424242`, `20261106`, `555`,
  `12345`, `999`, `31337`.
- Part 2 per seed: N=6 fights per (gear, monster), gears
  `spear` / `spear+hide` / `spear+kit`, monsters `hushwolf`, `belltoad`,
  `bulldozer`, `lockpick_raccoon` — 48 fights per (gear, monster) total.
  Records per-fight HP cost, per-batch mean HP cost, absorb-line counts.
- Part 2b (tank) per seed: 12 fights per monster (`hushwolf`,
  `bulldozer`, `belltoad`), player waits in hide armor (P=20) — 96 tank
  fights per monster total. Records per-fight absorb lines (count, values,
  mean).
- Part 4 characterization per seed: 4 unarmored + 4 hide-armored
  `fieldFight`s, villager vs hushwolf — recorded, not banded (Part 4's
  checks are relational, not bands).
- Output: `evidence/2026-11-06/perseed-armorcap-b/` — one JSON per seed
  (`armorcap-<seed>.json`) plus `armorcap-corpus-summary.json` (per-batch
  means, corpus means, SDs, SEMs).

## DERIVATION RULE (stated here, applied mechanically — no hand-widening)

Let `m` = mean of the 8 per-batch means, `s` = sample SD of the 8 batch
means, `SEM = s / sqrt(8)`, for the quantity being banded.

- **Unarmored-baseline HP-cost band** (per monster): `[max(0, floor(m - M)),
  min(100, ceil(m + M))]` where `M = max(10, 2*SEM)`. The 10-point floor is
  the test's own 6-fight batch granularity (one fight can swing a batch mean
  by ~17 points); `2*SEM` covers batch-to-batch spread. The floor is stated,
  not tuned to the data.
- **Hide-strictly-better check**: becomes conditional — it applies ONLY when
  the unarmored leg actually took damage (`un.avgC > 0`) in the test run.
  When both legs are 0% the monster landed no hits and there is no armor
  effect to compare; the test logs a vacuous skip (same pattern the test
  already uses for the no-immunity check). This is a guard redesign, not a
  band.
- **Kit-no-worse-than-hide check**: unchanged (already carries a +2 noise
  tolerance).
- **Tank guard redesign**: the test runs 12 tank fights per monster (was 4).
  The per-hit checks (every absorbed < max hit, every absorbed >= 1) apply
  ONLY when total hits landed >= 3 across the 12 fights; otherwise the test
  logs a vacuous skip. The old `> 0 hits in 4 fights` check is deleted.
- **Tank avg-absorbed band** (per monster): `[max(0, floor(m_a - M_a)),
  ceil(m_a + M_a)]` where `m_a` / `SEM_a` are the corpus per-batch mean
  absorbed and its SEM, `M_a = max(2, 2*SEM_a)`. The 2-point floor is the
  absorb-line integer granularity.
- **Direction preservation** (NOT a band — a stop rule): the corpus mean
  absorbed for hushwolf and belltoad must EXCEED the K=20 reference
  averages recorded in finding #1832 (hushwolf 6.2, belltoad 4). The
  re-baseline must preserve the retune's direction, not erase it. If a
  corpus mean fails this, that leg is a REAL regression: stop the
  re-baseline on that leg and report it as a finding instead.

## Green bar (the judge)

1. `scripts/test-armorcap-20261106.js` (proof, new): re-derives every band
   from `evidence/2026-11-06/perseed-armorcap-b/` by the rule above and
   asserts the cap test file's bands match the derivation exactly; asserts
   the direction-preservation stop rule; asserts the test file's tank fight
   count is 12 and the hide check is conditional. Green = all assertions
   pass.
2. `scripts/test-armor-cap-20261009.js` green on the final tip (all legs:
   Part 1 formula, Part 2 player 1v1, Part 2b tank, Part 3 party, Part 4
   villager), run at its default seed.
3. No `src/js` file modified (verified by `git status` / `git diff --stat`).

## Stop rules

- If the fresh corpus shows a REAL regression (a leg fails the
  direction-preservation rule, or a relational check fails with hits
  actually landed), do NOT re-baseline it away — report it as a finding
  and stop the re-baseline on that leg.
- If a derived band would be vacuous (e.g. [0,100]), that band is reported
  as uninformative in the evidence file and the check is left as a
  vacuous-skip guard, not a band — the evidence file says so explicitly.

## Metric review (§14)

Judged ONLY against this prereg. If the derivation rule proves wrong
(e.g. a band the rule produces still flakes on re-run), it is written up
under "metric review" in the evidence file and the revision is proposed for
the NEXT run — the rule is not re-scored mid-run.
