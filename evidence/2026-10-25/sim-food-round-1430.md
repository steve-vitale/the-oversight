# sim-food-round-1430 — coordinator evidence (loop B, axis food-economy)

Run: fleshout-loop-b-20261025T1430Z (09:30 CDT 2026-10-25). Loop A live on
scale-onramp for the whole run (claim fleshout-20261025T1418Z, arms
belltoad-morale + poolpres) — NOT touched. A landed pool-presence DIAG
(c5f92fc5e, 4f99a66b6) mid-run; both B arms rebased onto it clean, proofs
re-run, then merged. Belltoad-morale still live at closeout.

Axis: food-economy (converging, NOT converged). Topmost axis scale-onramp
was claimed by loop A, so B worked the next one down, taking the 1329Z
next blanks (2) and (3) in order. Blank (1) pooled cause list NOT taken:
causebase-b already landed a pooled kind-filtered baseline and whether it
closes blank (1) needs an audit first — carried as next blank with that note.

Both arms DIAG/tooling only, zero src/js game-code changes, non-overlapping
files, safe together per ARM INDEPENDENCE. No push, no version bump, no live
verification — merged locally, pending ship.

## Pre-registration (written before any worker sims)

- Arm 1 sim-rotragged-b (DIAG): classify every primary-corpus seed
  (leg2decide deciding corpus, seeds 9266–9281) as identical / down / up /
  degenerate under stated thresholds; attribute every moved seed as
  numerator-driven / denominator-driven / both from pd0/pd1 rot on parent
  vs commit; cross-check on the rotdecide-govern fresh corpus (9310–9325).
  DIAG-COMPLETE bar: 16/16 primary classified, every moved seed attributed,
  plus a sense sample read. This arm does NOT re-judge STEP/NO-STEP.
- Arm 2 sim-leg2sort-b (tooling): fix only the three sorted display lines
  in scripts/analyze-leg2decide-b.js (sort numbers, then format). Bar:
  existing test-leg2decide-b.js green + new proof green + before/after
  analyzer diff confined to those three display lines, all verdict numbers
  identical.

## Arm 1 — sim-rotragged-b: DIAG-COMPLETE, LANDED ba2549f92

Worker commit 941a00c94, rebased onto 4f99a66b6 as ba2549f92, proof 19/19
post-rebase and on merged master. Files: scripts/analyze-rotragged-b.js,
scripts/test-rotragged-b.js, evidence/2026-10-25/sim-rotragged-b.md.
Existing corpora only, no new sweeps. Verdicts stand untouched:
leg2decide STEP CONFIRMED 0.404x, rotdecide-govern STEP (CONTESTED) 0.645x.

The behavior answer, in plain words: the preserver-widening step is ragged
because it is three different things wearing one ratio.

- Untouched villages (identical: 9 primary, 5 cross-check). On the primary
  corpus every identical seed is cell-identical — widening changed
  literally nothing. No village trait in these files predicts untouched-ness
  in advance (identical seeds span national true/false, waves 2–4); the
  wildest ratio in the corpus (9280, 14.960x) belongs to an identical seed.
- Down-movers are two opposite stories (9 across both corpora). (a) A
  genuine depri-side improvement, numerator-driven: the depri village rots
  far less while the no-depri village is untouched (9266: pd1 rot 7,303 →
  400, reaches one wave further). (b) A no-depri-side blowup,
  denominator-driven or both: the no-depri village rots far MORE on commit
  — 2.8x, 4.2x, 5.6x, 10.6x — overwhelmingly fresh rot (fresh share up to
  0.87–1.00), and on the two biggest blowups the depri village also throws
  away far more. The ratio falls because the denominator exploded, not
  because the depri village improved. Across all 9 down-moves, pd0 rot rises
  in 6, stays flat in 3, and never falls.
- Up-movers are the mirror (4 across both corpora). The primary's single
  up-move is tiny (9281, 1.064x). All three cross-check up-moves are "both":
  the no-depri village rots far less AND the depri village rots far more —
  the sides swap which one rots (9322 extreme: pd0 134,087 → 16,160 while
  pd1 1,200 → 45,849).

What distinguishes down-movers from identical seeds is not a village trait
but the food-handling change itself: down-movers are exactly the seeds where
the commit changed some cell's rot. Moved seeds flip national and wave in
both directions; death causes (combat/monster dominant) do not separate the
classes.

Classification: primary identical 9, down 5 (all sharp), up 1 (mild),
degenerate 1 (9268, pd1-rot-zero-both); moved seeds 2 numerator-driven, 3
denominator-driven, 1 numerator-up. Cross-check identical 5, down 4, up 3,
degenerate 4; moved seeds 1 numerator, 1 denominator, 5 both.
DIAG-COMPLETE: 16/16 primary classified, 6/6 primary moved attributed,
16/16 cross-check classified, 7/7 cross-check moved attributed, 5 per-seed
stories read (9266 clean win, 9277 hoard-and-rot, 9280 untouched extreme,
9268 silent seed, 9322 swap).

Wall numbers (these corpora only, SEATDRIVE=0 substrate so table 0 is a
substrate fact, not a finding): primary national 59/64, table 0/64, wins
0/64, wave 4 in 37, wave 3 in 21, wave 2 in 6, no wave 5, median daysAlive
100; cross-check national 55/64, table 0/64, wins 0/64, wave 4 in 31, wave 3
in 26, wave 2 in 7, no wave 5, median 100.

