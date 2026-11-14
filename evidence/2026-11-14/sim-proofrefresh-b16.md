# sim-proofrefresh-b16 — measurement proof regenerated (round 16)

## Prereg

- **Run:** fleshout-loop-b-20261114T1130Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b16 (tracker blank #2:
  "proof refresh round 16 on the next manifest change (regenerate +
  re-point, do not hand-edit)"). Round 15 was GO 12/12 on its panel tip
  37267f43e (panel 70831cb4, merged b2b50c2cd; the coordinator adoption
  re-judged the GO legs on the rebased tip). Round 16 is owed NOW:
  the fusionoffer fix (59448d248) re-staled the b15 panel by 2
  manifest keys. Round 16 follows the proven round-11/12/13/14/15
  pattern exactly (regen + re-point + 6 GO legs), on the current tip.
  Full prereg committed first:
  `evidence/2026-11-14/sim-proofrefresh-b16-prereg.md` (commit
  fcdc2615f, before any judged run; rebased to a8562fc68, then to the
  closeout tip — see "Master moves").
- **Base SHA:** `237fb445f` (journey-scale r197 addendum; local master
  at worktree registration).
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
  test-proofrefresh-b16.js 12/12 incl. stale-input negatives (the
  retained b15 panel AND the b14 panel FAIL validate() on the new
  tip); (f) ontology exit 0. Any leg miss = NO-GO, no re-scoring.

## Owed-check (pre-registered decision, run before the panel, on base 237fb445f)

- Before: `node scripts/godpath/test-measurement-proof-update.js` FAILS on
  237fb445f with `Error: Proof source inputs are not current`
  (`scripts/balance-proof-update.js:8`), exit 1 — confirmed in the worktree
  before the panel run, matching the coordinator's baseline.
- `B.manifest('.')` vs the retained b15 panel's `sources`
  (`evidence/2026-11-14/neutral-proofrefresh-b15.json.gz`, sha256
  `70831cb459bed5627b7279337221e888e10f8dad30cfeb5ceda949fa5f027a67`):
  exactly **2 manifest keys differ** (of 526 total on the tip; 526 in
  the b15 panel):

  - `src/js/contests.js` — sim-fusionoffer-b (59448d248): fusion offer
    defers while a sheet is pending; prize bag gates fusion_reactor
    on pellet possession
    (panel `6d12d5c771b6…`, tip `7eb51bdb45ff…`)
  - `src/js/game.js` — sim-fusionoffer-b (59448d248), same landing
    (panel `097703a735f3…`, tip `2b155837ebf4…`)

  Both are real game-code changes since the b15 panel. No version-stamp
  key is stale on this tip. Observer and contract digests still match
  the b15 panel (observer f37e5ce03414…, contract 37bbb0fad947…).
  The staleness is the source manifest only: 2 real game-code changes.
  **Verdict of the owed-check: OWED.** Panels at b15 and earlier are
  superseded; the re-point target is the NEW panel only.

## Panel — first run (superseded by a master move, kept as record)

- Command: `node scripts/balance-panel.js --out .proofrefresh-b16-panel --n 16 --days 150 --par 4`
- Single clean run, ~29 min, no flap, no restart:
  `Saved .proofrefresh-b16-panel; 64 cases, 0 cached jobs.`
  Panel log: `~/workspace/proofrefresh-b16-panel.log`.
- `sourceHeadStart == sourceHeadEnd == fcdc2615f` (the prereg commit;
  the worktree HEAD at panel time — the manifest is identical to base
  237fb445f since the prereg touched only an evidence .md).
- Panel sha256
  `b6d4d6ed8db40cc90896eefbebd1cfdf610c290e1621148c448adbba04d0e265`
  (copy retained at `~/workspace/proofrefresh-b16-panel-first-run.json.gz`).
- Verification (read-only): the generated panel's `sources` vs the
  branch-tip manifest: **0 keys differ**;
  `validity.sourcesStable` true; 64 rows; neutrality 4/4 match, warnings
  0, tuple identical to the b15 panel. Observer/contract digests match
  the tip and the b15 panel. 0 rows with warnings/observer/gear problems.
