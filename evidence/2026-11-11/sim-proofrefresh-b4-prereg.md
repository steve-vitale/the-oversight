# Prereg — sim-proofrefresh-b4: measurement-proof refresh, round 4

- **Run:** fleshout-loop-b-20261111T0630Z, axis scale-onramp / winnability chain
- **Worktree:** `~/workspace/worktrees/sim-proofrefresh-b4`
- **Branch:** `sim-proofrefresh-b4`
- **Base SHA (read in the main tree immediately before the panel run):** `6769471caada1e76a25b8ea2ada20683885a8d72`
- **Date:** 2026-11-11
- **Finding:** measurement proof stale again after Game-file moves. Round 3
  (sim-proofrefresh-b3, base ad6a04b27) went stale before it could merge
  because master moved: journey-crisis r176, journey-scale r130, trapfirst,
  travelfirst, and journey-landing r125 landed after its base. The b3 panel
  and test file were never merged to master, so they live only in the b3
  worktree (read-only reference); this round adapts them with `-b4` suffixes
  and date 2026-11-11 and never overwrites the landed `-b` / `-b2` files
  or the unlanded `-b3` files.
- **Master-move note (before the panel run):** master moved during this
  run's setup, from b7fe9c03d (the branch's original base) to 6769471ca
  (journey-landing r125), which touched a manifest file
  (`src/js/convo-beats.js`). Per the master-move rule the branch was
  rebased onto the explicit new master SHA 6769471ca before any judged
  computation, and the panel is generated on that tip. The manifest diff
  below was recomputed after the rebase.

## What was stale, and why

