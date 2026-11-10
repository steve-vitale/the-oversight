# Prereg — sim-proofrefresh-b: measurement-proof refresh

- **Run:** fleshout-loop-b-20261110T1445Z, axis scale-onramp / winnability chain
- **Worktree:** `~/workspace/worktrees/sim-proofrefresh-b`
- **Base SHA (read immediately before the panel run):** `46459ac831d4d225d2c393f9453c90db8fd28873`
- **Date:** 2026-11-10

## Aborted first panel attempt (master moved mid-run)

- First panel run started on base `3838d86dcaa54274e05e7db45eb4e55a5126f595`
  (read in the worktree immediately before the run).
- At ~42 min in (35/68 case jobs written), `git rev-parse master` in both
  the main tree and the worktree read `46459ac831d4d225d2c393f9453c90db8fd28873`
  (Loop A sim-tendexact-a landing: 3 commits, exact-split `_removePantryKcal`).
- The move touched `src/js/hierarchy.js` — a manifest file (the panel
  manifest hashes every file under `src/`) — so per the master-move rule the
  in-flight panel (valid only for 3838d86dc) could not be kept. It was killed
  at 35/68 cases, its scratch dir deleted, the branch rebased onto the
  explicit new master SHA 46459ac83, and the panel is regenerated once on
  the new tip (below). No case output from the aborted run is reused.
- Pace note: the aborted run was writing ~1 case/min across 4 workers
  (~80 min projected total vs the ~22 min of the previous refresh) — shared-CPU
  contention with sibling loops. The regeneration budget is ~80–90 min.

## Runtime restart during the regeneration (recovery, panel resumed)

- The regeneration was interrupted by a runtime restart after 42m50s:
  no confirmed final result, parent + children dead (0 balance-panel
  processes), no `panel.json.gz` written (output was piped through
  `tail -40`, so nothing had flushed).
- Recovered state, verified before resuming: `cases/` held 64 files, all
  valid JSON, 64 distinct policy/seed/observe combos; only 4 jobs missing
  (winseek seeds 5, 6, 8, 9, observer-on). Case files are written via
  tmp+rename, so no partial files exist.
- Recovery: resume with the IDENTICAL command and the SAME `--out` dir.
  This reuses only cases from this run on this base in this tree — the
  tool's own cache path, which re-validates every cached case (key,
  identity incl. source/observer/contract digests, resultDigest,
  policy/seed) and throws on any mismatch. No case from another tree is
  reused; the prereg's "fresh --out dir" bar was about cross-tree reuse.
  The panel records the count in its `reused` field; the evidence file
  states it plainly. The 4 missing jobs are computed fresh in the resume.

- During the regeneration on 46459ac83, master moved again:
  46459ac83 → `74eccccd2b08d3517a1db7a9347996174947bd3c` (Loop B
  sim-choketrace-b landing, evidence + `scripts/choketrace-b-*.js` only).
- `git diff --name-only` between the two SHAs: only `evidence/2026-11-10/*`
  and `scripts/choketrace-b-{analyze,driver}.js` + `scripts/test-choketrace-b.js`.
  **No manifest file touched** (manifest = `src/**`, `scripts/policies/**`,
  `index.html`, `scripts/sim-harness.js`, `scripts/sweep-compare.js`).
- Per the master-move rule the panel is KEPT. After generation the branch
  is rebased onto the then-current master SHA (no manifest file changes, so
  the panel stays valid) and all proof legs are re-run on the rebased
  branch before committing, so the coordinator's `--ff-only` merge stays
  clean.

## What was stale, and why

`scripts/godpath/test-measurement-proof-update.js` FAILS on current master
3838d86dc with `Error: Proof source inputs are not current`
(`scripts/balance-proof-update.js:8` — `B.manifest(root)` no longer equals
`panel.sources`). The retained observer-neutral maintenance proof
(`evidence/2026-11-10/neutral-vetcount-b.json.gz`, pointed at by
`scripts/balance-proof.json`) was re-staled by exactly one Game-file move:
`src/js/hierarchy.js` +104 from Loop A's answermail-drive-a landing. The
panel manifest hashes every file under `src/` (plus `index.html`,
`scripts/sim-harness.js`, `scripts/sweep-compare.js`,
`scripts/policies/`), so any Game change invalidates it.

Pre-refresh state, measured on this branch before the panel run:
- `test-measurement-proof-update.js`: FAILS (exit 1, "Proof source inputs are not current")
- `test-measurement-workflow.js`: 8/9 — failing leg is "retained neutrality
  proof covers the current Game/controller/harness inputs" (same root cause)
- `test-measurement-cache-flags.js`: 4/4 (already passing)

