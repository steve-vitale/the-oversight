# sim-awayration2-b — PRE-REGISTRATION (committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T1630Z.
Worker tree: ~/workspace/worktrees/sim-awayration2-b. Base: master 991609dfe.
Axis: food-economy. Lever: AWAY-RATION dawn-pack sizing.
Resume note: the 1330Z run's awayrationfix arm died with ZERO commits;
this arm starts fresh. Canon read first: docs/CANON.md, docs/PRESERVATION.md
(food ladder; pack food moves only what fits in the actual pack),
docs/BALANCING.md (2,000 kcal/day adult anchor). No canon doc covers
away-ration sizing — if this run names a size, it is a finding, not canon.

## STEP 1 — DIAG (done, instrument only, zero game changes)

Instrument: scripts/sweep-awayration2-b.js + scripts/analyze-awayration2-b.js
(proof: scripts/test-awayration2-b.js, legs A+B green: fixture
decomposition exact, live wiring + byte-identical determinism on
seed 96101 × 100d, 52 pack meals, meal join rate 1.000).
Corpus: evidence/2026-11-03/perseed-awayration2-b/ (8 per-seed JSONs +
sweep-competent.json + analysis-diag.json + pilot-run.log).
Diag pilot: competent, seeds 96101–96108, 100d death-aware cap,
PLENTYDEPRI=1/DEPOSITGATE=1. Wall: 5/8 survived to 100d, 3 village-lost
(d15/d37/d83), wave 4 on 5/8, Arc III on 8/8, national/table/wins 0/8
(competent alone carries no scale push — expected, not chased).

DIAG NUMBERS (primary pack meals = first packMeal call per (vid,day)):
- 417 primary pack meals, 0 dup groups, 1,082 self-fed away days,
  0 fasting away days. Meal join rate 1.000.
- want (dayWant = need − ownEat): mean 561, median 480, range 53–1,580.
  Away villagers mostly feed themselves; the pack tops up a small want.
- dawn pack: mean 854, median 858. dawnGap (want − dawn): mean −293,
  median −347. The dawn pack EXCEEDS the want on 303/417 meals; it falls
  short on only 114, and the meal-time top-up (mean 93, median 0, fires
  on 103) covers all but 11.
- take/want: mean 0.980, median 1, share full 0.974.
- SHORTFALL (want − take): mean 13.8 kcal, median 0, max 1,229;
  share >0 = 0.026 (11/417), share ≥100 = 0.024, share ≥500 = 0.010.
- DECOMPOSITION (closes exactly, residual 0): of 5,744 total shortfall
  kcal, topUpGap share 1.000, theftGap share 0.000, residual 0.000.
  Binding meals: top-up 11, theft 0, residual outliers 0.
- Pantry at meal: shortfall meals mean 204.5 kcal vs full meals
  30,024.6 kcal. ALL 11 shortfall meals had a pantry too small for
  their top-up request once the dawn draw itself is charged
  (pantryAtTopUp = pantryBefore − dawnDrawn).
- Hunger at pack: mean 92.6, share ≥70 = 0.952. The hunger deduction
  IS visible in dawn size (mean dawnGap hungry −282 vs not-hungry
  −508, ~226 kcal) — but it never binds a meal: dawn still exceeds
  want on average, and the top-up covers the rest when the pantry
  allows. The perverse deduction is real in the formula and masked
  in every outcome.
- Reseed dayParts: {4: 417}. dayPart 4 is the end-of-day transition
  (advancePart increments to 4 → endDay → villageEats). There is NO
  dawn reservation: every "dawn" pack in this corpus was drawn at the
  day's end meal, after the day's four parts, at the villager's turn
  in roster order. Roster-order competition is NOT the story either
  (shortfall rate first-half 0.025 vs second-half 0.029).
- Adequacy (ate ≥ 0.6 × needEst): pack days 0.993, self-fed away days
  0.998.
- Villager starvation deaths: 6, only 1 away-at-death (Emily, s96104
  d15, pantry 0 — a genuinely empty-pantry village-lost seed, not a
  ration-size story). The other 5 are haven deaths on empty-pantry
  seeds (96105 pantry 0). No away-ration starvation signal beyond
  empty pantries.
