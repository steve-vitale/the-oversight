# Prereg — sim-proofrefresh-b10: measurement-proof refresh, round 10

- **Run:** fleshout-loop-b-20261112T1830Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b10 (tracker 1630Z blank #1:
  "proof refresh round 10 on the next manifest change (regenerate +
  re-point, do not hand-edit)")
- **Arm:** sim-proofrefresh-b10 — the measurement-proof refresh
- **Worktree:** `~/workspace/worktrees/sim-proofrefresh-b10`
- **Branch:** `sim-proofrefresh-b10`
- **Base SHA (read in the main tree immediately before the panel run):**
  `50c6e7fc801ffa5b760cc2d886ef066205d2044c` (branch tip equals master
  at run start; "Version bump b91014c86-20261112-183637 (batch ship)")
- **Date:** 2026-11-12

## Owed-check (pre-registered decision, run before writing this prereg)

Decision rule (from the arm brief): if
`node scripts/godpath/test-measurement-proof-update.js` PASSES and 0
manifest keys differ, the refresh is NOT owed — stand down, record the
check, do not regenerate. If it FAILS and ≥1 key differs, the refresh
IS owed.

Measured on this branch at 50c6e7fc8 (before any panel run):

- `test-measurement-proof-update.js`: FAILS (exit 1, "Proof source
  inputs are not current", `scripts/balance-proof-update.js:8`) —
  matches the coordinator's baseline (verified 18:33Z on tip
  b91014c86; re-verified here on 50c6e7fc8).
- `B.manifest('.')` vs the retained b9 panel's `sources`
  (`evidence/2026-11-12/neutral-proofrefresh-b9.json.gz`, sha256
  `1d4178b999bec3707314da0b056731d48f7880f689efe02a1272fa2d25f4676c`):
  exactly **6 manifest keys differ** (of 526 total):

  - `index.html` (c0ceffda30b0 → f8e888313842) — batch ship version
    bump 50c6e7fc8 (`Version bump b91014c86-20261112-183637`)
  - `src/js/build.js` (e02a8aad4671 → 69e74cf730f5) — same version
    bump 50c6e7fc8
  - `src/js/convo-mood.js` (36d2e7e8b278 → 2e8d9c9ed49b) —
    journey establishment r134 (88a3a8db7, Q1 stall diagnosed as
    rung-math; guard-beat pool 2→6 observational lines)
  - `src/js/convo-wants.js` (6c0c7755cdfb → 6c23783d5d0e) —
    journey-crisis r186 (b2a795948, warn-details pool-picker fix)
  - `scripts/policies/competent-r127.js` (absent → 17f3e4555d01) —
    NEW manifest key, journey-landing r128 (87f00547d)
  - `scripts/policies/competent.js` (17f3e4555d01 → 74a890f0844) —
    journey-landing r128 (87f00547d, scholar stops stepping nowhere:
    5 unchecked tbPlayerMove sites, flee/dodge/close fallbacks)

  Observer and contract digests still match (the proof test fails
  only on the source-manifest comparison); the staleness is purely
  the source manifest. Note the b9 adoption addendum already counted
  2 of these keys stale on the landing tip (convo-wants.js,
  competent.js); this round's 6 keys are the full count against the
  retained b9 panel from the b9 generation base 5c4361ccc to the
  current tip 50c6e7fc8.

- **Verdict of the owed-check: OWED.** The refresh proceeds below.
  Per the repo AGENTS.md rule (changed Game/controller/harness or
  collector/contract inputs require a fresh real observer-neutral
  maintenance proof), the refresh is a fresh real panel via
  `scripts/balance-proof-update.js`. Never rewrite source identities,
  never waive unknowns, never re-point to an old panel. Panels at b9
  and earlier are superseded — the re-point target is the NEW panel
  only.

Staleness chain (short): b9 refresh (base 5c4361ccc, landed, rebased
to b0f0ec909) → master commits incl. journey-landing r128
(competent.js + new competent-r127.js), journey-crisis r186
(convo-wants.js), journey establishment r134 (convo-mood.js), and
the batch ship version bump (index.html + build.js) → proof stale on
50c6e7fc8. This round restores the canonical 64-case maintenance
spec under the proofrefresh name, output
`evidence/2026-11-12/neutral-proofrefresh-b10.json.gz` (new file —
the b9, b8 and b7 panels are NOT overwritten).

## Pre-refresh state, measured on this branch before the panel run

Measured on this branch at 50c6e7fc8 (before any panel run):

