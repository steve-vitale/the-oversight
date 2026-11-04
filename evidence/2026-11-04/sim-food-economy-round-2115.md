# sim-food-economy-round-2115 — Loop A coordinator evidence

Run: oversight-flesh-out-loop, run fleshout-20261104T2115Z (Loop A).
Axis: food-economy. Sibling Loop B live on scale-onramp throughout
(2125Z claim: vetencounter-b + vetshape-b) — NOT touched. No
gate/price/deed change in either arm of this run. Zero src/js
changes from the worker arm; one 11-line narration hook from the
recovered prior run (see arm 1). No push, no bump, no live
verification (ship loop owns deploys). Merged locally, pending ship.

## Stale-lock recovery (this run's opening)

The run opened on a stale lock (fleshout-20261104T1933Z, created
19:33Z) whose run had died before closeout: its worktree
sim-exphurt-land-a last heartbeated 19:42Z (94 min stale at
21:16Z), no live processes, worktree clean with three committed
GO-LAND commits, claim file still live. Per the concurrency guard
(heartbeat > 15 min stale, lock > 90 min old), the lock was deleted
and the run proceeded; the stale claim was retired only after the
orphaned work was safely merged (below).

## Arm 1 — sim-exphurt-land-a RECOVERY: GO LAND, merged

The 1933Z run's worker had finished but its coordinator had timed
out before merging. Recovery, verified step by step, not assumed:

- Branch sim-exphurt-land-a (commits 7e12911ee prereg, 9f6d5d7a9
  hook + instrument, 05d4b6d5d evidence + corpus) was NOT on master.
- Rebased onto master 46c16d215 clean (master had not touched
  src/js/villager-agency.js since the branch base); src diff after
  rebase exactly the 11-line hurt-clause hook, nothing else.
- Proof re-run on the rebased tree: scripts/test-exphurt-land-a.js
  115/115 green; node --check clean.
- check.js --quick on the rebased tree: 283 passed, 7 failed —
  one more failure than the worker's 284/6 baseline. The extra
  failure, scripts/godpath/test-measurement-cache-flags.js, was
  adjudicated, not buried: run alone WITH the hook it passes 4/4,
  so the check.js failure was a concurrency artifact of three
  simultaneous check.js runs (the known concurrent-jest phantom
  class), not a hook regression. True standing set on the rebased
  tree = the worker's 6 pre-existing failures, zero new. Leg (d)
  judged MET on its purpose, as the worker judged it.
- Master moved twice during recovery (journey-endgame r131, then
  journey-scale r97); the branch was rebased again onto current
  master, proof re-run green, then merged --ff-only as 570daa9c5
  (post-rebase hashes 1a715818b / 16f2c0640 / 570daa9c5).
  Tree released done-merged, branch deleted, worktree removed.
- Worker verdict (from its committed evidence
  evidence/2026-11-04/sim-exphurt-land-a.md): GO LAND — M1 0/17 →
  17/17 among announced expedition returns on matched seeds
  99933–99956, median daysAlive delta 0d, trajectories
  bit-identical, healthy homecomings 188/188 template-identical.
  The hook appends "hurt on the way home" to the expedition
  homecoming line when the returnee is hurt at return (hp 1..7).
  This closes backlog #1699's narration half; its clock half
  (exped vs away duration write-back) stays exactly where prior
  arms left it — behaviorally moot, needing a proven
  outcome-changing divergence before any future arm touches it.

## Arm 2 — sim-upkeepbreakfast-a: VERIFICATION-GATE NO-GO (fast kill)

Blank: "UPKEEP BREAKFAST IS SILENT" (bankretain-rerun-a) — the
540-kcal morning upkeep meal on seed 16505/loop-day 59 was said to
leave no narration line, visible only as a kcal jump (344 → 884).
Worker brief: Phase 1 instrument + reproduction, then STOP for a
merge confirmation before any prereg or judged sim.

- Phase 1 (commit 5d405d5a0 post-rebase): full-transcript
  upkeep-breakfast instrument (lib + sweep + analyzer) with proof
  test scripts/test-upkeepbreakfast-a.js — pure 32/32, corpus mode
  44/44 on the reproduction corpora. The instrument closes the
  prior instrument's blind spot: it records upkeep-window say
  lines, not just daily() lines.
- Phase 2 gate (commit 8fb89e923 post-rebase): after rebasing onto
  master 570daa9c5 (exphurt merge + r97), the worker re-verified
  instead of assuming the deficit. Result: NO-GO for the hook as
  scoped. The post-merge corpus is BYTE-IDENTICAL to the Phase 1
  guard corpus; the 16505 chain reproduces verbatim (first-upkeep
  344, grapes intact, daily-start 884, pack 0, morning phase
  ate=false / 'no-pack-food'); and the meal IS narrated in the
  upkeep window itself by the engine's own meal beat
  (`Game.eat()`: "You eat Muscadine Grapes (540 kcal)."), the
  first line of the morning's upkeep window. Baseline on both
  bases: 2/2 qualifying upkeep meals narrated, 0 silent.
- Root cause of the filed blank: bankfood-trace-b.js captures say
  lines only around daily() and stores full day lines only on
  bankfood-evening rows; upkeep calls run outside daily(), so the
  window where competentEat speaks was never recorded. The blank
  was a measurement artifact, not a game silence.
- Consequences, honored rather than worked around: NO prereg was
  written (the suggested GO ≥ 0.80 shape is vacuous against a
  2/2-narrated baseline and must not be reused without a
  re-scoped deficit); NO pilot and NO confirm were run (a
  before/after comparison would compare an already-narrated
  baseline against a hook adding a duplicate line); NO hook, no
  src/js change, no [needs-eyes] commit. The player-away question
  posed for the prereg is moot for this meal: the 16505 case wakes
  away from haven and is still narrated, because the scholar IS
  the player character in the field.
