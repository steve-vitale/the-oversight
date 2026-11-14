# sim-proofrefresh-b18 — measurement proof regenerated (round 18)

## Prereg

- **Run:** fleshout-loop-b-20261114T2230Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b18 (tracker blank #2:
  "proof refresh round 17 on the next manifest change (regenerate +
  re-point, do not hand-edit)"). Round 17 was GO 12/12 on panel
  eadc86c3, merged. Round 18 is owed NOW: the Reunion arena balance
  (master 3e8bf6a7c) changed `src/js`, re-staling the b17 panel by 4
  manifest keys. Round 18 follows the proven
  round-11/12/13/14/15/16/17 pattern exactly (regen + re-point + 6 GO
  legs), on the current tip. Full prereg committed first:
  `evidence/2026-11-14/sim-proofrefresh-b18-prereg.md` (commit
  fbbbfa745, rebased to 87bfa6cf2 at closeout — see "Master move").
- **Base SHA:** `eaa7fb431` (local master at worktree registration;
  branch tip == master tip at registration).
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
  test-proofrefresh-b18.js 12/12 incl. stale-input negatives (the
  retained b17 panel AND the b16 panel FAIL validate() on the new
  tip); (f) ontology exit 0. Any leg miss = NO-GO, no re-scoring.

## Owed-check (pre-registered decision, run before the panel, on base eaa7fb431)

- Before: `node scripts/godpath/test-measurement-proof-update.js` FAILS on
  eaa7fb431 with `Error: Proof source inputs are not current`
  (`scripts/balance-proof-update.js:8`), exit 1 — confirmed in the worktree
  before the panel run.
- `B.manifest('.')` vs the retained b17 panel's `sources`
  (`evidence/2026-11-14/neutral-proofrefresh-b17.json.gz`, sha256
  `eadc86c3e076c8de096968d97d28e6e87fc0c0164f89d4523f21e7d758d3ae6b`):
  exactly **4 manifest keys differ** (of 526 total on the tip; 526 in
  the b17 panel):

  - `src/js/game.js` — Reunion arena balance: mirror cap (0d8d3650a),
    arena-only clone HP x0.4 / damage x0.5 (e17c08d78), damage re-tune
    0.5 -> 0.6 (ee8292e0b) (panel `2b155837ebf4…`, tip `84a25e80dbb4`)
  - `src/js/partyTactics.js` — same three Reunion arena-balance
    commits (panel `7beb2f710e66…`, tip `704ce45da663`)
  - `src/js/build.js` — version bump dcae77800 (batch ship)
    (panel `e8d585154146…`, tip `4d8491819f2a`)
  - `index.html` — version bump dcae77800 (batch ship)
    (panel `33d4677d8556…`, tip `3516fd2cc211`)

  Real game-code changes since the b17 panel (arena Reunion behavior:
  mirror cap 1, HP x0.4, damage x0.6) plus the 2 version-stamp keys
  from the batch ship bump. Observer and contract digests still match
  the b17 panel (observer f37e5ce03414…, contract 37bbb0fad947…).
  The staleness is the source manifest only: 2 real game-code keys +
  2 version-stamp keys.
  **Verdict of the owed-check: OWED.** Panels at b17 and earlier are
  superseded; the re-point target is the NEW panel only.

## Panel

- Command: `node scripts/balance-panel.js --out .proofrefresh-b18-panel --n 16 --days 150 --par 4`
- Single clean run, ~21 min, no flap kill, no restart:
  `Saved .proofrefresh-b18-panel; 64 cases, 0 cached jobs.`
  Panel log: `~/workspace/proofrefresh-b18-panel.log`.
- `sourceHeadStart == sourceHeadEnd == fbbbfa7451ba316118f848b8cb152bc3b26fd139`
  (the prereg commit; the worktree HEAD at panel time — the manifest is
  identical to base eaa7fb431 since the prereg touched only an evidence .md).