- `test-measurement-proof-update.js`: FAILS (exit 1, "Proof source
  inputs are not current") — matches the coordinator's baseline
  exactly.
- `scripts/balance-proof.json` points at
  `evidence/2026-11-12/neutral-proofrefresh-b9.json.gz`.

## Primary metric

`node scripts/godpath/test-measurement-proof-update.js` pass/fail on
the tip. GO = exit 0, all legs pass.

## GO threshold (all must hold — a miss on any is NO-GO)

- (a) `test-measurement-proof-update.js` exits 0 on this branch after
  `node scripts/balance-proof-update.js evidence/2026-11-12/neutral-proofrefresh-b10.json.gz`
  (exit 0; `scripts/balance-proof.json` re-points at the new panel).
- (b) `test-measurement-workflow.js` is 9/9.
- (c) `test-measurement-cache-flags.js` is 4/4 (known load artifact:
  the test spawns `balance-panel.js` three times with `timeout: 30000`;
  under heavy load a spawn can exceed 30s — see the b9 evidence
  adjudication and the reconcile evidence round 1 adjudication. If it
  fails only on spawn timeout, replicate all four legs manually with
  generous time; a manual 4/4 stands, recorded as such, never a
  silent pass). Do NOT change the 30s cap (sim-mcconfirm-refresh-b
  already NO-GO'd that; the cap stays 30s).
- (d) Neutrality reproduction: the fresh panel's neutral verdict
  reproduces the previous retained panel's
  (`evidence/2026-11-12/neutral-proofrefresh-b9.json.gz`) — neutrality
  `match` on every proof case (4 policies × proof seed 7) and
  `warnings: 0` on every entry, with the (policy, seed, match,
  warnings) tuple identical between the two panels. Regeneration
  alone must not move any verdict; any delta is a finding and a NO-GO
  pending investigation, never a silent pass. (The b8 panel
  `evidence/2026-11-12/neutral-proofrefresh-b8.json.gz` is checked as
  a second reference.)
- (e) `scripts/test-proofrefresh-b10.js` (new, modeled on b9's) passes
  all 12 legs: balance-proof-update validate passes on the new panel;
  the three proof tests pass; ontology green; neutrality match on
  every proof case; panel rows complete (64 observed cases, 64
  distinct policy/seed combos); `validity.sourcesStable` true;
  stale-input negative checks — the CURRENTLY RETAINED panel
  (`neutral-proofrefresh-b9.json.gz`) FAILS `validate()` on the new
  tip with "Proof source inputs are not current", proving the green
  result is not vacuous; and the b8 panel FAILS `validate()` the same
  way.
- (f) `scripts/validate-ontology.js` exits 0.

## Row-count note (pre-registered, not a mid-run re-score)

The previous retained panel (`neutral-proofrefresh-b9.json.gz`) is a
64-case panel on the same spec, so row counts are comparable this
round (64 vs 64). Row completeness is judged against this panel
command's own spec (64 observed cases, one per policy/seed
combination). The neutrality-reproduction leg (d) is the
apples-to-apples check: the 4 proof-case verdicts are comparable
across both panels.

## Horizon / seeds / policies

- Panel command: `node scripts/balance-panel.js --out .proofrefresh-b10-panel --n 16 --days 150`
  (driver defaults: policies capable,risk-aware,socialite,winseek;
  proof-seeds = first seed, 7; 68 jobs: 64 observer-on + 4
  observer-off proof cases). Fresh `--out` dir — no cached cases
  reused from another tree. Run the generation under `setsid` from
  the start (b7 precedent: the panel parent died silently TWICE under
  heavy parallel load; b8 ran 10:00–10:41Z, ~41 min wall, under setsid;
  b9 ran 14:57–15:50Z, ~53 min wall incl. a VM restart mid-panel,
  resume reused 54 cached cases). Resume in the same `--out` dir if it
  dies — the case cache is reused exactly; remove stale `.json.tmp`
  partials per the b6/b7 precedent.
- Seeds: the driver's default 16 (`sweep-dashboard.seedList(16)`:
  7, 42, 99, 1234, 555, 777, 2026, 31337, 1, 2, 3, 4, 5, 6, 8, 9),
  identical to the b9/b8/b7 panel's seed list. No new seed band is
  consumed. Policies: capable, risk-aware, socialite, winseek. Days:
  150. Origin: Columbus, Ohio (driver default).
- Horizon 150d: the maintenance-proof horizon, not a balance question
  — death-aware horizons apply to balance arms; this run re-proves
  the instrument, so it repeats the previous refresh's horizon
  exactly.
- Pace note: b9 ran ~53 min wall (incl. VM restart); b8 ~41 min;
  reconcile rounds ~55–63 min under load. Budget ~45–60 min for the
  panel. Record the base SHA at run start.

## Master-move rule

- `git rev-parse master` is read in the MAIN tree immediately before
  the panel run (base SHA above) and again after generation.
- If master moved AND the move touched any file in the panel manifest
  (`git diff --name-only` between the two SHAs checked against the
  manifest file list in `scripts/balance-panel.js`), regenerate once
  on the new tip.
- If the move touched no manifest file, keep the panel, rebase the
  branch onto the explicit new master SHA (never `git rebase
  master`), and re-run all proof legs on the rebased branch before
  committing, so the coordinator's `--ff-only` merge stays clean.

## Metric review (to be filled after the run)

- Whether the primary metric judged what it claimed to judge.
- Any delta found in the neutrality reproduction, and its disposition.
- Anything the refresh surfaced outside its scope (filed, not chased).
