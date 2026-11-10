# Prereg — sim-proofrefresh-b2: measurement-proof refresh, round 2

- **Run:** fleshout-loop-b-20261110T2046Z, axis scale-onramp / winnability chain
- **Worktree:** `~/workspace/worktrees/sim-proofrefresh-b`
- **Base SHA (read immediately before the panel run):** `febe01d6b43fdab8abb7c661c74ebf304c8a2f37`
- **Date:** 2026-11-10
- **Finding:** #2084 (open) — measurement proof stale again after Game-file moves.
- **File naming note:** the task brief names `sim-proofrefresh-b-prereg.md` /
  `sim-proofrefresh-b.md`, but those files are the LANDED record of the 1445Z
  refresh (commit f21b474e4). Overwriting them would destroy landed history,
  so this round uses `-b2` suffixed files (`sim-proofrefresh-b2-prereg.md`,
  `sim-proofrefresh-b2.md`, `neutral-proofrefresh-b2.json.gz`,
  `scripts/test-proofrefresh-b2.js`). Same arm, second round, no history lost.

## What was stale, and why

`scripts/godpath/test-measurement-proof-update.js` FAILS on current master
febe01d6b with `Error: Proof source inputs are not current`
(`scripts/balance-proof-update.js:8` — `B.manifest(root)` no longer equals
`panel.sources`). The retained observer-neutral maintenance proof
(`evidence/2026-11-10/neutral-r127scholar.json.gz`, pointed at by
`scripts/balance-proof.json`, digest `afaa075b…`) was re-staled by exactly
two manifest-file moves since the scholarcount-a adoption (a663f3ccf):

- `src/js/convo-beats.js` (counterclose-a landing)
- `scripts/policies/competent.js` (counterclose-a landing)

Verified by comparing `B.manifest('.')` against the retained panel's
`sources`: exactly these 2 keys differ. The panel manifest hashes every
file under `src/` (plus `index.html`, `scripts/sim-harness.js`,
`scripts/sweep-compare.js`, `scripts/policies/`), so any Game/policy change
invalidates it.

History of the staleness chain (this is the third refresh in a month):
- 2026-10-29: 7 Game files stale → 1445Z refresh, full 64-case panel
  (`neutral-proofrefresh-b.json.gz`, base 74eccccd2, landed f21b474e4).
- scholarcount-a adoption (a663f3ccf) re-pointed the proof at a seed-7-only
  4-row panel (`neutral-r127scholar.json.gz`) — a thinner proof, accepted at
  the time (pair 9/9+9/9), but NOT the canonical 64-case maintenance spec.
- counterclose-a landing (db816ddb9 → febe01d6b) moved the 2 files above and
  re-staled it. This round restores the canonical 64-case spec.

Per the repo AGENTS.md rule (changed Game/controller/harness or
collector/contract inputs require a fresh real observer-neutral maintenance
proof), the refresh is a fresh real panel via
`scripts/balance-proof-update.js`. Never rewrite source identities, never
waive unknowns, never re-point to an old panel.

## Pre-refresh state, measured on this branch before the panel run

- `test-measurement-proof-update.js`: FAILS (exit 1, "Proof source inputs are not current")
- `test-measurement-workflow.js`: 8/9 — failing leg is "retained neutrality
  proof covers the current Game/controller/harness inputs" (same root cause)
- `test-measurement-cache-flags.js`: 4/4 (already passing)
- `scripts/validate-ontology.js`: green — "All 135 systems validated"

## Primary metric

The three proof tests + ontology validation, judged together:
1. `node scripts/godpath/test-measurement-proof-update.js` exits 0
2. `node scripts/godpath/test-measurement-workflow.js` is 9/9
3. `node scripts/godpath/test-measurement-cache-flags.js` is 4/4
4. `node scripts/validate-ontology.js` exits 0 (135 systems validated)

## GO threshold (all must hold — a miss on any is NO-GO)

- (a) `test-measurement-proof-update.js` exits 0 on this branch after
  `node scripts/balance-proof-update.js evidence/2026-11-10/neutral-proofrefresh-b2.json.gz`
  (exit 0; `scripts/balance-proof.json` re-points at the new panel).
- (b) `test-measurement-workflow.js` is 9/9.
- (c) `test-measurement-cache-flags.js` is 4/4.
- (d) Neutrality reproduction: the fresh panel's neutral verdict reproduces
  the previous panel's (`evidence/2026-11-10/neutral-r127scholar.json.gz`) —
  neutrality `match` on every proof case (4 policies × proof seed 7) and
  `warnings: 0` on every entry, with the (policy, seed, match, warnings)
  tuple identical between the two panels. Regeneration alone must not move
  any verdict; any delta is a finding and a NO-GO pending investigation,
  never a silent pass.
- (e) `scripts/test-proofrefresh-b2.js` (new) passes all legs: balance-proof-update
  validate passes on the new panel; the three proof tests pass; ontology
  green; neutrality match on every proof case; panel rows complete (64
  observed cases, 64 distinct policy/seed combos); `validity.sourcesStable`
  true; stale-input negative check — the OLD panel
  (`neutral-r127scholar.json.gz`) FAILS `validate()` on the new tip with
  "Proof source inputs are not current", proving the green result is not
  vacuous.
- (f) `scripts/validate-ontology.js` exits 0.

## Row-count note (pre-registered, not a mid-run re-score)

The previous panel (`neutral-r127scholar.json.gz`) is a seed-7-only panel
with 4 rows; this round restores the canonical 64-case spec, so the fresh
panel has 64 rows. Row-count equality with the previous panel is therefore
NOT a GO leg this round — the difference is a known spec change decided here,
before generation. Row completeness is judged against this panel command's
own spec (64 observed cases, one per policy/seed combination). The
neutrality-reproduction leg (d) is the apples-to-apples check: the 4
proof-case verdicts are comparable across both specs.

## Horizon / seeds / policies

- Panel command: `node scripts/balance-panel.js --out <scratch-dir-inside-worktree> --n 16 --days 150`
  (driver defaults: policies capable,risk-aware,socialite,winseek; proof-seeds
  = first seed, 7; 68 jobs: 64 observer-on + 4 observer-off proof cases).
  Fresh `--out` dir — no cached cases reused from another tree.
- Seeds: the driver's default 16 (`sweep-dashboard.seedList(16)`:
  7, 42, 99, 1234, 555, 777, 2026, 31337, 1–9), identical to the 1445Z
  refresh panel's seed list.
- Horizon 150d: the maintenance-proof horizon, not a balance question —
  death-aware horizons apply to balance arms; this run re-proves the
  instrument, so it repeats the previous refresh's horizon exactly.
- Pace note: the 1445Z refresh ran ~1 case/min under sibling contention
  (~80 min for the full panel). Budget for this regeneration is ~90 min;
  Loop A is live on its 1915Z claim (counterclose-a already landed as
  febe01d6b; cookfirst-a still in flight), so contention is expected.

## Master-move rule

- `git rev-parse master` is read in the worktree immediately before the panel
  run (base SHA above) and again after generation.
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
