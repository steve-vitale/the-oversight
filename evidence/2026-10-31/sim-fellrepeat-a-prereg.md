# sim-fellrepeat-a — prereg (binding; committed BEFORE any judged leg)

Run: oversight-flesh-out-loop, Loop A run fleshout-20261031T0643Z,
arm sim-fellrepeat-a, axis food-economy, backlog #1590
(REFUSED FELL LINE REPEATS 3x PER MORNING, from Loop B arm
sim-strandfix-combined-b, evidence/2026-10-30/
sim-strandfix-combined-b.md). Worktree sim-fellrepeat-a.
DIAG FIRST, fix only if contained and only under verdict
branch (a) below. Zero policy-default flips, zero edits to
any existing policy file or existing script. New files
only: this prereg, the driver + analyzer + proof scripts
named below, the evidence file, and the corpora/tables
they produce.

## Question

Does BASE game code (no prototype policy) repeat a
refused-fell line within one morning, or was the 3x
repetition purely Loop B's prototype re-attempt loop?
Combined-b's MORN-ON corpus (seed 15215, days 10/12/14)
printed "Your Stone knife can't fell a giant — it takes
branches, not trunks. You need an axe." three times on
each fell morning, stopping only when the prototype's
tick reserve bit. The refusal line itself lives in
src/js/storage.js cutInfo (canFell / hint), spoken by the
cutTree wrapper.

## Prior evidence read in full before designing anything

- evidence/2026-10-30/sim-strandfix-combined-b.md (the
  3x finding, §4; MORN-ON corpus, 15215 days 10/12/14)
- evidence/2026-10-31/sim-lackingline-a.md (strand census
  method: strand = maximal runs of still creek evenings;
  control substrate env gates; re-derive, never inherit)
- evidence/2026-10-30/sim-strandfix-morning-b.md (strand
  mornings: actionable from day 8, the day after the
  first still evening; the tool gate; fell mornings
  10/12/14)

## Canon

docs/CANON.md read. No canon doc covers the fell-refusal
line itself: docs/ABILITY-REFUSALS.md covers ability-action
refusals, not the cutTree tool-gate refusal — stated here
instead of inventing canon. The standing rule that bears
on it is CANON.md's "no silent actions — every action
narrates honestly, including failures," plus the
sense-testing law (a person stops after the first
refusal; a repeated identical refusal reads as nagging,
not judgment).

## Pinned base

