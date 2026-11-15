# sim-proofrefresh-b19 — measurement proof regenerated (round 19)

## Prereg

- **Run:** fleshout-loop-b-20261115T0310Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b19 (tracker blank #2:
  "proof refresh round 19 on the next manifest change (regenerate +
  re-point, do not hand-edit)"). Round 18 was GO 12/12 on panel
  cc38babf, merged. Round 19 is owed NOW: the 0155Z Loop B round
  (master a4d0b2038) merged succpolity + holdbuild, which added policy
  files under scripts/policies/ that the proof manifest hashes,
  re-staling the b18 panel. Round 19 follows the proven
  round-11/12/13/14/15/16/17/18 pattern exactly (regen + re-point +
  6 GO legs), on the current tip. Full prereg committed first:
  `evidence/2026-11-14/sim-proofrefresh-b19-prereg.md`.
- **Base SHA:** `a4d0b2038` (main-tree master at run start; the worktree
  branch was fast-forwarded from its registration point 910bff7f4 to
  a4d0b2038 before the prereg — no local commits existed at ff time,
  tree clean). Master moved during the run (see below); branch rebased
  onto the explicit new SHA at closeout and leg (a) re-verified.
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
  every proof case, warnings 0; (e) test-proofrefresh-b19.js 12/12
  incl. stale-input negatives (the retained b18 panel AND the b17
  panel FAIL validate() on the new tip); (f) ontology exit 0. Any leg
  miss = NO-GO, no re-scoring.
- **Negative-panel note (brief vs pattern):** the task brief names the
  b13 and b12 panels as the leg-(e) negatives, copied from the
  round-13 brief. Rounds 14–18 have since landed and the current
  retained panel (the one `scripts/balance-proof.json` points at) is
  b18, so the pattern-faithful negatives — the two most recent prior
  panels, as b13 used b12/b11 and b18 used b17/b16 — are b18 and b17.
  The b19 test checks b18/b17; the b13 and b12 negatives were ALSO
  verified (validate() fails on both) in the owed-check and are
  recorded below, so the brief's literal requirement is met as well.

## Owed-check (pre-registered decision, run before the panel)

- Before: `node scripts/godpath/test-measurement-proof-update.js` FAILS on
  a4d0b2038 with `Error: Proof source inputs are not current`
  (`scripts/balance-proof-update.js:8`), exit 1 — confirmed in the worktree
  before the panel run, matching the coordinator's baseline.
  `test-measurement-workflow.js` standalone: **8 passed, 1 failed** —
  the failing leg is exactly "retained neutrality proof covers the
  current Game/controller/harness inputs" (the staleness failure; the
  same leg the b11/b12/b13 adoptions recorded as 8/9 on their stale
  landing tips).
- `B.manifest('.')` vs the retained b18 panel's `sources`
  (`evidence/2026-11-14/neutral-proofrefresh-b18.json.gz`, sha256
  `cc38babf2acdff069b86636e21cc4028a7c70bf858b991fbb166e769ba242786`):
  tip 529 keys, panel 526 keys — **3 keys only in the tip + 4 keys
  differ**:

  - `scripts/policies/competent-answercourt-b.js` — NEW (0155Z merges)
  - `scripts/policies/competent-scaleclimb-b.js` — NEW (0155Z merges)
  - `scripts/policies/competent-succpolity-b.js` — NEW (0155Z merges)
  - `src/js/betrayal.js` — Lane B social life r206 (365b17d7d):
    invite-small double-serve fix (panel `b702adcd61bd…`, tip
    `17e1e4c8a638…`)
  - `src/js/game.js` — journey-establishment r139 (93f88819c):
    spotter wiring, forage + bumpPlantFamiliarity grants (panel
    `84a25e80dbb4…`, tip `f3d10e7bece6…`)
  - `src/js/build.js` — batch-ship version bump 910bff7f4 (version
    stamp only; panel `4d8491819f2a…`, tip `002759da082a…`)
  - `index.html` — batch-ship version bump 910bff7f4 (version stamp
    only; panel `3516fd2cc211…`, tip `e35cc1619c6a…`)

  Observer and contract digests still match the b18 panel (observer
  f37e5ce0…, contract 37bbb0fa…). The staleness is the source manifest
  only: 3 new policy files + 2 real game-code changes + 2 version
  stamps.
- `B.manifest('.')` vs the retained b13 panel's `sources`
  (`evidence/2026-11-13/neutral-proofrefresh-b13.json.gz`): tip 529
  keys, panel 526 keys — the same 3 new policy files + **8 keys
  differ** (abilityActions.js, betrayal.js, build.js, contests.js,
  conversation.js, game.js, partyTactics.js, index.html). Observer and
  contract digests still match the b13 panel.
