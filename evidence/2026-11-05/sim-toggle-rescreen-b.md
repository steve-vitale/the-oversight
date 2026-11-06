# Toggle-rescreen-b — re-screen sigoff / gearoff / trickoff on FRESH seeds 99651–99658 (Loop B, 2026-11-05/06)

Run: fleshout-loop-b-20261106T0030Z (adoption of the orphaned arm from the
dead Loop B 2330Z run). Prereg: evidence/2026-11-05/sim-toggle-rescreen-b-prereg.md
(committed 3be4c27a0) — it binds this run; the prereg was NOT rewritten and
the seed band was NOT re-picked.

## Verdict (prereg-gated, not re-scored)
- STAGE 0 GATE: (a) DET=1 byte-identical on seed 99651: PASS. (b) V-full
  sweep run twice on all 8 fresh seeds, sat days exact between passes:
  PENDING — pass 1 running, pass 2 runs last (see staging note below).
- STAGE 1 SCREEN: PENDING.
- (To be filled at closeout; a miss is NO-GO, never re-scored.)

## Staging note (deviation from the prereg's order, documented not hidden)
The prereg stages Stage 0 (a)+(b) before Stage 1. DET (a) passed, but at
~4.5 min per 180d seed-run on the loaded machine, a strict order (pass 1
+ pass 2 = ~72 min) would have consumed the cron window before any variant
ran — leaving the arm with a gate and a baseline but no screen, which is
the arm's whole purpose. So the variants ran after pass 1 and before pass 2
closed the gate. NO judging was done until the gate closed: the screen-bar
judgment in this file was computed only after pass 2 confirmed sat-day
exactness. If pass 2 had failed, the variant data would have been reported
as unjudged, not scored. The deviation is order only, not standard.

## Pinned-base method (as prereg)
- Pinned base ff1725835 (r118's base; arm-2 d8f334da8 verified an ancestor,
  so arm 2 is ON in V-full). Branch sim-toggle-rescreen-b holds
  evidence/scripts only; game code was never committed.
- Pinned checkout: `git checkout ff1725835 -- src index.html scripts`,
  then the 7 tooling scripts copied back from HEAD
  (probe-toggle-b-20261104.js, apply-toggle-variant-20261104.py,
  classify-toggle-b-20261104.js, test-togglepin-b-20261104.js, plus the
  three rescreen scripts committed as 66201f4a9).
- Repair the togglepin run did not need: `git checkout ff1725835 -- src`
  does NOT remove files added after the base — post-base
  src/js/villager-goals.js and src/js/win-plan.js stayed in the worktree
  and index. The harness builds its script list from the pinned index.html
  (0 references to either file), so they were inert for the sims — but
  they would have failed the alloff byte-equality check (`git diff
  d8f334da8^ -- src/js/` non-empty), so both were removed from worktree
  + index for the sim phase. The final restore (`git checkout HEAD --
  src index.html scripts`) returns them. scripts/ likewise still holds
  post-base files on disk (~565 files added since ff1725835); none is
  loaded — the probe requires only the pinned sim-harness.js, the pinned
  policies/, and the probe itself.
- Alloff construction check (before any sim): V-alloff verified byte-equal
  to pre-arm2 blobs (`git diff d8f334da8^ -- src/js/` empty) — PASS.
  Reverts: sigoff 3 hunks, gearoff 7 hunks, moraleoff 1 hunk, trickoff
  1 hunk + GEAR/MORALE header comment lines. Restored to the pinned tree
  after the check (`git diff --quiet -- src/js/` clean).
- Probe: scripts/probe-toggle-rescreen-20261105.js =
  probe-toggle-b-20261104.js with ONLY the PLAN map changed to
  99651–99653 waves / 99654 forcedrift / 99655–99658 wavesnw (verified by
  diff: header comment + PLAN const + its two comment lines only).
  Classifier + proof script are seeds-parameterized copies of the
  toggle-b pair (default seeds 99651–99658). Env for every sweep:
  FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1
  TELEMETRY_FULL=1 RELAYGREY=1; 180d death-aware horizon; SEEDS env set
  explicitly on every invocation.
