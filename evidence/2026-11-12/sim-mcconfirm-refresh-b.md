# sim-mcconfirm-refresh-b — Loop B worker, run fleshout-loop-b-20261112T1130Z

Axis: winnability chain — MEASUREMENT HYGIENE (stale mcconfirm summary +
cache-flags spawn cap). Base: master `f1e603219` (worktree rebased onto the
live tip at start; spawn-time tip `ce89f2b77` had moved, worktree was at
`ddb0a9101`; rebase clean, no conflicts). Prereg:
`evidence/2026-11-12/sim-mcconfirm-refresh-b-prereg.md` (committed
`bbb723784` BEFORE any judged measurement) + amendment 1 (`89b765ee3`,
also pre-measurement). Zero `src/js` changes — none was needed; the task's
stop rule never fired. No new sims for item (a); item (b) is test runs only.

## Item (a) — mcconfirm-ctrl summary refresh: GO

The on-disk summary `evidence/2026-11-11/mcconfirm-ctrl-b-summary.json`
still recorded the old 8-seed merge leg. The analyzer's re-pin was
already landed (Loop A repin-a, `937f79040`): `MERGE_SEEDS = 16`,
`MERGE_SURVIVED = 1`, printed line already rendering "merge 1/16".
This item was the analyzer RE-RUN, not a re-pin — no analyzer edit was
made and none was needed.

Before (committed summary): `mergeLeg.seeds: 8`,
`jointRule.mergeSeeds: 8`, control 5/16, LEG_COMPLETE.

Analyzer re-run 1: exit 0, LEG_COMPLETE, printed
"joint rule inputs: merge 1/16 vs control 5/16".
Analyzer re-run 2: exit 0, stdout log byte-identical to run 1,
summary sha256 `cdf026f2a893c58b41d93af24dc59468949eebb86b15bb7546ac8fc74253193f`
on both runs — byte-identical reproduction, zero timestamp differences
(the summary carries no timestamp field).

After (on disk): `mergeLeg: {survived: 1, seeds: 16, base: e4dbe581b,
verdict: COLLAPSE_INSIDE_MERGE}`, `jointRule: {mergeSurvived: 1,
mergeSeeds: 16, controlSurvived: 5, controlSeeds: 16, jointVerdict:
COORDINATOR_READ}`. Diff vs HEAD is exactly those two lines (8→16 × 2);
every other value is unchanged: survived 5/16, median 138d, wall wins 0 /
national 0 / table 0 / wave5 5 / wave4 15, deaths 1365, instrument
errors 0.

`jointVerdict(1,5)` (merge analyzer export, machine-checked) =
`INCONCLUSIVE`; sanity `jointVerdict(1,8) = CONFIRMED`,
`jointVerdict(1,2) = REFUTED`.

Proofs: `scripts/test-mcconfirm-ctrl-b.js` **51/51 green**;
`scripts/test-mcconfirm-refresh-b.js` (new, this run) **16/16 green**
— constants, summary values, jointVerdict, fresh re-run reproducibility,
and the ctrl proof's live-sha pin. No proof re-pin was needed: live
`src/js/standing.js` sha is still `1eec2c9235a8`, matching the pinned
assertion. All three GO criteria met — **item (a) GO**.

## Item (b) — cache-flags 30s spawn cap: NO-GO (cap reverted to 30s)

The test is `scripts/godpath/test-measurement-cache-flags.js`: three
`spawnSync` calls of `balance-panel.js --seeds 7 --policies zero --days 1
--par 1`, each `timeout: 30000`. The cache-flag LOGIC was never touched;
only the timeout cap was in play, and it was reverted.

Load shape (prereg + amendment 1): one background sibling panel,
`balance-panel.js --seeds 7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9
--policies capable --days 150`, alive through every timed spawn and test
run (1 round each time, no restart needed), killed at the end. This is the
b7/b8 trip shape: a refresh-round test running alongside a sibling panel.