- Worker evidence: evidence/2026-11-04/sim-upkeepbreakfast-a-
  verification-postmerge.md; corpora sim-upkeepbreakfast-a-corpus-
  guard / -on / -guard-postmerge (each: upkeepbreakfast-a-s16505.
  json). Proof re-run green on merged master (pure 32/32;
  exphurt proof 115/115 re-run green on merged master too).
  Branch merged --ff-only after a clean rebase onto Loop B's
  vetencounter/vetshape landing (zero file overlap); tree
  released done-merged, branch deleted, worktree removed.

## Village assessment (plain words)

Two small honesty fixes to how the game talks about mornings and
homecomings. First, a villager who comes home hurt from an
expedition no longer gets a cheerful homecoming line that erases
the hurt — the line now says they were hurt on the way home, and
healthy homecomings read exactly as before. Second, a morning
breakfast eaten during the night's upkeep was never actually
silent: the game does say "You eat Muscadine Grapes (540 kcal)"
first thing in the morning. An earlier measuring tool only
listened to part of the morning, so it reported silence where
there was a spoken meal. No new narration was needed, and none
was added — adding a second line for the same meal would have
been clutter, not a fix.

## Reachability / wall numbers

No scale panel was run this round (food-economy axis; Loop B owns
the scale-onramp measurement). Wall state is NOT re-measured here
and is not claimed to have moved: standing state from Loop B's
2015Z run (wins 0/8, national/table 0/8, wave-5 0/8, readiness-5
ready days 0/8) plus its 2125Z follow-up (vetencounter/vetshape
both DIAG-NO-CANDIDATE, per their own coordinator closeout).
This run's arms touch narration and measurement only; they cannot
move the wall, and no wall movement is claimed.

## Metric review

- The exphurt leg-(d) reading (purpose over literal green) was
  re-earned on the rebased tree: the 7th check failure was proven
  a concurrency phantom by a clean solo re-run (4/4), not
  assumed away. Future recovery merges should re-run a full
  check alone (not beside sibling checks) before judging leg (d),
  or adjudicate any delta failure solo first.
- The upkeep arm validates the staged-gate discipline: a
  verification re-run on the new base BEFORE prereg killed a
  hook whose premise did not survive contact with the full
  transcript. The suggested GO ≥ 0.80 prereg shape must be
  retired for this question — any future narration prereg must
  first demonstrate a baseline below its bar.
- No metric was re-scored mid-run. The upkeep arm wrote no
  prereg because its gate failed before prereg was warranted;
  that is the gate working, not a missing prereg.

## Findings backlog (coordinator updates)

- "UPKEEP BREAKFAST IS SILENT" (bankretain-a / bankretain-rerun-a):
  CLOSED as a measurement artifact per this arm — see
  sim-findings.md update in this run. If Steve still perceives a
  gap here, it must be re-scoped as a NEW question about
  browser-transcript placement (where the spoken line lands on
  the phone surface), with its own substrate — not a rerun of
  this arm.
- "SILENT PLAYER-AT-HAVEN EXPEDITION RETURN" (exphurt-24-a, Bill
  s99946): resolved by the exphurt-land-a landing's capture-gap
  finding (the closing part DID contain both return lines; the
  old capture missed them) plus the hook itself.
- Next food-economy blanks, in order: (1) bankretain census
  substrate change (strand-screened band or probe-given food;
  do NOT run the census a third time unchanged); (2) stranded-
  scholar narration (backlog, still open); (3) late-work line
  hardcoded "at the creek" on forest_floor evenings (voice-only);
  (4) death-cause "the wild" bucket decomposition (41.0% of
  deaths) before any future death-share claim.

## Telemetry deviation check

Ran per the loop body against the exphurt-land-a per-seed corpus
(25 files): LOUD national 12 → 0, table 16 → 0, wins 16 → 0.
Investigated same-run, verdict EXPLAINED, NOT a regression:
the corpus is a 100d narration corpus whose instrument records
no scale outcomes (national/table/wins fields absent/zero by
construction), while the baseline counts come from scale panels;
the hook itself is narration-only with trajectories bit-identical
to baseline (median daysAlive 88 → 88). Baseline NOT rolled
forward. No LOUD line survives as an investigation item.

## Infrastructure notes

- Master moved 3 times under this run (r131, journey-scale r97,
  Loop B vetencounter/vetshape landing); every merge followed
  the established pattern: --ff-only refuses, rebase clean (zero
  file overlap), proofs green after every rebase and on merged
  master. No conflicts, no force, no push, no bump.
- Slow git worktree reset --hard (10+ min per registration
  during sibling contention) and concurrent check.js runs (3 at
  once) cost this run most of its wall time; the sim work itself
  was minutes. A future run should avoid starting a full
  check.js while sibling checks are in flight.
- Safe-commit index-clobber check: main tree verified clean
  (git status --short empty) after every merge and at closeout.

## Convergence state

- food-economy: CONVERGING, NOT converged. Exphurt narration
  blank landed; upkeep-breakfast blank closed as artifact; no
  food-economy default flipped, no game-code change from this
  run's own arm.
- scale-onramp: untouched (sibling Loop B). Stays converging
  (NOT converged): full seat still unwon, wave-5 kills still 0.
- Claim deleted; lock deleted at closeout. Evidence:
  evidence/2026-11-04/sim-food-economy-round-2115.md (this file).