- SENSE (away-voice lines, 13): all 13 are the hurt-traveler full-meal
  line ("eats away from the haven — N kcal from the pack — while hurt
  (health H/100), far from the haven's shelves"), including Nina on
  s96108 d47–d58 eating 1,196–1,372 kcal daily at health 1–7 for 12
  straight days. The voice names the traveler and the meal honestly;
  what it never explains is WHY a villager at health 1–7 is still out
  there instead of home — that question belongs to travel/health,
  not to ration size, and is logged as a finding, not chased here.

DIAG VERDICT — dominant shortfall mechanism, named as ordered:
TOP-UP LIMITS (pantry exhaustion at meal time), 100% of shortfall.
Dawn sizing: masked (dawn already exceeds want on average).
Hunger deduction: masked (visible in dawn size, never binding).
Theft: zero binding meals in competent sims (competent never steals).
A dawn-resizing fix therefore has NO meal benefit available to take:
on pantry-plentiful days take already equals want; on pantry-empty
days a bigger dawn draw draws nothing more, because the pantry is
empty. The pilot below exists to VERIFY that expectation on identical
seeds, not to assume it — and the GO bar is set so a granularity-only
wiggle cannot pass it.

## STEP 2 — THE FIX (exact formula, from the diag)

In src/js/game.js, packKcal gains an optional meal-path argument.
Theft/intimidation callers are UNTOUCHED (they call packKcal(vid)
with no second argument and get the old formula exactly, including
its Math.random consumption):

- packKcal(vid, mealWant): when mealWant is a finite number > 0,
  the dawn target is max(200, round(mealWant)) — sized to dayWant,
  NO random term, NO hunger deduction, NO bold bonus. FLOOR = 200,
  carried over from the existing formula (diag wants run 53–1,580,
  median 480; the floor binds only on tiny wants ≤ 200 and keeps the
  theft-path floor identical).
- packKcal(vid) with no/invalid mealWant: the OLD formula exactly:
  800 + Math.random()*500 − hunger*3 + (bold ? 150 : 0), floored
  at 200, drawn as real items via pantryDraw (cook:false).
- packMeal calls packKcal(vid, want). If the pack was already seeded
  today (e.g. by a thief earlier in the day), the cached pack stands
  and mealWant is ignored — the existing cache rule — and the top-up
  still fills want − dawn. The top-up block itself is UNTOUCHED:
  one attempt per pack-day, want − dawn, REAL pantry items only,
  never conjured; a stolen pack still loses exactly what was taken.
- No demand/gate/price changes. No other file touched.

## PRE-REGISTRATION (binding per MEASUREMENT.md §14)

- Primary metric (one): mean pack-meal shortfall (want − take, kcal)
  across primary pack meals, competent policy, pilot seeds, 100d.
- BASELINE (diag corpus, reused as the before cell): 13.8 kcal
  (11/417 short, max 1,229).
- GO (pilot, ALL required): armed mean shortfall ≤ 5.0 kcal AND
  armed shortfall-meal share ≤ 0.010. Rationale: this is the
  minimum obvious effect (§9 — GO only if visible in 8 seeds without
  statistics). A move from 13.8 to ≤ 5.0 means the fix eliminated
  most of the remaining shortfall; a granularity-only wiggle
  (single-draw vs two-draw ceil, ≤ 1 piece per meal) cannot reach it,
  and neither can any change on pantry-empty days. If the pilot
  misses, the verdict is NO-GO and the arm is KILLED (fix reverted,
  no game-code trace; prereg + evidence + scripts kept) — never
  re-scored against a friendlier metric.
- Horizon: 100d death-aware cap (dead villages stop; no fixed 200d).
  Why 100d: away pack meals need volume (417 in the 100d diag pilot);
  60d would thin the sample, 150d adds nothing (the question is a
  meal-time mechanism, not reachability).
- Seeds: PILOT 96101–96108, identical for baseline and armed.
  CONFIRM 96109–96124 runs ONLY on pilot GO. No other seed list runs.
- Policies: competent ONLY for the primary. Deviation from §2 stated
  plainly: the lever is NPC meal mechanics; competent is the pinned
  baseline, and player-policy variants (risk-aware etc.) do not touch
  villagerMealDay/packMeal, so a second policy would double runtime
  for no lever-relevant signal. The §15 panel attempt below still
  runs its own comparison where applicable.
- Guardrails (a GO met with a guardrail breached is NO-GO):
  (a) no starvation regression — armed pack-day adequacy ≥ 0.98
  (baseline 0.993) AND armed villager starvation deaths ≤ baseline + 2
  (baseline 6); (b) pantry draws stay honest real items, never
  conjured — pantryDraw is untouched, proven by proof-test leg C
  (drawn kcal == pantry kcal lost); (c) theft semantics unchanged —
  packKcal(vid) without an argument follows the old formula exactly,
  proven by proof-test leg C (hungry non-bold theft-path value
  ≤ 1,000, i.e. the hunger deduction still present on that path).
- Balanced panel (§15): attempted with the correctly-shaped call
  (competent, pilot seeds, 100d, before-panel on baseline source,
  after-panel on armed source, then `compare`). If the panel fails
  on the known sweep-corpus shape problem (packtail-confirm
  precedent), the sweep table (baseline vs armed corpora on
  identical seeds) is the before/after comparison, stated explicitly.
- Telemetry deviation check at end (if applicable): node
  scripts/telemetry-check.js with the scale-wall baseline; any LOUD
  line is a same-run investigation item.
- Reachability + village assessment: reported in the final evidence
  file (waves, Arc, national/table/wins, median survival, death
  causes) as watch metrics, never as judged substitutes for the
  primary.

## METRIC REVIEW (pre-run)

- Rows round want and take to integers (±1 kcal on shortfall);
  negligible at the 5.0-kcal GO scale and identical on both cells.
- Adequacy uses needEst (person.kcalPerDay) rather than the code's
  internal health-scaled need, matching size-b — comparable across
  runs, not the code's internal need.
- take/want shareFull counts take ≥ want; with ceil overshoot in
  pantryDraw, take can equal want without exceeding it (take is
  min(pool, want) by construction).
- The single-policy deviation above is a scope call, not a quiet
  edit: it is stated here, before the armed leg, and the panel
  attempt is unaffected.
- Analyzer corrections made during the diag (recorded, not hidden):
  shares now print to 3 decimals (1 decimal turned 11/417 into a
  printed 0); pantry-at-top-up charges the dawn draw itself
  (pantryBefore − dawnDrawn on reseed calls), which reclassified
  3 shortfall meals from "pantry enough" to "pantry short" — the
  corrected classification is 11/11 pantry-short; theftGap is 0 on
  reseeded calls (poolBefore there is yesterday's remainder, and
  the fractional remainders + topUpDone-before-true flags prove the
  reseed reading on all 11 shortfall rows).

## EXPECTATION (stated, not judged)

The fix is expected to NO-GO: the diag leaves it nothing to fix on
meals. If the pilot confirms that, the finding stands as the result
— the away-ration size problem was already closed by the packtail
top-up, and the remaining shortfall is a pantry-empty story, not a
formula story. A future arm that wants to move THOSE meals needs a
real dawn reservation (drawing packs at day start), which is a
different, larger change and is NOT smuggled into this arm.
