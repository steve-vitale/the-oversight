# sim-proofrefresh-b15 — measurement proof regenerated (round 15)

## Prereg

- **Run:** fleshout-loop-b-20261114T0730Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b15 (tracker blank #2:
  "proof refresh round 15 on the next manifest change (regenerate +
  re-point, do not hand-edit)"). Round 14 was GO 12/12 on its panel tip
  97929b5d3 AND on the final tip 8c83b6a9a (master did not move during
  round 14 — first clean final-tip GO since round 10). Round 15 is owed
  immediately and follows the proven round-11/12/13/14 pattern exactly
  (regen + re-point + 6 GO legs), on the current tip.
  Full prereg committed first:
  `evidence/2026-11-14/sim-proofrefresh-b15-prereg.md` — EXCEPT the
  flap blocked every git write for the first ~55 min of the run (see
  "Host write flap"), so the prereg file existed on disk from 08:12Z
  (before any judged run) but its commit landed with the closeout
  commit instead of before the panel. The prereg text is unaltered
  since 08:12Z; only its commit timing moved, forced by the host.
- **Base SHA:** `2de44bad8` (journey-establishment r137 closeout; local
  master at worktree registration, ahead of origin/master 249da4729
  which is an ancestor — the local merges since the last batch ship
  are not yet pushed; ship loop owns pushes).
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
  every proof case, warnings 0; (e) test-proofrefresh-b15.js 12/12
  incl. stale-input negatives (the retained b14 panel AND the b13
  panel FAIL validate() on the new tip); (f) ontology exit 0. Any leg
  miss = NO-GO, no re-scoring.

## Owed-check (pre-registered decision, run before the panel)

- Before: `node scripts/godpath/test-measurement-proof-update.js` FAILS on
  2de44bad8 with `Error: Proof source inputs are not current`
  (`scripts/balance-proof-update.js:8`), exit 1 — confirmed in the worktree
  before the panel run, matching the coordinator's baseline.
- `B.manifest('.')` vs the retained b14 panel's `sources`
  (`evidence/2026-11-14/neutral-proofrefresh-b14.json.gz`, sha256
  `63351ce634740e723570f412b1bf0238c90a0bcd4a482cb4d7e42c62e0f95f8b`):
  exactly **2 manifest keys differ** (of 526 total on the tip; 526 in
  the b14 panel):

  - `src/js/abilityActions.js` — sim-rageprecheck-b (e73ee835d): refuse
    Unleash Rage re-press while rageActive live
    (panel `fabd5737483f…`, tip `29515be97914…`)
  - `src/js/conversation.js` — journey-landing r131 HEED fix (63c051206):
    warn_you warning now engages the want
    (panel `02474e4acb9f…`, tip `2c015eb7cea2…`)

  Both are real game-code changes since the b14 panel. No version-stamp
  key is stale on this tip. Observer and contract digests still match
  the b14 panel (observer f37e5ce03414…, contract 37bbb0fad947…).
  The staleness is the source manifest only: 2 real game-code changes.
  **Verdict of the owed-check: OWED.** Panels at b14 and earlier are
  superseded; the re-point target is the NEW panel only.

## Panel

- Command: `node scripts/balance-panel.js --out .proofrefresh-b15-panel --n 16 --days 150`
- Ran in pieces across the flap (see "Host write flap"): 7 ungated
  attempts died at the first case-write batch; a gated retry loop
  banked 14 cases; an agent-service restart at ~09:07Z killed the
  loop; the flap cleared 09:05–09:06Z (watcher ALL-OK); a fresh
  `--par 4` run from the 31-case cache completed 09:20Z:
  `Saved .proofrefresh-b15-panel; 64 cases, 31 cached jobs`.
  Total wall from first launch 08:12Z to save 09:20Z (~68 min, most of
  it flap-waiting; the clean tail ran 09:08–09:20Z).
