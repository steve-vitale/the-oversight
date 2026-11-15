# sim-proofrefresh-b20 — measurement proof regenerated (round 20)

## Prereg

- **Run:** fleshout-loop-b-20261115T0621Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b20 (tracker blank:
  "proof refresh round 20 on the next manifest change (regenerate +
  re-point, do not hand-edit)"). Round 19 was GO 12/12 on panel
  8ea3a8bd, merged. Round 20 is owed NOW: the funeral-mend landing
  (master b9b226430) changed src/js/hierarchy.js, which the proof
  manifest hashes, re-staling the b19 panel; the batch ship's
  index.html version stamp also moves the manifest. Round 20 follows
  the proven round-13/18/19 pattern exactly (regen + re-point + 6 GO
  legs), on the current tip. Full prereg committed first:
  `evidence/2026-11-15/sim-proofrefresh-b20-prereg.md`.
- **Base SHA:** `b9b226430` (main-tree master at run start; the worktree
  branch sim-proofrefresh-b20 was registered at this tip, tree clean).
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
  every proof case, warnings 0; (e) test-proofrefresh-b20.js 12/12
  incl. stale-input negatives (the retained b19 panel AND the b18
  panel FAIL validate() on the new tip); (f) ontology exit 0. Any leg
  miss = NO-GO, no re-scoring.
- **Negative-panel note (brief vs pattern):** this round's brief names
  the b19 and b18 panels as the leg-(e) negatives — the two most
  recent prior panels, as b13 used b12/b11 and b19 used b18/b17. The
  b20 test checks b19/b18; the b13/b12 negatives are ALSO verified
  (validate() must fail on both) in the owed-check and recorded below,
  matching the round-19 practice.

## Owed-check (pre-registered decision, run before the panel)

- Before: `node scripts/godpath/test-measurement-proof-update.js` FAILS on
  b9b226430 with `Error: Proof source inputs are not current`
  (`scripts/balance-proof-update.js:8`), exit 1 — confirmed in the worktree
  before the panel run, matching the coordinator's baseline.
  `test-measurement-workflow.js` standalone: **8 passed, 1 failed** —
  the failing leg is exactly "retained neutrality proof covers the
  current Game/controller/harness inputs" (the staleness failure; the
  same leg the b11/b12/b13/b19 adoptions recorded as 8/9 on their stale
  landing tips).
- `B.manifest('.')` vs the retained b19 panel's `sources`
  (`evidence/2026-11-14/neutral-proofrefresh-b19.json.gz`, sha256
  `8ea3a8bdcb8b72d6988a2fb7bf181623480eecca1f104f9c6241439fa5266e8e`):
  tip 529 keys, panel 529 keys — **0 keys only in the tip + 6 keys
  differ**:

  - `src/js/build.js` — batch-ship version bump (panel `002759da082a…`,
    tip `cf40fec40e13…`)
  - `src/js/conversation.js` — funeral-mend landing (panel
    `7bf28860b363…`, tip `af4d10c25eee…`)
  - `src/js/convo-scene.js` — funeral-mend landing (panel
    `039e3737f4e9…`, tip `d2c6e5d9b6b9…`)
  - `src/js/game.js` — funeral-mend landing (panel `f3d10e7bece6…`,
    tip `e0d7dee980e1…`)
  - `src/js/hierarchy.js` — funeral-mend landing (panel
    `03cd67034447…`, tip `446b7141eb83…`)
  - `index.html` — batch-ship version bump (panel `e35cc1619c6a…`,
    tip `6e54b11025a4…`)

  Observer and contract digests still match the b19 panel (observer
  f37e5ce0…, contract 37bbb0fa…). The staleness is the source manifest
  only: 5 funeral-mend game-code changes + 2 version stamps.
