# sim-proofrefresh-b17 — measurement proof regenerated (round 17)

## Prereg

- **Run:** fleshout-loop-b-20261114T1430Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b17 (tracker blank #2:
  "proof refresh round 17 on the next manifest change (regenerate +
  re-point, do not hand-edit)"). Round 16 was GO 12/12 on its panel tip
  a8562fc68 (panel 49fbcf95, merged; addendum re-verified GO on final
  tip 28a5cacaf). Round 17 is owed NOW: journey-landing r132 +
  journey-crisis r201 changed `src/js/conversation.js`, re-staling the
  b16 panel by 1 manifest key. Round 17 follows the proven
  round-11/12/13/14/15/16 pattern exactly (regen + re-point + 6 GO
  legs), on the current tip. Full prereg committed first:
  `evidence/2026-11-14/sim-proofrefresh-b17-prereg.md` (commit
  9a6a864aa, before any judged run; rebased to 76e741f5f at closeout —
  see "Master move").
- **Base SHA:** `792f4570d` (sim-transplant15f-picks16-a; local master
  at worktree registration). The branch was fast-forwarded from its
  registration tip 8491b132b to 792f4570d before the prereg (pure
  fast-forward — the registration tip was already in master, plus 5
  transplant15a/15f commits ahead of it).
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
  blaming the change — this IS the owed cache-flags quiet-box A/B,
  folded into this arm's legs, not a separate arm); (d) neutrality
  reproduces the prior panel on every proof case, warnings 0; (e)
  test-proofrefresh-b17.js 12/12 incl. stale-input negatives (the
  retained b16 panel AND the b15 panel FAIL validate() on the new
  tip); (f) ontology exit 0. Any leg miss = NO-GO, no re-scoring.

## Owed-check (pre-registered decision, run before the panel, on base 792f4570d)

- Before: `node scripts/godpath/test-measurement-proof-update.js` FAILS on
  792f4570d with `Error: Proof source inputs are not current`
  (`scripts/balance-proof-update.js:8`), exit 1 — confirmed in the worktree
  before the panel run, matching the coordinator's baseline (coordinator
  verified the same failure on master 4355b9d18; it reproduces on
  792f4570d).
- `B.manifest('.')` vs the retained b16 panel's `sources`
  (`evidence/2026-11-14/neutral-proofrefresh-b16.json.gz`, sha256
  `49fbcf957c7bdd89f07e41677ecb1bffb87e97bb89bf9e3a5be2a94b94d13556`):
  exactly **1 manifest key differs** (of 526 total on the tip; 526 in
  the b16 panel):

  - `src/js/conversation.js` — journey-landing r132 nod-loop fix
    (3bffd4752: repeat nv gesture thins the sitting) + journey-crisis
    r201 favor-want settle gate (f1871e37b)
    (panel `989d6818bcc3…`, tip `7bf28860b363`)

  A real game-code change since the b16 panel (conversation behavior).
  No version-stamp key is stale on this tip. Observer and contract
  digests still match the b16 panel (observer f37e5ce03414…,
  contract 37bbb0fad947…). The staleness is the source manifest only:
  1 real game-code change.
  **Verdict of the owed-check: OWED.** Panels at b16 and earlier are
  superseded; the re-point target is the NEW panel only.

## Panel

- Command: `node scripts/balance-panel.js --out .proofrefresh-b17-panel --n 16 --days 150 --par 4`
- Single clean run, ~24 min, no flap kill, no restart:
  `Saved .proofrefresh-b17-panel; 64 cases, 0 cached jobs.`
  Panel log: `~/workspace/proofrefresh-b17-panel.log`.
- `sourceHeadStart == sourceHeadEnd == 9a6a864aa2ace5c2fac4ec0161b2accddfc32a7d`
  (the prereg commit; the worktree HEAD at panel time — the manifest is
  identical to base 792f4570d since the prereg touched only an evidence .md).
- Panel sha256
  `eadc86c3e076c8de096968d97d28e6e87fc0c0164f89d4523f21e7d758d3ae6b`.