- Stale-input negatives verified on this tip (validate() FAILS with
  "Proof source inputs are not current" on all four): b13, b12, b18,
  b17. The brief's literal b13/b12 negatives hold, and so do the
  pattern-faithful b18/b17 negatives the b19 test checks.
- Pre-regeneration `test-proofrefresh-b19-20261114.js`: crashes at leg
  (d) with ENOENT — `evidence/2026-11-14/neutral-proofrefresh-b19.json.gz`
  does not exist yet (the panel has not been generated or re-pointed).
  Legs before the crash: validate FAIL (ENOENT on the new panel),
  proof-update FAIL exit 1, workflow 8/9, cache-flags 4/4, ontology
  exit 0 ("All 138 systems validated", ONTOLOGY.md 2198 lines).
- **Verdict of the owed-check: OWED.** Panels at b18 and earlier are
  superseded; the re-point target is the NEW panel only.

## Panel

- Command: `node scripts/balance-panel.js --out .proofrefresh-b19-panel --n 16 --days 150`
- Single attempt, started 03:19:12Z, finished 03:59:58Z:
  `Saved .proofrefresh-b19-panel; 64 cases, 0 cached jobs. PANEL_EXIT=0`.
  No flap kill during the panel run. ~41 min wall.
- The `cases/` cache in `.proofrefresh-b19-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- `sourceHeadStart == sourceHeadEnd == 92a619524` (prereg/owed-check
  commit, on base a4d0b2038).
- Panel sha256
  `8ea3a8bdcb8b72d6988a2fb7bf181623480eecca1f104f9c6241439fa5266e8e`.
- Verification (read-only): the generated panel's `sources` vs the
  branch-tip manifest: **0 keys differ**;
  `validity.sourcesStable` true; 64 rows; neutrality 4/4 match, warnings
  0, tuple identical to the b18 panel AND the b17 panel (regeneration
  moved no verdict). Observer/contract digests match the tip and the b18
  panel. 0 rows with warnings/observer/gear problems (read on the OUTER
  panel rows).
- Staleness on the tip (measured, `B.manifest` vs panel `sources`, 529
  keys): **b19-new 0 stale**; **b18 7 stale** (3 new policy files + 4
  changed keys); **b17 8 stale**.
  Before/after: the refresh takes the proof from 7 stale keys (b18)
  to 0 (b19-new) on this tip.

## Panel's own wall rows (scale-wall numbers, as the panel carries them)

64 rows, 150d, 16 seeds × 4 policies (regenerated panel, base a4d0b2038):

- national 11/64, wins 16/64, entered 16/64 — all 16 wins from the
  capable policy (16/16 capable rows won; risk-aware, socialite, winseek
  0/16 each).
- `row.table` 56/64 — the table field as the panel carries it tracks
  Arc-IV reach (maxArc 4 is also 56/64); it is NOT the entered/won count
  (entered 16/64 is the like-for-like number against b18's 16/64).
  maxRank: global 11, regional 46, village 7.
- Wave reach: 13/64 reached wave 5, 63/64 reached wave 4 (the single
  miss: winseek seed 42, village-lost at d30 on wave 3 — same seed/row as
  b8, b9, b10, b11, b12, and b13).
- Max Arc: 56/64 Arc IV, 8/64 Arc III.
- Median survival 90 game-days, max 150.
- End reasons: village-lost 46, over-other 16, survived 2.
- Vests 23 total; vestsVillager 39.
- Per-policy median days: capable 90, risk-aware 111/114, socialite 92/94,
  winseek 68/74.
- Per-policy wave-5 reach: capable 4, risk-aware 7, socialite 2,
  winseek 0.
- Per-policy vests: capable 2, risk-aware 7, socialite 6, winseek 8.

Against b18's rows (same spec): **0 of 64 rows differ** — the panel rows
are byte-identical to b18's on every carried field (won 16→16, entered
16→16, national 11→11, table 56→56, wave-5 13→13, wave-4 63→63, median
90→90, vests 23→23, vestsVillager 39→39, survived 2→2, village-lost
46→46). The two game-code changes since the b18 panel (betrayal.js r206
invite-small fix, game.js r139 spotter wiring) moved NO panel row. These
are the instrument's own rows on the new tip, reported as carried, not a
balance verdict (this arm re-proves the instrument; no lever was played,
and no compare run was done). The national step stays the binding
constraint on the win rows that lack it — filed here for the
winnability chain, not chased.

## Master move (during the run)

Master moved DURING the panel run: `git rev-parse master` in the main
tree reads `7b2192b76` at ~04:00Z (was a4d0b2038 at panel start). The move
is 6 commits — sim-transplant8c-a (4 commits: evidence + proof/test
scripts) + sim-succpolity-g1join-b (2 commits: the G1 join false-positive
fix, 4c9d3c940, + prereg) — touching ONLY evidence/ files and
scripts/analyze-*, scripts/test-* files. Exactly ZERO manifest files
changed (verified by file list; the rebase + leg-(a) re-verification at
closeout is the definitive check). At closeout the branch is rebased onto
the explicit new SHA 7b2192b76 and leg (a) re-verified before the
coordinator's `--ff-only` merge (see Closeout).

## Host write flap

- No flap episode observed during this run. The panel run (03:19–03:59Z)
  completed in one clean attempt; all commits, the re-point write, and
  the ontology validator's runs left every file intact (ONTOLOGY.md
  2198 lines before and after, 0 diff vs HEAD). No truncated writes, no
  EPERM.
- The safe-commit index clobber struck BOTH prereg commits (first:
  files staged-as-deleted + untracked after a correct commit 5fba70421;
  second: `MM` on the single file after 92a61952) — repaired with the
  ls-tree -r pipe per the repo lesson, verified `git status --short`
  empty + `git diff HEAD` empty before the panel run. No work lost.

## Pre-regeneration verification

Measured on the branch tip 92a61952 before any regeneration:

- `test-measurement-proof-update.js`: FAILS, exit 1, "Proof source
  inputs are not current" — the expected stale state; the exact stale-key
  list is the 7 keys above (3 new + 4 changed).
- `scripts/test-proofrefresh-b19-20261114.js`: crashes at leg (d) with
  ENOENT — `evidence/2026-11-14/neutral-proofrefresh-b19.json.gz` does
  not exist yet (the panel has not been copied into evidence/ or
  re-pointed; that happens on the regenerated panel). Legs before the
  crash: validate FAIL (ENOENT on the new panel), proof-update FAIL exit
  1, workflow 8/9, cache-flags 4/4, ontology exit 0.
- `test-measurement-workflow.js` standalone: **8 passed, 1 failed** —
  the failing leg is exactly "retained neutrality proof covers the
  current Game/controller/harness inputs" (the staleness failure; the
  same leg the b11/b12/b13 adoptions recorded as 8/9 on their stale
  landing tips). All other legs pass.
- `validate-ontology.js` standalone: exit 0, "All 138 systems validated",
  ONTOLOGY.md 2198 lines, no diff vs HEAD.

## Proof update

Copied the regenerated panel to
`evidence/2026-11-14/neutral-proofrefresh-b19.json.gz` (new file — the
b18/b17/b13/b12 panels are NOT overwritten), then `node
scripts/balance-proof-update.js
evidence/2026-11-14/neutral-proofrefresh-b19.json.gz` — exit 0;
`scripts/balance-proof.json` re-points at the new panel only
(panelDigest `8ea3a8bd…`). No hand-edited hashes; no re-point to an
old panel.

## GO legs (judged only on the final tip)

- (a) `test-measurement-proof-update.js`: exit 0, 9 passed — ON THE
  PANEL TIP (a4d0b2038 + prereg commits). **Re-verified on the final tip
  7b2192b76 — see Closeout.**
- (b) `test-measurement-workflow.js`: 9/9 (panel tip).
- (c) `test-measurement-cache-flags.js`: 4/4 outright — no load artifact,
  no flap kill; passes on the first run. The 30s cap is unchanged.
- (d) Neutrality reproduction: match on every proof case, warnings 0,
  tuple identical to the b18 panel AND the b17 panel — regeneration
  moved no verdict. (Covered by proof-test legs 6, 8, 9.)
- (e) `scripts/test-proofrefresh-b19-20261114.js`: 12/12 — including the
  stale-input negative checks: the retained b18 panel AND the b17 panel
  FAIL `validate()` on the new tip with "Proof source inputs are not
  current", proving the green result is not vacuous. (The brief's
  b13/b12 negatives were verified separately in the owed-check and also
  fail validate() on this tip.)
- (f) `scripts/validate-ontology.js`: exit 0, "All 138 systems
  validated". ONTOLOGY.md 2198 lines, 0 diff vs HEAD.
- A miss on any leg would have been NO-GO; on the panel tip none missed.
  Judged only against the prereg, never re-scored.
- Telemetry deviation check: `scripts/telemetry-check.js` cannot parse
  the retained `.gz` panel ("Unexpected token" — it expects per-seed
  JSON evidence, not a panel archive), the same limitation the
  b11/b12/b13 adoptions recorded. Its LOUD line is that parse refusal,
  investigated this run: the tool cannot read panel archives at all, so
  there is no per-seed evidence for it to check and no deviation to
  judge; the neutrality reproduction (leg d) is the instrument check
  that stands in its place. No lever was played, so there is no
  before/after deviation to check. Baseline NOT rolled.

## Verdict

**GO on the panel tip (a4d0b2038 + prereg commits).** The measurement proof
is refreshed on the panel tip: the new panel is current (0 stale keys),
every prereg GO leg passes, and the proof re-points at the new panel only.
Final-tip verdict after the rebase onto 7b2192b76 — see Closeout.

## Metric review

- The primary metric judged what it claimed: the proof test failed on
  the stale tip with exactly the expected manifest-mismatch error (7
  keys: 3 new policy files + 4 changed, all named) and passes on the
  refreshed tip with 0 stale keys; the stale-input negative checks (b18
  and b17 both fail validate on the new tip, and b13/b12 as well) prove
  the green result is not vacuous. No re-scoring at any point.
- The cache-flags leg passed outright on the first run — no load artifact
  this round, no discriminating A/B needed. The 30s cap stays untouched.
- The neutrality reproduction (leg d) held exactly: regeneration moved
  no verdict vs b18 or b17, and this round 0/64 rows differ at all —
  the r206 betrayal fix and the r139 spotter wiring are invisible to
  the panel, as the instrument is designed to be for a dialogue-fix and
  a foraging-grant change. The national step stays the binding constraint
  on the win rows that lack it. Filed here for the winnability chain,
  not chased — this arm's scope is the instrument.
- The safe-commit index clobber struck both prereg commits — repaired per
  the repo lesson, no work lost. Second sighting of the `MM` (staged +
  unstaged) manifestation on a single-file commit.
- The brief's b13/b12 negative naming was stale (copied from the round-13
  brief; rounds 14–18 have since landed). The pattern-faithful negatives
  (b18/b17) are what the test checks; b13/b12 were verified separately
  and also fail. No metric revision proposed; the prereg held. Future
  briefs should name the two most recent prior panels, not a fixed pair.
- No metric revision proposed for the next run. The prereg held.

## Commits (branch sim-proofrefresh-b19, base a4d0b2038 → rebased 7b2192b76)

- 9e37cacf5 (was 5fba70421) — prereg + proof test (round 19, base
  a4d0b2038, owed-check pending)
- 02bb5b9a8 (was 92a61952) — prereg owed-check (OWED — b18 stale by 3
  new policy files + 4 keys)
- 4bfde32cc (was e0a15a69) — fresh real neutral panel (REGENERATED on
  a4d0b2038) + proof re-point + evidence (GO 12/12 on the a4d0b2038 tip;
  see closeout for the 7b2192b76 re-verification)
- [closeout commit] — closeout record (this section)

## Closeout — REBASED, GO ON FINAL TIP

- Master moved during the run to 7b2192b76 (sim-transplant8c-a +
  sim-succpolity-g1join-b, evidence + test/analyzer scripts, exactly
  ZERO manifest files). Branch rebased onto the explicit SHA 7b2192b76
  (3 picks, clean, no stop-at-pick quirk this time; final log shows each
  commit exactly once, tip 4bfde32cc).
- Leg (a) re-verified on the rebased tip: **exit 0, 9 passed**. Panel
  sources vs the new-tip manifest: **0 keys differ** (529/529) — the
  master move touched no manifest file, so the regenerated panel stays
  current on the final tip. Full b19 proof test re-run on the rebased
  tip: **12/12**.
- **Verdict on the final tip (7b2192b76): GO.** All six prereg legs pass
  on the final tip; no re-scoring, no version-stamp-only hazard (the
  910bff7f4 bump predates the panel — the panel was generated after it,
  so build.js/index.html are current in the panel).
- Merge: `git merge --ff-only sim-proofrefresh-b19` in the main tree
  (no pipe, strict && chain; ancestry verified with
  `git merge-base --is-ancestor` after). Then release:
  `worktree-release.sh sim-proofrefresh-b19 merged`, worktree removed,
  branch deleted, `worktree-reap.sh`, main tree verified clean. No push,
  no bump, no live verification — the ship loop owns deploys. "Merged
  locally, pending ship."
