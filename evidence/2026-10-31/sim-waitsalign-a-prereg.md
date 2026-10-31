# sim-waitsalign-a — prereg (BINDING, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop, run fleshout-20261031T0537Z,
arm sim-waitsalign-a, axis food-economy. Worktree
sim-waitsalign-a. Backlog #1599 (MORNING ALIGNMENT FLIP,
from sim-selecttrim-a evidence/2026-10-31/
sim-selecttrim-a.md §5 + out-of-scope findings).
DIAG/MECHANISM ONLY: zero src/js changes, zero
policy-default flips, zero edits to any existing policy
file or existing script. New files only: one diag
policy (default OFF, env-gated), one trace driver (adapted
from the selecttrim driver, same substrate stack), one
corpus scan analyzer (pure read of existing corpora), one
sleep-threshold unit probe (state set up through the
harness + tickAction only — no direct clock writes in
judged legs), one proof script. Sibling worktrees never
touched; the main tree never touched; nothing is merged
by this worker (the coordinator merges).

## Canon read first

docs/CANON.md + docs/TIME-ECONOMY.md (ticks, day-parts,
512-tick day, wait-to-boundary, sleep). No canon doc
covers the sleep-refusal guard or the harness morning
waits as a named mechanism — the mechanism below is
named from code + measurement, not from canon, and the
evidence file says so.

## The question (from selecttrim-a, stated exactly)

On seed 15215 ON, saving 3 ticks on d9 (control evening
dayTicks 451 -> trim 448) coincides with d10's morning
flipping 256 -> 384, making d10 newly ticks-short
(decision ticks 221 -> 94). The sleep/upkeep threshold
behind the flip was NOT isolated in selecttrim-a. This
arm isolates it: what decides a 256 vs 384 morning, and
which d9 events move it?

## Candidate mechanism (to be proven, not assumed)

Harness morning = 3 x doAction('wait') after sleep
(scripts/sim-harness.js day loop: 3 upkeep+wait rounds,
then policy.daily, then Game.sleep()). Each wait ticks
to the next 128-part boundary (game.js doAction 'wait':
wticks = 128 - dayTicks%128, or 128 on a boundary).
- If sleep() ROLLED the day (dayTicks reset to 0 by
  endDay inside the sleep loop), the 3 waits land on
  128, 256, 384 -> morning 384.
- If sleep() REFUSED ("too late for real sleep", game.js
  sleep(): 512 - dayTicks < 64, i.e. evening dayTicks
  >= 449), the day does NOT roll in sleep; the first
  wait is the rollover stub (512 - evening dayTicks
  ticks, e.g. 61 from 451) which rolls the day to 0, and
  only 2 full waits follow -> morning 256.
- Boundary prediction: evening dayTicks <= 448 -> sleep
  accepted -> morning 384; evening >= 449 -> sleep
  refused -> morning 256. A 3-tick save moves 451 -> 448
  exactly across the line; a 1- or 2-tick save does not.
  This is a THRESHOLD on the evening clock, not a phase
  of the waits and not a draw-count effect (the guard is
  a pure clock comparison, no RNG). Exceptions are
  possible where sleep is INTERRUPTED mid-loop (fight /
  encounter / contest grab / tent wreck -> woke, no day
  roll) or the bearer dies overnight (succession wake);
  every exception must carry a recorded cause or the arm
  fails open, not GO.

## Substrate (shared strand substrate, from selecttrim-a)

POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1, WOODWARM=1
(ON legs), PRESSB=1, DAYS=15 for fresh probe legs (the
flip window is d9-d15; a 30-day leg adds nothing to the
mechanism question). Seed 15215 primary; second-seed
scan over the 10-seed strand band (15003, 15009, 15091,
15211, 15220, 15221, 15337, 15376, 15439) at DAYS=15.

## Legs / probes (in order; pilot gate before confirm)

PILOT (must pass before any confirm spend):
- P0 code read: sleep() guards, tickAction endDay reset,
  doAction 'wait' boundary math, harness 3-wait loop —
  exact code locations recorded.
- P1 corpus scan: every evening->morning transition in
  the four selecttrim-a corpora (4 legs x 30 days, 120
  transitions, pure read). Predict 384 iff evening
  dayTicks <= 448, 256 iff >= 449. Report every
  exception with its cause (woke / combat / succession /
  game-over) or as UNEXPLAINED.