Measurement instrument: `scripts/test-mcconfirm-refresh-spawn.js` (new,
this run). N=12 sequential COLD spawns of the test's exact invocation
(fresh tmp out dir each, SIMOPT alternating 0/1, generous 300s outer
timeout so true spawn time is measured), then the cache-flags test itself
3× under the same load. Full samples in
`evidence/2026-11-12/mcconfirm-refresh-spawn-measure-run1.json` and
`-run2.json` (`mcconfirm-refresh-spawn-measure.json` is the run-2 copy).

### Round 1 — old 30s cap

Spawn seconds: 40.8, 45.2, 41.6, 40.6, 35.0, 38.2, 54.7, 76.2, 77.5,
54.1, 70.2, 99.8. p50 49.6s, **p95 (interp) 87.5s**, p95 (nearest-rank)
99.8s, max 99.8s, **12/12 over 30s**. Loadavg start 4.84 7.29 8.23,
after-spawns 0.62 5.58 7.40, end 12.13 13.90 10.75. Load alive throughout.

Cache-flags test on the old cap under this load: **0/3** — 0/4 each run
(92.8s, 94.7s, 93.8s; every first spawn timed out at 30s).

Cap rule (prereg, never guessed): smallest multiple of 5s ≥ p95 + 10s
= 87.5 + 10 = 97.5 → **100s**. Applied as a one-line change
(`timeout: 30000` → `timeout: 100000`, plus a comment citing the
measurement); cache-flag logic untouched.

### Round 2 — raised 100s cap

Spawn seconds: 74.1, 68.8, 95.6, 108.5, 102.0, 69.4, 80.6, 61.7, 84.8,
97.7, 93.2, 78.9. p50 82.7s, **p95 (interp) 104.9s**, p95 (nearest-rank)
108.5s, max 108.5s, 12/12 over 30s, **2/12 over the new 100s cap**.
Loadavg start 4.66 11.43 10.10, after-spawns 4.17 12.78 12.27, end
2.42 10.43 11.62 — a heavier host baseline than round 1. Load alive
throughout.

Cache-flags test on the 100s cap under this load: **2/3** — 4/4 in
166.7s, 4/4 in 152.8s, then **3/4 in 228.8s** (exit 1). The failing run
failed its 4th assertion (the repeat spawn reusing cached cases); the
exact cause is UNPROVEN — the measurement script did not capture the
failing run's stdout. Most likely a 100s timeout on the repeat spawn
(the 228.8s total fits ~65s + ~60s + 100s timeout), but that is an
inference, recorded here as unknown, not asserted.

One-off repro afterwards (same load shape, 100s cap): **4/4 in 142.7s**
— the cap usually works under load, but 3/3 was not met.

### Verdict

GO required p95 > 30s AND 3/3 with the raised cap AND no other proof
regresses. p95 > 30s held in both rounds and the old cap failed 0/3,
but the raised cap yielded **2/3, not 3/3**. Per the prereg NO-GO branch
("if the raised cap does not yield 3/3 passes, NO-GO on the change"),
the cap change does NOT land: **`timeout` reverted to 30000, file
byte-identical to HEAD**. The 100s value stays a measured candidate for
the next round, not a landed change. **Item (b) NO-GO.**

