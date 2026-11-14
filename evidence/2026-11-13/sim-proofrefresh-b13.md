# sim-proofrefresh-b13 — measurement proof regenerated (round 13)

## Prereg

- **Run:** fleshout-loop-b-20261114T0130Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b13 (tracker blank #2:
  "proof refresh round 13 on the next manifest change (regenerate +
  re-point, do not hand-edit)"). Round 12 landed 2026-11-13 (branch
  sim-proofrefresh-b12, panel regen on 95dbf07f3, rebased onto
  b5ae72cd4, then onto 249da4729) but was NO-GO on the final tip
  249da4729 by leg (a) alone — exactly 2 stale version-stamp keys
  (src/js/build.js, index.html) from the batch-ship version bump, no
  game-code change. Round 13 follows the proven round-11/12 pattern
  exactly (regen + re-point + 6 GO legs), on the current tip.
  Full prereg committed first:
  `evidence/2026-11-13/sim-proofrefresh-b13-prereg.md`.
- **Base SHA:** `102853490` (read in the worktree at panel start;
  main-tree master at registration, unchanged at prereg time).
  Master moved during the run (see below); branch rebased onto the
  explicit new SHA at closeout and leg (a) re-verified.
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
  every proof case, warnings 0; (e) test-proofrefresh-b13.js 12/12
  incl. stale-input negatives (the retained b12 panel AND the b11
  panel FAIL validate() on the new tip); (f) ontology exit 0. Any leg
  miss = NO-GO, no re-scoring.

## Owed-check (pre-registered decision, run before the panel)

- Before: `node scripts/godpath/test-measurement-proof-update.js` FAILS on
  102853490 with `Error: Proof source inputs are not current`
  (`scripts/balance-proof-update.js:8`), exit 1 — confirmed in the worktree
  before the panel run, matching the coordinator's baseline.
- `B.manifest('.')` vs the retained b12 panel's `sources`
  (`evidence/2026-11-12/neutral-proofrefresh-b12.json.gz`, sha256
  `b9bca8826cd460aff66fb6e6b8a79f3e4c5b0bbd4e7b891729ac5f1d4a0a84cc`):
  exactly **3 manifest keys differ** (of 526 total on the tip; 526 in
  the b12 panel):

  - `src/js/build.js` — batch-ship version bump 249da4729 (version
    stamp only)
  - `index.html` — batch-ship version bump 249da4729 (version stamp
    only)
  - `src/js/conversation.js` — journey-landing r130 (6ccdc325e):
    ask:village injured question gets an injured answer [needs-eyes]

  Observer and contract digests still match the b12 panel
  (observer f37e5ce0…, contract 37bbb0fa…). The staleness is the
  source manifest only: 2 version stamps + 1 real game-code change.
  **Verdict of the owed-check: OWED.** Panels at b12 and earlier are
  superseded; the re-point target is the NEW panel only.

## Panel

- Command: `node scripts/balance-panel.js --out .proofrefresh-b13-panel --n 16 --days 150`
- Single attempt, started 01:53:49Z, finished 02:23:53Z:
  `Saved .proofrefresh-b13-panel; 64 cases, 0 cached jobs. PANEL_EXIT=0`.
  No flap kill during the panel run (the flap episode this round hit
  later, during the proof test — see below). ~30 min wall.