Documented DIAG limits (not hidden): why identical seeds are untouched
(no preservation action counts, occupation roster, or per-day trajectories
in the files); whether the pd0 blowup is "more hauling" or "less
preserving" (haul/preserve counts absent — both print the same signature);
9266's remaining 400 kcal of depri rot is all preserved rot (genuine zero
fresh rot or accounting residue, files cannot distinguish). No
dialogue/transcripts in these files, so no people-likeness claim beyond
aggregate signatures (deaths spread across combat, monster, sickness,
starvation, wounds, named causes; villages diverge in rank/wave/lifespan
tracking their food story).

## Arm 2 — sim-leg2sort-b: DISPLAY FIX, LANDED 38ddee42c

Worker commit fb9dc734, rebased twice (onto 4f99a66b6 as 99792ad45, then
onto ba2549f92 as 38ddee42c — the second rebase is this run's own first
merge, not a sibling conflict), proofs 9/9 + 19/19 post-rebase and on merged
master. Files: scripts/analyze-leg2decide-b.js (3 lines), scripts/test-
leg2sort-b.js, evidence/2026-10-25/sim-leg2sort-b.md.

Bug: lines 147–149 built display lines with bare `.sort()` on toFixed(3)
strings, so the listed order was lexicographic ("14.960" before "2.977").
Fix: sort the numbers with `(a, b) => a - b`, then format. Sibling grep:
the toFixed().sort() pattern exists nowhere else in scripts/ (leg2drift
sorts death counts numerically; journey-social sorts numbers before
formatting; other .sort() calls sort filenames/labels where letter order is
intended).

Before/after on the real leg2decide corpus (64 files, seeds 9266–9281):
exactly two lines changed — parent and commit ratio lists now end
"…, 2.977, 14.960" instead of "…, 14.960, 2.977". The steps line is
byte-identical and every verdict number is byte-identical: M(parent)
0.487x, M(commit) 0.196x, MEDIAN STEP RATIO 0.404x, VERDICT STEP CONFIRMED.
DISPLAY ONLY, as pre-registered. Plain-words misreading risk: the misordered
list could make a reader think the spread topped out near 3x with the
14.960 seed sitting mid-list, while the median/quartiles beside it told the
true story. The verdict itself was never wrong.

## Village assessment (plain words)

These villages looked like ordinary mid-game villages on a 100-day clock:
most reached national standing, none reached the table, none won, none got
past wave 4 — the familiar scale wall in miniature. What changed with
preserver widening was not survival or standing in aggregate but food
handling: some villages hoarded fresh food and rotted spectacularly, others
threw away far more under plenty-depri, and a few flipped which side rotted
entirely. The step is real but ragged — a behavior change with winners and
losers by seed, not a uniform improvement. Nothing here reads robotic:
deaths spread across causes and villages diverged in ways that track their
food story.

## Telemetry deviation check (Steve 2026-10-13)

`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-24/leg2decide-b-corpus/*.json' --metrics national,table,wins,exiled`:
3 LOUD lines — national 12 → 59, table 16 → 0, wins 16 → 0; exiled quiet.
All are the known WINSEAT-baseline vs pre-seat-substrate regime artifacts
(100d, SEATDRIVE=0 measurement corpus, same class as prior runs). Baseline
NOT rolled.

## Metric review (for the NEXT run, not a re-score)

- Proposed throughput companion metric: total (rot + deprioritized) kcal per
  village-day, because the ratio alone REWARDS a denominator blowup — a
  village that rots far more without depri scores as an "improvement."
- Future pre-registrations should state ratio-identical vs cell-identical
  (cross-check 9318/9324 differ on that distinction).

## Infrastructure

- Safe-commit index clobber hit both worker commits (bogus staged deletions
  for files byte-identical to HEAD); each worker repaired surgically via
  cacheinfo and re-verified commit correctness + clean status. No EPERM flap
  on .git writes this run; worktree registrations slow (~3 min each) under
  sibling load.
- Repo-wide `check.js --quick` NOT verified by this run, after two attempts:
  the leg2sort worker's run produced no output in ~6 minutes and was stopped;
  the coordinator's run (600s timeout, `--cacheDirectory` flag) was killed at
  600s mid-suite with partial progress output and unidentified F marks — it
  never finished, so its failures cannot be attributed to anything, including
  the standing pre-existing set. Neither attempt is part of the arms'
  pre-registered bars (the direct test scripts + analyzer diff are, all
  green). The partial run left no stray repo changes (status shows only this
  evidence file, untracked).
- Landing order note: leg2sort's second rebase was caused by this run's own
  rotragged merge landing first (ff-only correctly refused the divergent
  second branch); rebased, re-proved, then merged — no force, no conflict.

## Blanks filled / documented

- FILLED (1329Z blank 2): rot-step raggedness as a behavior question —
  answered above (three stories under one ratio; denominator blowup dominates
  the down-moves).
- FILLED (1329Z blank 3): leg2decide string-sort display fix — landed,
  verdicts unchanged.
- NEXT BLANKS, in order: (1) pooled baseline cause list before any "new
  death mode" guardrail reuse — still open; FIRST audit whether causebase-b
  (570 deaths, 6 competent corpora, f810314b8) already satisfies it before
  running any new corpus; (2) rotragged follow-ups — why identical seeds are
  untouched, and the pd0 blowup mechanism (both need haul/preserve action
  counts the current per-seed files do not carry); (3) the rot+deprioritized
  per-village-day companion metric as a pre-registered primary for the next
  rot question.

## Convergence

food-economy stays converging (NOT converged): two measurement blanks
closed with zero game-code change, but no food-economy lever moves the scale
wall and the pooled-cause-list blank is still open. scale-onramp stays
converging (untouched; sibling loop A). Claim deleted; lock deleted.
Evidence: evidence/2026-10-25/sim-food-round-1430.md (coordinator, this
file) + sim-rotragged-b.md + sim-leg2sort-b.md (commits ba2549f92,
38ddee42c).
