# sim-selecttrim-a — prereg (BINDING, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop, run fleshout-20261031T0415Z,
arm sim-selecttrim-a, axis food-economy. Worktree
sim-selecttrim-a. Backlog item #1588 (SELECTIVE TRIM MUST
KEEP THE WITHIN-TILE WALK), from sim-strandfix-ticks-b
(evidence/2026-10-30/sim-strandfix-ticks-b.md) and
sim-strandfix-combined-b
(evidence/2026-10-30/sim-strandfix-combined-b.md), both read
before this prereg. DIAG/MECHANISM ONLY: a policy-side
prototype, NON-default, gated flag only — zero src/js
changes, zero policy-default flips. Sibling worktrees never
touched; the main tree never touched; nothing is merged by
this worker (the coordinator merges).

## The question (from ticks-b, stated exactly)

The whole-day creek-wake hold refuted itself: it froze
position at the foodless west corner, so the morning press
never fired (0 attempts vs control 1 guard / 4 ON), the
guard day-11 rescue was lost, and strands lengthened.
The motivated next design is a trim that skips expensive
routine beats while KEEPING the within-tile walk from the
west corner to the east muscadine patch — the walk that
makes the next morning's press fire.

## Implementation question (answered first, before the verdict)

Can such a trim exist as a wrapper over competent.daily
(which runs monolithically — nighttravel.daily calls
competent.daily whole, then nightStep), or does it need a
minimal gated variant inside the policy? Definitions used
for this verdict, fixed here:

- WRAPPER: no edit to competent.js at all. The trim layer
  wraps nighttravel/competent from outside and either calls
  inner.daily whole or not at all (the ticks-b hold shape),
  or assembles a trimmed day from competent.js's own
  EXPORTED beats (module.exports lists forageTripSeedFirst,
  sortHaul, walkTo, goHomeStanding, competentEat, etc.).
  Assembling exported beats is still wrapper-side: no line
  of competent.js changes.
- GATED VARIANT: an env-gated branch inside
  competent.daily itself that, on trim days only, selects a
  subset of the existing beats and skips the rest, without
  changing any beat's logic. Default OFF; the un-gated flow
  is byte-identical.
- NO TRIM POINT: neither form can isolate the walk — e.g.
  the walk is produced by an engine verb inside an expensive
  beat and cannot be invoked separately, or the walk beat
  itself costs more than the hole it must clear. In that
  case the verdict is DIAG-NO-GO on this clause, reported
  with the exact code location, instead of hacking the
  policy (no Game-method interception, no steering walk
  re-implemented outside the routine, no pre-walk to a
  known patch — a walk the routine did not itself take
  would violate the perception law: the villager must
  arrive at the patch by its own day, not by being placed
  there).

## Substrate (shared strand substrate, from prior strand arms)

POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1, DAYS=30,
seed 15215 only (guard + ON legs). PRESSB=1 on both the
control legs and the trim legs (the press is the thing
being preserved, so it must be armed on both sides; the
control legs reproduce ticks-b's control-variant legs on
this base). This is a single-seed mechanism pilot: the
8-seed pilot rule does NOT apply here (said explicitly,
per the task brief) — the mechanism question is about one
trajectory's walk, and the verdict is about that walk, not
a bank rate.

## Legs

- control-guard, control-on: pressb stack, trim OFF.
  Expected reproduction of ticks-b control-variant 15215:
  guard press attempts 1 (d10), ON press attempts 4
  (d10, d14, d18, d22); guard ticks-short evenings d7
  (shortfall 49) + d10 (shortfall 3); ON ticks-short d7
  (49), d13 (1), d18 (3), d22 (3). Drift, if any, is
  reported, not hidden; judged comparisons use THIS arm's
  own control legs.
- trim-guard, trim-on: same stack + trim ON (SELECTTRIM=1).
- Identification run (NOT a judged leg): a spy driver on
  the control stack, seed 15215, recording position +
  dayTicks around every engine movement/forage verb with
  the calling competent beat, to identify which beat
  produces the west->east walk and what the routine beats
  cost on strand days. The trim design follows the spy,
  not a guess.

## PRE-REGISTERED verdict (judged exactly this, no re-scoring)

DIAG-GO iff ALL of:
(a) a trim mechanism exists (wrapper form or gated-variant
    form, per the definitions above) that preserves the
    within-tile walk on BOTH legs — i.e. the trim leg's
    morning wake cell on the day after each trimmed strand
    day matches the control leg's wake cell on that morning
    (the east muscadine-patch cell), on both guard and ON;
(b) following-morning press attempts are preserved —
    strictly more than the hold arm's 0 on each leg where
    control had attempts (guard: >= 1; ON: >= 1 — the bar
    is "more than 0", not "equal to control", because this
    is a mechanism arm proving the press is no longer
    structurally suppressed);
(c) ticks saved are reported per leg against the known
    holes (day-7 49-tick routine hole; guard day-10 press
    shape: waits 384 + press 17 + routine 18 = 419, 3
    short of 96) — the report must state, per leg, the
    trimmed routine total on the strand days and the
    resulting evening ticksLeft, not just "saved".

Conversion of strand evenings is NOT required for
DIAG-GO — this is a mechanism arm, not a fix arm.
Conversion / prevention / gate-shift numbers (including
whether the guard day-11 rescue survives — ticks-b's
metric-review gate-shift bar) are reported honestly but
do NOT flip the verdict either way.

DIAG-NO-GO iff the walk is lost like the hold arm
(trim wake cells stay at the west corner), OR no trim
point exists under the definitions above (reported
precisely, with the code location, instead of hacking
the policy).

Day 7 is reported separately, NOT part of the bar: the
prereg expectation (from ticks-b) is NOT MOVED — day 7
wakes at haven, so no creek-wake trim gate fires on it,
and its 49-tick hole stands. If the trim gate as built
fires on day 7, that is a gate bug, reported as one.

## Sense-testing law

Read the trim days' transcripts end to end. A trim that
makes the villager's day read as nonsense fails even if
ticks are saved: the trimmed day must still read as a
person who walked, foraged, and ended the day where the
walk took them — not as an absence, and not as a
teleport to food.