- The `cases/` cache in `.proofrefresh-b13-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- `sourceHeadStart == sourceHeadEnd == d65a1bb9c` (prereg/proof-test
  commit, on base 102853490).
- Panel sha256
  `c70edd6f811a111b6335459a2cf228f8802d45532fcd781ba117fa5b18d6e8ea`.
- Verification (read-only): the generated panel's `sources` vs the
  branch-tip manifest: **0 keys differ**;
  `validity.sourcesStable` true; 64 rows; neutrality 4/4 match, warnings
  0, tuple identical to the b12 panel AND the b11 panel (regeneration moved
  no verdict). Observer/contract digests match the tip and the b12 panel.
  0 rows with warnings/observer/gear problems (read on the OUTER
  panel rows).
- Staleness on the tip (measured, `B.manifest` vs panel `sources`, 526
  keys): **b13-new 0 stale**; **b12 3 stale**; **b11 4 stale**.
  Before/after: the refresh takes the proof from 3 stale keys (b12)
  to 0 (b13-new) on this tip.

## Panel's own wall rows (scale-wall numbers, as the panel carries them)

64 rows, 150d, 16 seeds × 4 policies (regenerated panel, base 102853490):

- national 12/64, wins 15/64, entered 15/64 — all 15 wins from the
  capable policy (15/16 capable rows won; risk-aware, socialite, winseek
  0/16 each).
- `row.table` 55/64 — the table field as the panel carries it tracks
  Arc-IV reach (maxArc 4 is also 55/64); it is NOT the entered/won count
  (entered 15/64 is the like-for-like number against b12's 15/64).
  maxRank: global 12, regional 45, village 7.
- Wave reach: 9/64 reached wave 5, 63/64 reached wave 4 (the single
  miss: winseek seed 42, village-lost at d30 on wave 3 — same seed/row as
  b8, b9, b10, b11, and b12).
- Max Arc: 55/64 Arc IV, 9/64 Arc III.
- Median survival 90 game-days, max 150.
- End reasons: village-lost 47, over-other 15, survived 2.
- Vests 24 total; vestsVillager 41.
- Per-policy median days: capable 90, risk-aware 105/106, socialite 75/89,
  winseek 67/74.
- Per-policy wave-5 reach: capable 5, risk-aware 3, socialite 1,
  winseek 0.
- Per-policy vests: capable 0, risk-aware 7, socialite 9, winseek 8.

Against b12's rows (same spec): **0 of 64 rows differ** — the panel rows
are byte-identical to b12's on every carried field (won 15→15, entered
15→15, national 12→12, table 55→55, wave-5 9→9, wave-4 63→63, median
90→90, vests 24→24, vestsVillager 41→41, survived 2→2, village-lost
47→47). The one game-code change since the b12 panel
(conversation.js, journey-landing r130 injured answer) moved NO panel
row. These are the instrument's own rows on the new tip, reported as
carried, not a balance verdict (this arm re-proves the instrument; no
lever was played, and no compare run was done). The national step stays
the binding constraint on the win rows that lack it — filed here for
the winnability chain, not chased.

## Master move (during the run)

Master moved DURING the panel run: `git rev-parse master` in the main
tree reads `62c19318e` at ~02:32Z (was 102853490 at panel start). The move
is sim-transplant 4/5/6 + sim-retribution-b commits (evidence, test
scripts, driver/analyzer scripts) touching exactly ONE manifest file —
`src/js/abilityActions.js` (sim-retribution-b: defer retribution death
lines until after the RETRIBUTION summary). The regenerated panel (base
102853490) is therefore stale on the new tip by that one key. At
closeout the branch is rebased onto the explicit new SHA 62c19318e and
leg (a) re-verified before the coordinator's `--ff-only` merge (see
Closeout).

## Host write flap

- **Episode, ~02:28Z–~02:30Z (proof-test kills).** Flap-watch logged
  FLAP at 02:28:51Z (A/B/E/G/H/I FAIL, EPERM on writes and git
  update-ref) and a partial FLAP? at 02:29:58Z (E/I FAIL on O_EXCL).
  During the first full proof-test run at ~02:27–02:29Z, the flap
  struck two legs: cache-flags failed with EPERM inside its panel jobs,
  and the ontology validator's unconditional rewrite of
  `docs/ONTOLOGY.md` left it at **0 lines** (2198 deletions) — the
  2026-11-12 truncation mode, third sighting (b12 episode 2 was the
  second). The committed file in HEAD was intact (2198 lines).
  Recovery: `git checkout -- docs/ONTOLOGY.md` failed TWICE with EPERM
  (unable to write the file; index.lock write error in the main repo's
  `.git/worktrees/` dir) while plain node writes to /tmp AND to the
  worktree passed in the same minute — the flap flickers per-operation,
  and git's index/ref writes were the ones refused. Restored instead
  via `git show HEAD:docs/ONTOLOGY.md > docs/ONTOLOGY.md`: 2198 lines,
  hash-object matches the HEAD blob exactly (5d6fe602…). After
  clearance (probes pass 02:30:21Z, 02:31:01Z): cache-flags standalone
  4/4 exit 0, ontology validator exit 0 with the file still 2198 lines
  and 0 diff vs HEAD, then the full 12-leg test re-run 12/12. Nothing
  lost; the validator's non-atomic rewrite remains the fragility
  (filed in the b10/b11/b12 reviews, still a tooling-arm item, not this
  refresh).
- The panel run itself (01:53–02:23Z) was NOT flap-killed — one clean
  attempt, 64 cases, 0 cached jobs.
- The safe-commit index clobber struck the prereg commit (files
  staged-as-deleted + untracked after a correct commit d65a1bb9c) —
  repaired with the ls-tree -r pipe per the repo lesson, verified
  `git status --short` empty + `git diff HEAD` empty before the panel
  run. No work lost.
- The worktree heartbeat call after the panel took ~2 min to return
  (registry-lock contention suspected) — heartbeat still landed; noted
  here, not chased.

## Pre-regeneration verification

Measured on the branch tip d65a1bb9c before any regeneration:

- `test-measurement-proof-update.js`: FAILS, exit 1, "Proof source
  inputs are not current" — the expected stale state; the exact stale-key
  list is the 3 keys above.
- `scripts/test-proofrefresh-b13.js`: crashes at leg (d) with ENOENT —
  `evidence/2026-11-13/neutral-proofrefresh-b13.json.gz` does not exist
  yet (the panel has not been copied into evidence/ or re-pointed; that
  happens on the regenerated panel). Legs before the crash: validate
  FAIL (ENOENT on the new panel), proof-update FAIL exit 1, workflow
  8/9, cache-flags 4/4, ontology exit 0.
- `test-measurement-workflow.js` standalone: **8 passed, 1 failed** —
  the failing leg is exactly "retained neutrality proof covers the
  current Game/controller/harness inputs" (the staleness failure; the
  same leg the b11/b12 adoptions recorded as 8/9 on their stale landing
  tips). All other legs pass.
- `validate-ontology.js` standalone: exit 0, "All 138 systems validated",
  ONTOLOGY.md 2198 lines, no diff vs HEAD.

## Proof update

Copied the regenerated panel to
`evidence/2026-11-13/neutral-proofrefresh-b13.json.gz` (new file — the
b12/b11/b10 panels are NOT overwritten), then `node
scripts/balance-proof-update.js
evidence/2026-11-13/neutral-proofrefresh-b13.json.gz` — exit 0;
`scripts/balance-proof.json` re-points at the new panel only
(panelDigest `c70edd6f…`). No hand-edited hashes; no re-point to an
old panel.

## GO legs (judged only on the final tip)

- (a) `test-measurement-proof-update.js`: exit 0, 9 passed — ON THE
  PANEL TIP (102853490). **FAILS on the final tip 62c19318e — see
  Closeout.**
- (b) `test-measurement-workflow.js`: 9/9 (panel tip).
- (c) `test-measurement-cache-flags.js`: 4/4 — first run during the
  flap episode failed with the panel worker's EPERM (not a load
  artifact, not a change artifact); re-run on the cleared box passes
  outright, 4/4, no manual replication needed. The 30s cap is unchanged.
- (d) Neutrality reproduction: match on every proof case, warnings 0,
  tuple identical to the b12 panel AND the b11 panel — regeneration
  moved no verdict. (Covered by proof-test legs 6, 8, 9.)
- (e) `scripts/test-proofrefresh-b13.js`: 12/12 — including the
  stale-input negative checks: the retained b12 panel AND the b11 panel
  FAIL `validate()` on the new tip with "Proof source inputs are not
  current", proving the green result is not vacuous. (The first 12-leg
  run scored 10/12 only because the flap killed legs (c) and (f)
  mid-run — cache-flags EPERM inside its panel jobs, ontology
  truncation; both pass outright on the cleared-box re-run, full test
  12/12. No re-scoring of any leg: the failing runs were flap kills,
  the passing runs are the same checks on the same tip after clearance.)
- (f) `scripts/validate-ontology.js`: exit 0, "All 138 systems
  validated". ONTOLOGY.md restored from HEAD after the flap truncation
  (2198 lines, hash-identical to the HEAD blob) and re-verified after
  the validator re-ran — still 2198 lines, no diff.
- A miss on any leg would have been NO-GO; on the panel tip none missed.
  Judged only against the prereg, never re-scored.
- Telemetry deviation check: `scripts/telemetry-check.js` cannot parse
  the retained `.gz` panel ("Unexpected token" — it expects per-seed
  JSON evidence, not a panel archive), the same limitation the b11/b12
  adoptions recorded. No lever was played, so there is no before/after
  deviation to check; the neutrality reproduction (leg d) is the
  instrument check that stands in its place. No LOUD line to
  investigate. Baseline NOT rolled.

## Verdict

**GO on the panel tip (102853490) — NO-GO on the final tip (62c19318e),
by leg (a) alone.** The measurement proof is refreshed on the panel tip:
the new panel is current (0 stale keys), every prereg GO leg passes, and
the proof re-points at the new panel only. The master move at the wire
(62c19318e) changed exactly 1 manifest key (`src/js/abilityActions.js`,
sim-retribution-b game-code change, not a version stamp), so leg (a)
fails on the final tip and the prereg rule (judged only on the final tip)
makes the round NO-GO there. See Closeout for the coordinator decision
(merge as-is with round 14 owed immediately, or hold for a round-14
regeneration on 62c19318e).

Round 14 NOT attempted: the brief forbids a second panel in one round,
and a fresh ~30 min panel starting near 02:35Z would strand across the
next Loop B run — the same call rounds 10, 11, and 12 made. Round 14
stays owed for the next B run, now on base 62c19318e.

## Metric review

- The primary metric judged what it claimed: the proof test failed on
  the stale tip with exactly the expected manifest-mismatch error (3
  keys, named) and passes on the refreshed tip with 0 stale keys; the
  stale-input negative checks (b12 and b11 both fail validate on the new
  tip) prove the green result is not vacuous. No re-scoring at any point.
- The cache-flags leg's first failure was a flap kill (EPERM inside its
  panel jobs), not the 2026-11-12 spawn-timeout load artifact — the
  discriminating evidence is the failure signature itself plus the
  outright 4/4 pass on the cleared box. The 30s cap stays untouched.
- The ontology leg's first failure was the flap truncating ONTOLOGY.md
  to 0 lines during the validator's rewrite — the same mode as
  2026-11-12 and b12, now seen a third time. The validator should write
  atomically or skip the rewrite when the table is unchanged. Still a
  tooling-arm item, not this refresh; the restore-via-`git show`
  recovery is proven (byte-identical to the HEAD blob) and left no
  damage. New this round: `git checkout --` itself can fail under the
  flap (index.lock EPERM) while plain file writes pass — restores should
  go through `git show > file` + hash check when checkout refuses.
- The neutrality reproduction (leg d) held exactly: regeneration moved
  no verdict vs b12 or b11, and this round 0/64 rows differ at all —
  the r130 conversation change is invisible to the panel, as the
  instrument is designed to be for a dialogue-answer change. The
  national step stays the binding constraint on the win rows that lack
  it. Filed here for the winnability chain, not chased — this arm's
  scope is the instrument.
- The safe-commit index clobber struck the prereg commit — repaired per
  the repo lesson, no work lost.
- No metric revision proposed for the next run. The prereg held.

## Commits (branch sim-proofrefresh-b13, base 102853490 → rebased 62c19318e)

- d65a1bb9c — prereg + proof test (round 13, base 102853490, owed-check
  3 stale keys)
- [panel commit, rebased] — fresh real neutral panel (REGENERATED on
  102853490) + proof re-point + evidence (GO 12/12 on the 102853490 tip;
  see closeout for the 62c19318e re-verification)

## Closeout — (to be filled after the rebase + leg (a) re-verification)