`scripts/godpath/test-measurement-proof-update.js` FAILS on current master
6769471ca with `Error: Proof source inputs are not current`
(`scripts/balance-proof-update.js:8` — `B.manifest(root)` no longer equals
`panel.sources`). The currently retained panel is the one
`scripts/balance-proof.json` points at,
`evidence/2026-11-10/neutral-r172social-panel/panel.json.gz` (re-pointed by
journey-social-life r175 adoption, e4361b886 — NOT the b2 panel; the b2
panel was superseded as the retained proof by that adoption). It is stale
by exactly 9 manifest-file moves since its generation, verified by
comparing `B.manifest('.')` against the retained panel's `sources`
(never trusted from any brief's file list):

- `src/js/convo-wants.js` (journey-deepening r129, ed33b42b8 — already
  stale at b3 time)
- `src/js/favor-forage.js` (journey-deepening r129, ed33b42b8 — already
  stale at b3 time)
- `src/js/favor-water.js` (journey-deepening r129, ed33b42b8 — already
  stale at b3 time)
- `src/js/conversation.js` (journey-crisis r176, 82450a883)
- `src/js/convo-beats.js` (journey-crisis r176, 82450a883; touched again
  by journey-landing r125, 6769471ca)
- `src/js/convo-mood.js` (journey-crisis r176, 82450a883)
- `src/js/party-formal.js` (journey-crisis r176, 82450a883)
- `src/js/hierarchy.js` (journey-scale r130, fc0ffb37c)
- `src/js/safetynets.js` (journey-scale r130, fc0ffb37c)

The b2 panel (`evidence/2026-11-10/neutral-proofrefresh-b2.json.gz`,
base 3daa1a9b6) is stale by exactly 10 keys — the same 9, plus:

- `src/js/truth.js` (journey-deepening r129, ed33b42b8 — already inside
  the retained r172social panel, so it does not count against it)

Correction to the brief's file list: the brief names journey r176/r130,
trapfirst, travelfirst as the moves that staled b3. Verified via
`git diff --name-only ad6a04b27..6769471ca -- 'src/js/*'`: trapfirst and
travelfirst touched NO `src/js` file (scripts/evidence only) and therefore
cannot stale the proof; the staling moves are the two journey landings
(r176, r130) plus the r125 landing that moved master during this run's
setup. The panel manifest hashes every file under `src/` (plus
`index.html`, `scripts/sim-harness.js`, `scripts/sweep-compare.js`,
`scripts/policies/`), so any Game/policy change invalidates it.

Staleness chain: 2026-10-29 seven Game files stale → 1445Z refresh, full
64-case panel (`neutral-proofrefresh-b.json.gz`, base 74eccccd2, landed
f21b474e4) → scholarcount-a adoption (a663f3ccf) re-pointed at a seed-7-only
4-row panel (`neutral-r127scholar.json.gz`) → counterclose-a landing moved
2 files → b2 refresh, full 64-case panel (base febe01d6b, regenerated on
3daa1a9b6, landed ecc7f8a77 / 56d0a3506 / 151d33876) → journey-social-life
r175 adoption (e4361b886) re-pointed the proof at its own 64-case panel
(`neutral-r172social-panel/panel.json.gz`) → journey-deepening r129
(ed33b42b8) moved 3 files → b3 refresh (base ad6a04b27) never merged,
went stale → journey-crisis r176 (82450a883) moved 4 files,
journey-scale r130 (fc0ffb37c) moved 2 files, journey-landing r125
(6769471ca) re-touched convo-beats.js. This round restores the canonical
64-case maintenance spec under the proofrefresh name.

Per the repo AGENTS.md rule (changed Game/controller/harness or
collector/contract inputs require a fresh real observer-neutral maintenance
proof), the refresh is a fresh real panel via
`scripts/balance-proof-update.js`. Never rewrite source identities, never
waive unknowns, never re-point to an old panel.

## Pre-refresh state, measured on this branch before the panel run

Measured on base b7fe9c03d, re-confirmed after the rebase onto 6769471ca
(`test-measurement-proof-update.js` re-run on the rebased branch, still
exit 1 with "Proof source inputs are not current"):

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
  `node scripts/balance-proof-update.js evidence/2026-11-11/neutral-proofrefresh-b4.json.gz`
  (exit 0; `scripts/balance-proof.json` re-points at the new panel).
- (b) `test-measurement-workflow.js` is 9/9.
- (c) `test-measurement-cache-flags.js` is 4/4.
- (d) Neutrality reproduction: the fresh panel's neutral verdict reproduces
  the previous retained panel's
  (`evidence/2026-11-10/neutral-r172social-panel/panel.json.gz`) —
  neutrality `match` on every proof case (4 policies × proof seed 7) and
  `warnings: 0` on every entry, with the (policy, seed, match, warnings)
  tuple identical between the two panels. Regeneration alone must not move
  any verdict; any delta is a finding and a NO-GO pending investigation,
  never a silent pass. (The b2 panel carries the identical neutrality tuple
  and is checked as a second reference; it is NOT the retained panel this
  round.)
- (e) `scripts/test-proofrefresh-b4.js` (new) passes all legs: balance-proof-update
  validate passes on the new panel; the three proof tests pass; ontology
  green; neutrality match on every proof case; panel rows complete (64
  observed cases, 64 distinct policy/seed combos); `validity.sourcesStable`
  true; stale-input negative check — the CURRENTLY RETAINED panel
  (`neutral-r172social-panel/panel.json.gz`) FAILS `validate()` on the new
  tip with "Proof source inputs are not current", proving the green result
  is not vacuous. (The b2 panel is checked the same way as a second
  negative reference.)
- (f) `scripts/validate-ontology.js` exits 0.

## Row-count note (pre-registered, not a mid-run re-score)

The previous retained panel (`neutral-r172social-panel/panel.json.gz`) is a
64-case panel on the same spec, so row counts are comparable this round
(64 vs 64). Row completeness is judged against this panel command's own
spec (64 observed cases, one per policy/seed combination). The
neutrality-reproduction leg (d) is the apples-to-apples check: the 4
proof-case verdicts are comparable across both panels.

## Horizon / seeds / policies

- Panel command: `node scripts/balance-panel.js --out .proofrefresh-b4-panel --n 16 --days 150`
  (driver defaults: policies capable,risk-aware,socialite,winseek; proof-seeds
  = first seed, 7; 68 jobs: 64 observer-on + 4 observer-off proof cases).
  Fresh `--out` dir — no cached cases reused from another tree.
- Seeds: the driver's default 16 (`sweep-dashboard.seedList(16)`:
  7, 42, 99, 1234, 555, 777, 2026, 31337, 1–9), identical to the 1445Z, b2
  and b3 refresh panels' seed list. No new seed band is consumed.
- Horizon 150d: the maintenance-proof horizon, not a balance question —
  death-aware horizons apply to balance arms; this run re-proves the
  instrument, so it repeats the previous refresh's horizon exactly.
- Pace note: the b2 refresh ran ~22–38 min and b3 ~21.5 min for the full
  panel. Budget for this regeneration is ~60 min; Loop A is LIVE
  (tradefirst/feastfirst trees) and may land src/js mid-run — see the
  master-move rule: if the panel re-stales after this run, say so plainly
  and record the exact staling file(s); do NOT force extra regenerations
  beyond the one in the rule; the coordinator owns the final refresh check
  at closeout.

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
