# sim-culpritbisect-a — inside-the-merge bisect (fleshout-20261113T1615Z)

Run: fleshout-20261113T1615Z (Loop A), arm sim-culpritbisect-a
Axis: scale-onramp (survival collapse; the masterregress arm
localized the drop inside merge e4dbe581b)
Branch: sim-culpritbisect-a — worktree ~/workspace/worktrees/sim-culpritbisect-a
Date: 2026-11-13
Coordinator: adoption (worker dead at run timeout; s02 resumed +
re-run + this evidence file's adoption sections are the adoption
coordinator's).

## Verdict: BISECT NARROWED, NOT CLOSED

The collapse is inside (203a32775, aa5d9ef92] — 39 revisions of
the 157-commit merge range (good 203a32775 → bad e4dbe581b; the
"205 local commits" in the run brief is the H2 line to the
healthy pole and is NOT bisected by this arm — see the prereg's
range correction). s01 (305ae6279) is BAD 1/8 even WITH the
roster-check standing fix swapped in, so the collapse is NOT
(only) in standing.js. s02 (aa5d9ef92, the midpoint) is
AMBIGUOUS 2/8 on the first pass AND on the prereg-required
re-run (byte-identical — the harness is deterministic), so it is
recorded AMBIGUOUS and the bisect proceeds treating it as BAD.
The full bisect (~4–5 more steps at ~40 min each) does not fit
this adoption turn; the state below is complete and resumable
for the next bisect round.

SHAPE WARNING (from the prereg, pre-registered): the origin
endpoints are BOTH collapsed (merge-base d229b58f5 1/8, origin
tip a628aeaf3 2/8), so this bisect may converge to the
merge-base edge with no good→bad transition inside the origin
line — DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE. s01 BAD + s02
AMBIGUOUS are consistent with that shape so far; the next
rounds will tell whether a single culprit commit exists or the
origin line was already collapsed at divergence.

## Endpoints (verified, same driver, fix swapped in)

| endpoint | base | survived | median | rank | errors |
|----------|------|----------|--------|------|--------|
| ep-far | 203a32775 | 4/8 | 150d | REGIONAL_INTACT | 0 |
| ep-merge | e4dbe581b | 1/8 | 126d | REGIONAL_INTACT | 0 |

Per-seed days — far: 86/144/150/43/150/87/150/150; merge:
103/150/115/140/76/126/115/136. The endpoints reproduce the
masterregress legs exactly (far = masterregress far, merge =
masterregress merge), so the bisect's yardstick is sound.

## s01 — 305ae6279 'Refresh person-trust baseline for DUTY dawn pick': BAD

Survived 1/8, median 109d, rank RANK_STALL (regional 0/8),
errors 0. Per-seed days 117/100/107/119/81/109/150/76 — sole
survivor 190397. The culprit is at or before 305ae6279: window
narrows from (203a32775, e4dbe581b] to (203a32775, 305ae6279],
78 revisions left. The standing fix was swapped in and the step
is STILL bad — the collapse does not live (only) in standing.js.

## s02 — aa5d9ef92 'Merge PR #24 heard-raid-danger-3a06': AMBIGUOUS (first pass)

Survived 2/8, median 112d, rank RANK_STALL (regional 0/8),
errors 0. Per-seed days 71/150/112/54/97/150/112/97 —
survivors 190392 (150d) and 190396 (150d). Wall: wins 0,
national 0, table 0, wave-5 2/8, wave-4 8/8, deaths 688
(villager combat 233, expedition 162, combat 168, the wild 91,
monster 19; the rest single digits). The worker died mid-step
(run timeout); the adoption coordinator resumed the remaining
seeds 190396–190398 with the same driver (refuses overwrites),
completing the corpus, and analyzed it with
scripts/culpritbisect-analyze-20261113.js (exit 0).

Geometry: aa5d9ef92 splits the s01 window ~evenly (39 revisions
each side: 203a32775..aa5d9ef92 = 39, aa5d9ef92..305ae6279 = 39).
Per the prereg rule, AMBIGUOUS re-runs once; the re-run decides.

## s02 re-run — AMBIGUOUS again (2/8), recorded AMBIGUOUS, bisect treats as BAD

Re-run (STEP=s02r-aa5d9ef92, same 8 seeds, same commit, fix
swapped in; run by the adoption coordinator after the strikefall
gate freed the box): survived 2/8, median 112d, rank RANK_STALL,
errors 0 — per-seed days BYTE-IDENTICAL to the first pass
(71/150/112/54/97/150/112/97), deaths 688, same death-cause
shares. The harness is deterministic, so the re-run confirms the
2/8 is structural, not noise. Per the prereg rule the re-run was
supposed to decide; it reproduced AMBIGUOUS exactly, so s02 is
recorded AMBIGUOUS and the bisect proceeds treating it as BAD.

**Narrowed window: (203a32775, aa5d9ef92], 39 revisions.**
The next pick is the bisect midpoint of that range (compute with
`git bisect start` — good 203a32775, bad aa5d9ef92 — at the start
of the next round; the midpoint was NOT computed in this
adoption to avoid mutating bisect state in the shared repo).
s01 (305ae6279) BAD + s02 treated-BAD together rule out the
( aa5d9ef92, 305ae6279] half. The collapse is NOT (only) in
standing.js: s01 stayed BAD with the roster-check fix swapped
in.

## Wall numbers (this run's steps)

| step | survived | median | regional | wave-5 | wins | national | table |
|------|----------|--------|----------|--------|------|----------|-------|
| ep-far | 4/8 | 150d | 8/8 | — | 0 | 0 | 0 |
| ep-merge | 1/8 | 126d | 8/8 | — | 0 | 0 | 0 |
| s01 | 1/8 | 109d | 0/8 | — | 0 | 0 | 0 |
| s02 | 2/8 | 112d | 0/8 | 2/8 | 0 | 0 | 0 |
| s02r | 2/8 | 112d | 0/8 | 2/8 | 0 | 0 | 0 |

## Files

- evidence/2026-11-13/sim-culpritbisect-a-prereg.md — prereg,
  written + committed BEFORE any judged sim (312e74713). It
  carries the range correction (157 commits, not 205), the
  substrate verification, the method (manual git bisect), the
  bisect rule, and the pre-registered verdicts incl. the
  DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE shape warning.
- scripts/culpritbisect-driver-20261113.js — bisect driver
  (LEG=bisect, STEP=sNN-<sha9>, fix swapped in every step).
- scripts/culpritbisect-analyze-20261113.js — analyzer (bisect
  rule, rank rule, boundary judge).
- scripts/culpritbisect-step.sh — step runner (checkout / swap
  / run / analyze / restore).
- scripts/test-culpritbisect-a.js — proof test (109/109;
  see §Proof).
- evidence/2026-11-13/culpritbisect-a-steps.log — step ledger
  (endpoints + picks + verdicts).
- evidence/2026-11-13/culpritbisect-a-{ep-far,ep-merge,s01,s02,s02r}-summary.json
  — analyzer summaries.
- evidence/2026-11-13/culpritbisect-a-{ep-far,ep-merge,s01,s02,s02r}-driver.log
  — driver logs.
- evidence/2026-11-13/perseed-culpritbisect-a-{ep-far,ep-merge,s01,s02,s02r}/
  — per-seed JSONs (8 each).
- scripts/masterregress-analyze-20261113.js +
  scripts/vetfirst-instrument-20261111.js — used by the driver/
  analyzer as untracked scratch at old checkouts; byte-identical
  to the master files, NOT committed by this arm (already on
  master), deleted from the tree at closeout.

### Adoption addendum — prereg recovery correction (2026-11-13, coordinator)

At adoption start the working tree sat on a detached bisect
checkout (aa5d9ef92), so no prereg file was visible on disk
and the coordinator wrote a RECONSTRUCTED prereg from the
driver/analyzer/steps log. That reconstruction was WRONG in
one place (it repeated the run brief's "205 local commits /
H2" framing) and unnecessary in the first place: the real
prereg exists on the branch (committed 312e74713, before any
sim). Once the branch was checked back out, the
reconstruction was DELETED and the real prereg stands. The
evidence file's verdict section above was corrected to the
real 157-commit range at the same time. Lesson, recorded for
the next adoption: a detached-HEAD bisect tree hides the
branch's files — check the branch before concluding a file
doesn't exist.

## Proof

`node scripts/test-culpritbisect-a.js` — **109 passed, 0 failed**
(committed 312e74713; re-run by the adoption coordinator on the
branch tip e3700f9ca: 109/109, exit 0; re-run again after the
rebase onto current master before merge). The proof covers the
driver guards, the analyzer's bisect/rank/boundary rules, the
step runner's swap/restore mechanics, and a smoke leg on the
branch (native fix standing, standingSwapped=false).

## Metric review

No metric proved wrong. The AMBIGUOUS band (==2/8) did its job:
s02 sits exactly on it, and the re-run rule — not a re-score —
decides it. One process note: the worker's run plan ("~5 steps"
after s02) never fit a 2h run at ~40 min/step; bisect rounds
should be scoped as multi-run campaigns with the state (steps
log + summaries) as the handoff, which is what this evidence
file is.