- `B.manifest('.')` vs the retained b18 panel's `sources`
  (`evidence/2026-11-14/neutral-proofrefresh-b18.json.gz`): tip 529
  keys, panel 526 keys — the same 3 new policy files (competent-
  answercourt-b, competent-scaleclimb-b, competent-succpolity-b, from
  the 0155Z merges, already in b19) + **7 keys differ** (betrayal.js,
  build.js, conversation.js, convo-scene.js, game.js, hierarchy.js,
  index.html). Observer and contract digests still match the b18 panel.
- `B.manifest('.')` vs the retained b17 panel: 3 new policy files +
  **8 keys differ** (adds partyTactics.js). Vs the b13 and b12 panels
  (`evidence/2026-11-13/neutral-proofrefresh-b13.json.gz`,
  `evidence/2026-11-12/neutral-proofrefresh-b12.json.gz`): 3 new
  policy files + **10 keys differ** each (adds abilityActions.js,
  contests.js). Observer and contract digests match all four.
- Stale-input negatives verified on this tip (validate() FAILS with
  "Proof source inputs are not current" on all five): b19, b18, b17,
  b13, b12. The brief's b19/b18 negatives hold, and so do b13/b12.
- Cache-flags anomaly in the owed-check: `test-measurement-cache-
  flags.js` scored **0/4** on this tip (all four legs FAIL), where
  round 19 scored 4/4. Discriminating probe, same tip, same minute:
  a single 1-day zero-policy panel build via the real CLI completes
  fine (exit 0, 1 case) but takes **35.4s wall for ~3s CPU** — over
  the test's 30s spawn timeout. Box load average was 25.47 at the
  time (a parallel test sweep running in other trees: garden/relay
  suites + journey-landing-r135). This is the 2026-11-12 load
  artifact, not a code failure: no panel/cache code changed in this
  arm (only evidence + test files committed so far; the funeral-mend
  base did not touch balance-panel.js or the cache logic). Leg (c)
  was re-run at closeout on a quiet box — see GO legs.
- Pre-regeneration `test-proofrefresh-b20.js`: crashes at leg (d)
  with ENOENT — `evidence/2026-11-15/neutral-proofrefresh-b20.json.gz`
  does not exist yet (the panel has not been generated or re-pointed).
  Legs before the crash: validate FAIL (ENOENT on the new panel),
  proof-update FAIL exit 1, workflow 8/9, cache-flags 3/4 (one leg
  failed — the load artifact again: 0/4 standalone minutes earlier,
  3/4 inside this run as the parallel sweep wound down; scores move
  with box load, not with any code change), ontology exit 0
  ("All 138 systems validated", ONTOLOGY.md 2198 lines).
- `validate-ontology.js` standalone: exit 0, "All 138 systems
  validated", ONTOLOGY.md 2198 lines.
- **Verdict of the owed-check: OWED.** Panels at b19 and earlier are
  superseded; the re-point target is the NEW panel only.

## Panel

