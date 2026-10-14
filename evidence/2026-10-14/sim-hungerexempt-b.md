# HUNGER-EXEMPT THROTTLE — pilot (fleshout-b ARM: thinner-buffer-cost)
2026-10-14 (run 2026-10-14T06:00Z) | axis: food-economy | arm: hunger-exempt-throttle

## Context
The landed prodthrottle lever (afb736e6) cut village-scale fresh-rot −74%
(pilot) / −41.1% (confirm) but its §10-12 confirm was NO-GO at guardrails:
median survival −14d, starvation deaths 26→38 (evidence/2026-10-14/sim-throttleconfirm-b.md).
The confirm's metric review proposed the pilot's named thinner-buffer-cost
arm: "exempt redirect while any villager is actively hungry" — this arm.
Signal note (engine-honest, not a proxy): the exemption gates on
progState().hungryStreak — the anyStarving signal out of villageEats (some
villager ate under 60% of ration-adjusted need, not fasting, not on voted
half-rations; the same signal that fires the hunger-winter crisis). The
throttlefeast arm's logged signal (v.hungryDays, the empty-pantry clock) is
MUTUALLY EXCLUSIVE with the throttle — an empty pantry never engages — so a
hungryDays gate would be a dead branch; it cannot serve as the exemption.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any sweep spend
- Question: does exempting the prod-throttle redirect while any villager is
  actively hungry shrink the confirm's survival cost (starvation) without
  giving back the lever's rot effect?
- Lever: HUNGER-EXEMPT THROTTLE as landed in this run's commit — game-code
  change in src/js/game.js resolveOneAssignment: when the throttle would
  fire but progState().hungryStreak > 0, production continues (no redirect,
  no rotation advance) and the beat narrates the decision
  ("🍲 ...but someone went to bed hungry... the hungry eat first.").
  HUNGEREXEMPT=0 disables (instrumentation-side control; default ON).
- CONTROL: landed throttle on current tip (HUNGEREXEMPT=0 — exemption
  disabled). ARMED: hunger-exempt throttle (HUNGEREXEMPT unset — exemption
  enabled). Same code tree, identical seeds, env-var only.
- PRIMARY: starvation deaths per 100 villager-days (death-cause 'starvation'
  over summed daily roster length from samples.pop), armed vs control on
  identical seeds. GO = armed ≤ 0.85 × control (the survival cost shrinks).
- GUARDRAILS:
  - absolute fresh-rot kcal: armed ≤ 1.33 × control (the lever must still
    move rot — the exemption must not gut the effect)
  - national: armed ≥ control − 2
  - median survival: armed_median ≥ control_median − 10d (ONE-SIDED:
    improvement passes)
  - hungryDays: armed ≤ control + max(5, 10% of control) (confirm convention)
- Horizon: 180d death-aware (dead villages stop, 10d tail — harnessstop fix);
  180d is the pacing-law max.
- Seeds: 11/22/33/44/55/66/77/88 × leadcourt/belongseek, IDENTICAL seeds
  both sides (16 runs/side). This 16-run pilot IS the gate per
  pre-registration (pilot, no confirm spend this run).
- Instrument-honesty: SMOKE=1 gate before any sweep spend; named-export
  policy unwrap (no Object.assign({}, require(...)) — #69); per-side shape
  assertion (proof test §3: HUNGEREXEMPT=0 redirects, armed exempts) before
  each side's runs; sweep logs to evidence/2026-10-14/ (never /tmp).
- A miss is NO-GO — never re-scored against a friendlier metric mid-run.
  Metric doubts go under "metric review", revisions apply to the NEXT run.

## Proof (scripts/test-hungerexempt-20261014.js)
RED→GREEN verified via the patch-file cycle (no git stash on the hot tree):
- RED (pristine): exemption inert — redirect fires into hungryStreak>0
  villages; rotation advances; no exemption ledger. ALL GREEN.
- GREEN (armed): production continues on hungryStreak>0 (task not
  redirected, exemption counted, decision narrated honestly, redirect beat
  silent, rotation untouched); landed redirect preserved when hungryStreak=0;
  HUNGEREXEMPT=0 restores landed behavior; empty-pantry mutual exclusivity
  asserted. ALL GREEN (19/19).

## Instrument-honesty gate
(to be filled: SMOKE=1 result before any sweep spend)

## Results
(to be filled)

## Wall numbers (scale wall — report every run)
(to be filled: national/table/wins, exiled, wave4/5 reach, median/max survival)

## Village assessment (plain words)
(to be filled)

## Sense-test (redirect/exemption narration — read, judge meaning and honesty)
(to be filled)

## Blanks filled / documented
(to be filled)

## Metric review (§14)
(to be filled — this run's metric is new: starvation deaths per 100
villager-days, proposed by the confirm's metric review)

## Convergence state
(to be filled: converging | converged | parked | killed-at-pilot)