Per the repo AGENTS.md rule (changed Game/controller/harness or
collector/contract inputs require a fresh real observer-neutral maintenance
proof), the refresh is a fresh real panel via
`scripts/balance-proof-update.js`. Never rewrite source identities, never
waive unknowns, never re-point to an old panel.

## Primary metric

The three proof tests, judged together:
1. `node scripts/godpath/test-measurement-proof-update.js` exits 0
2. `node scripts/godpath/test-measurement-workflow.js` is 9/9
3. `node scripts/godpath/test-measurement-cache-flags.js` is 4/4

## GO threshold (all must hold — a miss on any is NO-GO)

- (a) `test-measurement-proof-update.js` exits 0 on this branch after
  `node scripts/balance-proof-update.js evidence/2026-11-10/neutral-proofrefresh-b.json.gz`
  (exit 0; `scripts/balance-proof.json` re-points at the new panel).
- (b) `test-measurement-workflow.js` is 9/9.
- (c) `test-measurement-cache-flags.js` is 4/4.
- (d) Neutrality reproduction: the fresh panel's neutral verdict reproduces
  the previous panel's (`evidence/2026-11-10/neutral-vetcount-b.json.gz`) —
  neutrality `match` on every proof case (4 policies × proof seed 7) and
  row count 64. Regeneration alone must not move any verdict; any delta is
  a finding and a NO-GO pending investigation, never a silent pass.
- (e) `scripts/test-proofrefresh-b.js` (new) passes all legs: balance-proof-update
  validate passes on the new panel; the three proof tests pass; neutrality
  match on every proof case; panel rows complete (64 observed cases, row
  count matches the previous panel's); `validity.sourcesStable` true.

## Horizon / seeds / policies

- Panel command: `node scripts/balance-panel.js --out <scratch-dir-inside-worktree> --n 16 --days 150`
  (driver defaults: policies capable,risk-aware,socialite,winseek; proof-seeds
  = first seed, 7; 64 cases, 0 cached, ~22 min). Fresh `--out` dir — no
  cached cases reused from another tree.
- Seeds: the driver's default 16 (`sweep-dashboard.seedList(16)`:
  7, 42, 99, 1234, 555, 777, 2026, 31337, 1–9), identical to the previous
  panel's seed list so the neutrality reproduction in (d) is apples-to-apples.
- Horizon 150d: the maintenance-proof horizon, not a balance question —
  death-aware horizons apply to balance arms; this run re-proves the
  instrument, so it repeats the previous proof's horizon exactly.

## Pre-refresh state on the new base (46459ac83, re-measured after rebase)

- `test-measurement-proof-update.js`: still FAILS (same "Proof source inputs
  are not current" — the new base's `hierarchy.js` differs again).
- `test-measurement-workflow.js`: still 8/9, same failing leg (retained
  neutrality proof covers the current Game/controller/harness inputs).
- `test-measurement-cache-flags.js`: 0/4 then 1/4 across two runs — NOT a
  proof breakage. The test spawns the panel CLI with a hardcoded 30s
  `timeout:30000`; a manual run of the identical command
  (`SIMOPT=0 node scripts/balance-panel.js --root . --seeds 7 --policies zero
  --days 1 --out /tmp/cacheflags-probe --par 1`) takes **38.4s wall** on this
  loaded box and exits 0, writing exactly the 2 expected cases (observer
  on/off, SIMOPT=0, distinct keys) plus a valid panel.json.gz. The test's
  spawnSync kills the run at 30s (status null, falsy so no throw, legs 2–3
  see partial cases). This is a load/timeout artifact: the same test passed
  4/4 on 3838d86dc when the box was quieter (both tests together took 17s).
  The refresh does not touch the CLI or the test; GO leg (c) is judged on a
  re-run after the refresh, retrying if the failure signature is the 30s
  timeout rather than a panel-validity failure. The test itself is NOT
  edited (no loosening an assertion to go green).

After generation, compare the fresh panel against
`evidence/2026-11-10/neutral-vetcount-b.json.gz`:
- `validity.neutrality` entries: same policies, same proof seed, `match: true`,
  `warnings: 0` on every entry (previous panel: 4/4 match, 0 warnings).
- Row count: 64 observed cases, one per policy/seed combination.
- Any delta in either is a finding and a NO-GO pending investigation.

## Master-move rule

- `git rev-parse master` is read in the worktree immediately before the panel
  run (base SHA above) and again after generation.
- If master moved AND the move touched any file in the panel manifest
  (`git diff --name-only` between the two SHAs checked against the manifest
  file list in `scripts/balance-panel.js`), regenerate once on the new tip.
- If the move touched no manifest file, keep the panel and record the check.

## Metric review (to be filled after the run)

- Whether the primary metric judged what it claimed to judge.
- Any delta found in the neutrality reproduction, and its disposition.
- Anything the refresh surfaced outside its scope (filed, not chased).