Regressions (after the revert, no load): cache-flags test **4/4** in
~42s (spawns ~13s unloaded — the test itself is healthy; only load
makes spawns slow); ctrl proof **51/51**; refresh proof **16/16**.
`test-proofrefresh-b8.js` is **9/12** — the 3 failures are all one
pre-existing cause, NOT a regression from this work: the b8 panel is
stale on this tip (validate fails "Proof source inputs are not current";
the workflow test's retained-proof leg fails the same way). Exactly two
manifest keys differ vs the panel — `src/js/build.js` and `index.html`
— both moved by other agents' landings in the 10 commits since b8
(`773736559`); this run changed zero `src/js` files and zero manifest
inputs. Proof-refresh round 9 is owed (0930Z blank #4, already tracked).
The cache-flags leg inside b8 is 4/4.

NOTE (label staleness, not data staleness): the measurement script's
run-2 printout and the results JSON field `testPassesOldCap` still say
"old 30s cap" for round 2 — round 2 actually ran under the 100s cap.
The numbers are correct; the label is wrong. The next script edit
should rename the field.

## Wall numbers (no new sims — the corpora's numbers)

Control leg (fresh band 190419–190434): survived 5/16, median 138d.
Merge leg: survived 1/16, median 111d. Both legs: wins 0/16, national
0/16, table 0/16. scale-onramp stays converging (NOT converged).

## Metric review (§14)

- The prereg bound the run: both items were judged against their written
  bars, and the item (b) miss is reported NO-GO with the change reverted,
  not re-scored as "better than before" (0/3 → 2/3 is an improvement,
  not a pass).
- Prereg defect 1 (mine): the b8 12/12 regression bar was mis-scoped —
  it measures panel freshness, not this change. On this tip the b8 panel
  was already stale before any of my edits (10 master commits since b8).
  The correct regression reading is the cache-flags leg 4/4 + ctrl proof
  51/51 + zero `src/js` changes. Next round: baseline the regression set
  BEFORE changing anything.
- Prereg defect 2 (mine): the cap rule (single-round p95 + 10s) proved
  too thin. Round 2's heavier host load pushed p95 to 104.9s, above the
  100s cap derived from round 1's 87.5s. Spawn time under concurrent-panel
  load has a long right tail and is host-load-dependent; a single-round
  p95 under-covers it. Next round should pool rounds (24 samples) and/or
  use a larger margin, and should capture the failing test run's stdout
  (this run's one unknown: round 2's failing 4th assertion).
- Amendment 1 (load panel 4 → 16 seeds + restart rule) was committed
  BEFORE any item (b) measurement, with its reason stated; it
  strengthened the load, never weakened it. Without it the 4-seed panel
  would have finished in ~2.5 min (b8: 64 rows / 41 min at `--par 4`),
  voiding the under-load condition for most samples.
- No metric was re-scored mid-run. The item (a) re-pin allowance was not
  needed (constants + printed line already landed; live sha unchanged).

## Infrastructure

- Rebased onto live master `f1e603219` at start (spawn tip had moved).
- Safe-commit index clobber struck on both prereg commits (D+?? once,
  MM once); repaired both times with the `git ls-tree -r HEAD --
  <paths> | git update-index --add --index-info` pipe; commits verified
  correct (blob matches HEAD, status + diff clean).
- The measurement script kills its load panel and removes its /tmp out
  dirs in a `finally`; no stray processes or /tmp panel dirs left
  (verified: no `mcconfirm-refresh-load-panel*` under /tmp).
- Loop A live on scale-onramp bisect round 6 throughout — its trees and
  branches untouched.

## Files (this branch)

- `evidence/2026-11-12/sim-mcconfirm-refresh-b-prereg.md` (committed
  `bbb723784` + amendment `89b765ee3`)
- `evidence/2026-11-11/mcconfirm-ctrl-b-summary.json` (analyzer fresh
  output: 8→16 × 2, nothing else)
- `evidence/2026-11-12/sim-mcconfirm-refresh-b.md` (this file)
- `evidence/2026-11-12/mcconfirm-refresh-spawn-measure.json` (round 2)
- `evidence/2026-11-12/mcconfirm-refresh-spawn-measure-run1.json`
- `evidence/2026-11-12/mcconfirm-refresh-spawn-measure-run2.json`
- `scripts/test-mcconfirm-refresh-b.js` (item (a) proof, 16/16)
- `scripts/test-mcconfirm-refresh-spawn.js` (item (b) measurement, runs
  the load + spawns + 3 test runs, writes the JSON above)

## Next blanks, in order

1. Cache-flags cap, next round: re-measure with a pooled p95 (24+
   samples across rounds) and a bigger margin; capture failing-run
   stdout; fix the script's stale "old 30s cap" label. Input: this
   run's two JSONs (run-1 p95 87.5s, run-2 p95 104.9s).
2. Measurement-proof refresh round 9 (b8 panel stale on this tip —
   0930Z blank #4, already tracked).
3. Bisect round 6 outcome sets the next winnability arm — Loop A live
   on round 6, do not pre-claim it while A is live.
