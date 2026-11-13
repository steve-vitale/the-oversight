# sim-proofrefresh-b12 — measurement proof regenerated (round 12)

## Prereg

- **Run:** fleshout-loop-b-20261113T2230Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b12 (tracker blank #2:
  "proof refresh round 12 on the next manifest change (regenerate +
  re-point, do not hand-edit)"). Round 11 landed 2026-11-13 ~22:30Z
  (branch sim-proofrefresh-b11, panel regen on 89b9030f9, rebased onto
  941eecdce); round 12 follows the proven round-11 pattern exactly
  (regen + re-point + 6 GO legs). Full prereg committed first:
  `evidence/2026-11-13/sim-proofrefresh-b12-prereg.md`.
- **Base SHA:** `95dbf07f3` (read in the worktree at panel start;
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
  every proof case, warnings 0; (e) test-proofrefresh-b12.js 12/12
  incl. stale-input negatives (the retained b11 panel AND the b10
  panel FAIL validate() on the new tip); (f) ontology exit 0. Any leg
  miss = NO-GO, no re-scoring.

## Owed-check (pre-registered decision, run before the panel)

- Before: `node scripts/godpath/test-measurement-proof-update.js` FAILS on
  95dbf07f3 with `Error: Proof source inputs are not current`
  (`scripts/balance-proof-update.js:8`), exit 1 — confirmed in the worktree
  before the panel run, matching the coordinator's baseline.
- `B.manifest('.')` vs the retained b11 panel's `sources`
  (`evidence/2026-11-12/neutral-proofrefresh-b11.json.gz`, sha256
  `2da0e215acb37614a3aced8bc7c4e479cde72edad30a26cd3a0e922ba4e77b1e`):
  exactly **2 manifest keys differ** (of 526 total on the tip; 526 in
  the b11 panel):

  - `src/js/conversation.js` — journey-social r195 (56655e81e):
    favor-requirements spend-out fires under the door-block cycle
  - `src/js/convo-dialogue.js` — journey-social r195 (56655e81e):
    empty-recap 4-variant pool

  Observer and contract digests still match the b11 panel. The
  staleness is purely the source manifest. **Verdict of the owed-check:
  OWED.** Panels at b11 and earlier are superseded; the re-point
  target is the NEW panel only.

## Panel

- Command: `node scripts/balance-panel.js --out .proofrefresh-b12-panel --n 16 --days 150`
- First attempt started 22:51:17Z, killed ~23:08Z by the host write flap
  (EPERM in the panel worker's case-file write, 38 dots, 41 cases cached).
  Second attempt (resume, same command, cache reused) started 23:10:39Z,
  killed ~23:19Z by the same flap (29 more dots, 68 cases cached).
  Third attempt started 23:23:36Z after two consecutive passing probes
  (23:21:14Z, 23:22:15Z) + heartbeat: `Saved .proofrefresh-b12-panel;
  64 cases, 67 cached jobs. PANEL_EXIT=0`, finished 23:25:27Z. The one
  fresh job was the case whose write the second flap kill interrupted.
  Total wall across the three attempts ~34 min of panel work; the flap
  cost two restarts but no recomputation beyond the single killed case.
- The `cases/` cache in `.proofrefresh-b12-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- `sourceHeadStart == sourceHeadEnd == 8d0dd1e83` (prereg/proof-test
  commit, on base 95dbf07f3).
- Panel sha256
  `b9bca8826cd460aff66fb6e6b8a79f3e4c5b0bbd4e7b891729ac5f1d4a0a84cc`.
- Verification (read-only): the generated panel's `sources` vs the
  branch-tip manifest: **0 keys differ**;
  `validity.sourcesStable` true; 64 rows; neutrality 4/4 match, warnings
  0, tuple identical to the b11 panel AND the b10 panel (regeneration moved
  no verdict). Observer/contract digests match the tip and the b11 panel.
  0 rows with warnings/observer/gear problems (read on the OUTER
  panel rows).
- Staleness on the tip (measured, `B.manifest` vs panel `sources`, 526
  keys): **b12-new 0 stale**; **b11 2 stale**; **b10 20 stale**
  (b10 was 18 stale on the b11 tip; the r195 move adds the 2 new keys).
  Before/after: the refresh takes the proof from 2 stale keys (b11)
  to 0 (b12-new) on this tip.

## Panel's own wall rows (scale-wall numbers, as the panel carries them)

64 rows, 150d, 16 seeds × 4 policies (regenerated panel, base 95dbf07f3):

- national 12/64, wins 15/64, entered 15/64 — all 15 wins from the
  capable policy (15/16 capable rows won; risk-aware, socialite, winseek
  0/16 each).
- `row.table` 55/64 — the table field as the panel carries it tracks
  Arc-IV reach (maxArc 4 is also 55/64); it is NOT the entered/won count
  (entered 15/64 is the like-for-like number against b11's 16/64).
  maxRank: global 12, regional 45, village 7.
- Wave reach: 9/64 reached wave 5, 63/64 reached wave 4 (the single
  miss: winseek seed 42, village-lost at d30 on wave 3 — same seed/row as
  b8, b9, b10, and b11).
- Max Arc: 55/64 Arc IV, 9/64 Arc III.
- Median survival 90 game-days, max 150.
- End reasons: village-lost 47, over-other 15, survived 2.
- Vests 24 total; vestsVillager 41.
- Per-policy median days: capable 90, risk-aware 106, socialite 89,
  winseek 74.
- Per-policy wave-5 reach: capable 5, risk-aware 3, socialite 1,
  winseek 0.
- Per-policy vests: capable 0, risk-aware 7, socialite 9, winseek 8.

Against b11's rows (same spec; the only game-code change between is the
r195 conversation/convo-dialogue move): won 16→15, entered 16→15,
national 13→12, table 56→55, wave-5 6→9, wave-4 63→63, median 90→90,
vests 25→24, vestsVillager 41→41, survived 1→2, village-lost 47→47.
Row-by-row, **4 of 64 rows differ** between the b11 panel and this
regenerated panel — all capable, all from the two r195 files:

- capable/7: wave 4→5, national 1→0, vests 1→0 — still wins.
- capable/9: wave 4→5 — still wins.
- capable/555: wave 4→5, but days 92→150, won 1→0, table 1→0,
  entered 1→0, end over-other→survived, maxArc 4→3 — the one lost win;
  the village survives the full 150 days without entering/winning.
- capable/2026: days 93→90 — still wins.

Wave-5 facing ROSE (6→9) while wins FELL by one: the r195 conversation
change moved three capable rows to face wave 5, and one of them (555)
now survives to day 150 without a win instead of winning at wave 4.
These are the instrument's own rows on the new tip, reported as
carried, not a balance verdict (this arm re-proves the instrument; no
lever was played, and no compare run was done). The national step stays
the binding constraint on the win rows that lack it — filed here for
the winnability chain, not chased.

## Master move (during the run)

Master moved DURING the panel run: `git rev-parse master` in the main
tree reads `b5ae72cd4` at ~23:25Z (was 95dbf07f3 at panel start). The move
is four sim-transplant118 commits (Loop A family-1, live) touching
exactly TWO files — `evidence/2026-11-13/sim-transplant118.md` and
`scripts/test-transplant118.js` — NO manifest file. The regenerated panel
(base 95dbf07f3) is therefore current on the new tip too: the tip manifest
is identical, 0 stale keys either way. At closeout the branch is
rebased onto the explicit new SHA b5ae72cd4 and leg (a) re-verified
before the coordinator's `--ff-only` merge.

## Host write flap

- **Episode 1, ~23:07:59Z–~23:21Z (two kills).** Flap-watch logged FLAP
  at 23:07:59Z (A=FAIL EPERM, B=FAIL update-ref, E=FAIL). It killed the
  first panel run at ~23:08Z (EPERM in `balance-panel.js:328`, the
  worker's case-file write) and the resumed second run at ~23:19Z
  (same site, same signature). My own probes failed 23:19:21Z and
  23:20:14Z, then passed 23:21:14Z and 23:22:15Z; heartbeat first after
  clearance (23:22:15Z), third panel attempt started 23:23:36Z and
  finished clean. The runtime restarted once mid-episode (~23:08Z),
  SIGTERM'ing my background waiters; the panel's `cases/` cache
  survived both kills and both restarts, so each resume reused
  everything already computed (67/68 jobs on the final run).
- **Episode 2, ~23:29Z–~23:38Z (ontology truncation).** Flap-watch
  logged FLAP at 23:29:05Z and 23:30:07Z; my probes failed
  23:30:19Z–23:36:40Z (seven consecutive). During the first full
  proof-test run at ~23:26–23:27Z, the flap struck the ontology
  validator's unconditional rewrite of `docs/ONTOLOGY.md` and left it
  at **0 lines** (2198 deletions) — the 2026-11-12 truncation mode,
  recurring. The committed file in HEAD was intact (2198 lines).
  Recovery, after clearance (probes pass 23:38:26Z, 23:39:26Z) and
  heartbeat first: `git checkout -- docs/ONTOLOGY.md` restored 2198
  lines, 0 diff; validator re-run exit 0, file still 2198 lines, 0
  diff after. Nothing lost; the validator's non-atomic rewrite remains
  the fragility (filed in the b10/b11 reviews, still a tooling-arm
  item, not this refresh).
- Flap-watch itself restarted at 23:16:38Z (new boot 5623d281) via the
  watchdog after the runtime restart — the watchdog did its job.
- The safe-commit index clobber struck the prereg commit (files
  staged-as-deleted + untracked after a correct commit 8d0dd1e83) —
  repaired with the ls-tree -r pipe per the repo lesson, verified
  `git status --short` empty + `git diff HEAD` empty before the panel
  run. No work lost.

## Pre-regeneration verification

Measured on the branch tip 8d0dd1e83 before any regeneration:

- `test-measurement-proof-update.js`: FAILS, exit 1, "Proof source
  inputs are not current" — the expected stale state; the exact stale-key
  list is the 2 keys above.
- `scripts/test-proofrefresh-b12.js`: crashes at leg (d) with ENOENT —
  `evidence/2026-11-12/neutral-proofrefresh-b12.json.gz` does not exist
  yet (the panel has not been copied into evidence/ or re-pointed; that
  happens on the regenerated panel). Legs before the crash: validate
  FAIL (ENOENT on the new panel), proof-update FAIL exit 1, workflow
  8/9, cache-flags 4/4, ontology exit 0.
- `test-measurement-workflow.js` standalone: **8 passed, 1 failed** —
  the failing leg is exactly "retained neutrality proof covers the
  current Game/controller/harness inputs" (the staleness failure; the
  same leg the b11 adoption recorded as 8/9 on its stale landing tip).
  All other legs pass.
- `validate-ontology.js` standalone: exit 0, "All 138 systems validated",
  ONTOLOGY.md 2198 lines, no diff vs HEAD.

## Proof update

Copied the regenerated panel to
`evidence/2026-11-12/neutral-proofrefresh-b12.json.gz` (new file — the
b11/b10/b9 panels are NOT overwritten), then `node
scripts/balance-proof-update.js
evidence/2026-11-12/neutral-proofrefresh-b12.json.gz` — exit 0;
`scripts/balance-proof.json` re-points at the new panel only
(panelDigest `b9bca882…`). No hand-edited hashes; no re-point to an
old panel.

## GO legs (judged only on the final tip)

- (a) `test-measurement-proof-update.js`: exit 0, 9 passed.
- (b) `test-measurement-workflow.js`: 9/9.
- (c) `test-measurement-cache-flags.js`: 4/4 — first run during the
  flap episode failed with the panel worker's EPERM (not a load
  artifact, not a change artifact); re-run on the cleared box passes
  outright, 4/4, no manual replication needed. The 30s cap is unchanged.
- (d) Neutrality reproduction: match on every proof case, warnings 0,
  tuple identical to the b11 panel AND the b10 panel — regeneration
  moved no verdict. (Covered by proof-test legs 6, 8, 9.)
- (e) `scripts/test-proofrefresh-b12.js`: 12/12 — including the
  stale-input negative checks: the retained b11 panel AND the b10 panel
  FAIL `validate()` on the new tip with "Proof source inputs are not
  current", proving the green result is not vacuous. (The first 12-leg
  run scored 10/12 only because the flap killed legs (c) and (f)
  mid-run — cache-flags EPERM inside its panel jobs, ontology
  truncation; both pass outright on the cleared-box re-run, full test
  12/12. No re-scoring of any leg: the failing runs were flap kills,
  the passing runs are the same checks on the same tip after clearance.)
- (f) `scripts/validate-ontology.js`: exit 0, "All 138 systems
  validated". ONTOLOGY.md restored from HEAD after the flap truncation
  (2198 lines, no diff vs HEAD) and re-verified after the validator
  re-ran — still 2198 lines, no diff.
- A miss on any leg would have been NO-GO; none missed. Judged only
  against the prereg, never re-scored.
- Telemetry deviation check: `scripts/telemetry-check.js` cannot parse
  the retained `.gz` panel ("Unexpected token" — it expects per-seed
  JSON evidence, not a panel archive), the same limitation the b11
  adoption recorded. No lever was played, so there is no before/after
  deviation to check; the neutrality reproduction (leg d) is the
  instrument check that stands in its place. No LOUD line to
  investigate. Baseline NOT rolled.

## Verdict

**GO on the panel tip (95dbf07f3) and on the b5ae72cd4 rebase — NO-GO
on the final tip (249da4729), by leg (a) alone.** The measurement proof
is refreshed on the panel tip: the new panel is current (0 stale keys),
every prereg GO leg passes, and the proof re-points at the new panel
only. The batch-ship version bump that landed at the wire (249da4729)
moved exactly 2 version-stamp manifest keys (`src/js/build.js`,
`index.html`), so leg (a) fails on the final tip and the prereg rule
(judged only on the final tip) makes the round NO-GO there. See
Closeout for the coordinator decision (merge as-is with round 13 owed
immediately, or hold for a round-13 regeneration on 249da4729).

Round 13 NOT attempted: round 12's panel took three attempts across
two flap episodes plus two runtime restarts; a second ~35 min panel
plus legs would overrun the window and strand mid-flight, the same
call rounds 10 and 11 made. Round 13 stays owed for the next B run.

## Metric review

- The primary metric judged what it claimed: the proof test failed on
  the stale tip with exactly the expected manifest-mismatch error (2
  keys, named) and passes on the refreshed tip with 0 stale keys; the
  stale-input negative checks (b11 and b10 both fail validate on the new
  tip) prove the green result is not vacuous. No re-scoring at any point.
- The cache-flags leg's first failure was a flap kill (EPERM inside its
  panel jobs), not the 2026-11-12 spawn-timeout load artifact — the
  discriminating evidence is the failure signature itself plus the
  outright 4/4 pass on the cleared box. The 30s cap stays untouched.
- The ontology leg's first failure was the flap truncating ONTOLOGY.md
  to 0 lines during the validator's rewrite — the same mode as
  2026-11-12, now seen twice. The validator should write atomically or
  skip the rewrite when the table is unchanged. Still a tooling-arm
  item, not this refresh; the restore-from-HEAD recovery is proven and
  left no damage.
- The neutrality reproduction (leg d) held exactly: regeneration moved
  no verdict vs b11 or b10, even though 4/64 rows differ and wave-5
  reach rose 6→9 while wins fell 16→15 — the observer-neutrality proof
  is insensitive to the row movement, as designed. The row movement
  itself (three capable rows now facing wave 5; capable/555 surviving
  150 days without a win) is a scale-wall observation from the r195
  conversation change, not a defect in the instrument. Filed here for
  the winnability chain, not chased — this arm's scope is the instrument.
- The safe-commit index clobber struck the prereg commit — repaired per
  the repo lesson, no work lost.
- No metric revision proposed for the next run. The prereg held.

## Commits (branch sim-proofrefresh-b12, base 95dbf07f3 → rebased b5ae72cd4 → rebased 249da4729)

- [prereg commit, rebased] — prereg + proof test (12 legs modeled on b11)
- [panel commit, rebased] — fresh real neutral panel (REGENERATED on
  95dbf07f3) + proof re-point + evidence (GO 12/12 on the 95dbf07f3 tip
  and on the b5ae72cd4 tip; see closeout for the 249da4729 re-verification)

## Closeout — LANDED (with a second master move at the wire)

- Master moved during the run to b5ae72cd4 (four sim-transplant118
  commits, evidence + one test script, NO manifest file). Branch rebased
  onto the explicit SHA b5ae72cd4 (picks clean), leg (a) re-verified
  9/9 exit 0 on that tip; the panel stays valid (manifest identical,
  0 stale keys).
- Master moved AGAIN at the wire: `249da4729` — batch-ship version bump
  ("Version bump b5ae72cd4-20261113-233744"), touching `index.html`,
  `src/js/build.js`, `sw.js`, `version.json`. Two of those ARE manifest
  files. Branch rebased onto the explicit new SHA 249da4729 (picks
  clean, tip 938c8df62) and leg (a) re-verified on the rebased tip:
  **FAILS, exit 1 — exactly 2 stale keys, `src/js/build.js` and
  `index.html`, both version stamps from the ship-loop bump only.**
  No game-code change; the panel rows are unaffected, but the proof
  system hashes file contents and cannot distinguish a version stamp
  from a game change, and no hand-edited hashes are permitted.
- **Verdict on the final tip (249da4729): NO-GO per the prereg rule
  (legs judged only on the final tip).** GO 12/12 on the 95dbf07f3 tip
  and on the b5ae72cd4 tip; NO-GO on 249da4729 by leg (a) alone, on
  exactly the 2 version-stamp keys. The branch as committed still
  improves master: the retained b11 panel is stale on 249da4729 by 4
  keys (2 r195 + 2 version), the b12 panel by 2 (version only).
- **Coordinator decision needed:** merge this branch as-is (ff-only is
  clean; the proof stays stale by the 2 version keys and round 13 is
  owed immediately on 249da4729) or hold it for a round-13 regeneration
  on 249da4729. This run does NOT regenerate: the brief forbids a
  second panel / round 13, and a fresh ~35 min panel starting near
  00:00Z would strand across the next Loop B run, the same call rounds
  10 and 11 made. Round 13 stays owed for the next B run, now on base
  249da4729.
- Merge (if the coordinator takes it): `git merge --ff-only
  sim-proofrefresh-b12` in the main tree (no pipe, strict && chain;
  ancestry verified with `git merge-base --is-ancestor` after). Then
  release: `worktree-release.sh sim-proofrefresh-b12 merged`,
  worktree removed, branch deleted, `worktree-reap.sh`, main tree
  verified clean. No push, no bump, no live verification — the ship
  loop owns deploys. "Merged locally, pending ship."
