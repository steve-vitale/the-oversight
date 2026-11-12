# Prereg — sim-proofrefresh-b8: measurement-proof refresh, round 8

- **Run:** fleshout-loop-b-20261112T0930Z, axis scale-onramp / winnability
  chain
- **Arm:** sim-proofrefresh-b8 — the measurement-proof refresh,
  tracker 0730Z next blank #2
- **Worktree:** `~/workspace/worktrees/sim-proofrefresh-b8`
- **Branch:** `sim-proofrefresh-b8`
- **Base SHA (read in the main tree immediately before the panel run):**
  `0436a04e0fbab50b86d0111aa67461c35c2fcd4b` (journey-establishment r133
  run note; branch tip equals master at run start)
- **Date:** 2026-11-12
- **Finding:** measurement proof stale again. The retained panel is the
  b7 panel (`evidence/2026-11-12/neutral-proofrefresh-b7.json.gz`,
  generated on the d98aae0f0-based branch, panelDigest
  `67736e5343826e0c632fe08fadd6a131482a9a177184fcc4eb3ceee9468d9a65`).
  17 commits landed on master after the b7 branch base — one of them a
  game-code change to a manifest file.

## What was stale, and why

`scripts/godpath/test-measurement-proof-update.js` FAILS on current master
0436a04e0 with `Error: Proof source inputs are not current`
(`scripts/balance-proof-update.js:8` — `B.manifest(root)` no longer equals
`panel.sources`). Verified by comparing `B.manifest('.')` against the
b7 panel's `sources` (never trusted from any brief's file list) —
exactly 1 manifest key differs:

- `src/js/game.js` (hash fc88aaa8… → 108f3b5f…, the sim-synergydisc-b
  dawn-resonance double-passive synergy-discovery change, ce653cdab)

Observer and contract digests still match; the staleness is purely the
source manifest. Per the repo AGENTS.md rule (changed Game/controller/
harness or collector/contract inputs require a fresh real
observer-neutral maintenance proof), the refresh is a fresh real panel
via `scripts/balance-proof-update.js`. Never rewrite source identities,
never waive unknowns, never re-point to an old panel. Panels at b7 and
earlier are superseded — the re-point target is the NEW panel only.

Staleness chain (short): b7 refresh (base d98aae0f0, landed) → 17 master
commits incl. the synergydisc-b game.js change (dawn resonance for
double-passive synergy discovery) → proof stale on 0436a04e0. This round
restores the canonical 64-case maintenance spec under the proofrefresh
name, output `evidence/2026-11-12/neutral-proofrefresh-b8.json.gz`
(new file — the b7 and b6 panels are NOT overwritten).

## Pre-refresh state, measured on this branch before the panel run

Measured on this branch at 0436a04e0 (before any panel run):

