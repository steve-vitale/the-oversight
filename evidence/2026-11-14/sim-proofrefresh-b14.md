# sim-proofrefresh-b14 — measurement proof regenerated (round 14)

## Prereg

- **Run:** fleshout-loop-b-20261114T0330Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b14 (tracker blank #2:
  "proof refresh round 14 on the next manifest change (regenerate +
  re-point, do not hand-edit)"). Round 13 was GO 12/12 on its panel tip
  102853490 but NO-GO on the final tip 62c19318e by leg (a) alone —
  exactly 1 stale key (src/js/abilityActions.js, the retribution fix).
  Round 14 is owed immediately and follows the proven round-11/12/13
  pattern exactly (regen + re-point + 6 GO legs), on the current tip.
  Full prereg committed first:
  `evidence/2026-11-14/sim-proofrefresh-b14-prereg.md`.
- **Base SHA:** `8c83b6a9a266b32cc0b0c1e51f2aa794998facc1` (journey-scale
  r196 addendum; main-tree master at worktree fast-forward, unchanged
  at prereg time and unchanged at closeout — no rebase needed).
- **Primary metric:** `node scripts/godpath/test-measurement-proof-update.js`
  pass/fail on the tip. GO = exit 0, all legs pass.
- **Panel spec:** seeds [7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9],
  policies [capable, risk-aware, socialite, winseek], days 150, origin
  Columbus, Ohio — via `scripts/balance-panel.js` (64 rows).
- **Horizon:** N/A (infrastructure — the panel carries its own 150d spec).
- **GO bar (pre-registered):** (a) test-measurement-proof-update 9/9
  exit 0 on the final tip; (b) measurement-workflow 9/9; (c)
  cache-flags 4/4 outright (2026-11-12 load-artifact lesson: if it
  fails under load, run the discriminating A/B on a quiet box before
  blaming the change); (d) neutrality reproduces the prior panel on
  every proof case, warnings 0; (e) test-proofrefresh-b14.js 12/12
  incl. stale-input negatives (the retained b13 panel AND the b12
  panel FAIL validate() on the new tip); (f) ontology exit 0. Any leg
  miss = NO-GO, no re-scoring.

## Owed-check (pre-registered decision, run before the panel)

- Before: `node scripts/godpath/test-measurement-proof-update.js` FAILS on
  8c83b6a9a with `Error: Proof source inputs are not current`
  (`scripts/balance-proof-update.js:8`), exit 1 — confirmed in the worktree
  before the panel run, matching the coordinator's baseline.
- `B.manifest('.')` vs the retained b13 panel's `sources`
  (`evidence/2026-11-13/neutral-proofrefresh-b13.json.gz`, sha256
  `c70edd6f811a111b6335459a2cf228f8802d45532fcd781ba117fa5b18d6e8ea`):
  exactly **1 manifest key differs** (of 526 total on the tip; 526 in
  the b13 panel):

  - `src/js/abilityActions.js` — sim-retribution-b (62c19318e): defer
    retribution death lines until after the RETRIBUTION summary
    (panel `b32275f576ce…`, tip `fabd5737483f…`)

  The transplant landings + journey-scale r196 moves since 62c19318e
  touched NO manifest file — the staleness on this tip is exactly the
  same single key round 13 closed with. Fewer stale keys than the
  brief's "expect MORE than 1": the moves were evidence/test/driver
  scripts only.
  Observer and contract digests still match the b13 panel
  (observer f37e5ce03414…, contract 37bbb0fad947…). The staleness is
  the source manifest only: 1 real game-code change, no version stamp.
  **Verdict of the owed-check: OWED.** Panels at b13 and earlier are
  superseded; the re-point target is the NEW panel only.

## Panel

- Command: `node scripts/balance-panel.js --out .proofrefresh-b14-panel --n 16 --days 150`
- Single attempt, started 03:55:25Z, finished 04:17:35Z:
  `Saved .proofrefresh-b14-panel; 64 cases, 0 cached jobs. PANEL_EXIT=0`.
  No flap kill during the panel run (no flap episode observed this
  round at all). ~22 min wall.
