# sim-scale-onramp-round-1016 — coordinator evidence (loop A, adoption run)

Run: fleshout-loop-20261027T101615Z, axis scale-onramp (topmost non-converged
axis, not named in any live claim at run start except the dead run's own).
Sibling loop B live on food-economy throughout (0945Z claim, arms
sim-raidcallers-b + sim-raidday100-b) — NOT touched.

## STALE-LOCK RECOVERY (run start)

- Lock fleshout-loop-a-20261027T0840Z found at run start: created
  2026-10-27T08:40:40Z, ~95 minutes old (>90-minute fallback).
- Its tree sim-arrivalsurge-a: heartbeat 2026-10-27T09:35:43Z, ~40 minutes
  stale (>15-minute guard) → the previous run was DEAD by the guard's own
  rule, no matter how fresh the lock looked.
- Deleted the lock, created own lock fleshout-loop-20261027T101615Z,
  retired the dead claim to .DEAD.
- Dead tree NOT touched, NOT released, NOT removed (0615Z precedent). Its
  untracked files stay in its tree; only its two committed arm commits
  were adopted.
- Pre-flight: main tree clean (git status 0), disk 28%. Reap at run start:
  active 10/16, nothing removed.

## WHAT THE DEAD RUN LEFT, AND WHAT THIS RUN DID

The dead 0840Z run worked the 0755Z run's next blanks (1) melt
classification and (2) arrival-surge archaeology, both DIAG/measurement
only, zero src/js planned. At death it had committed both arms' work but
merged only one:

- Arm sim-w4melt-a: ALREADY ON MASTER before this run (prereg 39288a76c,
  evidence 3e2f8beef, DIAG-GO). This run verified its verdict line and
  did not re-judge it.
- Arm sim-arrivalsurge-a: committed on branch sim-arrivalsurge-a (prereg
  4961c6d00, evidence 7e1467c70, DIAG-GO) but NEVER MERGED. This run
  adopted it: fresh registered worktree sim-arrivalsurge-adopt-a,
  branch reset to the dead branch's tip, rebased clean onto master
  6ae5049d8 (no conflicts; diff vs master exactly the 3 arm files),
  proof re-run green post-rebase (17/17), merged --ff-only as
  6207c3ff3 + 91083687f, proof re-run green on merged master (17/17),
  tree released as merged, worktree removed, branch deleted.
- No worker subagent was spawned: the arm was already committed and the
  remaining work was rebase + proof + merge, which is the coordinator's
  own landing role. No verdict was re-scored; adoption judges the arm
  as its prereg judged it.

## THE ANSWER, IN PLAIN WORDS (adopted verdict, not re-derived here)

Why wave-4 arrivals tripled (11 → 31) while every band headline stayed
identical: nothing about how wave-4 monsters are born changed. The game
still opens wave 4 the same way, still rolls the same dice when you walk
onto a tile, and still births a wave-4 monster about as often per day the
door is open. What changed is how LONG the door stays open, and how early
it opens. Between October 25 and October 27 the villages started eating
better — the bot player learned to staff its cooks and fishers even when
its first choice refused — so villages lived longer, feasted more, and hit
standing 100 sooner. A door open 27 days births about three times what a
door open 7 days births, at the same rate. That is the whole surge: same
dice, more rolls. Full candidate dispositions (12 groups A–L, every
plausible commit disposed individually) live in the arm evidence:
evidence/2026-10-27/sim-arrivalsurge-a.md. Its proof script
scripts/test-arrivalsurge-a.js re-checks the load-bearing negatives
mechanically (empty spawn/standing diff, empty symbol searches, window
size 213, fallback commits in-window).

Unsettled, named in the arm evidence and NOT hidden: the attribution
share. Staffing fallbacks are the primary identified mover and social
visibility a secondary one, but the exact split of 11 → 31 cannot be
derived from code/history alone. The confirming measurement is named
there (a fallback-only band rerun, with a fixed promotion rule) and is
the next arm for this question — it was not run here, per the arm's own
assignment.

## WALL NUMBERS (no new sweep this run — read, don't re-judge)

This adoption ran no sims: the deliverable is code archaeology, and its
proof is git-history queries. The band the archaeology explains is the
w4funnel-repin band (seeds 73671–73678, tableseat-nowait, 180d
death-aware), as re-pinned in the 0755Z run and unchanged by this run:

- national-ever 7/8, national-final 5/8, table invited 5/8, entered 4/8,
  wins 4/8 (lesser seat only), wave-4 5/8, wave-5 0/8, median 130d,
  deaths 284, starvation 2, wave-4 kills 2.
- The scale wall stands on this band: wave 5 still 0/8, full seat
  unreached, wins still only through default-OFF courtship + seat
  instruments. The surge answer does not move the wall; it explains one
  of its measurements (the funnel's middle, not its end).

## TELEMETRY DEVIATION CHECK

Not re-run, with reason: this arm produced no per-seed sweep corpus
(archaeology only; its proof reads git history). The band corpus it
explains (w4funnel-repin-a) was already run through the deviation check
in the 0755Z run: 2 LOUD lines (national 12→0, wins 16→0), both the known
ingestion artifacts (WINSEAT-regime baseline vs pre-seat substrate;
file-count/top-level paths vs band-level nationalEver/won). Baseline
NOT rolled then, and NOT rolled now. Re-running the same corpus would
duplicate, not add, evidence.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

Judged exactly against the dead arm's prereg DIAG-GO rule, leg (b):
a named "NO SINGLE COMMIT" verdict with every plausible candidate
disposed individually. Delivered in the arm evidence: 12 candidate
groups, each with commit hashes, files, and reasons. No metric was
re-scored in adoption: the tempting re-score — promoting the staffing
fallbacks from CONTRIBUTES to EXPLAINS on the strength of their
direction — was not taken by the arm, and is not taken here, because
code/history cannot prove the count. The promotion rule for the future
fallback-only arm is fixed in the arm evidence. No game code changed in
this run; no [needs-eyes] flag applies (code archaeology, not a
feel/combat/UI change).

## BACKLOG MARKS MADE BY THIS LANDING

- "WAVE-4 ARRIVAL SURGE CAUSE UNKNOWN" (2026-10-27, scale-onramp /
  measurement, from sim-w4funnel-repin-a) → fixed by this landing:
  answered by sim-arrivalsurge-a (DIAG-GO, no-single-commit verdict),
  adopted and merged as 91083687f.
- "MELT IS NOW A REAL FUNNEL EXIT" (2026-10-27, scale-onramp / combat,
  from sim-w4funnel-repin-a) → measured by the dead run's sim-w4melt-a
  (DIAG-GO, already on master as 3e2f8beef): melts fight-classified,
  clustering tested; the open remainder is the unsettled TB starts
  cluster carried below, not the melt question itself.

## INFRASTRUCTURE NOTES

- Worktree registration slow (~7 min, sibling I/O contention), same as
  the 0755Z run's ~8 min; not a failure.
- No EPERM flap blocked this run's writes; no /tmp fallback needed.
- Safe-commit index clobber: NOT hit on the adoption branch commits
  (rebase, not safe-commit) — checked: post-merge git status empty.
  Coordinator evidence commit below to be verified the same way.
- Master moved 0 times under this run after the rebase (tip stayed
  6ae5049d8 until the merge); sibling B trees were never touched.
- check.js --quick NOT re-run: zero src/js in this run, zero green-list
  files; arm proofs (17/17 pre-merge, post-rebase, and on merged master)
  are the attributable verification. Standing profile from prior runs
  (280 passed / 7 failed, pre-existing parity gear assertion) is
  unchanged by this content.

## CONVERGENCE STATE

scale-onramp stays converging (NOT converged): the arrival-surge
question is now answered and the melt door classified, but wave 5 is
still 0/8, the full seat is still unreached, and wins still come only
through default-OFF instruments and the lesser seat. food-economy stays
converging (untouched; sibling loop B). Rotation left at 3
(convergence work does not cycle it).

Next blanks, in order:
1. The arrivalsurge confirming measurement: fallback-only band rerun
   (seeds 73671–73678, tableseat-nowait, 180d) under the arm evidence's
   fixed promotion rule — promote fallbacks to EXPLAINS only if it
   reproduces most of the arrival gain AND earlier standing-100 days.
2. Haven pile-up intended-behavior question (0615Z/0755Z carry): steve-call
   if it touches the restore rule or narration; NOT worked here.
3. Unsettled TB starts cluster on the w4melt band (73675: 61 startCombat
   rows, 28 tbEnd rows) — a trace arm, not a re-judgment of w4melt-a.
4. Whether waiting matters on bands where the seat stays unready longer
   (long-standing carry).

Merged locally, pending ship. No push, no version bump, no live
verification — the batch ship job owns deploys.
