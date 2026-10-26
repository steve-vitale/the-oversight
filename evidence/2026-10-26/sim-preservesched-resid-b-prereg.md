# sim-preservesched-resid-b — PRE-REGISTRATION (written BEFORE the sweep runs)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T1730Z, axis
food-economy, arm sim-preservesched-resid-b. DIAG ONLY: zero src/js
changes, no default flips, no game-code changes. Instrument extension only
(scripts/preservesched-resid-capture.js + scripts/sweep-preservesched-resid-b.js).

## Band (recovered exactly from the prior arm)

Identical seeds/policies to sim-preservesched-b: seeds 9750–9757,
competent-nofeast (COMPETENT_FEAST=0, FEASTSCALE_R13 unset/0,
SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1), 100d, CAP=1. The sweep
reuses scripts/substrate-capture.js and scripts/inflow-capture.js
UNCHANGED, plus the new resid capture (outer say-wrapper, installed
after substrate capture). Corpus: evidence/2026-10-26/
sim-preservesched-resid-b-corpus/.

## Control (must pass before any residual judgment)

Re-derive the original 36/38 verdict from the NEW corpus with the
identical counting rules (lag in {1,2} + eligibleAny + first bound
line racksFull recompute true; counted-inflow rule identical to
inflow-days.js): neutrality 327 bound / 289 attributed / 38
unattributed, lag distribution 1x32/2x4/3x1/4x1, coverage 36/38,
residuals exactly (9750,83) and (9750,84). If the control does NOT
reproduce, the run stops: DIAG-NO-GO on instrument grounds, no
residual judgment is made.

## Primary metric (binding, MEASUREMENT.md §14)

Primary metric: separation of the seed 9750 days 83–84 residual pair,
using the new per-bound-line fields (haven tier, granary bonus, and
the per-stack spoilDays of the eligible pile at the bound line).

GO threshold: ONE hypothesis explains BOTH residual days with named
per-stack evidence while the other is excluded by a stated
observation:
- H1 GRANARY-SHIFTED CLOCK: haven tier >= 3 on seed 9750 at days
  83–84, AND the eligible pile on both days contains stock-door
  "Foraged food" stacks with spoilDay 85 (the day-79 arrival,
  79+3+3), with day 84 additionally consistent with spoilDay 86
  (the day-80 arrival). Exclusion of H2: no older non-stock stack
  is needed to account for the eligible kcal on either day.
- H2 OLDER-STOCK RIPENING: haven tier < 3 on those days (so no
  granary shift exists to explain spoilDay 85 stock), AND the
  eligible stacks on days 83–84 are named older non-stock items
  (cooked 5d-shelf items, deposit-door items, or other non-stock
  arrivals) whose spoilDays fall in the eligible window on those
  days, with no spoilDay-85 stock stack present. Exclusion of H1:
  the tier reading, or the absence of spoilDay-85 stock stacks.

A miss is DIAG-NO-GO with both hypotheses kept open, never re-scored;
metric doubts go under "metric review" for the next run. The original
36/38 corpus and the SPOIL-CLOCK + RACKS-FULL rule itself are NOT
re-judged here — that verdict stands.

## Horizon / seeds / policies

Horizon 100d (same as the original band; death-aware: villages that
die stop early, as in the original corpus). Seeds 9750–9757.
Policy competent-nofeast as above. Wall numbers reported from the
new corpus: national / table / wins, wave 4–5 reach, median survival.
