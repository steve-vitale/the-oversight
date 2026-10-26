# sim-stockdoor-b — PRE-REGISTRATION (written BEFORE the sweep runs)

Run: oversight-flesh-out-loop-b, axis food-economy, arm
sim-stockdoor-b. INSTRUMENT ONLY: zero src/js changes, no default
flips, no meal or pantry redesign. The 1730Z arm
(sim-preservesched-resid-b) was DIAG-NO-GO because neither
pre-registered hypothesis covered both residual days: the pair
separates into THREE suppliers, and the day-83 supplier — a
meal-surplus stack written by the nightly meal's stockSurplus path
on day 82 — bypasses all three recorded pantry doors. This arm
adds the fourth-door record to the inflow stream so the pair can
be re-judged from inflow records alone, without snapshot
archaeology.

## Instrument

New file `scripts/stockdoor-capture.js`: a recorder-side wrapper
around `Game.stockSurplus(v, give)` (game.js, the nightly meal's
surplus path, called by villagerMealDay). The wrapper calls the
original with identical arguments, `this`, and return value, and
records only to the caller's array: {day (scholar day), vDay
(v.day, the clock stockSurplus itself stamps), door:
'stockSurplus', name: 'Foraged food', give (rounded offered kcal),
kcal (the original's return: kcal actually stored), spoilDay
(vDay + 3, the freshDay stockSurplus stamps — NO granary bonus,
matching the resid arm's finding that the meal-surplus stack
carries no granaryDays)}. No Game.state write, no RNG
consumption, no say/log write. A minimal game-code hook is NOT
expected: stockSurplus is a plain Game method, wrappable exactly
like the three existing doors. If replay cannot see it for any
reason, the run stops and reports that fact instead of adding a
hook silently.

Reused UNCHANGED: `scripts/substrate-capture.js`,
`scripts/inflow-capture.js` (three doors only — the new corpus's
`inflows` field therefore still carries exactly the three original
doors, and the fourth-door records live in a separate
`stockdoorRecords` field), `scripts/preservesched-resid-capture.js`.
New sweep `scripts/sweep-stockdoor-b.js` (same band, plus the
stockdoor install before setupGame). New analyzer
`scripts/analyze-stockdoor-b.js`, new proof
`scripts/test-stockdoor-b.js`. Corpus:
evidence/2026-10-26/sim-stockdoor-b-corpus/.

## Band (identical to the resid band)

Seeds 9750–9757, competent-nofeast (COMPETENT_FEAST=0,
FEASTSCALE_R13 unset/0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1), 100d death-aware, CAP=1. This 8-seed band IS the
pilot gate. No confirm band is spent unless the instrument
changes per-seed GAME outputs outside the residual pair's
accounting — in which case that change is reported first and no
confirm runs. ("Per-seed game outputs" = dayTable classes,
attribution flags, days alive, deaths, death causes, rank,
waveReach, national/table/win. The added `stockdoorRecords`
field and run timings are instrument output, not game output,
and are the only permitted per-seed differences.)

## Control (must pass before any residual judgment)

The PRE-FOURTH-DOOR view — counting only the stock, deposit,
and pantryAdd doors, with the identical counting rules of
analyze-preservesched-b.js — re-derives the original verdict
from the NEW corpus: neutrality 327 bound / 289 attributed /
38 unattributed, attribution-flag reproduction 0 mismatches, lag
distribution 1x32 / 2x4 / 3x1 / 4x1, median lag 1.0, coverage
36/38, residuals exactly (9750,83) and (9750,84). If the control
does NOT reproduce, the run stops: NO-GO on instrument grounds,
no residual judgment is made.

Determinism leg (part of the control): the new corpus matches
the committed resid-b corpus on all 8 seeds on every game-output
field listed above. Any mismatch is reported as an instrument
effect and no confirm band is spent.

## Primary metric (binding, MEASUREMENT.md §14)

Primary metric: re-judgment of the seed 9750 days 83–84 residual
pair with the fourth-door record in place.

GO threshold — ALL of the following must hold:
1. Control passes exactly (above).
2. Fourth-door record: seed 9750's day-82 stockSurplus records
   total exactly 2000 kcal stored, every record has spoilDay 85
   and name 'Foraged food', and spoilDay = vDay + 3 on every
   record (vDay 82).
3. Day-83 accounting: every bound line's eligible pile on seed
   9750 day 83 is exactly the 200-kcal x 10 stack at spoilDay 85
   with no granaryDays (2000 kcal total), and that stack matches
   the day-82 fourth-door record on units (10), spoilDay (85),
   and kcal (2000).
4. Day-84 accounting: every bound line's eligible pile on seed
   9750 day 84 totals exactly 3567 kcal and decomposes exactly
   as: the same meal-surplus stack (200 x 10 @ 85, no
   granaryDays, from the day-82 fourth-door record) + day-80
   granary stock (178 + 189 @ 86, granaryDays 3, present in the
   stock-door records for day 80) + ripened day-74 Winner's
   share (300 x 2 units @ 86, granaryDays 3, two stacks, present
   in the pantryAdd records for day 74).
5. Determinism leg passes (above): no game-output change on any
   seed.

GO iff all five hold. Any miss is NO-GO with the failing leg
named, never re-scored; metric doubts go under "metric review"
in the final evidence. The 36/38 corpus, the SPOIL-CLOCK +
RACKS-FULL rule, and the resid arm's DIAG-NO-GO verdict are NOT
re-judged here — the resid verdict stands as the prior run's
judgment under its own header; this arm judges only the
re-judgment with the fourth door recorded.

## Horizon / seeds / policies

Horizon 100d (same as the original band; death-aware: villages
that die stop early). Seeds 9750–9757. Policy competent-nofeast
as above. Wall numbers reported from the new corpus: national /
table / wins, wave 4–5 reach, median survival, death causes.