- Wall (see "Panel's own wall rows" for the retained panel — the
  first-run wall is identical in every headline: national 11/64, wins
  16/64, entered 16/64, table 56/64, wave-5 13/64, wave-4 63/64,
  median 90, max 150, vests 23, vestsVillager 39).
- Row movement vs b15: **16 of 64 rows differ in some field**
  (capable 1, risk-aware 7, socialite 5, winseek 3) — the fusionoffer
  fix touches contests/game code directly (fusion offer deferral +
  prize-bag gating), so row movement is the game changing, not the
  instrument drifting: the neutrality proof reproduces exactly.
  Headline aggregates moved modestly (table 55→56, wave-5 14→13,
  vestsVillager 41→39). Filed here for the winnability chain, not
  chased: this arm re-proves the instrument; no lever was played and
  no compare run was done.

## Master moves (during the run)

- **Move 1 — version bump + transplant15a landing:** master moved
  237fb445f → 16f05da86 during the first panel run (batch ship version
  bump 3b7a5c56b-20261114-123416 + sim-transplant15a-narrowed-a).
  The move touches **2 manifest keys**: `src/js/build.js` and
  `index.html` — the 2 version-stamp manifest keys (finding #2316).
  Measured: the first-run b16 panel has exactly those 2 stale keys
  vs 16f05da86; the b15 panel has 4 stale keys vs 16f05da86
  (build.js, contests.js, game.js, index.html). Per the prereg's
  master-move rule and the b15 adoption precedent (regen on the
  rebased tip instead of merging a stale proof), the panel was
  REGENERATED on the rebased tip rather than merging a 2-stale proof
  and reporting a NO-GO for the coordinator to re-run. The prereg's
  version-bump clause ("do NOT merge a NO-GO; report stale-key counts
  and whether merging still improves master") is therefore moot:
  no NO-GO was produced; the stale counts are recorded here instead
  (b15: 4 stale on 16f05da86; b16-first-run: 2 stale on 16f05da86;
  b16-regenerated: 0 stale).
- Rebase: branch rebased onto master 16f05da86 (prereg commit
  fcdc2615f → a8562fc68). Clean, no stop-at-pick quirk.
- **Move 2 — transplant15c/15e landing:** master moved again,
  16f05da86 → 3a60ceb10, during the regeneration run
  (sim-transplant15c-narrowed-a + sim-transplant15e-a). The move
  touches **NO manifest file** (15 files: evidence + scripts/test-*,
  verified with `git diff --name-only` filtered to src/,
  scripts/policies/, index.html, sim-harness.js, sweep-compare.js —
  empty). Per the prereg's master-move rule the panel stays valid:
  the manifest on 3a60ceb10 is identical to the manifest on
  16f05da86. The branch is rebased onto 3a60ceb10 at closeout and
  leg (a) is re-verified on that final tip (see "GO legs" — the
  panel's recorded sourceHeadStart/End, a8562fc68, is the pre-rebase
  branch tip; the manifest equality is what the proof test checks,
  and it is verified 0-stale on the final tip).

## Panel — regenerated on the rebased tip (RETAINED)

- Command: `node scripts/balance-panel.js --out .proofrefresh-b16-panel --n 16 --days 150 --par 4`
- First attempt SIGTERM'd after ~37.5 min by an agent-service restart
  (same signature as the b15 runs' 09:07Z restart); 62 cases were
  already banked in the worktree cache. Re-launch from the cache
  completed in ~2.4 min:
  `Saved .proofrefresh-b16-panel; 64 cases, 62 cached jobs.`
  Panel logs: `~/workspace/proofrefresh-b16-panel-r2.log`,
  `~/workspace/proofrefresh-b16-panel-r2b.log`. No write flap this run
  (no EPERM anywhere; the kill was the service restart, not the host).
- `sourceHeadStart == sourceHeadEnd == a8562fc68b48efbe3c69793cf65f786eac517c49`
  (rebased prereg tip on master 16f05da86).
- Panel sha256
  `49fbcf957c7bdd89f07e41677ecb1bffb87e97bb89bf9e3a5be2a94b94d13556`.
- Verification (read-only): the generated panel's `sources` vs the
  branch-tip manifest: **0 keys differ**;
  `validity.sourcesStable` true; 64 rows; neutrality 4/4 match, warnings
  0, tuple identical to the b15 panel AND the first-run b16 panel.
  Observer/contract digests match the tip and the b15 panel.
  0 rows with warnings/observer/gear problems.
- Staleness on the tip (measured, `B.manifest` vs panel `sources`, 526
  keys): **b16-regenerated 0 stale**; **b16-first-run 0 stale on its
  own tip** (2 stale vs 16f05da86); **b15 2 stale on 237fb445f, 4 stale
  on 16f05da86**; **b14 2 stale on 2de44bad8** (and 6 stale on the final
  tip — see leg (e)). Before/after: the refresh takes the proof from
  2 stale keys (b15) to 0 (b16-regenerated) on the final tip.
- Row movement vs b15: **16 of 64 rows differ in some field**
  (capable 1, risk-aware 7, socialite 5, winseek 3) — identical set to
  the first-run panel. Row movement vs the first-run b16 panel:
  **0/64 rows differ** — the version bump (build.js + index.html)
  moved no verdict, as predicted: it is stamps only, no game behavior.
- The `cases/` cache in `.proofrefresh-b16-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).

## Panel's own wall rows (scale-wall numbers, as the panel carries them)

64 rows, 150d, 16 seeds × 4 policies (regenerated panel, tip a8562fc68):

- national 11/64, wins 16/64, entered 16/64 — all 16 wins from the
  capable policy (16/16 capable rows won; risk-aware, socialite, winseek
  0/16 each).
- `row.table` 56/64 — the table field as the panel carries it tracks
  Arc-IV reach (maxArc 4 is also 56/64); it is NOT the entered/won count
  (entered 16/64 is the like-for-like number against b15's 16/64).
  maxRank: global 11, regional 46, village 7.
- Wave reach: 13/64 reached wave 5, 63/64 reached wave 4 (the single
  miss: winseek seed 42, village-lost at d30 on wave 3 — same seed/row as
  b8, b9, b10, b11, b12, b13, b14, and b15).
- Max Arc: 56/64 Arc IV, 8/64 Arc III.
- Median survival 90 game-days, max 150.
- End reasons: village-lost 46, over-other 16, survived 2.
- Vests 23 total; vestsVillager 39.
- Per-policy median days: capable 90, risk-aware 114, socialite 94,
  winseek 74.
- Per-policy wave-5 reach: capable 4, risk-aware 7, socialite 2,
  winseek 0.
- Per-policy vests: capable 2, risk-aware 7, socialite 6, winseek 8.

Against b15's rows (same spec, same counting code — recomputed from
the retained b15 panel): national 11→11, wins 16→16, entered 16→16,
table 55→56, wave-5 14→13, wave-4 63→63, median 90→90, max 150→150,
vests 23→23, vestsVillager 41→39, survived 2→2, village-lost 46→46,
over-other 16→16. These are the instrument's own rows on the new tip,
reported as carried, not a balance verdict (this arm re-proves the
instrument; no lever was played, and no compare run was done). The
national step stays the binding constraint on the win rows that lack
it — filed here for the winnability chain, not chased.

## Pre-regeneration verification

Measured on the branch tip before any regeneration:

- `test-measurement-proof-update.js`: FAILS, exit 1, "Proof source
  inputs are not current" — the expected stale state; the exact stale-key
  list is the 2 keys above.
- `validate-ontology.js` standalone: exit 0 (re-verified in the leg run).

## Proof update

Copied the regenerated panel to
`evidence/2026-11-14/neutral-proofrefresh-b16.json.gz` (new file — the
b15/b14/b13 panels are NOT overwritten), then `node
scripts/balance-proof-update.js
evidence/2026-11-14/neutral-proofrefresh-b16.json.gz` — exit 0;
`scripts/balance-proof.json` re-points at the new panel only
(panelDigest `49fbcf95…`). No hand-edited hashes; no re-point to an
old panel.

## GO legs (judged only on the final tip — 3a60ceb10, after the closeout rebase)

(To be filled after the rebase — see "Closeout".)

## Metric review

(To be filled at closeout, after the legs are judged on the final tip.)

## Commits (branch sim-proofrefresh-b16)

(To be filled at closeout.)

## Closeout

(To be filled at closeout: final tip, leg (a) re-verification on the
rebased tip, verdict, coordinator decision.)