- Verification (read-only): the generated panel's `sources` vs the
  branch-tip manifest: **0 keys differ**;
  `validity.sourcesStable` true; 64 rows; neutrality 4/4 match, warnings
  0, tuple identical to the b16 panel AND the b15 panel.
  Observer/contract digests match the tip and the b16 panel.
  0 rows with warnings/observer/gear problems.
- Staleness on the final tip (measured, `B.manifest` vs panel `sources`,
  526 keys): **b17-new 0 stale**; **b16 1 stale** (conversation.js);
  **b15 5 stale** (build.js, contests.js, conversation.js, game.js,
  index.html — the version-bump keys from the 16f05da86 ship bump plus
  the fusionoffer and conversation changes). Before/after: the refresh
  takes the proof from 1 stale key (b16) to 0 (b17-new) on the final tip.
- Row movement vs b16: **0 of 64 rows differ** — the conversation.js
  changes (nod-loop thinning + favor-want settle gate) moved no
  verdict. Headline aggregates identical (see wall rows). Filed here
  for the winnability chain, not chased: this arm re-proves the
  instrument; no lever was played and no compare run was done.

## Panel's own wall rows (scale-wall numbers, as the panel carries them)

64 rows, 150d, 16 seeds × 4 policies (regenerated panel, tip 9a6a864aa):

- national 11/64, wins 16/64, entered 16/64 — all 16 wins from the
  capable policy (16/16 capable rows won; risk-aware, socialite, winseek
  0/16 each).
- `row.table` 56/64 — the table field as the panel carries it tracks
  Arc-IV reach (maxArc 4 is also 56/64); it is NOT the entered/won count
  (entered 16/64 is the like-for-like number against b16's 16/64).
  maxRank: global 11, regional 46, village 7.
- Wave reach: 13/64 reached wave 5, 63/64 reached wave 4 (the single
  miss: winseek seed 42, village-lost at d30 on wave 3 — same seed/row as
  b8, b9, b10, b11, b12, b13, b14, b15, and b16).
- Max Arc: 56/64 Arc IV, 8/64 Arc III.
- Median survival 90 game-days, max 150.
- End reasons: village-lost 46, over-other 16, survived 2.
- Vests 23 total; vestsVillager 39.
- Per-policy median days: capable 90, risk-aware 111/114, socialite 92/94,
  winseek 68/74.
- Per-policy wave-5 reach: capable 4, risk-aware 7, socialite 2,
  winseek 0.
- Per-policy vests: capable 2, risk-aware 7, socialite 6, winseek 8.

Against b16's rows (same spec, same counting code — recomputed from
the retained b16 panel): national 11→11, wins 16→16, entered 16→16,
table 56→56, wave-5 13→13, wave-4 63→63, median 90→90, max 150→150,
vests 23→23, vestsVillager 39→39, survived 2→2, village-lost 46→46,
over-other 16→16. Every headline identical — the instrument's own rows
on the new tip, reported as carried, not a balance verdict (this arm
re-proves the instrument; no lever was played, and no compare run was
done). The national step stays the binding constraint on the win rows
that lack it — filed here for the winnability chain, not chased.

## Master move (during the run)

- **Move 1 — coordinator evidence:** master moved 792f4570d →
  e500f1956 during the panel run (fleshout-20261114T1355Z coordinator
  evidence — H1 transplant round, 4 arms landed). The move touches **NO
  manifest file** (1 file: evidence/2026-11-14/sim-transplant-round-1355.md,
  verified with `git diff --name-only` filtered to src/,
  scripts/policies/, index.html, sim-harness.js, sweep-compare.js,
  scripts/balance-metrics.json — empty). Per the prereg's master-move
  rule the panel stays valid: the manifest on e500f1956 is identical to
  the manifest on 792f4570d. The branch was rebased onto e500f1956 at
  closeout (1/1 pick, clean, no stop-at-pick quirk; prereg commit
  9a6a864aa → 76e741f5f) and leg (a) was re-verified on that final tip
  (see "GO legs" — the panel's recorded sourceHeadStart/End, 9a6a864aa,
  is the pre-rebase branch tip; the manifest equality is what the proof
  test checks, and it is verified 0-stale on the final tip).

