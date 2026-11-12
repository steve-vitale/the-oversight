# sim-mcconfirm-refresh-b — PREREG (Loop B worker, run fleshout-loop-b-20261112T1130Z)

Axis: winnability chain — MEASUREMENT HYGIENE (stale mcconfirm summary +
cache-flags spawn cap). Base: master `f1e603219` (worktree rebased onto the
live tip at start; spawn-time tip `ce89f2b77` had moved; rebase clean, no
conflicts, worktree clean). Zero `src/js` changes are expected — if one ever
looks necessary, STOP and report; do not make one unilaterally. No new sims
for item (a); item (b) is test runs only.

State at prereg time (read-only inspection only; NO judged measurement has
run yet):
- `scripts/mcconfirm-ctrl-analyze-20261111.js` already carries
  `MERGE_SEEDS = 16` and the printed context line already renders
  "merge 1/16 vs control 5/16" (Loop A repin-a, `937f79040`). The re-pin
  work is already landed; the stale artifact is ONLY the on-disk summary
  `evidence/2026-11-11/mcconfirm-ctrl-b-summary.json` (still
  `mergeLeg.seeds: 8` / `jointRule.mergeSeeds: 8`). Item (a) is therefore
  the analyzer RE-RUN, not a re-pin — unless the re-run's printed line
  still reads 1/8, in which case the one-line re-pin is done first.
- Live `src/js/standing.js` sha256 is still `1eec2c9235a8`, matching the
  ctrl proof's pinned live-sha assertion — no re-pin expected there.
- Cache-flags test is `scripts/godpath/test-measurement-cache-flags.js`:
  three `spawnSync` calls of `scripts/balance-panel.js --seeds 7
  --policies zero --days 1 --par 1`, each `timeout: 30000`. It is a leg
  of `scripts/test-proofrefresh-b8.js` (expects 4/4).

## Item (a) — mcconfirm-ctrl summary refresh

Primary metric: the on-disk summary's `mergeLeg.seeds` /
`jointRule.mergeSeeds` (must become 16) and the analyzer's printed
joint-rule context line (must read "merge 1/16" fresh-band input).
Corpus: the already-committed 16 per-seed JSONs
`evidence/2026-11-11/perseed-mcconfirm-ctrl-b/` (fresh band 190419–190434);
no new sims. Horizon/seeds: n/a — re-analysis only.

GO (all three must hold):
1. The summary on disk matches a fresh analyzer run end-to-end: re-run
   the analyzer, then re-run it a second time and confirm the second run
   reproduces the summary (only timestamp differences allowed, disclosed
   in evidence; the summary carries no timestamp field, so byte-identical
   is expected).
2. `jointVerdict(1,5)` (merge analyzer export) still returns
   `INCONCLUSIVE` (machine-checked, not hand-read).
3. `node scripts/test-mcconfirm-ctrl-b.js` is green (51/51) after the
   change.

Re-pin allowance (exactly as the 0630Z adoption did): IF the proof's
on-disk standing.js sha assertion trips because master's file carries the
same ROSTER CHECK hunk under a later sha, re-pin that ONE assertion
(marker present + sha + guard refuses on exact-sha); the driver guard
itself stays exact-sha strict and untouched. Any other proof failure is
a NO-GO, investigated, not re-pinned.

## Item (b) — cache-flags 30s spawn cap

Primary metric: wall-clock spawn time of the test's exact
balance-panel invocation under concurrent-panel load, and the
cache-flags test's pass/fail under that same load.

LOAD SHAPE (pre-registered, the b7/b8 trip shape): one background
sibling panel, `node scripts/balance-panel.js --root <worktree> --seeds
7,42,99,1234 --policies capable --days 150 --out
/tmp/mcconfirm-refresh-load-panel`, started before the first timed spawn
and left running through all timed spawns and all test runs; killed at
the end. Load averages (`uptime`) recorded at start, mid-run, and end.
If the background panel finishes early, record it and note the load
lapsed — measurements after the lapse do not count as under-load.

MEASUREMENT: N=12 sequential timed spawns of the exact test invocation
(`node scripts/balance-panel.js --root <worktree> --seeds 7 --policies
zero --days 1 --out <fresh tmp> --par 1`, env `SIMOPT` alternating
`0`/`1`), each timed wall-clock, while the load panel runs. Report every
sample, p50, p95 (linear-interpolation percentile; also report
nearest-rank p95 and max). Then run the cache-flags test itself 3×
consecutively under the same load and record each run's outcome.

CAP RULE (pre-registered, never guessed): a new cap is justified only
as the smallest multiple of 5s that is >= p95 + 10s.

GO for a cap change (all three must hold):
1. Measured spawn p95 (interpolated) > 30s under the load above, AND
   the test fails >= 1 of 3 runs on the OLD cap under the same load.
2. The test passes 3/3 consecutive runs with the raised cap under the
   same load shape (background panel restarted if it finished).
3. No other proof test regresses: `scripts/test-mcconfirm-ctrl-b.js`
   51/51 AND `scripts/test-proofrefresh-b8.js` 12/12 green after the
   cap change.

NO-GO branches (a miss is a miss, never re-scored):
- If the test passes 3/3 with the OLD cap under the same load, the cap
  stays 30s — NO-GO on the change, measurement recorded.
- If p95 <= 30s but the test still fails under load, the cap is not the
  cause — NO-GO, failure documented, no cap change.
- If the raised cap does not yield 3/3 passes, NO-GO on the change.
- The cache-flag LOGIC itself is never changed — only the timeout cap.

## Regression set

- After any change: `test-mcconfirm-ctrl-b.js` (51/51) and, for item (b),
  `test-proofrefresh-b8.js` (12/12, includes the cache-flags leg).
- Proof scripts: `scripts/test-mcconfirm-refresh-b.js` (item (a):
  constants, summary values, jointVerdict, re-run reproducibility) and
  `scripts/test-mcconfirm-refresh-spawn.js` (item (b): spawn-time
  measurement + cap-vs-p95 assertion).

## Evidence

`evidence/2026-11-12/sim-mcconfirm-refresh-b.md` (with a "metric review"
section). Records the analyzer's before/after summary values, the
spawn-time measurements with the load applied, and the verdict per item.

## Amendment 1 (pre-measurement, item (b) load shape — committed BEFORE any item (b) measurement runs)

Reason: the b8 panel took 41 min for 64 rows at the panel's default
`--par 4` (~2.5 min per row per worker), so the pre-registered 4-seed
load panel would finish in ~2.5 min of wall time — far shorter than the
~15 min the 12 timed spawns + 3 test runs need. A load that lapses
mid-measurement would void the "under concurrent-panel load" condition
for the later samples. The amendment strengthens the load, never
weakens it; the command shape, policy, days, and out dir are unchanged.

- Load panel seeds are the 16-seed b8 set
  (`7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9`), policy
  `capable`, days 150 — 16 rows, ~10 min wall at `--par 4`.
- The measurement script restarts the IDENTICAL load command if it
  exits before the measurements complete, and records every restart
  (timestamp + exit status) in the results JSON. The load condition
  throughout is "a sibling panel of this command is running"; a
  restart is the same load resuming, not a different load.
- Nothing else in this prereg changes. Items (a) and (b) GO/NO-GO bars,
  the cap rule, and the regression set are untouched.
