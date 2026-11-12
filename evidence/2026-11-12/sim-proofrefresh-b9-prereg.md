# Prereg — sim-proofrefresh-b9: measurement-proof refresh, round 9

- **Run:** fleshout-loop-b-20261112T1430Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b9 (tracker 1130Z next
  blank #3)
- **Arm:** sim-proofrefresh-b9 — the measurement-proof refresh
- **Worktree:** `~/workspace/worktrees/sim-proofrefresh-b9`
- **Branch:** `sim-proofrefresh-b9`
- **Base SHA (read in the main tree immediately before the panel run):**
  `5c4361ccc4715b7755e34193ca6b67de58291d9c` (branch tip equals master
  at run start)
- **Date:** 2026-11-12

## Owed-check (pre-registered decision, run before writing this prereg)

Decision rule (from the arm brief): if
`node scripts/godpath/test-measurement-proof-update.js` PASSES and 0
manifest keys differ, the refresh is NOT owed — stand down, record the
check, do not regenerate. If it FAILS and ≥1 key differs, the refresh
IS owed.

Measured on this branch at 5c4361ccc (before any panel run):

- `test-measurement-proof-update.js`: FAILS (exit 1, "Proof source
  inputs are not current", `scripts/balance-proof-update.js:8`) —
  matches the coordinator's baseline.
- `B.manifest('.')` vs the retained b8 panel's `sources`
  (`evidence/2026-11-12/neutral-proofrefresh-b8.json.gz`, sha256
  `067ff0dbd0b27a5205b01f33c32b8ff96702762df006a6f4d8b0a40efa2f47c5`):
  exactly **4 manifest keys differ** (of 525 total):

  - `index.html` (1c31138c4092 → c0ceffda30b0) — batch ship version
    bump 9b3373853 (`Version bump 11e576828-20261112-112418`)
  - `src/js/build.js` (95f24948681c → e02a8aad4671) — same version
    bump 9b3373853
  - `src/js/conversation.js` (6c77bddb14bb → 845dc36d5e94) —
    journey-scale r133 (3cf9a4644, gesture accept/decline for mimed
    invitations, trap-line fix)
  - `src/js/game.js` (108f3b5f8129 → 64fbc75d9835) —
    sim-eldergrammar-a (a5b75cab8, one-word say-line fix 'A Elder
    veteran' → 'An Elder veteran')

  Observer and contract digests still match (the proof test fails
  only on the source-manifest comparison); the staleness is purely
  the source manifest. The coordinator's read named two of the
  post-b8 landings (eldergrammar game.js, journey-scale r133) — both
  verified — plus the batch ship version bump, which also moved two
  manifest keys (index.html, build.js).

- **Verdict of the owed-check: OWED.** The refresh proceeds below.
  Per the repo AGENTS.md rule (changed Game/controller/harness or
  collector/contract inputs require a fresh real observer-neutral
  maintenance proof), the refresh is a fresh real panel via
  `scripts/balance-proof-update.js`. Never rewrite source identities,
  never waive unknowns, never re-point to an old panel. Panels at b8
  and earlier are superseded — the re-point target is the NEW panel
  only.

Staleness chain (short): b8 refresh (base 0436a04e0, rebased to
9f19007f0, landed) → master commits incl. the eldergrammar game.js
fix, the journey-scale r133 conversation.js change, and the batch
ship version bump (index.html + build.js) → proof stale on
5c4361ccc. This round restores the canonical 64-case maintenance
spec under the proofrefresh name, output
`evidence/2026-11-12/neutral-proofrefresh-b9.json.gz` (new file —
the b8 and b7 panels are NOT overwritten).

## Pre-refresh state, measured on this branch before the panel run

Measured on this branch at 5c4361ccc (before any panel run):

- `test-measurement-proof-update.js`: FAILS (exit 1, "Proof source
  inputs are not current") — matches the coordinator's baseline
  exactly.
- `scripts/balance-proof.json` points at
  `evidence/2026-11-12/neutral-proofrefresh-b8.json.gz`.

## Primary metric

`node scripts/godpath/test-measurement-proof-update.js` pass/fail on
the tip. GO = exit 0, all legs pass.

## GO threshold (all must hold — a miss on any is NO-GO)

- (a) `test-measurement-proof-update.js` exits 0 on this branch after
  `node scripts/balance-proof-update.js evidence/2026-11-12/neutral-proofrefresh-b9.json.gz`
  (exit 0; `scripts/balance-proof.json` re-points at the new panel).
- (b) `test-measurement-workflow.js` is 9/9.
- (c) `test-measurement-cache-flags.js` is 4/4 (known load artifact:
  the test spawns `balance-panel.js` three times with `timeout: 30000`;
  under heavy load a spawn can exceed 30s — see the b8 evidence
  adjudication and the reconcile evidence round 1 adjudication. If it
  fails only on spawn timeout, replicate all four legs manually with
  generous time; a manual 4/4 stands, recorded as such, never a
  silent pass). Do NOT change the 30s cap (sim-mcconfirm-refresh-b
  already NO-GO'd that; the cap stays 30s).
- (d) Neutrality reproduction: the fresh panel's neutral verdict
  reproduces the previous retained panel's
  (`evidence/2026-11-12/neutral-proofrefresh-b8.json.gz`) — neutrality
  `match` on every proof case (4 policies × proof seed 7) and
  `warnings: 0` on every entry, with the (policy, seed, match,
  warnings) tuple identical between the two panels. Regeneration
  alone must not move any verdict; any delta is a finding and a NO-GO
  pending investigation, never a silent pass. (The b7 panel
  `evidence/2026-11-12/neutral-proofrefresh-b7.json.gz` is checked as
  a second reference.)
- (e) `scripts/test-proofrefresh-b9.js` (new) passes all 12 legs:
  balance-proof-update validate passes on the new panel; the three
  proof tests pass; ontology green; neutrality match on every proof
  case; panel rows complete (64 observed cases, 64 distinct
  policy/seed combos); `validity.sourcesStable` true; stale-input
  negative checks — the CURRENTLY RETAINED panel
  (`neutral-proofrefresh-b8.json.gz`) FAILS `validate()` on the new
  tip with "Proof source inputs are not current", proving the green
  result is not vacuous; and the b7 panel
  (`neutral-proofrefresh-b7.json.gz`) FAILS `validate()` the same way.
- (f) `scripts/validate-ontology.js` exits 0.

## Row-count note (pre-registered, not a mid-run re-score)

The previous retained panel (`neutral-proofrefresh-b8.json.gz`) is a
64-case panel on the same spec, so row counts are comparable this
round (64 vs 64). Row completeness is judged against this panel
command's own spec (64 observed cases, one per policy/seed
combination). The neutrality-reproduction leg (d) is the
apples-to-apples check: the 4 proof-case verdicts are comparable
across both panels.

## Horizon / seeds / policies

- Panel command: `node scripts/balance-panel.js --out .proofrefresh-b9-panel --n 16 --days 150`
  (driver defaults: policies capable,risk-aware,socialite,winseek;
  proof-seeds = first seed, 7; 68 jobs: 64 observer-on + 4
  observer-off proof cases). Fresh `--out` dir — no cached cases
  reused from another tree. Run the generation under `setsid` from
  the start (b7 precedent: the panel parent died silently TWICE under
  heavy parallel load; b8 ran 10:00–10:41Z, ~41 min wall, under setsid
  with the parent surviving; resume in the same `--out` dir if it
  dies — the case cache is reused exactly; remove stale `.json.tmp`
  partials per the b6/b7 precedent).
- Seeds: the driver's default 16 (`sweep-dashboard.seedList(16)`:
  7, 42, 99, 1234, 555, 777, 2026, 31337, 1, 2, 3, 4, 5, 6, 8, 9),
  identical to the b8/b7 panel's seed list. No new seed band is
  consumed. Policies: capable, risk-aware, socialite, winseek. Days:
  150. Origin: Columbus, Ohio (driver default).
- Horizon 150d: the maintenance-proof horizon, not a balance question
  — death-aware horizons apply to balance arms; this run re-proves
  the instrument, so it repeats the previous refresh's horizon
  exactly.
- Pace note: b8 ran ~41 min wall; b7 ran ~35 min (incl. two silent
  parent deaths mid-panel); reconcile rounds ran ~55–63 min under
  load avg ~21. The box is heavily loaded right now (sibling
  playtest check.js + journey runs) — budget ~45–60 min for the
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
