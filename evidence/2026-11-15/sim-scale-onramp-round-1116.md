# Scale-onramp round 1116 — stale-lock recovery + adoption (6b3way NOT-CARRIER, 7brain UNMEASURED-conflict, both landed)

Run: fleshout-20261115T1116Z (Loop A), axis scale-onramp (survival
collapse). STALE-LOCK RECOVERY + ADOPTION of the dead 0810Z run.

## Recovery (run start)

- Lock fleshout-20261115T0810Z was 3h06m old at 11:16Z; both
  workers' heartbeats 73–74 min stale (transplant6b3way-a
  10:02:07Z, transplant7brain-a 10:03:31Z); no live processes. The
  dead claim was retired to .DEAD with a note; the lock was replaced
  by this run's. Loop B live on winnability chain throughout
  (claim fleshout-loop-b-20261115T1055Z, arms sim-gorgeprice-b +
  sim-onlylead-b) — NOT touched.
- What the dead run left: the 7brain arm COMPLETE on its branch (4
  commits, evidence UNMEASURED-conflict); the 6b3way arm HALF-DONE
  (prereg + proof committed daf39601d, 146/146; subject commit
  2256f4ad4 cut; baseline leg ep-far-6b3way run 09:55–10:04Z, 4/8
  GOOD, corpus uncommitted in the worktree; subject leg never run).
  Both trees were heartbeated on adoption (read back 11:20:43Z /
  11:20:44Z) and released as done-merged at closeout.
- This run takes the 0707Z next blanks (1) and (2) exactly as the
  dead 0810Z run had claimed them.

## Arm 1 — sim-transplant7brain-a (ADOPTION, UNMEASURED-conflict, landed)

Adopted complete: the brain-side ablation of PR #30 cannot be built
by mechanical reverse onto master tip — 4 of 5 hunks fail, including
the `vbrainAlignObjective` function itself. Verdict
UNMEASURED-conflict; family 7 stays UNMEASURED on the brain side.
Proofs re-verified on the branch (test-transplant7brain.js 57/57,
test-culpritbisect-a.js 116/116), rebased clean onto master tip
9fa74d252, re-run after the rebase: 56/57 — the single failing leg
is the base-state guard ("every commit above the tip is this arm's
own work"), stale by design once the base moves (MASTER_TIP is
hardcoded to the prereg-time base 7251dcb4f; the rebase added 6
intervening master commits above it). Same class as the 0707Z 7b
arm's 125/126 on merged master; adjudicated, not fixed by editing
the proof. Merged ff-only as 0116c16e7 (tip commit; branch commits
eec4356e6, 3c5871f5c, 27b775a51, 0116c16e7). Tree released,
worktree removed, branch deleted. Evidence:
evidence/2026-11-15/sim-transplant7brain.md (+ prereg).

## Arm 2 — sim-transplant6b3way-a (ADOPTION + FINISH, NOT-CARRIER, landed)

COORDINATOR DECISION (deviation, recorded): the coordinator finished
this arm directly in the adopted tree instead of spawning a fresh
worker. The baseline leg, the subject commit, and the step tooling
were already in that tree; a fresh worker would have re-run or
misread the half-done state. The finish was mechanical and fully
pre-registered (the dead worker's prereg binds it): verify baseline
corpus, restore standing.js to native, run the family-test leg and
the subject leg, judge, write evidence.
- Baseline leg ep-far-6b3way (dead worker, verified by this finish):
  survived 4/8, days 86/144/150/43/150/87/150/150, gate PROCEED.
- Subject leg t6b3way-f843fab1c (this finish): survived 4/8, per-seed
  days BIT-IDENTICAL to baseline, vetSays arrays byte-identical
  (225/225), deaths 629/629, standing identical, maxWave identical,
  instrumentErrors 0. Verdict NOT-CARRIER (≥3/8, expected inert
  form). `objRefreshPick ≡ objPick` proven live on the subject
  (test-transplant6b-refresh pick/refresh byte-identical, rngNext
  0.8845642388332635); the merge's own proof exits 2 (expected
  skip) on the subject.
- Subject commit 2256f4ad46d965a1dfe9619558289a90653edd42 left in
  place on branch `transplant-6b-subject` per the prereg (NOT
  deleted with the arm branch).
- Proofs at the final state: test-transplant6b3way.js 173/173,
  test-culpritbisect-a.js 116/116, re-run green after the rebase
  onto master tip 874d97c00. Merged ff-only; branch commits
  771dfaa13 (prereg + proof), 3e5154339 (evidence + corpora),
  2650f9f41, d1ea95249, b236258a1 (evidence corrections). Tree
  released, worktree removed, arm branch deleted. Evidence:
  evidence/2026-11-15/sim-transplant6b3way.md (+ prereg).