- Panel sha256
  `cc38babf2acdff069b86636e21cc4028a7c70bf858b991fbb166e769ba242786`.
- Verification (read-only): the generated panel's `sources` vs the
  branch-tip manifest: **0 keys differ**;
  `validity.sourcesStable` true; 64 rows; neutrality 4/4 match, warnings
  0, tuple identical to the b17 panel AND the b16 panel.
  Observer/contract digests match the tip and the b17 panel.
  0 rows with warnings/observer/gear problems.
- Staleness on the final tip (measured, `B.manifest` vs panel `sources`,
  526 keys): **b18-new 0 stale**; **b17 4 stale** (game.js,
  partyTactics.js, build.js, index.html); **b16 5 stale** (the same 4
  plus conversation.js). Before/after: the refresh takes the proof from
  4 stale keys (b17) to 0 (b18-new) on the final tip.
- Row movement vs b17: **3 of 64 rows differ** — capable/7 (days 89→90),
  risk-aware/1234 (days 93→96), winseek/555 (days 46→47). All three
  differ only in survival length (+1/+3/+1 days) and downstream
  stochastic detail; every verdict field (won/entered/table/national,
  waveReach, maxArc) is unchanged. Headline aggregates identical
  (see wall rows). Filed here for the winnability chain, not chased:
  this arm re-proves the instrument; no lever was played and no
  compare run was done.

## Panel's own wall rows (scale-wall numbers, as the panel carries them)

64 rows, 150d, 16 seeds × 4 policies (regenerated panel, tip fbbbfa745):

- national 11/64, wins 16/64, entered 16/64 — all 16 wins from the
  capable policy (16/16 capable rows won; risk-aware, socialite, winseek
  0/16 each).
- `row.table` 56/64 — the table field as the panel carries it tracks
  Arc-IV reach (maxArc 4 is also 56/64); it is NOT the entered/won count
  (entered 16/64 is the like-for-like number against b17's 16/64).
  maxRank: global 11, regional 46, village 7.
- Wave reach: 13/64 reached wave 5, 63/64 reached wave 4 (the single
  miss: winseek seed 42, village-lost at d30 on wave 3 — same seed/row as
  b8, b9, b10, b11, b12, b13, b14, b15, b16, and b17).
- Max Arc: 56/64 Arc IV, 8/64 Arc III.
- Median survival 90 game-days, max 150.
- End reasons: village-lost 46, over-other 16, survived 2.
- Vests 23 total; vestsVillager 39.
- Per-policy median days: capable 90, risk-aware 114, socialite 94,
  winseek 74.
- Per-policy wave-5 reach: capable 4, risk-aware 7, socialite 2,
  winseek 0.
- Per-policy vests: capable 2, risk-aware 7, socialite 6, winseek 8.

Against b17's rows (same spec, same counting code — recomputed from
the retained b17 panel): national 11→11, wins 16→16, entered 16→16,
table 56→56, wave-5 13→13, wave-4 63→63, median 90→90, max 150→150,
vests 23→23, vestsVillager 39→39, survived 2→2, village-lost 46→46,
over-other 16→16. Every headline identical — the instrument's own rows
on the new tip, reported as carried, not a balance verdict (this arm
re-proves the instrument; no lever was played, and no compare run was
done). The national step stays the binding constraint on the win rows
that lack it — filed here for the winnability chain, not chased.

## Master move (during the run)

- **Move 1 — sim-transplant16-a:** master moved eaa7fb431 →
  007c61738 during the panel run (3 commits: sim-transplant16-a
  prereg + evidence + evidence fix). The move touches **NO manifest
  file** (3 files: evidence/2026-11-14/sim-transplant16-prereg.md,
  evidence/2026-11-14/sim-transplant16.md, scripts/test-transplant16.js
  — verified with `git diff --name-only` filtered to src/,
  scripts/policies/, index.html, sim-harness.js, sweep-compare.js,
  scripts/balance-metrics.json — empty). Per the prereg's master-move
  rule the panel stays valid: the manifest on 007c61738 is identical
  to the manifest on eaa7fb431. The branch was rebased onto 007c61738
  at closeout (2/2 picks, clean, no stop-at-pick quirk; prereg commit
  fbbbfa745 → 87bfa6cf2, panel commit b6a7c23c → 282a57d89) and all six
  GO legs were re-run on that final tip (see "GO legs" — the panel's
  recorded sourceHeadStart/End, fbbbfa745, is the pre-rebase branch
  tip; the manifest equality is what the proof test checks, and it is
  verified 0-stale on the final tip).