- `test-measurement-proof-update.js`: FAILS (exit 1, "Proof source inputs
  are not current") — matches the coordinator's baseline exactly.
- `scripts/balance-proof.json` points at
  `evidence/2026-11-12/neutral-proofrefresh-b7.json.gz`.

## Primary metric

`node scripts/godpath/test-measurement-proof-update.js` pass/fail on the
tip. GO = exit 0, all legs pass.

## GO threshold (all must hold — a miss on any is NO-GO)

- (a) `test-measurement-proof-update.js` exits 0 on this branch after
  `node scripts/balance-proof-update.js evidence/2026-11-12/neutral-proofrefresh-b8.json.gz`
  (exit 0; `scripts/balance-proof.json` re-points at the new panel).
- (b) `test-measurement-workflow.js` is 9/9.
- (c) `test-measurement-cache-flags.js` is 4/4 (known load artifact:
  the test spawns `balance-panel.js` three times with `timeout: 30000`;
  under heavy Loop A + Loop B load a spawn can exceed 30s — see the
  reconcile evidence round 1 adjudication. If it fails only on spawn
  timeout, replicate all four legs manually with generous time; a manual
  4/4 stands, recorded as such, never a silent pass).
- (d) Neutrality reproduction: the fresh panel's neutral verdict reproduces
  the previous retained panel's (`evidence/2026-11-12/neutral-proofrefresh-b7.json.gz`)
  — neutrality `match` on every proof case (4 policies × proof seed 7) and
  `warnings: 0` on every entry, with the (policy, seed, match, warnings)
  tuple identical between the two panels. Regeneration alone must not move
  any verdict; any delta is a finding and a NO-GO pending investigation,
  never a silent pass. (The b6 panel
  `evidence/2026-11-11/neutral-proofrefresh-b6.json.gz` is checked as a
  second reference.)
- (e) `scripts/test-proofrefresh-b8.js` (new) passes all 12 legs:
  balance-proof-update validate passes on the new panel; the three proof
  tests pass; ontology green; neutrality match on every proof case; panel
  rows complete (64 observed cases, 64 distinct policy/seed combos);
  `validity.sourcesStable` true; stale-input negative checks — the
  CURRENTLY RETAINED panel (`neutral-proofrefresh-b7.json.gz`) FAILS
  `validate()` on the new tip with "Proof source inputs are not current",
  proving the green result is not vacuous; and the b6 panel
  (`neutral-proofrefresh-b6.json.gz`) FAILS `validate()` the same way.
- (f) `scripts/validate-ontology.js` exits 0.

## Row-count note (pre-registered, not a mid-run re-score)

The previous retained panel (`neutral-proofrefresh-b7.json.gz`) is a 64-case
panel on the same spec, so row counts are comparable this round (64 vs 64).
Row completeness is judged against this panel command's own spec (64
observed cases, one per policy/seed combination). The neutrality-reproduction
leg (d) is the apples-to-apples check: the 4 proof-case verdicts are
comparable across both panels.

## Horizon / seeds / policies

- Panel command: `node scripts/balance-panel.js --out .proofrefresh-b8-panel --n 16 --days 150`
  (driver defaults: policies capable,risk-aware,socialite,winseek; proof-seeds
  = first seed, 7; 68 jobs: 64 observer-on + 4 observer-off proof cases).
  Fresh `--out` dir — no cached cases reused from another tree.
  Run the generation under `setsid` from the start (b7 precedent: the
  panel parent died silently TWICE under heavy parallel load; resume in
  the same `--out` dir if it dies — the case cache is reused exactly;
  remove stale `.json.tmp` partials per the b6/b7 precedent).
- Seeds: the driver's default 16 (`sweep-dashboard.seedList(16)`:
  7, 42, 99, 1234, 555, 777, 2026, 31337, 1, 2, 3, 4, 5, 6, 8, 9),
  identical to the b7/b6 panel's seed list. No new seed band is
  consumed. Policies: capable, risk-aware, socialite, winseek. Days: 150.
  Origin: Columbus, Ohio (driver default).
- Horizon 150d: the maintenance-proof horizon, not a balance question —
  death-aware horizons apply to balance arms; this run re-proves the
  instrument, so it repeats the previous refresh's horizon exactly.
- Pace note: b7 ran ~35 min (incl. two silent parent deaths mid-panel);
  b5 ran ~22 min; reconcile rounds ran ~55–63 min under load avg ~21.
  The sibling holdout worker is generating panels concurrently — expect
  load. Report by ~10:30Z even if partial — a partial arm with committed
  prereg + instrument and a clear status beats a silent timeout.

## Master-move rule

- `git rev-parse master` is read in the MAIN tree immediately before the
  panel run (base SHA above) and again after generation.
- If master moved AND the move touched any file in the panel manifest
  (`git diff --name-only` between the two SHAs checked against the manifest
  file list in `scripts/balance-panel.js`), regenerate once on the new tip.
- If the move touched no manifest file, keep the panel, rebase the branch
  onto the explicit new master SHA (never `git rebase master`), and re-run
  all proof legs on the rebased branch before committing, so the
  coordinator's `--ff-only` merge stays clean.

## Metric review (to be filled after the run)

- Whether the primary metric judged what it claimed to judge.
- Any delta found in the neutrality reproduction, and its disposition.
- Anything the refresh surfaced outside its scope (filed, not chased).
