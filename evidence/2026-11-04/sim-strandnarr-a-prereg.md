# sim-strandnarr-a — PRE-REGISTRATION (committed BEFORE any judged sim)

Worker: sim-strandnarr-a (Loop A, food-economy / narration).
Assignment: stranded-night narration census + upkeep-breakfast adjudication.
Anchor: seed 17021, loop-days 51–53 (thicket strand; flip with 0 actions,
skip 'no-gather-target'): the day record just ends with no bedding-down line
about the stranded night itself.

## Prior capture — why a new instrument is required (read, not assumed)

The prior bankfood arm (scripts/bankfood-trace-b.js) captured narration by
wrapping Game.say and slicing ONLY the lines spoken inside one
policy.daily call (sayBefore..sayAfter). The harness order per loop-day is:
upkeep, wait, upkeep, wait, upkeep, wait, daily, sleep. Therefore:

- Lines spoken during the three upkeep calls (competentEat's meal beat)
  fall in the gap between daily(N) and daily(N+1) and were never sliced
  into any row.
- Lines spoken during Game.sleep() (bedding-down, wake) fall AFTER
  daily(N) returns and were never sliced into any row either.
- Game.log itself keeps only the last 40 lines (game.js emit), so a
  post-hoc log read cannot recover a full day either.

The new instrument (scripts/policies/strandnarr-diag.js +
scripts/strandnarr-trace-b.js) therefore wraps Game.say/Game.sysSay and
records EVERY attempted line with phase markers at upkeep entry/exit,
daily entry/exit, and sleep entry/exit, so upkeep windows and sleep
windows are first-class slices. It draws no RNG, edits no state, and
calls the original (no-op, narration off) say/sysSay — trajectory
identity vs instrument-OFF is proven by the det-gate below.

## Primary metric

Stranded-night bedding-down coverage, pilot:

- Stranded night = a loop-day evening whose nighttravel outcome is
  `travel-refused` or `out-of-reach` AND the scholar is not inside Haven
  at daily exit (the bankfood evening gate).
- Denominator = stranded nights where Game.sleep() slept through (the
  scholar day rolled). Sleep-refused nights ("too late for real sleep")
  and woke-with-a-start nights are counted separately, NOT in the
  denominator — they are not bedding-down nights by construction.
- Numerator = denominator nights whose SLEEP window contains a
  bedding-down line: /You settle into/ or /Sleeping rough means/.
- GO threshold (verdict "narrated", no fix): denominator >= 5 AND
  coverage = 100%. Any slept-through stranded night with no
  bedding-down line in its sleep window is a genuine-silence
  instance and moves the verdict to fix-or-document.
- If denominator < 5, the verdict is INSUFFICIENT-DATA, not "narrated".

## Anchor adjudication (judged FIRST, before pilot generalization)

Seed 17021, bankfood variant leg (env gates identical to
bankfood-trace-b.js; WOODWARM=0 leg first, WOODWARM=1 if the anchor
evenings do not reproduce — the leg that reproduces is reported):

1. Upkeep-breakfast claim (17021 loop-day 52 morning: first-upkeep
   scholar kcal 128 -> daily-entry kcalBefore 2310, with 270 kcal
   Muscadine Grapes eaten in the upkeep window, no line in the prior
   arm's capture):
   - CAPTURE ARTIFACT iff the full transcript shows a Muscadine
     Grapes meal beat of 270 kcal inside an upkeep window of that
     loop-day, before daily entry.
   - GENUINELY SILENT iff the full transcript across that morning's
     sleep + upkeep windows contains no meal beat while scholar kcal
     rose by >= 270 kcal from a pack/pantry eat inside the window.
   - NARRATED-IN-RECORD iff the prior capture already contained it
     (stated not to; included for completeness).
2. Stranded-night claim (17021 loop-days 51–53): for each stranded
   evening, the sleep window is quoted verbatim (bedding-down line
   present or absent) — the anchor verdict follows the primary
   metric's rule, not the old day record.

## Secondary metrics (census, not verdict arms)

- Upkeep-breakfast coverage (pilot): over stranded mornings, share of
  upkeep-window scholar-kcal gains >= 50 kcal that have a matching
  "You eat ..." meal beat inside the same upkeep window.
- Remote-pantry sense note: on stranded mornings, havenStoresAccess
  value + whether any pantry draw succeeded (pantry kcal fell and
  pack kcal rose inside an upkeep window while not inside Haven).
  Reported as a question, not chased as an arm.
- Haven-gossip sense note: count of "Word gets around the haven"
  lines inside stranded scholars' sleep/upkeep windows. Reported as
  a question (the engine's monsterNewsCheck carries no position
  gate), not chased as an arm.

## Horizon, seeds, policies (death-aware, never fixed-200d)

- Horizon: 60 loop-days. Why: the anchor sits at loop-days 51–53, so
  the run must reach past 53; dead villages stop simulating
  (runDays stops on Game.over), so 60 is a cap, not a sentence.
- Pilot seeds (8): 17021 (anchor) + 15003, 15009, 15091, 15211,
  15215, 15220, 15221 (the bankfood woodshort-qualifier band).
- Policies: bankfood(warmed(woodcarry(nighttravel))) over competent,
  env gates COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
  POLICY=nighttravel WOODCARRY=1, BANKFOOD=1, WOODWARM as above.
- No confirm spend: this is a census/adjudication run, not a lever
  run. A genuine silence, if proven, is filled by a minimal
  naming/bedding-down hook (policy/transcript level preferred; no
  src/js change unless a code read proves the silence lives there;
  no gate/price/deed change ever).

## Det-gate (instrument honesty)

Seed 17021, 60 loop-days, instrument ON vs OFF: bankfood evening
records, morning records, first-upkeep kcal series, and daily-entry
scholar kcal must be identical. Any divergence = instrument
contamination; the run stops and the instrument is fixed first.

## Metric binding

Pre-registered metrics bind this run. A miss is NO-GO / a verdict
change per the rules above, never re-scored against a friendlier
metric mid-run. If a metric proves wrong, it goes under "metric
review" in the evidence file with a revision proposed for the NEXT
run. Every evidence file carries a "metric review" section.