## Host write flap

- No denied window hit this run. The 10/10 127KB write-probe gate
  passed immediately before the panel launch, and the panel ran clean
  in one ~21-min run with no EPERM kill and no restart. The flap
  watcher was not consulted (it does not see the panel's denial
  bursts, per the b15 finding); the gate probe is the instrument that
  predicted the passing window.
- The safe-commit index clobber struck TWICE this round (prereg commit
  fbbbfa745 and panel commit b6a7c23c — files staged-as-deleted after
  correct commits, including an `MM` on balance-proof.json the second
  time) — repaired both times with the documented `git ls-tree -r HEAD
  -- <paths> | git update-index --add --index-info` pipe; each commit
  was verified correct (hash-object == HEAD blob, status/diff clean
  after repair) before the rebase.
- `validate-ontology.js` rewrote docs/ONTOLOGY.md identically on both
  leg runs (no diff vs HEAD, 2198 lines) — no truncation, no committed
  change.

## Pre-regeneration verification

Measured on the branch tip before any regeneration:

- `test-measurement-proof-update.js`: FAILS, exit 1, "Proof source
  inputs are not current" — the expected stale state; the exact stale-key
  list is the 4 keys above.
- `validate-ontology.js` standalone: not run pre-panel this round
  (the flap gate probe, not the ontology write, was the pre-launch
  check); verified exit 0 in the leg run after the panel.

## Proof update

Copied the regenerated panel to
`evidence/2026-11-14/neutral-proofrefresh-b18.json.gz` (new file — the
b17/b16/b15 panels are NOT overwritten), then `node
scripts/balance-proof-update.js
evidence/2026-11-14/neutral-proofrefresh-b18.json.gz` — exit 0;
`scripts/balance-proof.json` re-points at the new panel only
(panelDigest `cc38babf…`). No hand-edited hashes; no re-point to an
old panel.

## GO legs (judged only on the final tip — 007c61738, branch tip 282a57d89, after the closeout rebase)

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
  tuple identical to the b17 panel AND the b16 panel — regeneration
  moved no verdict. (Covered by proof-test legs 6, 8, 9.)
- (e) `scripts/test-proofrefresh-b18.js`: 12/12 — including the
  stale-input negative checks: the retained b17 panel AND the b16 panel
  FAIL `validate()` on the new tip with "Proof source inputs are not
  current", proving the green result is not vacuous.
- (f) `scripts/validate-ontology.js`: exit 0, "All 138 systems
  validated". ONTOLOGY.md 2198 lines, no diff vs HEAD, no truncation
  this round.
- A miss on any leg would have been NO-GO; on the final tip none missed.
  Judged only against the prereg, never re-scored.
- Telemetry deviation check: `scripts/telemetry-check.js` cannot parse
  the retained `.gz` panel (LOUD: "Unexpected token" — it expects
  per-seed JSON evidence, not a panel archive), the same limitation the
  b11/b12/b13/b14/b15/b16/b17 adoptions recorded. No lever was played, so
  there is no before/after deviation to check; the neutrality
  reproduction (leg d) is the instrument check that stands in its place.
  No LOUD line to investigate beyond that known parser limitation.
  Baseline NOT rolled.

## Verdict