Worktree HEAD at prereg writing time (recorded by the
proof script's tracked-diff guard as the base commit).
This prereg commit adds only this file, so all legs run
on pinned-base game/policy code verbatim. The strand set
is RE-DERIVED on this base from the control legs, never
inherited from combined-b / lackingline-a (both ran on
older pins).

## Method (staged)

Control legs ONLY for judged numbers: the kcalshort
substrate verbatim (POLICY=nighttravel,
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0 guard / 1 ON,
DAYS=30, no prototype policy, no STRANDFIX, no PRESSB).
New driver scripts/fellrepeat-trace-a.js adapts
scripts/kcalshort-trace-b.js with ONE read-only change
in kind: every evening row carries fellRefusalCount (the
count of that loop-day's full transcript lines matching
the refusal patterns below) and fellSuccessCount, and
fullDaySay is stored on every row whose loop-day falls
in the strand window or whose fellRefusalCount > 0, so
every counted refusal is checkable verbatim.

Refusal patterns (case-insensitive, counted per line):
- "can't fell" (covers the Stone-knife giant line and
  the "can't fell this" variant)
- "need an axe to fell" (covers the no-tool tier-none
  variant)
A line matching both counts once. Success pattern
("comes down with a crack") is counted separately and
never pooled into refusals.

"Morning" partition, stated honestly: the harness
captures one transcript per loop-day (one daily() call);
no finer morning timestamp exists in the corpus. The
per-loop-day refusal count therefore UPPER-BOUNDS the
per-morning count: a day count of 0 proves a morning
count of 0, and any day count >= 2 triggers a
line-order read (are the lines adjacent, i.e. one
re-attempt burst?) reported in the evidence, never
assumed. "Per villager": the transcript is the bearer's
day; non-bearer villagers have no day transcript in
this driver (same coverage limit as the prior strand
arms) — the table is per loop-day for the bearer, and
the evidence says so rather than claiming a
multi-villager census.

STAGE 1 — PILOT: seed 15215 only, guard + ON control
legs. The pilot must reproduce a strand (else the arm
stops and reports strand loss, not a verdict).
STAGE 2 — CONFIRM: the same two legs are the judged
legs (pilot files ARE the judged 15215 files; no
re-run, no cherry-pick — the pilot runs the exact
judged driver and env, so its numbers are the judged
numbers, stated as such).
STAGE 3 — BAND SPOT-CHECK (conditional): ONLY if the
pilot finds any repetition (any loop-day on either
15215 leg with fellRefusalCount >= 2) OR any refusal
at all on a strand morning, run the 9-seed band
(15003, 15009, 15091, 15211, 15220, 15221, 15337,
15376, 15439) on both control legs and extend the
table. If the pilot finds zero refusals on every
strand morning, the band is NOT run (per the task
brief) and the evidence says so.
DETERMINISM: one leg re-run byte-identical (15215 ON).

## The table (the GO input)

For each control leg (guard, ON), for EVERY strand
morning in the re-derived 15215 window — defined as
every loop-day whose previous evening is a still creek
evening, plus the loop-days 10, 12, 14 explicitly even
if the re-derived window shifts them (they are named
so a shift cannot silently drop the combined-b fell
mornings) — the table carries: loop-day, previous
evening's class, morning wood/tool (where recorded),
fellRefusalCount, fellSuccessCount, and the refusal
lines verbatim (or "none" when the count is 0). Days
10/12/14 are highlighted rows. A morning is "covered"
only if its full transcript was captured and counted;
a morning with no transcript is a NO-GO input, not a
zero.

## GO threshold (binding, judged exactly as written)

GO iff a complete per-morning refusal-count table covers
every strand morning in the 15215 window on control
legs, with narration verbatim. Otherwise NO-GO.

## Verdict branches (decided by the table, not by preference)

(a) If base repeats >= 2x in any morning (any
loop-day fellRefusalCount >= 2 on a control leg):
implement a contained canFell pre-check fix — single
file, suppresses repeat refusals only, never changes
fell success — with a proof test and [needs-eyes] in
the commit message (narration/behavior change). The
fix must be proven on identical seeds before/after
(refusal counts fall to <= 1 per morning; fell-success
counts unchanged; strand evenings unchanged).
(b) If base never repeats (no loop-day count >= 2 on
either control leg): close #1590 as a prototype
artifact with the recorded design rule — pre-check
canFell before ANY re-attempt in future prototypes —
and land no game change.
Either branch is a complete arm; do not force a game
change to justify the arm. Branch (b) also covers the
sub-case "base never refuses at all" (count 0
everywhere): the artifact conclusion is stronger, not
weaker, and the design rule still stands for future
prototypes.

## What is NOT claimed

- No balanced-panel compare (§15): this is a DIAG arm
  with zero game-root change under branch (b), and
  under branch (a) the before/after is the refusal-count
  table itself on identical seeds, not a panel run.
  Stated in the evidence, never labeled a panel run.
- No claim about the UI button path (app.js, excluded
  from node): a human tapping "Cut down" repeatedly is
  a different repetition class and is NOT judged here.
- No claim about non-bearer villagers (no transcript).

## Instruments

- scripts/fellrepeat-trace-a.js (new driver; adapted
  from kcalshort-trace-b.js, read-only counting
  addition only, same policy stack and env gates)
- scripts/analyze-fellrepeat-a.js (new analyzer: strand
  extraction, per-morning table, verbatim lines, band
  extension if triggered, determinism comparison)
- scripts/test-fellrepeat-a.js (new proof: counting
  unit cases incl. the 3x fixture, corpus checks,
  tracked-diff guard vs the pinned base)

## Horizon

Death-aware, DAYS=30, same as all prior strand arms.
Dead villages stop simulating (+10d tail max per the
harness); all bank seeds survived 30 days on prior
arms, so a ceiling is expected and is reported as such,
never as a survival claim.