## Host write flap

- A denied window was ACTIVE at run start (~14:43Z):
  `validate-ontology.js` died with `Error: EPERM: operation not
  permitted, write` and my 127KB gate probe passed 0/10 — while the
  flap watcher logged ALL-OK (the watcher does NOT see the panel's
  denial bursts, per the b15 finding). The window cleared within
  minutes (small + 127KB writes pass again; the gate re-probed 10/10
  before the panel launch).
- The flap's EPERM truncated the worktree copy of `docs/ONTOLOGY.md`
  to 0 lines mid-write (the validate-ontology.js write died
  part-way). Restored whole from HEAD (`git checkout HEAD --
  docs/ONTOLOGY.md`, 2198 lines, no diff vs HEAD after); nothing lost,
  ONTOLOGY.md is not a committed change this round.
- The safe-commit index clobber struck the prereg commit (prereg
  staged-as-deleted after a correct commit; ONTOLOGY.md also showed
  as modified from the truncation above) — repaired with the
  documented `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info` pipe; the commit was verified correct (hash-object ==
  HEAD blob, status/diff clean after repair).
- No panel kill, no restart, no work lost. The panel ran clean in one
  ~24-min run; the gated write-probe stayed in the kit but was not
  needed again.

## Pre-regeneration verification

Measured on the branch tip before any regeneration:

- `test-measurement-proof-update.js`: FAILS, exit 1, "Proof source
  inputs are not current" — the expected stale state; the exact stale-key
  list is the 1 key above.
- `validate-ontology.js` standalone: exit 1 at first attempt — NOT a
  validation failure; the run died on the host EPERM write flap (see
  above). Re-verified exit 0 in the leg run after the flap cleared.

## Proof update

Copied the regenerated panel to
`evidence/2026-11-14/neutral-proofrefresh-b17.json.gz` (new file — the
b16/b15/b14 panels are NOT overwritten), then `node
scripts/balance-proof-update.js
evidence/2026-11-14/neutral-proofrefresh-b17.json.gz` — exit 0;
`scripts/balance-proof.json` re-points at the new panel only
(panelDigest `eadc86c3…`). No hand-edited hashes; no re-point to an
old panel.

## GO legs (judged only on the final tip — e500f1956, branch tip 76e741f5f, after the closeout rebase)

- (a) `test-measurement-proof-update.js`: exit 0, **9 passed, 0 failed**
  — ON THE FINAL TIP.
- (b) `test-measurement-workflow.js`: 9/9 (final tip).
- (c) `test-measurement-cache-flags.js`: 4/4 outright, first attempt,
  no load artifact, no re-run needed. This IS the owed cache-flags
  quiet-box A/B folded into this arm's legs: the box ran a full
  64-row panel regen plus the leg suite during this run and the
  cache-flags check still passed 4/4 on the first attempt — no
  discriminating A/B against load was needed because there was no
  failure to discriminate.
- (d) Neutrality reproduction: match on every proof case, warnings 0,
  tuple identical to the b16 panel AND the b15 panel — regeneration
  moved no verdict. (Covered by proof-test legs 6, 8, 9.)
- (e) `scripts/test-proofrefresh-b17.js`: 12/12 — including the
  stale-input negative checks: the retained b16 panel AND the b15 panel
  FAIL `validate()` on the new tip with "Proof source inputs are not
  current", proving the green result is not vacuous.
- (f) `scripts/validate-ontology.js`: exit 0, "All 138 systems
  validated". ONTOLOGY.md 2198 lines, no diff vs HEAD, no truncation
  this round (after the flap-truncation restore above).
- A miss on any leg would have been NO-GO; on the final tip none missed.
  Judged only against the prereg, never re-scored.
- Telemetry deviation check: `scripts/telemetry-check.js` cannot parse
  the retained `.gz` panel (LOUD: "Unexpected token" — it expects
  per-seed JSON evidence, not a panel archive), the same limitation the
  b11/b12/b13/b14/b15/b16 adoptions recorded. No lever was played, so
  there is no before/after deviation to check; the neutrality
  reproduction (leg d) is the instrument check that stands in its place.
  No LOUD line to investigate beyond that known parser limitation.
  Baseline NOT rolled.

