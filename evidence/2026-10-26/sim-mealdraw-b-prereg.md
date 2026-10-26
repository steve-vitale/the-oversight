# sim-mealdraw-b — PRE-REGISTRATION (written BEFORE the sweep runs)

Run: oversight-flesh-out-loop-b, axis food-economy, arm
sim-mealdraw-b. MEASUREMENT ONLY: zero src/js changes, no default
flips, no meal or pantry redesign. The stockdoor arm
(sim-stockdoor-b, commit on branch sim-mealdraw-b's history) was
DIAG-NO-GO on its own prereg: the day-82 stockSurplus gross write
is 2,800 kcal (600+200+800+1,200, all spoilDay 85), but the day-83
surviving pile is only 2,000 kcal (200x10@85) — the night meal
eats from its own write, and night 81's 3,000 kcal survived at
zero. A night's gross write is an upper bound, never the
surviving pile. This arm adds the meal-draw record so gross
write vs surviving pile can be reconciled from records alone,
with the pile match judged on gross and surviving pile
SEPARATELY (the stockdoor arm's named correction).

## Instrument

New file `scripts/mealdraw-capture.js`: a recorder-side wrapper
set, installed after substrate + inflow + resid + stockdoor
captures, all reused UNCHANGED:

- `Game.villagerMealDay` wrapped: sets a per-call context
  (vid, home/away from `v.away[vid]` at entry) for the duration
  of the call, then restores it. Records the call's return
  (`{ate, gave, drawn, fasting}`) for the fresh+spoiled
  cross-check below. Identical arguments, `this`, return.
- `Game.villageMeal` wrapped: same pattern, context 'player'.
  The player meal runs at endDay BEFORE villageEats, so a day-82
  player draw can only touch pre-store stock — it can never
  draw the night's own surplus stack, which does not exist yet.
- `Game.pantryDraw` wrapped: when called, records
  `{seq, day (scholar day), vDay, context, vid, want, taken,
  shortOfFresh, cookLinesSeenToday, items}` where each item is
  snapshotted at return time as `{name, kcalEach, units,
  effectiveKcal, cooked, spoilDay, granaryDays, foodState,
  foodKind}`. Outside any meal context the context is 'other'.
  No Game.state write, no RNG consumption, no say/log write.
- `Game.drawSpoiled` wrapped: same context tagging; records
  `{seq, day, context, vid, want, got, cookLinesSeenToday,
  items}` where items come from a before/after aggregate diff
  of spoiled pantry stacks (key name|kcalEach|spoilDay|
  granaryDays|foodState), so spoiled draws are itemized, not a
  lump. `got` must equal the diff sum (cross-check).
- `Game.say` wrapped (outermost): counts cook-frame lines per
  day with the SAME regex as the resid capture
  (`COOK_FRAME_RE`), purely to stamp every draw record with
  `cookLinesSeenToday`. This is what makes window boundaries
  exact: a draw belongs to window W (first-cook day D to
  first-cook day D+1) iff (day == D and cookLinesSeenToday >= 1)
  or (day == D+1 and cookLinesSeenToday == 0). EndDay meals
  carry cookLinesSeenToday >= 1 (daytime cook lines already
  fired); pre-first-cook daytime draws carry 0. Days with no
  cook line at all are not in the prereg days (9750 days 82–84
  all have cook lines) and would be flagged, not assumed.

New sweep `scripts/sweep-mealdraw-b.js` (same band + env
asserts as sweep-stockdoor-b.js, plus the mealdraw install;
corpus `evidence/2026-10-26/sim-mealdraw-b-corpus/`,
mealdraw-b-cap1 files). New analyzer
`scripts/analyze-mealdraw-b.js`, new proof
`scripts/test-mealdraw-b.js`. Reused UNCHANGED:
`scripts/substrate-capture.js`, `scripts/inflow-capture.js`,
`scripts/preservesched-resid-capture.js`,
`scripts/stockdoor-capture.js`.

## Band (identical to the stockdoor band)

Seeds 9750–9757, competent-nofeast (COMPETENT_FEAST=0,
FEASTSCALE_R13 unset/0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1), 100d death-aware, CAP=1. This 8-seed band IS
the pilot gate. No confirm band is spent unless the instrument
changes per-seed GAME outputs — in which case that change is
reported first and no confirm runs. ("Per-seed game outputs" =
dayTable classes, attribution flags, days alive, deaths, death
causes, rank, waveReach, national/table/win, endReason. The
added `mealDrawRecords` field and run timings are instrument
output, not game output, and are the only permitted per-seed
differences vs the stockdoor corpus.)

## Control (must pass before any residual judgment)

The PRE-FOURTH-DOOR view — counting only the stock, deposit,
and pantryAdd doors, with the identical counting rules of
analyze-stockdoor-b.js — re-derives from the NEW corpus:
neutrality 327 bound / 289 attributed / 38 unattributed,
attribution-flag reproduction 0 mismatches, lag distribution
1x32 / 2x4 / 3x1 / 4x1, median lag 1.0, coverage 36/38,
residuals exactly (9750,83) and (9750,84). If the control does
NOT reproduce, the run stops: NO-GO on instrument grounds, no
residual judgment is made.

## Primary metric (binding, MEASUREMENT.md §14)

Primary metric: reconciliation of the seed 9750 day-83 and
day-84 piles from meal-draw records, with gross and surviving
pile judged SEPARATELY. Stack classes are keyed by
(name, kcalEach, spoilDay, granaryDays). Endpoints are the
committed stockdoor corpus's dayPantry snapshots (first cook
line each day) — the same endpoints the stockdoor arm used.

GO threshold — ALL of the following must hold:

1. Control passes exactly (above).
2. Night-82 gap, Class A: window-1 (day-82 first cook to
   day-83 first cook) meal draws from class
   ('Foraged food', 200, 85, null) total exactly 800 kcal,
   itemized per villager (vid + units per draw), all in
   villager-home context (the stack does not exist before the
   night's first store, so no player/other draw from it can
   occur in window 1 — any such draw is a leg failure, not a
   footnote).
3. Night-82 gap, whole @85 class: window-1 meal draws from
   ALL spoilDay-85 classes total exactly 1,142 kcal
   (800 Class A + the 342 kcal of day-82 first-cook granary
   pieces, 122 + 220, granaryDays 3), by context, so that
   342 (day-82 first-cook @85) + 2,800 (night-82 stockdoor
   gross) − 1,142 (window-1 draws) = 2,000 (day-83 first-cook
   @85) closes with ZERO residual. Any residual (unrecorded
   consumer, day-83 pre-cook write to @85, smoke term) is a
   leg failure with the residual named. Note the smoke term
   for @85 in window 1 is evidenced as 0: the day-83
   racksFull pile (after the day-83 first worked line) still
   shows the full 200x10@85, so the day-83 first smoke did
   not touch @85.
4. Day-84 pile, @85 anchor: window-2 (day-83 first cook to
   day-84 first cook) meal draws from class
   ('Foraged food', 200, 85, null) total exactly 0 kcal, so
   2,000 (day-83 first-cook @85) + 0 writes − 0 draws = 2,000
   (day-84 first-cook @85). The day-84 pile's @85 component
   is therefore the untouched survivor, not a re-write.
5. Day-84 pile, @86 classes: for EACH @86 class, the window-2
   equation closes exactly:
   day-84 total = day-83 total + window-2 stockdoor writes
   − window-2 meal draws − window-2 first-smoke
   consumption, where the first-smoke consumption is
   evidenced by (a) dried stacks appearing in dayPantry84
   that are absent in dayPantry83, converted back at the
   rough yield 0.80, AND (b) the day-84 first worked line's
   preserved kcal (~3,200) matching the fresh total × 0.80.
   Expected values from the stockdoor corpus (to be
   confirmed, not assumed): Winner-300@86: 2,400 − draws −
   smoke = 1,200; Foraged-200@86: 0 + 2,800 (night-83
   stockdoor gross) − draws − smoke = 0; Foraged-178@86 and
   Foraged-189@86: 178/189 − draws − smoke = 178/189. A
   class equation that closes only by plugging an
   unevidenced residual is a leg failure.
6. Cross-checks: (a) for every villager-home meal call,
   fresh taken + spoiled got == the call's returned `drawn`
   (away calls excluded: pack draws are not pantry draws);
   (b) every drawSpoiled `got` equals its before/after diff
   sum; (c) no mealDraw truncation flag on any file.
7. Determinism leg: the new corpus matches the committed
   stockdoor corpus on all 8 seeds on every game-output
   field listed under Band. Any mismatch is reported as an
   instrument effect and no confirm band is spent.

GO iff all seven hold. Any miss is NO-GO with the failing leg
named, never re-scored; metric doubts go under "metric
review" in the final evidence. The stockdoor arm's DIAG-NO-GO
verdict stands as the prior run's judgment under its own
header; this arm judges only the meal-draw reconciliation.

## Horizon / seeds / policies

Horizon 100d (same as the stockdoor band; death-aware).
Seeds 9750–9757. Policy competent-nofeast as above. Wall
numbers reported from the new corpus: national / table /
wins, wave 4–5 reach, median survival, death causes. A
sense-test (one full night-meal sequence read and judged for
meaning vs the recorded draws) is reported in the final
evidence, not in this prereg.