- The `cases/` cache in `.proofrefresh-b15-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- `sourceHeadStart == sourceHeadEnd == 2de44bad831a7a3d17fa0d02ea2d8b6bff48c81c`
  (base 2de44bad8; master did not move during the run).
- Panel sha256
  `fd0d5bebe9f576fc3b6149c776e40f9ddf1f17506bf50b3be97c1ec38d575fd8`.
- Verification (read-only): the generated panel's `sources` vs the
  branch-tip manifest: **0 keys differ**;
  `validity.sourcesStable` true; 64 rows; neutrality 4/4 match, warnings
  0, tuple identical to the b14 panel AND the b13 panel (regeneration
  moved no verdict). Observer/contract digests match the tip and the b14 panel.
  0 rows with warnings/observer/gear problems.
- Staleness on the tip (measured, `B.manifest` vs panel `sources`, 526
  keys): **b15-new 0 stale**; **b14 2 stale**; **b13 2 stale** (both
  stale keys are the abilityActions.js + conversation.js moves).
  Before/after: the refresh takes the proof from 2 stale keys (b14)
  to 0 (b15-new) on this tip.
- Row movement vs b14: **31 of 64 rows differ in some field**
  (capable 9, risk-aware 13, socialite 10, winseek 0) — unlike b14's
  0/64 vs b13. The two game-code changes since the b14 panel both
  touch combat/behavior directly (rage re-press refusal changes fight
  play; HEED want-engagement changes villager behavior), so row
  movement is the game changing, not the instrument drifting: the
  neutrality proof (leg d) reproduces exactly, and the panel is the
  instrument's honest measurement of the new tip. Headline aggregates
  moved modestly (see wall rows). Filed here for the winnability
  chain — wave-5 reach 9→14 and wins 15→16 after the rageprecheck +
  HEED landings is the first wave-5 movement this arm has recorded —
  not chased: this arm re-proves the instrument; no lever was played
  and no compare run was done.

## Panel's own wall rows (scale-wall numbers, as the panel carries them)

64 rows, 150d, 16 seeds × 4 policies (regenerated panel, base 2de44bad8):

- national 11/64, wins 16/64, entered 16/64 — all 16 wins from the
  capable policy (16/16 capable rows won; risk-aware, socialite, winseek
  0/16 each).
- `row.table` 55/64 — the table field as the panel carries it tracks
  Arc-IV reach (maxArc 4 is also 55/64); it is NOT the entered/won count
  (entered 16/64 is the like-for-like number against b14's 15/64).
  maxRank: global 11, regional 46, village 7.
- Wave reach: 14/64 reached wave 5, 63/64 reached wave 4 (the single
  miss: winseek seed 42, village-lost at d30 on wave 3 — same seed/row as
  b8, b9, b10, b11, b12, b13, and b14).
- Max Arc: 55/64 Arc IV, 9/64 Arc III.
- Median survival 90 game-days, max 151.
- End reasons: village-lost 46, over-other 16, survived 2.
- Vests 23 total; vestsVillager 41.
- Per-policy median days: capable 90, risk-aware 110, socialite 93,
  winseek 75.
- Per-policy wave-5 reach: capable 5, risk-aware 6, socialite 3,
  winseek 0.
- Per-policy vests: capable 2, risk-aware 6, socialite 7, winseek 8.

Against b14's rows (same spec, same counting code — recomputed from
the retained b14 panel): national 12→11, wins 15→16, entered 15→16,
table 55→55, wave-5 9→14, wave-4 63→63, median 90→90, max 151→151,
vests 24→23, vestsVillager 41→41, survived 2→2, village-lost 47→46,
over-other 15→16. These are the instrument's own rows on the new tip,
reported as carried, not a balance verdict (this arm re-proves the
instrument; no lever was played, and no compare run was done). The
national step stays the binding constraint on the win rows that lack
it — filed here for the winnability chain, not chased.

## Master move (during the run)

None. Master stayed at `2de44bad8` from worktree registration through
closeout (checked at prereg, owed-check, panel attempts, and closeout).
No rebase was needed; the panel tip IS the final tip, so the prereg rule
(legs judged only on the final tip) is satisfied by the panel-tip results
directly. Second consecutive round with no master move during the run.

## Host write flap

- A host write-flap episode was ACTIVE for the first ~55 min of the
  run (first FLAP line in the watcher log 2026-11-14T08:07:04Z; ALL-OK
  at 08:04:59Z) and CLEARED 09:05–09:06Z (watcher: all probes OK at
  09:05:42Z, ALL-OK at 09:06:49Z; same boot 76881aa4 throughout — no
  VM replacement). Episode length ~59 min. Symptoms: EPERM (errno 1,
  Operation not permitted) on file writes, git ref/index writes, and
  the worktree heartbeat registry write. The flap-watcher's probes
  showed the pattern stable all episode — A (python write+fsync+rename)
  FAIL@write, B (git update-ref) FAIL, G/H (py/node fsync+rename)
  FAIL, while C/D (node plain 26KB writeFileSync) passed ~394/396
  historically and F (python plain write) passed. The episode denied
  plain writes too, in bursts of seconds-to-minutes: my own
  100–127KB writeFileSync+rename probes passed 10/10–20/20 in passing
  windows and failed 0/20 and 0/10 inside denied windows, minutes apart.
- Panel kills: the panel run died 7 times on its FIRST case-write
  batch (attempts at 08:12, 08:17, 08:22, mini 08:35, loop att 1
  08:39, loop att 2 08:43, mini --par 1 08:47), each time with
  `Error: EPERM: operation not permitted, write at
  Object.writeFileSync (node:fs) at worker (scripts/balance-panel.js:328)`
  and zero-byte `.json.tmp` files — and an EMPTY log, because the
  parent's stderr write to the log file was itself denied. The sim
  children themselves run fine (a direct child completed the full
  150-day capable/7 sim in ~99s to a pipe, row won/national/table).
  Ruled out as causes: write size (case values are 50–222KB, mean
  ~127KB — same class as passing probes), process age (a 30s-old
  process's writes pass), directory (scratch vs worktree cases both
  pass/fail together), parallelism (the --par 1 mini failed its first
  write with no other sim running), and the rename step (write-only
  and write+rename fail together). Remaining explanation: denial
  bursts in time; the panel's first-write batch kept landing inside
  one. The ungated retry loop DID bank 8 cases across its attempts
  (08:43–08:53), proving passing windows exist and resume works.
- Gated retry (the working method): a 10/10 write-probe gate
  immediately before launch predicts a passing window. Proved by the
  gated --par 1 mini (gate 10/10 → mini completed, 2 cases saved,
  ~4-min window). The gated loop (10 attempts max, 45s between gate
  checks) launched 08:53:40Z; attempt 1 gated PASS, banked 4 cases,
  died 08:56:55Z on EPERM when the window closed; attempt 4 gated
  PASS 08:59:11Z and banked 16 more (31 total) before an agent-service
  restart at ~09:07Z killed the loop shell and wiped /tmp (same boot
  — the restart was the agent service, not the VM; the worktree and
  its 31-case cache survived intact). NOTE for the next run: the
  flap-watcher's C/D probes pass while panel writes fail — the watcher
  does NOT see the panel's denial bursts. The gate probe (127KB
  writeFileSync+rename ×10, in the cases dir) is the instrument that
  sees them; reuse it. The 2 mini cases were copied into
  `.proofrefresh-b15-panel/cases/` (same identity — same
  source/observer/contract digests, seeds, policies, days, origin —
  so the panel reuses them after its own per-case validation).
- Git writes (commit, heartbeat, update-ref probe) denied until the
  flap cleared at ~09:06Z; the prereg commit therefore landed with
  the closeout commit (see Prereg). The safe-commit index clobber
  did NOT strike the closeout commit (verified status/diff clean
  after — see Commits). No work lost: prereg, test, evidence, panel,
  and the banked cases all survived on disk in the worktree.
- A sibling observation from this run, passed to the flap watcher:
  a bare-process node write succeeds, but the same write inside a
  process that has just run a sim child fails during denied windows —
  timing, not the child, is the discriminator (the --par 1 mini
  failed with no sim running; probes pass/fail in bursts regardless).

## Pre-regeneration verification

Measured on the branch tip before any regeneration:

- `test-measurement-proof-update.js`: FAILS, exit 1, "Proof source
  inputs are not current" — the expected stale state; the exact stale-key
  list is the 2 keys above.
- `validate-ontology.js` standalone: exit 0, "All 138 systems validated",
  ONTOLOGY.md 2198 lines, no diff vs HEAD (re-verified in the leg run).

## Proof update

Copied the regenerated panel to
`evidence/2026-11-14/neutral-proofrefresh-b15.json.gz` (new file — the
b14/b13/b12 panels are NOT overwritten), then `node
scripts/balance-proof-update.js
evidence/2026-11-14/neutral-proofrefresh-b15.json.gz` — exit 0;
`scripts/balance-proof.json` re-points at the new panel only
(panelDigest `fd0d5beb…`). No hand-edited hashes; no re-point to an
old panel.

## GO legs (judged only on the final tip — 2de44bad8, which is also the panel tip)

- (a) `test-measurement-proof-update.js`: exit 0, **9 passed, 0 failed**
  — ON THE FINAL TIP.
- (b) `test-measurement-workflow.js`: 9/9 (final tip).
- (c) `test-measurement-cache-flags.js`: 4/4 outright, first attempt,
  no load artifact, no re-run needed. (The flap, not box load, was
  this run's hazard; the cache-flags check ran clean in the clear
  window.)
- (d) Neutrality reproduction: match on every proof case, warnings 0,
  tuple identical to the b14 panel AND the b13 panel — regeneration
  moved no verdict. (Covered by proof-test legs 6, 8, 9.)
- (e) `scripts/test-proofrefresh-b15.js`: 12/12 — including the
  stale-input negative checks: the retained b14 panel AND the b13 panel
  FAIL `validate()` on the new tip with "Proof source inputs are not
  current", proving the green result is not vacuous.
- (f) `scripts/validate-ontology.js`: exit 0, "All 138 systems
  validated". ONTOLOGY.md 2198 lines, no diff vs HEAD, no truncation
  this round.
- A miss on any leg would have been NO-GO; on the final tip none missed.
  Judged only against the prereg, never re-scored.
- Telemetry deviation check: `scripts/telemetry-check.js` cannot parse
  the retained `.gz` panel ("Unexpected token" — it expects per-seed
  JSON evidence, not a panel archive), the same limitation the b11/b12/b13/b14
  adoptions recorded. No lever was played, so there is no before/after
  deviation to check; the neutrality reproduction (leg d) is the
  instrument check that stands in its place. No LOUD line to
  investigate beyond that known parser limitation. Baseline NOT rolled.

## Verdict

**GO on the final tip (2de44bad8) — all six legs pass, 12/12.**
The measurement proof is refreshed on the final tip: the new panel is
current (0 stale keys), every prereg GO leg passes, and the proof
re-points at the new panel only. Master did not move during the run,
so like round 14 there is no final-tip staleness to carry forward.
Round 16 is owed after the next manifest change — not started here,
per the brief.

## Metric review

- The primary metric judged what it claimed: the proof test failed on
  the stale tip with exactly the expected manifest-mismatch error (2
  keys, named) and passes on the refreshed tip with 0 stale keys; the
  stale-input negative checks (b14 and b13 both fail validate on the new
  tip) prove the green result is not vacuous. No re-scoring at any point.
- The 31/64 row movement vs b14 does NOT break the verdict: the GO
  legs judge the proof (current + neutral), and neutrality reproduces
  exactly. The movement is the game changing under the instrument —
  two combat/behavior fixes landed since the b14 panel — and the
  instrument measured it honestly. The metric (proof current/neutral)
  is not the row vector; conflating them would be the drift §14 warns
  about. The movement itself is filed for the winnability chain
  (wave-5 9→14, wins 15→16), where it belongs.
- The prereg's commit-timing rule ("committed before any judged run")
  could not be met literally: the host denied every git write for the
  first 55 min. The prereg file itself was written 08:12Z before any
  judged run and is unaltered since; only the commit landed late.
  Proposed for the next run: when the flap blocks the prereg commit,
  record the file's mtime + sha in the evidence (done here by the
  timeline) rather than treating the commit as the pre-registration
  event. No metric revision proposed beyond that note.
- The gated write-probe is now a proven tool for flap episodes: a
  10/10 gate predicts a passing window well enough to complete a
  mini panel and to bank 16 cases in one attempt. The next run should
  keep the gate in its kit rather than re-deriving it.
- No other metric revision proposed. The prereg held.

## Commits (branch sim-proofrefresh-b15, base 2de44bad8)

- (TO BE FILLED at closeout — prereg + panel + proof re-point + test + evidence in one closeout commit; the flap blocked the separate prereg commit.)

## Closeout — GO ON FINAL TIP (round 16 owed after next manifest change)

- Master did not move during the run: tip 2de44bad8 at registration,
  panel, proof test, and closeout. No rebase performed; no rebase
  stop-at-pick quirk encountered.
- Leg (a) verified on the final tip 2de44bad8: **PASSES, exit 0, 9/9**
  — the panel tip is the final tip.
- **Verdict on the final tip (2de44bad8): GO.** All six prereg legs
  pass; test-proofrefresh-b15.js 12/12.
- **Coordinator decision:** merge as-is — `git merge --ff-only
  sim-proofrefresh-b15` in the main tree (no pipe, strict && chain;
  ancestry verified with `git merge-base --is-ancestor` after). Then
  release: `worktree-release.sh sim-proofrefresh-b15 merged`,
  worktree removed, branch deleted, `worktree-reap.sh`, main tree
  verified clean. No push, no bump, no live verification — the ship
  loop owns deploys. "Merged locally, pending ship."
- Round 16 stays owed for the next B run, on the next manifest change.
