# sim-divedeep-fix-b — PREREGISTRATION (committed before any after-measurement)

Run: fleshout-loop-b-20261028T0630Z, axis food-economy.
Arm: extend the day-roll predictor (`_onceADayPostPaymentDay`,
src/js/abilityActions.js) to the `water_breathing.dive_deep` precheck.
Prior run: evidence/2026-10-28/sim-onceaday-scope-b.md §3 (group C).
Scope: touch ONLY abilityActions.js and the dive_deep precheck site.
Do NOT touch challenge/end_it_before prechecks, do NOT touch calm_beast,
do NOT touch any other ability. If the fix needs files beyond
abilityActions.js, stop and report instead of sprawling.

## Primary metric: boundary false refusal fixed

GO iff ALL hold:
(a) Flag-set dayTicks-500 case (500+15 >= 512, day rolls) no longer
    refuses pre-payment and succeeds as tomorrow's dive, matching
    flag-unset behavior on the same fixture: day+1, dayTicks reset to 0,
    dive flag stamped on the NEW day, salvage gained.
(b) Genuine same-day reuse (flag set, dayTicks 100, no day-roll pending)
    still refuses before payment, with day/ticks/kcal all unchanged.
(c) An 8-seed pilot band (competent-player policy, 100d death-aware cap,
    same seeds before/after) completes 8/8 with no crash and no new
    refusal class, with wall numbers (national / table / wins, wave 4-5
    reach, median survival) reported before/after.

## Fixtures / seeds

- Group C re-run from the prior arm's script (adapted, same design):
  seeds 9981 and 9983 (9982 has no creek/wetland tile — documented limit,
  carried over, not re-litigated). Cases per seed: C-500-flag (boundary,
  flag set), C-500-noflag (boundary, flag unset), C-100-flag
  (non-boundary, flag set). Plus a boundary button-read purity check
  (10x _actionAvailable at dayTicks 500, flag set/unset, deltas 0).
- Regression guard: challenge/end_it_before group B cases on seeds 9981,
  9982 must reproduce the prior arm's numbers exactly (boundary success,
  non-boundary refusal before payment) — the fix must not move them.
- Pilot band seeds: 9981, 9982, 9983, 9984, 9985, 9986, 9987, 9988
  (competent policy, DAYS=100, identical seeds before/after).

## Metric binding (§14)

Pre-registered metrics bind this run. A miss is NO-GO, never re-scored
against a friendlier metric mid-run. Doubts go under "metric review" in
the evidence file for the NEXT run.

## Standing panel note

If scripts/balance-panel.js cannot ingest the fixture/band corpus, that
is stated explicitly in the evidence file (standing panel exception)
rather than faking a panel artifact.