- The `cases/` cache in `.proofrefresh-b14-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- `sourceHeadStart == sourceHeadEnd == 97929b5d3` (prereg/proof-test
  commit, on base 8c83b6a9a).
- Panel sha256
  `63351ce634740e723570f412b1bf0238c90a0bcd4a482cb4d7e42c62e0f95f8b`.
- Verification (read-only): the generated panel's `sources` vs the
  branch-tip manifest: **0 keys differ**;
  `validity.sourcesStable` true; 64 rows; neutrality 4/4 match, warnings
  0, tuple identical to the b13 panel AND the b12 panel (regeneration moved
  no verdict). Observer/contract digests match the tip and the b13 panel.
  0 rows with warnings/observer/gear problems (read on the OUTER
  panel rows).
- Staleness on the tip (measured, `B.manifest` vs panel `sources`, 526
  keys): **b14-new 0 stale**; **b13 1 stale**; **b12 4 stale** (b12 was
  3 stale on the b13 tip; the abilityActions.js move adds the fourth).
  Before/after: the refresh takes the proof from 1 stale key (b13)
  to 0 (b14-new) on this tip.

## Panel's own wall rows (scale-wall numbers, as the panel carries them)

64 rows, 150d, 16 seeds × 4 policies (regenerated panel, base 8c83b6a9a):

- national 12/64, wins 15/64, entered 15/64 — all 15 wins from the
  capable policy (15/16 capable rows won; risk-aware, socialite, winseek
  0/16 each).
- `row.table` 55/64 — the table field as the panel carries it tracks
  Arc-IV reach (maxArc 4 is also 55/64); it is NOT the entered/won count
  (entered 15/64 is the like-for-like number against b13's 15/64).
  maxRank: global 12, regional 45, village 7.
- Wave reach: 9/64 reached wave 5, 63/64 reached wave 4 (the single
  miss: winseek seed 42, village-lost at d30 on wave 3 — same seed/row as
  b8, b9, b10, b11, b12, and b13).
- Max Arc: 55/64 Arc IV, 9/64 Arc III.
- Median survival 90 game-days, max 150.
- End reasons: village-lost 47, over-other 15, survived 2.
- Vests 24 total; vestsVillager 41.
- Per-policy median days: capable 90, risk-aware 106, socialite 89,
  winseek 74.
- Per-policy wave-5 reach: capable 5, risk-aware 3, socialite 1,
  winseek 0.
- Per-policy vests: capable 0, risk-aware 7, socialite 9, winseek 8.

Against b13's rows (same spec): **0 of 64 rows differ** — the panel rows
are byte-identical to b13's on every carried field (won 15→15, entered
15→15, national 12→12, table 55→55, wave-5 9→9, wave-4 63→63, median
90→90, vests 24→24, vestsVillager 41→41, survived 2→2, village-lost
47→47). The one game-code change since the b13 panel
(abilityActions.js, retribution death-line deferral) moved NO panel
row. These are the instrument's own rows on the new tip, reported as
carried, not a balance verdict (this arm re-proves the instrument; no
lever was played, and no compare run was done). The national step stays
the binding constraint on the win rows that lack it — filed here for
the winnability chain, not chased.

## Master move (during the run)

None. Master stayed at `8c83b6a9a` from worktree fast-forward through
closeout (checked after the panel, after the proof test, and at
closeout). No rebase was needed; the panel tip IS the final tip, so
the prereg rule (legs judged only on the final tip) is satisfied by
the panel-tip results directly. This is the first round since b10
where the final tip did not move under the run.

## Host write flap

None observed this round. No flap kill during the panel run, the proof
test, or the commits; no truncation, no EPERM anywhere. The
safe-commit index clobber DID strike the prereg commit (files
staged-as-deleted + untracked after a correct commit 97929b5d3) —
repaired with the ls-tree -r pipe per the repo lesson, verified
`git status --short` empty + `git diff HEAD` empty before the panel
run. No work lost. The worktree heartbeat calls returned promptly
this round (no registry-lock contention seen).

## Pre-regeneration verification

Measured on the branch tip 97929b5d3 before any regeneration:

- `test-measurement-proof-update.js`: FAILS, exit 1, "Proof source
  inputs are not current" — the expected stale state; the exact stale-key
  list is the 1 key above.
- `validate-ontology.js` standalone (post-panel, pre-proof-test):
  exit 0, "All 138 systems validated", ONTOLOGY.md 2198 lines, no diff
  vs HEAD.

## Proof update

Copied the regenerated panel to
`evidence/2026-11-14/neutral-proofrefresh-b14.json.gz` (new file — the
b13/b12/b11 panels are NOT overwritten), then `node
scripts/balance-proof-update.js
evidence/2026-11-14/neutral-proofrefresh-b14.json.gz` — exit 0;
`scripts/balance-proof.json` re-points at the new panel only
(panelDigest `63351ce6…`). No hand-edited hashes; no re-point to an
old panel.

## GO legs (judged only on the final tip — 8c83b6a9a, which is also the panel tip)

- (a) `test-measurement-proof-update.js`: exit 0, **9 passed, 0 failed**
  — ON THE FINAL TIP. First GO on the final tip since the round-10/11/12/13
  sequence of master-move NO-GOs.
- (b) `test-measurement-workflow.js`: 9/9 (final tip).
- (c) `test-measurement-cache-flags.js`: 4/4 outright, first attempt,
  no load artifact, no re-run needed.
- (d) Neutrality reproduction: match on every proof case, warnings 0,
  tuple identical to the b13 panel AND the b12 panel — regeneration
  moved no verdict. (Covered by proof-test legs 6, 8, 9.)
- (e) `scripts/test-proofrefresh-b14.js`: 12/12 — including the
  stale-input negative checks: the retained b13 panel AND the b12 panel
  FAIL `validate()` on the new tip with "Proof source inputs are not
  current", proving the green result is not vacuous.
- (f) `scripts/validate-ontology.js`: exit 0, "All 138 systems
  validated". ONTOLOGY.md 2198 lines, no diff vs HEAD, no truncation
  this round.
- A miss on any leg would have been NO-GO; on the final tip none missed.
  Judged only against the prereg, never re-scored.
- Telemetry deviation check: `scripts/telemetry-check.js` cannot parse
  the retained `.gz` panel ("Unexpected token" — it expects per-seed
  JSON evidence, not a panel archive), the same limitation the b11/b12/b13
  adoptions recorded. No lever was played, so there is no before/after
  deviation to check; the neutrality reproduction (leg d) is the
  instrument check that stands in its place. No LOUD line to
  investigate beyond that known parser limitation. Baseline NOT rolled.

## Verdict

**GO on the final tip (8c83b6a9a) — all six legs pass, 12/12.**
The measurement proof is refreshed on the final tip: the new panel is
current (0 stale keys), every prereg GO leg passes, and the proof
re-points at the new panel only. Master did not move during the run,
so unlike rounds 10–13 there is no final-tip staleness to carry
forward. Round 15 is owed after the next manifest change — not started
here, per the brief.

## Metric review

- The primary metric judged what it claimed: the proof test failed on
  the stale tip with exactly the expected manifest-mismatch error (1
  key, named) and passes on the refreshed tip with 0 stale keys; the
  stale-input negative checks (b13 and b12 both fail validate on the new
  tip) prove the green result is not vacuous. No re-scoring at any point.
- The brief's "expect MORE stale keys than 1" did not hold: transplant
  landings + journey r196 touched no manifest file. The owed-check
  measured 1, not more — the expectation was a guess, the measurement
  is the record.
- The neutrality reproduction (leg d) held exactly: regeneration moved
  no verdict vs b13 or b12, and this round 0/64 rows differ at all —
  the retribution death-line deferral is invisible to the panel, as
  the instrument is designed to be for a narration-order change. The
  national step stays the binding constraint on the win rows that lack
  it. Filed here for the winnability chain, not chased — this arm's
  scope is the instrument.
- The safe-commit index clobber struck the prereg commit again (fourth
  sighting in this arm's recent rounds) — repaired per the repo lesson,
  no work lost.
- No metric revision proposed for the next run. The prereg held.

## Commits (branch sim-proofrefresh-b14, base 8c83b6a9a)

- 97929b5d3 — prereg + proof test (round 14, base 8c83b6a9a, owed-check 1 stale key)
- [panel commit — to be filled at closeout]
- [closeout commit — this section]

## Closeout — GO ON FINAL TIP (round 15 owed after next manifest change)

- Master did not move during the run: tip 8c83b6a9a at fast-forward,
  panel, proof test, and closeout. No rebase performed; no rebase
  stop-at-pick quirk encountered.
- Leg (a) verified on the final tip 8c83b6a9a: **PASSES, exit 0, 9/9**
  — the panel tip is the final tip.
- **Verdict on the final tip (8c83b6a9a): GO.** All six prereg legs
  pass; test-proofrefresh-b14.js 12/12.
- **Coordinator decision:** merge as-is — `git merge --ff-only
  sim-proofrefresh-b14` in the main tree (no pipe, strict && chain;
  ancestry verified with `git merge-base --is-ancestor` after). Then
  release: `worktree-release.sh sim-proofrefresh-b14 merged`,
  worktree removed, branch deleted, `worktree-reap.sh`, main tree
  verified clean. No push, no bump, no live verification — the ship
  loop owns deploys. "Merged locally, pending ship."
- Round 15 stays owed for the next B run, on the next manifest change.
