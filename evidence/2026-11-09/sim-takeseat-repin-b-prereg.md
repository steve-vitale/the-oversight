# sim-takeseat-repin-b — pre-registration (binding)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261109T1230Z, axis
scale-onramp / winnability chain. Worker tree:
~/workspace/worktrees/sim-takeseat-repin-b, branch
sim-takeseat-repin-b. Base: master `5e79679e4` (verified by
`git log --oneline -1` at run start). Scope: TEST MAINTENANCE only —
ZERO src/js, zero analyzer/lib changes. This arm re-pins the stale
live legs in the takeseat/feareddoor proof suites on seed 53001
(backlog item: TAKESEAT/FEAREDDOOR LIVE-LEG PINS STALE ON SEED
53001, recorded in evidence/2026-11-09/sim-takeseat-pricedseat-b.md).

## Background (as recorded, to be re-derived — not copied)

After the sit-drive rebaseline landings (ff8b9869f / b5d1eb923 /
38389defb / f37924c96), the armed takeseat leg on seed 53001 now
takes the lesser seat (seatTaken 1, 150d, standing 209) and the armed
feareddoor leg enters 1 door, so
`scripts/test-takeseat-b-20261107.js:272` and
`scripts/test-feareddoor-b-20261107.js:446` fail their "no-seat seed
— drive never fires" pins. The drive still discriminates (baseline 0
sits). Those values were re-verified on master 8419eefa4; master is
now 5e79679e4 — the re-pin values in this arm come from a FRESH run
on current master, not from the old record.

## Method

1. Run both suites on current master FIRST, before any edit, and
   record what seed 53001 actually does in both legs (baseline and
   armed) — full `head()` fields (days, gameDays, endReason,
   standing, maxWave, finalSeat, w4kills) plus seatTaken /
   doorsEntered / seatDay / walked paths.
2. Re-pin the assertions to the TRUE current-master behavior, with a
   comment at each pin citing the sit-drive rebaseline and this arm.
3. Re-run both suites to green on the branch tip.

## Suite claims that must survive the re-pin

Takeseat (`scripts/test-takeseat-b-20261107.js`, section D LIVE):
- (a) Drive discrimination — baseline takes 0 seats while armed
  fires (seatTaken 1). If the armed leg now takes a seat while
  baseline does not, that IS the discrimination proof — say so
  plainly in the test message and the evidence.
- (b) Trajectory neutrality where asserted — armed reproduces
  baseline exactly on a leg where the drive does not fire. Seed
  53001 no longer qualifies as a no-seat seed, so the head-equality
  assertion on 53001 must be re-examined: replace it with a
  discrimination assertion, or re-pin to a still-quiet seed WITH
  justification in the evidence file. Do NOT silently delete a
  claim the suite used to prove.
- (c) The "earns no seat" smoke structural check on the baseline leg
  must be re-pinned to whatever the baseline leg actually does on
  current master (if the baseline still earns no seat, it stands;
  if it now takes a seat, the pin changes and the evidence says
  why).

Feareddoor (`scripts/test-feareddoor-b-20261107.js`, section D LIVE):
- (a) Drive discrimination — baseline enters 0 doors while armed
  enters ≥ 1 (the pricedseat record says armed enters 1 on 53001
  and baseline enters 0 — re-derive, do not copy).
- (b) Trajectory neutrality where asserted — same re-examination
  as takeseat: the head-equality assertion on 53001 only survives
  if the drive does not fire in either leg on the re-pinned seed;
  otherwise replace with a discrimination assertion or re-pin to
  a still-quiet seed with justification.
- (c) The "earns no seat" smoke structural check must be re-pinned
  to the baseline leg's actual current-master behavior (the
  pricedseat record says the baseline leg TOO now takes the lesser
  seat on 53001 — re-derive, do not copy).

## Judge (per docs/MEASUREMENT.md §§9–12, 14–15 where it applies)

This is a maintenance arm. The judge is:
- Both suites fully green on the branch tip
  (`scripts/test-takeseat-b-20261107.js` and
  `scripts/test-feareddoor-b-20261107.js`), AND
- Every re-pinned value matches a fresh current-master run
  byte-for-byte on the asserted fields (days, standing, finalSeat,
  seatTaken, doorsEntered, head fields).

No src/js change, so no balanced panel is owed (§15: no
before/after game comparison — the game is unchanged; the pins move
to the game). A miss on any claim above is a NO-GO for the arm, not
a re-score.

## Deliverables

- The two re-pinned test files (only files changed, plus evidence).
- evidence/2026-11-09/sim-takeseat-repin-b.md: old pins, fresh
  current-master values, what changed and why, both suites' green
  counts, any claim the suite no longer proves and why.
- No new proof script is needed beyond the two suites themselves
  going green.

## Metric review (to be filled in the evidence file)

- Whether the re-pinned values match the fresh current-master run
  byte-for-byte on the asserted fields.
- Whether every claim listed above still holds after the re-pin,
  and if any claim was replaced, what replaced it and why.
- Whether the discrimination proof is now stronger, weaker, or
  unchanged relative to the old "no-seat seed" framing.
