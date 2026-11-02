# sim-rosterreturn-a — pre-registration (DIAGNOSIS ONLY)

Arm: sim-rosterreturn-a, Loop A run fleshout-loop-a-20261102T1424Z,
axis scale-onramp. Follow-up to sim-bearerorder-a's instrument
observation (evidence/2026-11-02/sim-bearerorder-a.md, "Instrument
observations"): on seed 97330, Nora Wilson falls d106, is absent from
daily roster snapshots d106–d111, returns to the roster d112 appended
last (before Ivy's death that day), then wins the mantle by sort-time
trust (91 vs Omar 90) and falls again d122.

DIAGNOSIS ONLY — zero src/js changes, zero policy-decision changes.
The bearerorder closecommit policy stack is reused verbatim
(titanroute + musterclose + mustergap commit-own over the
lead-fullseat stack), so the 97330 chain reproduces under identical
play. Instrument/driver scripts are driver-side reads + wrappers only.

## Primary question

By what mechanism does a dead villager return to roster candidacy?
Trace every roster-append path in code (joiners, revival, roster
rebuild, npcIds roster source in src/js/betrayal.js, ledger.js
playerDeath, villager-agency.js, hierarchy.js, titans.js) and isolate
the one that fires for Nora on 97330.

## Seeds

- 97330 MANDATORY (the observed return: fall d106, return d112).
- 97338 as second seed (bearerorder's other seed): its daily roster
  snapshots are checked for any dead-villager return. A return on
  97338 is supporting generality, NOT required for GO — the claim
  ("the mechanism that fires for Nora") is bounded by 97330 alone,
  because the question names one event on one seed; 97338 can only
  add a second traced event or a null (no return there).
- Both seeds run under the bearerorder driver pattern
  (scripts/rosterreturn-driver-20261102.js, adapted from
  scripts/bearerorder-driver-20261102.js): daily roster snapshots
  plus death/return event capture. One process per seed.

## Horizon

180 days (same as bearerorder), or until village-lost + tail,
whichever first. The return (d112) and the second fall (d122) both
fall well inside; 180d bounds the search without a fixed-200d run.

## Pre-registered verdict classes (judge against these, never re-scored)

- DIAG-GO: the return mechanism is named from code (function + file
  + trigger condition) AND at least one return event is traced to
  that path with a named cause (a log line, a code hook, or a
  before/after roster snapshot pair tied to the trigger).
- DIAG-NO-GO: a return is reproduced but its cause stays unisolated
  after tracing all roster-append paths.
- DIAG-NO-BAND: no return reproduces on 97330 under the bearerorder
  driver (identical policy stack, 180d horizon).

## Secondary questions (answered plainly in the evidence file)

1. Does this affect the bearerorder verdict? (At choice time, was
   Nora a legitimate roster candidate by the engine's own list?)
2. Should anyone build on roster membership as "alive" before this
   is closed?
3. Sense check: read transcript lines around d106–d112 on 97330 if
   any exist for the return; report whether anything narrates it or
   it happens silently.

## Metric review (placeholder — filled in the evidence file, not here)

Any doubt about the metric above goes under "metric review" in the
evidence file and proposes a revision for the NEXT run; it never
changes this run's verdict.

## Canon

docs/CANON.md read first. No canon doc covers titan musters, the
Herald, or bearer succession ordering (bearerorder arm established
this; MONSTER-WAVES.md covers wave law, not muster accounting or
succession). Nothing here invents canon for them.