## Verdict

**GO on the final tip (e500f1956) — all six legs pass, 12/12.**
The measurement proof is refreshed on the final tip: the new panel is
current (0 stale keys), every prereg GO leg passes, and the proof
re-points at the new panel only. Master moved once during the run
(coordinator evidence, no manifest files); the branch was rebased onto
the explicit final master SHA and leg (a) re-verified on that tip.
Round 18 is owed after the next manifest change — not started here,
per the brief.

## Metric review

- The primary metric judged what it claimed: the proof test failed on
  the stale tip with exactly the expected manifest-mismatch error (1
  key, named) and passes on the refreshed tip with 0 stale keys; the
  stale-input negative checks (b16 and b15 both fail validate on the new
  tip) prove the green result is not vacuous. No re-scoring at any point.
- The 0/64 row movement vs b16 is the strongest form of this round's
  verdict: the conversation.js changes (nod-loop thinning + favor-want
  settle gate) moved no verdict at all, and every wall headline is
  identical to b16. The GO legs judge the proof (current + neutral),
  and neutrality reproduces exactly. The metric (proof current/neutral)
  is not the row vector; conflating them would be the drift §14 warns
  about. No metric revision proposed.
- The prereg's master-move rule held up under the one move in this run:
  the move (evidence-only) needed only a rebase + leg (a)
  re-verification, per the rule as written. The version-bump clause's
  "report to the coordinator" path was not needed because no NO-GO was
  produced. No metric revision proposed.
- The flap-truncation of ONTOLOGY.md is a second sighting of the
  2026-11-12 class (flap empties a file mid-write; restore whole from
  HEAD). The validate-ontology leg's first-attempt exit 1 was the flap,
  not a validation failure — worth naming in the leg record so a later
  reader does not misread it as an ontology miss. No metric revision
  proposed beyond that note.
- No other metric revision proposed. The prereg held.

## Commits (branch sim-proofrefresh-b17, base 792f4570d, rebased onto e500f1956)

- 9a6a864aa (rebased to 76e741f5f) — prereg (proof refresh round 17
  owed; conversation.js re-staled b16 by 1 key)
- (this commit) — regenerated neutral panel (sha eadc86c3, 64 rows,
  0 stale) + proof re-point + test + evidence (GO 12/12, panel eadc86c3)

## Closeout — GO ON FINAL TIP (round 18 owed after next manifest change)

- Master moved once during the run: 792f4570d → e500f1956 (coordinator
  evidence, no manifest files). Branch rebased onto the explicit final
  master SHA e500f1956 at closeout; rebase clean, no stop-at-pick quirk.
- Leg (a) verified on the final tip e500f1956 (branch tip 76e741f5f):
  **PASSES, exit 0, 9/9** — the manifest on the final tip is identical
  to the panel's sources (0 stale keys; the 792f4570d→e500f1956 move
  touched no manifest file).
- **Verdict on the final tip (e500f1956): GO.** All six prereg legs
  pass; test-proofrefresh-b17.js 12/12.
- **Coordinator decision:** merge as-is — `git merge --ff-only
  sim-proofrefresh-b17` in the main tree (no pipe, strict && chain;
  ancestry verified with `git merge-base --is-ancestor` after). Then
  release: `worktree-release.sh sim-proofrefresh-b17 merged`,
  worktree removed, branch deleted, `worktree-reap.sh`, main tree
  verified clean. No push, no bump, no live verification — the ship
  loop owns deploys. "Merged locally, pending ship."
- Round 18 stays owed for the next B run, on the next manifest change.
- Cases cache deleted at closeout (not committed); the retained .gz is
  the artifact. Panel log retained at `~/workspace/proofrefresh-b17-panel.log`.
- Infrastructure notes: one brief write-flap denied window at run
  start (EPERM; watcher blind to it; cleared in minutes); one
  agent-service-free run otherwise (no restart kill). The safe-commit
  index clobber struck once (prereg commit) — repaired with the
  documented pipe; the commit was verified correct before the rebase.