- Command: `node scripts/balance-panel.js --out .proofrefresh-b20-panel --n 16 --days 150`
- Single attempt, started 06:44:04Z, finished 07:13:08Z:
  `Saved .proofrefresh-b20-panel; 64 cases, 0 cached jobs. PANEL_EXIT=0`.
  ~29 min wall (faster than round 19's 41 min — box quieter).
- The `cases/` cache in `.proofrefresh-b20-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- `sourceHeadStart == sourceHeadEnd == 72c4dda8629a05210ed2d8124f431708f3a55f8b`
  (prereg/owed-check commit, on base b9b226430).
- Panel sha256
  `d58537cde306ebc9720adccc707a57fda9828fd1a0d9bb594db64164bcce5a4b`.
- Verification (read-only): the generated panel's `sources` vs the
  branch-tip manifest: **0 keys differ**;
  `validity.sourcesStable` true; 64 rows; neutrality 4/4 match, warnings
  0, tuple identical to the b19 panel AND the b18 panel (regeneration
  moved no NEUTRALITY verdict). Observer/contract digests match the tip
  and the b19 panel. 0 rows with warnings/observer/gear problems (read on
  the OUTER panel rows).
- Staleness on the tip (measured, `B.manifest` vs panel `sources`, 529
  keys): **b20-new 0 stale**; **b19 6 stale** (the 6 differing keys);
  **b18 10 stale**.
  Before/after: the refresh takes the proof from 6 stale keys (b19)
  to 0 (b20-new) on this tip.

## ROW MOVEMENT — the brief's "0/64 rows differ" does NOT hold this round

The task brief asked to verify "0/64 rows differ vs the prior panel".
Measured, headline fields (won, entered, national, table, waveReach,
maxArc, maxRank, days, gameDays, endReason, vests, vestsVillager):
**64/64 rows differ vs b19** (and vs b18; b18/b19 rows were identical
to each other). Per-field counts: days 60/64, waveReach 21/64,
maxRank 13/64, vests 16/64, national 6/64, table 6/64, maxArc 6/64,
won 2/64, entered 2/64, endReason 8/64, vestsVillager 7/64.
Aggregates b20 vs b19: won 14 vs 16, entered 14 vs 16, national 13
vs 11, table 54 vs 56, waveReach>=5 13 vs 13, waveReach>=4 62 vs 63,
vests 22 vs 23, vestsVillager 44 vs 39, median days 90 vs 90,
survived 4 vs 2, village-lost 46 vs 46.

Cause, verified — not assumed:

- **Determinism proven on this tip.** capable/seed 7 run twice as
  standalone single-case panels → byte-identical rows; the
  single-case re-run row == the full-panel capable/7 row. The panel
  is deterministic on identical code, so the movement is not panel
  noise or a flaky run.
- **The game changed underneath.** Between the b19 panel and this
  tip, funeral-mend changed hierarchy.js, game.js, conversation.js
  and convo-scene.js — code the panel exercises every day (funerals,
  conversations, hierarchy). A behavior change anywhere in the RNG
  draw sequence shifts every seed's trajectory chaotically: days move
  on 60/64 rows while aggregates move modestly. Round 19's 0/64 held
  because its intervening changes (a dialogue fix + foraging grants)
  were invisible to the panel; funeral-mend is not invisible.
- **Direction is mixed, not a clean mend effect.** National 11→13
  is consistent with the mend (dissolutions 0 vs 7 holding realms
  longer — capable/2, /4, /5, /6 newly reach national/global), but
  two capable rows LOSE their wins (capable/42 won d90 → village-lost
  d77; capable/1234 won d90 → village-lost d64). That is a
  winnability-chain observation for the coordinator, not a defect
  claim from this arm: this arm re-proves the instrument and played
  no lever; the funeral-mend confirm's own verdict stands on its own
  seeds. Filed here, not chased.
- **The proof's binding check still holds.** The neutrality tuple
  reproduces b19 AND b18 exactly — the observer does not change
  outcomes on the new tip. Row stability across a game-code change
  was never what the proof guarantees; the brief's 0/64 expectation
  binds only when the intervening changes are panel-invisible. No
  re-scoring: leg (d) as pre-registered (neutrality reproduction) is
  judged exactly as written, and it passes.

## Panel's own wall rows (scale-wall numbers, as the panel carries them)

64 rows, 150d, 16 seeds × 4 policies (regenerated panel, base b9b226430):

- national 13/64, wins 14/64, entered 14/64 — all 14 wins from the
  capable policy (14/16 capable rows won; risk-aware, socialite, winseek
  0/16 each).
- `row.table` 54/64 — the table field as the panel carries it tracks
  Arc-IV reach (maxArc 4 is also 54/64); it is NOT the entered/won count
  (entered 14/64 is the like-for-like number against b19's 16/64).
  maxRank: global 12, regional 47, national 1, village 4 (b19: global
  11, regional 46, village 7 — the rank mix shifted with the rows).
- Wave reach: 13/64 reached wave 5, 62/64 reached wave 4 (the two
  misses: winseek seed 1234, village-lost at d35 on wave 3; winseek
  seed 42, village-lost at d27 — the d27 row is the same seed as
  b8–b13's lone miss, now dying three days earlier).
- Max Arc: 54/64 Arc IV, 10/64 Arc III.
- Median survival 90 game-days, max 150.
- End reasons: village-lost 46, over-other 14, survived 4.
- Vests 22 total; vestsVillager 44.
- Per-policy median days: capable 90, risk-aware 139, socialite 103,
  winseek 61.
- Per-policy wave-5 reach: capable 6, risk-aware 5, socialite 2,
  winseek 0 (b19: 4/7/2/0 — same 13 total, different mix).
- Per-policy vests: capable 1, risk-aware 8, socialite 8, winseek 5
  (b19: 2/7/6/8).

Against b19's rows (same spec): headline fields differ on 64/64 rows
(see ROW MOVEMENT above) — the funeral-mend game-code change moved
the panel's rows. These are the instrument's own rows on the new tip,
reported as carried, not a balance verdict (this arm re-proves the
instrument; no lever was played, and no compare run was done). The
national step stays the binding constraint on the win rows that lack
it — filed here for the winnability chain, not chased.

## Master move (during the run)

Master moved DURING the panel run: `git rev-parse master` in the main
tree reads `3904f2b8f` at ~07:19Z (was b9b226430 at panel start). The move
is 10 commits — Loop A ove48-freshband-a + ove48-drawparity-a
(evidence + drivers/analyzers/test scripts) and the journey-landing
r135 gate adjudication (evidence + driver scripts) — touching ONLY
evidence/ files and scripts/ driver/analyzer/test files. Exactly ZERO
manifest files changed (verified: the manifest hashes 2 top-level
scripts/*.js — sim-harness.js and sweep-compare.js — plus
scripts/policies/, src/js/, src/data/, index.html and the balance
instrument files; none of the move's scripts files are in it). At
closeout the branch is rebased onto the explicit new SHA 3904f2b8f
and leg (a) + the full 12-leg test re-verified before the
coordinator's `--ff-only` merge (see Closeout).

## Host write flap

- No flap episode observed during this run. The panel run (06:44–07:13Z)
  completed in one clean attempt; all commits, the re-point write, and
  the ontology validator's runs left every file intact (ONTOLOGY.md
  2198 lines before and after, 0 diff vs HEAD). No truncated writes, no
  EPERM.
- The safe-commit index clobber struck ALL THREE commits (first:
  files staged-as-deleted + untracked after a correct commit b9c840f8e;
  second: `MM` on the single file after 72c4dda86; third: D + MM + MM
  across all three files after 78caee21d) — repaired each time with the
  ls-tree -r pipe per the repo lesson, verified `git status --short`
  empty (save the untracked panel dir) + `git diff HEAD` empty before
  continuing. No work lost.

## Pre-regeneration verification

Measured on the branch tip 72c4dda86 before any regeneration:

- `test-measurement-proof-update.js`: FAILS, exit 1, "Proof source
  inputs are not current" — the expected stale state; the exact stale-key
  list is the 6 keys above (5 funeral-mend + 2 version stamps, 6 keys
  total: build.js, conversation.js, convo-scene.js, game.js,
  hierarchy.js, index.html).
- `scripts/test-proofrefresh-b20.js`: crashes at leg (d) with ENOENT —
  `evidence/2026-11-15/neutral-proofrefresh-b20.json.gz` does not exist
  yet (the panel has not been copied into evidence/ or re-pointed; that
  happens on the regenerated panel). Legs before the crash: validate FAIL
  (ENOENT on the new panel), proof-update FAIL exit 1, workflow 8/9,
  cache-flags 3/4 (load artifact), ontology exit 0.
- `test-measurement-workflow.js` standalone: **8 passed, 1 failed** —
  the failing leg is exactly "retained neutrality proof covers the
  current Game/controller/harness inputs" (the staleness failure; the
  same leg the b11/b12/b13/b19 adoptions recorded as 8/9 on their stale
  landing tips). All other legs pass.
- `validate-ontology.js` standalone: exit 0, "All 138 systems validated",
  ONTOLOGY.md 2198 lines, no diff vs HEAD.

## Proof update

Copied the regenerated panel to
`evidence/2026-11-15/neutral-proofrefresh-b20.json.gz` (new file — the
b19/b18/b13/b12 panels are NOT overwritten), then `node
scripts/balance-proof-update.js
evidence/2026-11-15/neutral-proofrefresh-b20.json.gz` — exit 0;
`scripts/balance-proof.json` re-points at the new panel only
(panelDigest `d58537cd…`). No hand-edited hashes; no re-point to an
old panel.

## GO legs (judged only on the final tip — see Closeout for the re-verified legs)

- (a) `test-measurement-proof-update.js`: exit 0, 9 passed — ON THE
  PANEL TIP (b9b226430 + prereg commits). **Re-verified on the final tip
  3904f2b8f — see Closeout.**
- (b) `test-measurement-workflow.js`: 9/9 (panel tip).
- (c) `test-measurement-cache-flags.js`: 4/4 outright on the panel tip —
  re-run at 07:19Z on a quiet box (load average 2.15, down from 25.47
  in the owed-check). The 0/4 owed-check score was the load artifact,
  proven by the discriminating probe (35.4s wall vs the 30s cap) and
  by the 4/4 pass on the same tip once the box quieted. No code
  changed between the two scores. The 30s cap is unchanged.
- (d) Neutrality reproduction: match on every proof case, warnings 0,
  tuple identical to the b19 panel AND the b18 panel — regeneration
  moved no NEUTRALITY verdict. (Covered by proof-test legs 6, 8, 9.)
  The 64/64 headline-row movement is reported separately above; it is
  the game changing, not the observer, and is not leg (d).
- (e) `scripts/test-proofrefresh-b20.js`: 12/12 — including the
  stale-input negative checks: the retained b19 panel AND the b18 panel
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
  b11/b12/b13/b19 adoptions recorded. Its LOUD line is that parse refusal,
  investigated this run: the tool cannot read panel archives at all, so
  there is no per-seed evidence for it to check and no deviation to
  judge; the neutrality reproduction (leg d) is the instrument check
  that stands in its place. No lever was played, so there is no
  before/after deviation to check. Baseline NOT rolled.

## Verdict

**GO on the panel tip (b9b226430 + prereg commits).** The measurement proof
is refreshed on the panel tip: the new panel is current (0 stale keys),
every prereg GO leg passes, and the proof re-points at the new panel only.
Final-tip verdict after the rebase onto 3904f2b8f — see Closeout.

One flagged deviation from the task brief (not a prereg leg): the brief's
"0/64 rows differ vs the prior panel" does not hold — headline rows differ
64/64, verified as the funeral-mend game-code change (determinism proven;
neutrality tuple reproduces exactly). The coordinator should note that the
row-stability check binds only when intervening changes are
panel-invisible; on this round it is a real measurement of the game
moving, not a proof failure.

## Metric review

- The primary metric judged what it claimed: the proof test failed on
  the stale tip with exactly the expected manifest-mismatch error (6
  keys: 5 funeral-mend + 2 version stamps, all named) and passes on the
  refreshed tip with 0 stale keys; the stale-input negative checks (b19
  and b18 both fail validate on the new tip, and b17/b13/b12 as well)
  prove the green result is not vacuous. No re-scoring at any point.
- The cache-flags leg failed 0/4 under load in the owed-check and passed
  4/4 outright on the same tip once the box quieted — the load artifact
  the 2026-11-12 lesson describes, proven twice this round (the 35.4s
  wall probe vs the 30s cap; the 3/4 mid-run score as the sweep wound
  down). The 30s cap stays untouched. No metric revision proposed; the
  prereg's A/B instruction worked as written.
- The neutrality reproduction (leg d) held exactly: regeneration moved
  no neutrality verdict vs b19 or b18 — but the headline rows moved
  64/64 because the game itself changed (funeral-mend). The brief's
  row-stability expectation is the wrong instrument for a round where
  game code the panel exercises changed: it conflates "the proof is
  fresh" with "the game is unchanged". Proposed revision for the NEXT
  run's brief: scope the 0/64 row-stability check to rounds whose
  intervening changes are panel-invisible (evidence/test-only moves,
  or game changes proven invisible in the owed-check); when game code
  moves, judge leg (d) on the neutrality tuple alone and report row
  movement as a winnability observation. This is a brief-wording
  revision, not a re-score of this run: the prereg legs are judged
  exactly as written.
- The safe-commit index clobber struck all three commits — repaired per
  the repo lesson, no work lost. Third sighting of the D + MM + MM
  multi-file manifestation.
- No other metric revision proposed. The prereg held.

## Commits (branch sim-proofrefresh-b20, base b9b226430 → rebased 3904f2b8f)

- 79b2621da (was b9c840f8e) — prereg + proof test (round 20, base b9b226430, owed-check pending)
- b851c3bba (was 72c4dda86) — prereg owed-check (OWED — b19 stale by 6 keys; cache-flags 0/4 is a load artifact, probe 35.4s wall vs 30s cap)
- 2c4bf282f (was 78caee21d) — fresh real neutral panel (REGENERATED on b9b226430) + proof re-point + prereg panel section (GO 12/12 on the b9b226430 tip; see closeout for the 3904f2b8f re-verification)
- a7f870e1e (was 82a7a1839) — evidence (GO 12/12 on panel tip; row movement 64/64 verified as funeral-mend effect, determinism proven)
- [closeout commit] — closeout record (this section)

## Closeout — REBASED, GO ON FINAL TIP

- Master moved during the run to 3904f2b8f (Loop A ove48-freshband-a +
  ove48-drawparity-a + journey-landing r135 gate adjudication,
  evidence + driver/analyzer/test scripts, exactly ZERO manifest
  files). Branch rebased onto the explicit SHA 3904f2b8f (4 picks,
  clean, no stop-at-pick quirk; final log shows each commit exactly
  once, tip a7f870e1e).
- Leg (a) re-verified on the rebased tip: **exit 0, 9 passed**. Panel
  sources vs the new-tip manifest: **0 keys differ** (529/529) — the
  master move touched no manifest file, so the regenerated panel stays
  current on the final tip. Full b20 proof test re-run on the rebased
  tip: **12/12** (incl. cache-flags 4/4 on the quiet box).
- **Verdict on the final tip (3904f2b8f): GO.** All six prereg legs pass
  on the final tip; no re-scoring, no version-stamp-only hazard (the
  ship bump predates the panel — the panel was generated after it, so
  build.js/index.html are current in the panel). The flagged brief
  deviation stands: headline rows differ 64/64 vs b19, verified as the
  funeral-mend game-code change (determinism proven; neutrality tuple
  reproduces exactly).
- Cases cache deleted at closeout (`.proofrefresh-b20-panel/` removed;
  the retained .gz is the artifact). Worktree clean except committed
  work; no uncommitted leftovers.
- Merge: `git merge --ff-only sim-proofrefresh-b20` in the main tree
  (coordinator's step — no pipe, strict && chain; ancestry verified with
  `git merge-base --is-ancestor` after). Then release:
  `worktree-release.sh sim-proofrefresh-b20 merged`, worktree removed,
  branch deleted, `worktree-reap.sh`, main tree verified clean. No push,
  no bump, no live verification — the ship loop owns deploys. "Merged
  locally, pending ship."