**GO on the final tip (007c61738) — all six legs pass, 12/12.**
The measurement proof is refreshed on the final tip: the new panel is
current (0 stale keys), every prereg GO leg passes, and the proof
re-points at the new panel only. Master moved once during the run
(sim-transplant16-a, no manifest files); the branch was rebased onto
the explicit final master SHA and all six legs re-run on that tip.
Round 19 is owed after the next manifest change — not started here,
per the brief.

## Metric review

- The primary metric judged what it claimed: the proof test failed on
  the stale tip with exactly the expected manifest-mismatch error (4
  keys, named) and passes on the refreshed tip with 0 stale keys; the
  stale-input negative checks (b17 and b16 both fail validate on the new
  tip) prove the green result is not vacuous. No re-scoring at any point.
- The 3/64 row movement vs b17 is survival-length noise only (+1/+3/+1
  days on three rows, all verdicts unchanged, every headline identical)
  — the Reunion arena-balance changes (mirror cap, HP x0.4, damage
  x0.6) moved no panel verdict, as expected: the panel's 150d village
  sims never reach an arena Reunion fight. The GO legs judge the proof
  (current + neutral), and neutrality reproduces exactly. The metric
  (proof current/neutral) is not the row vector; conflating them would
  be the drift §14 warns about. No metric revision proposed.
- The prereg's master-move rule held up under the one move in this run:
  the move (evidence + non-manifest test) needed only a rebase + leg
  re-verification, per the rule as written. The version-bump clause's
  "report to the coordinator" path was not needed because no NO-GO was
  produced. No metric revision proposed.
- The safe-commit index clobber struck twice this round (third and
  fourth sightings overall on this program) — worth naming in the leg
  record so a later reader does not misread a post-commit `D`/`MM`
  status as a failed commit. The commits were verified correct before
  the rebase. No metric revision proposed beyond that note.
- No other metric revision proposed. The prereg held.

## Commits (branch sim-proofrefresh-b18, base eaa7fb431, rebased onto 007c61738)

- 87bfa6cf2 (was fbbbfa745) — prereg (proof refresh round 18 owed;
  Reunion arena balance re-staled b17 by 4 keys)
- 282a57d89 (was b6a7c23c) — regenerated neutral panel (sha cc38babf,
  64 rows, 0 stale) + proof re-point + test
- (this commit) — evidence (GO 12/12, panel cc38babf)

## Closeout — GO ON FINAL TIP (round 19 owed after next manifest change)

- Master moved once during the run: eaa7fb431 → 007c61738
  (sim-transplant16-a, no manifest files). Branch rebased onto the
  explicit final master SHA 007c61738 at closeout; rebase clean, no
  stop-at-pick quirk.
- All six legs re-run on the final tip 007c61738 (branch tip 282a57d89):
  **GO.** test-measurement-proof-update 9/9, measurement-workflow 9/9,
  cache-flags 4/4, neutrality reproduces b17 and b16 with warnings 0,
  test-proofrefresh-b18.js 12/12, ontology exit 0.
- **Verdict on the final tip (007c61738): GO.** All six prereg legs
  pass; test-proofrefresh-b18.js 12/12.
- **Coordinator decision:** merge as-is — `git merge --ff-only
  sim-proofrefresh-b18` in the main tree (no pipe, strict && chain;
  ancestry verified with `git merge-base --is-ancestor` after). Then
  release: `worktree-release.sh sim-proofrefresh-b18 merged`,
  worktree removed, branch deleted, `worktree-reap.sh`, main tree
  verified clean. No push, no bump, no live verification — the ship
  loop owns deploys. "Merged locally, pending ship."
- Round 19 stays owed for the next B run, on the next manifest change.
- Cases cache deleted at closeout (not committed); the retained .gz is
  the artifact. Panel log retained at `~/workspace/proofrefresh-b18-panel.log`.
- Infrastructure notes: no write-flap denied window this run (gate
  probe 10/10 before launch; panel clean in one ~21-min run). The
  safe-commit index clobber struck twice — repaired with the documented
  pipe; both commits verified correct before the rebase.
