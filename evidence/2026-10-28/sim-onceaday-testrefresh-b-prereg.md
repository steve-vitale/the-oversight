# sim-onceaday-testrefresh-b — prereg (committed before any judged fixture run)

Run: fleshout-loop-b-20261028T1530Z, axis food-economy.
Arm: sim-onceaday-testrefresh-b, tracker blank 1 from run
fleshout-loop-b-20261028T1430Z.
Worktree/branch: sim-onceaday-refresh-b. No push, no version bump,
no live verification — coordinator merges locally, ship loop owns deploys.

## Background (why this refresh exists)

evidence/2026-10-28/sim-liveness-b.md, sibling regression check
section, proved on this tree: scripts/test-refusalprecheck-b.js still
encodes the refusalprecheck-era residual — a non-boundary once-a-day
tap refuses POST-payment, ticks consumed, silent 40 kcal burn — but
landed sim-onceaday-b work now prechecks once-a-day day-roll-aware
(docs/ABILITY-REFUSALS.md §5; evidence/2026-10-28/sim-onceaday-scope-b.md
§1), so those taps refuse PRE-payment with ticks/kcal/day unchanged.
The test's R13/R14 expectations, never updated since commit 10ef1e627,
are stale. This arm refreshes the test only; it changes no game code
and no game behaviour.

## Order, stated honestly

The unmodified test was run once BEFORE this prereg was committed,
as a baseline reproduction only — not a judged run. It reported
FAILURES (32), all on R13/R14 (2 failures per fixture per seed:
ticks unchanged where the stale expectation demanded ticks consumed,
and kcal unchanged where it demanded the silent 40 kcal burn).
No other fixture failed. The judged after-run(s) below run only
AFTER this prereg commit.

## Scope (hard)

- Change ONLY scripts/test-refusalprecheck-b.js: the R13/R14
  expectation block plus its header comments (the "pinned residual"
  language is replaced with the day-roll-aware precheck description,
  citing sim-onceaday-scope-b).
- Touch NO src/js, NO other test, NO game behaviour.
- If any non-R13/R14 fixture needs changing, that is out of scope:
  report it, do not change it.

## Primary metric

scripts/test-refusalprecheck-b.js in assert mode, all fixtures,
on the seeds below: PASS with zero failures.

## GO threshold (pre-registered)

GO = the refreshed test passes ALL fixtures: 8 seeds x 14 fixtures
= 112 rows, zero failures, on two consecutive runs (determinism:
both runs green with identical pass counts), where R13/R14 assert
pre-payment refusal on every seed:

- result false
- day unchanged (dayAfter == dayBefore)
- dayTicks unchanged (dayTicksAfter == dayTicksBefore)
- kcal unchanged (kcalAfter == kcalBefore)
- challengeDay/postureDay flag unchanged (the flag that was set
  for today stays set for today; it is NOT re-stamped and NOT cleared)
- the once-a-day refusal sentence present in the narration
  ("You already threw down a challenge today" for war_cry;
  "You already threw your weight around today" for
  intimidating_presence)

`_actionAvailable` (button-disabled-state read) is recorded as a
diagnostic only and is NOT judged: no assertion is made about its
value unless a value is first proven — no value is invented here.

## NO-GO (pre-registered)

- Any fixture other than R13/R14 regresses (was passing before,
  fails after), OR
- R13/R14 cannot be made to assert pre-payment refusal on current
  master (e.g. the tap still pays ticks/kcal, or the flag moves,
  or the sentence is absent), OR
- The two proof runs disagree (non-deterministic result).

## Fixtures / horizon

No sim band, no day horizon: this is a fixture proof, not a policy
sim. Fixtures: R1–R14 as defined in scripts/test-refusalprecheck-b.js.
Seeds: the script default 9981–9988 (8 seeds). Positions: R13/R14
at the non-boundary position dayTicks = 100 (payment of 3 ticks
cannot roll the day); R9/R10 remain the boundary success-path pair
and are NOT re-scoped.

## Proof (pre-registered)

1. Refreshed test, assert mode, run twice; both runs green, 112 rows.
2. `node scripts/check.js --quick` (never concurrent jest; if any
   jest is invoked, use --cacheDirectory=/tmp/jest-cache-sim-onceaday-refresh-b).
   An unrelated check.js failure is reported as pre-existing with
   evidence, not loosened or hidden.
3. Evidence file evidence/2026-10-28/sim-onceaday-testrefresh-b.md:
   before/after numbers, what changed and why in plain words,
   a "metric review" section (§14: judged against this prereg as
   written, no mid-run re-scoring), and a sense note (what a refused
   repeat tap now costs the player: nothing — that is the point).

## Metric review (to be filled at run end, not here)

Judged against this prereg as written. Any doubt about the metric
itself goes under "metric review" in the evidence file and proposes
a revision for the NEXT run; it never re-scores this run.