- P2 honest-trajectory probe trio, 15215 ON, DAYS=15:
  control (save 0, eve 451 -> morning 256 predicted),
  ask-skip (new diag wrapper: trim day assembled from
  exported beats as forage+sortHaul+eat+talkRound, i.e.
  skips ONLY askAbout beasttricks, save 2, eve 449 ->
  morning 256 predicted), trim (selecttrim-diag, save 3,
  eve 448 -> morning 384 predicted). The ask-skip policy
  is default OFF and env-gated; it changes no existing
  file and no default.
- P3 unit threshold probe: fresh harness instances, one
  per evening-clock value, advancing the clock with
  tickAction only, then Game.sleep() + 3 x doAction
  ('wait') exactly as the harness does. Values: 400,
  440, 444, 447, 448, 449, 450, 451, 455, 460, 480, 500.
  Predict: <= 448 -> day rolled in sleep, morning 384;
  >= 449 -> sleep refused, morning 256. Any interrupted
  sleep is reported as an exception with its cause.

CONFIRM (only if the pilot passes: P1 zero UNEXPLAINED
exceptions, P2 trio matches predictions exactly, P3
boundary exact at 448/449):
- C1 second seed/leg: ON control legs (DAYS=15) over
  the strand band; any seed with a strand evening in
  449..460 gets trim + ask-skip legs, and the flip
  prediction is judged on that seed. If no band seed
  yields a threshold-straddling strand evening, the
  confirm is instead: (i) the 15215 guard leg pair
  (control/trim, re-run by this arm's driver, DAYS=15)
  judged on the same threshold rule across all its
  transitions, AND (ii) the P3 unit probe re-run under a
  second seed. Either confirm shape satisfies the
  "second seed/leg" bar; the evidence file states which
  shape was used and why.
- C2 determinism: one probe leg re-run byte-identical
  on game fields (evenings/mornings), as selecttrim-a
  did.

## PRE-REGISTERED verdict (judged exactly this, no re-scoring)

DIAG-GO iff ALL of:
(a) a named waits mechanism with exact code locations
    (sleep guard + wait boundary + endDay reset + the 3
    harness waits) that explains 256 vs 384;
(b) the 15215 ON probe trio flips/preserves EXACTLY as
    predicted: control morning 256 (no flip), ask-skip
    morning 256 (no flip), trim morning 384 (flip);
(c) the unit probe boundary is exact: 448 -> 384 and
    449 -> 256 (neighbors consistent, no unexplained
    exception);
(d) reproduction on at least one second seed/leg per C1
    (same threshold rule, zero unexplained exceptions).
DIAG-NO-GO iff any of (a)-(d) fails, OR any transition
or probe value is UNEXPLAINED (interrupted sleep without
a recorded cause, a morning that is neither 256 nor 384
without a cause, or a boundary value that disobeys the
threshold). A miss is NO-GO, never re-scored against a
friendlier metric mid-run.

## Sense-testing law

Read the probe days' transcripts. The mechanism must
read as people: a villager who ends the day with under
an hour left is told it is too late for real sleep, so
the next morning starts one part later in the day's
accounting. If the sleep-refusal line does not appear
on refused evenings, that absence is reported, not
assumed.

## Metric review

Written in the evidence file. Known risks carried in,
not discovered mid-run: (1) RNG-stream shift from
skipped beats can move forage yields and night outcomes
— the verdict judges CLOCK values (evening dayTicks,
morning dayTicks), which are beat-cost sums, not yields;
yield/death divergences are reported as cascade, as in
selecttrim-a. (2) The ask-skip wrapper assembles beats
in trim order (forage first); if its d9 forage pays
differently from control's, the saved-ticks ladder
(0/2/3) is re-based on the measured routine totals and
the verdict judges the MEASURED evening values against
the threshold, with the ladder deviation disclosed.
(3) "Waits" in this arm means the harness's 3 morning
doAction('wait') calls, not an engine waits counter —
the selecttrim-a evidence already uses "waits" this way
("384 mornings", "256 mornings"); the evidence file
defines the term on first use so the coordinator is not
left hunting for a counter that does not exist.