## Wall (this run's judged corpora, 16 configs — the 6b3way pair; 7brain has no corpus)

national 0/16, table 0/16, wins 0/16, wave-5 4/16, wave-4 16/16,
median 150d. Telemetry deviation check: REFUSED (recorder-corpus
class) — baseline NOT rolled, no LOUD lines.

## Coordinator decisions

1. 6b --3way follow-up CLOSED: narrowed family 6b is now MEASURED
   NOT-CARRIER. The 0707Z next blank (1) is done; no further 6b
   arm is owed. The full family 6 stays UNMEASURED (the brain-side
   gate-keeping is the unmeasured half, and it lives on master
   today — the demotion only bites where `vbrainShouldRefresh`
   exists).
2. Family 7 brain-side: NOT decided here. The redefined ablation
   (removing the align step from the CURRENT 114-line align
   function, DUTY/ASSIGN branches included) is the only remaining
   measurement route, and it needs a fresh prereg defining the new
   ablation set from the current code — a coordinator call for the
   next run, not this one.
3. The proof §10 intermediate-state crash (uncaught ENOENT when the
   baseline summary exists but the subject summary does not yet) is
   a tooling note for the next arm, not a verdict input. The fix is
   a guard in the proof, not a re-score.

## Infrastructure

- WRITE FLAP: no EPERM failure struck this run's git or file writes
  (11:16Z onward). The dead 0810Z run recorded three flap windows
  in its morning (08:18–08:21Z, 08:52–09:48Z, 09:58–10:01Z); none
  recurred here. Git operations ran slow at times (full-tree restat
  on checkouts, ~60–110s; the 6b3way merge took ~6 min CPU-bound on
  the corpus checkout, no lock held) — the same flap-era slowness
  prior arms recorded.
- SAFE-COMMIT CLOBBER: struck 4× on the 6b3way arm (evidence commit
  cccf2ed24: all 21 files staged-as-deleted; three correction
  commits: the evidence file MM each time) — all repaired with the
  documented `ls-tree -r HEAD | git update-index --add --index-info`
  pipe; every commit verified correct (worktree hash == HEAD blob)
  before continuing. The arm evidence records 3× (its count line
  went stale on the fourth strike, which hit the "final" correction
  commit itself); the 4th strike is recorded HERE, and the
  correction chain was stopped by decision, not by exhaustion.
  The 7brain adoption had no clobber (its commits were the dead
  worker's, already landed on the branch).
- REBASES: both clean, no stop-at-pick quirk this run. The 6b3way
  branch was rebased twice: first onto 0116c16e7 (the tip after the
  7brain merge), then onto 874d97c00 after the batch ship loop
  landed a version bump mid-run (journey-scale r207 closeout +
  bump 79060b74b-20261115-113520) — the second rebase was required
  before the ff-only merge, per the stale-base rule.
- REAPER: the pre-flight reap was deferred past run start
  (adoption investigation + live Loop B trees + the subject step
  running) and run as the final sweep instead: 12/16 active, nothing
  removed; 4 LOUD uncommitted-changes trees (sim-saycap-a,
  sim-siegedialog-a, sim-inffight-ab, journey2-endgame) belong to
  other runs — NOT touched, owners must commit or release.
- check.js --quick NOT re-run (zero src/js on either arm branch;
  loop precedent). The 6b3way subject lives on its own branch, not
  in the live game.
- MEMORY NOTE: the memory system's survival-collapse line was
  updated externally during this run and now records "6b3way
  UNDETERMINED (subject not run)" — STALE as of this landing. The
  verdict is NOT-CARRIER (this evidence). MEMORY.md was not edited
  here (memory system owns it); the correction rides on this run's
  memory-log entry.

scale-onramp stays converging (NOT converged): the objectives halves
of both families are now measured (6b NOT-CARRIER on the --3way
form; 7b NOT-CARRIER on the identity form; 7brain UNMEASURED on the
brain-side conflict), but wins remain 0 on every judged corpus,
national/table remain 0, and the carrier question for family 7 has
moved to a redefined ablation. food-economy stays converging
(untouched; parked). winnability chain stays converging (untouched;
sibling loop B). Next blanks, in order: (1) family 7 redefined
ablation (coordinator call + fresh prereg); (2) family 2b AMBIGUOUS
stays on the suspect list; (3) the four conflicted PR #22 hunks as a
family; (4) headcount-ceiling (Steve-call); (5) Reunion mirror pack
in the wild (Steve design call). Claim deleted; lock deleted.
Evidence: evidence/2026-11-15/sim-scale-onramp-round-1116.md (this
file).