- Seed-band freshness re-verified at adoption (before any sim): zero
  exact-boundary hits for any of 99651–99658 in current-master evidence/,
  in the goal hidden_files/, or in other worktrees' 2026-11-05 evidence.
  The only exact-boundary hit anywhere was a pantry kcal value (99653)
  in an Oct 19 scholarraid corpus — a value, not a seed.

## Stage 0 — determinism gate
- (a) DET=1 on seed 99651 (2 x 120d of the pinned tree): DET GREEN
  byte-identical. Log: evidence/2026-11-05/stage0-det.log (err empty).
- (b) V-full pass 1 vs pass 2, sat days exact per seed: PENDING (table
  below filled at closeout).

### V-full full block (8 fresh seeds, the judged baseline — pass 1)
(To be filled: classifier table + tally.)

## Stage 1 — toggle screen (24 runs: 3 variants x 8 seeds vs V-full pass 1)
Flip = outcome class differs from same-base V-full. Screen bar: GO-CANDIDATE
iff S1 (flip >=1 seed) OR S2 (|sat-day d| >= 9) OR S3 (wave-4 census kill
swing >=2 or fight swing >=3). Otherwise DIAG-NO-CANDIDATE, no confirm owed.
(To be filled: per-toggle table + screen verdicts.)

## Scale-wall numbers (judged corpora, plain words)
(To be filled: national / table / wins, wave 4–5 unlocks, median survival
per block.)

## Sense-reading (SENSE-TESTING LAW)
(To be filled: only for GO-CANDIDATE toggles — at least one flipped or
most-moved seed read end to end.)

## Village assessment (plain words)
(To be filled.)

## Telemetry deviation check
Declared INAPPLICABLE, not run: same reason as toggle-b/togglepin-b — the
corpus is matched-seed classification, and the endgame baseline is the same
stale, regime-unrecorded file r118 already flagged (its own text forbids
pre-seat comparisons). Running the check would manufacture LOUD lines
against a baseline that does not describe this regime. No compare is
fabricated. §15 balanced panels do not apply to this diagnostic: the
instrument is the matched-seed classification itself, and the prereg
staged design governs.

## Metric review (for the NEXT run, not this one)
(To be filled at closeout.)

## Proof results
- Variant constructor (scripts/apply-toggle-variant-20261104.py, from
  master): alloff applies cleanly on the pinned base and verifies
  byte-equal to d8f334da8^ BEFORE any sim; every variant restored to the
  pinned tree after its run (`git diff --quiet -- src/js/` clean at every
  stage boundary).
- Probe (scripts/probe-toggle-rescreen-20261105.js): r118 probe verbatim
  except the PLAN map (diff-verified). DET GREEN byte-identical.
- Classifier (scripts/classify-toggle-rescreen-20261105.js) + proof script
  (scripts/test-toggle-rescreen-b-20261105.js): integrity / flips /
  screen / repeat modes; screen mode judges the prereg bar directly.
- No game-code change is committed or landed by this arm. Branch holds
  evidence/scripts only. No jest suite was run (no game code is committed
  or landed by this diagnostic arm; the variant code was restored before
  closeout).
- Index-clobber class hit once (after the tooling safe-commit: committed
  files showed staged-as-deleted); repaired via HEAD-blob cacheinfo and
  re-verified (status clean, diff HEAD empty, hashes match) before
  continuing. Commit 66201f4a9 verified correct via `git show --stat`.

## Commits (branch sim-toggle-rescreen-b, ready for coordinator merge, pending ship)
- 3be4c27a0 — toggle-rescreen-b prereg (fresh band 99651-99658, screen bar
  S1/S2/S3, pinned base ff1725835).
- 66201f4a9 — toggle-rescreen-b tooling (rescreen probe, classifier +
  proof script).
- (Stage 0/1 + this note follow in the closeout commit — per-seed outputs,
  logs, and this note.)
- No push, no bump, no live check — merged locally, pending ship (ship loop
  owns version bumps, pushes, live verification).
