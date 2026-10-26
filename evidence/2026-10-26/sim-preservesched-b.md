# sim-preservesched-b — why racks-bound days fall on no-inflow days (DIAG ONLY, no game change)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T1630Z, axis
food-economy, arm sim-preservesched-b. Takes the 1529Z next blank (2): the
preserve-scheduling question left open by sim-inflowtrail-b.
Predecessors: sim-inflow-b + sim-inflowtrail-b-land (evidence/2026-10-26/
sim-inflowtrail-b.md): 38 unattributed racks-bound days all had inflow
within the trailing 4 days (median lag 1.0d). Provenance is CLOSED and is
NOT re-judged here. The open question is TIMING only.
Analyzer: `scripts/analyze-preservesched-b.js`. Proof:
`scripts/test-preservesched-b.js` (green in this worktree, see
"Reproduction check" below).
Canon: docs/CANON.md + docs/PRESERVATION.md (ladder: cleaned 2d < cooked
5d < smoked 30d; smoking 16 ticks; "rot can't be smoked back into food").

## Pre-registration (binding, MEASUREMENT.md §14)

Method first: read-only analysis of the COMMITTED inflow-b /
inflowtrail corpora (`evidence/2026-10-26/sim-inflow-b-corpus/`, cap1
files only, 8 seeds 9750–9757, competent-nofeast, 100d, SEATDRIVE=0 band).
NO fresh sweep was run, because the brief's fresh-sweep condition did
NOT trigger: the committed corpora DO carry the scheduling fields —
preserve-action day (the racks-bound day set), per-cook-line trigger
state (racksFull recompute, eligiblePresent/Count/Kcal, preservedKcal,
rackCap, pantry snapshot, throttle state), and counted inflow records
by day/door. What they lack (eligible-stack spoilDays, haven tier) is
named under "Metric review" as the residual-settling instrument, not
bridged by an unneeded sweep.

Primary metric (from the brief): for each racks-bound day, the lag to
the most recent inflow day AND the scheduling rule that put a preserve
action on that day.
GO threshold (from the brief): one named scheduling rule explains
>= 80% of racks-bound days' timing (lag distribution + trigger
condition both stated). Below 80% is DIAG-NO-GO with the residual
decomposition named — never re-scored mid-run.

Coverage counting rule (fixed in the analyzer header before the verdict
was computed): a day is EXPLAINED iff ALL of: lag to the most recent
counted-inflow day in {1,2} AND eligibleAny true on that day AND the
first bound cook line's racksFull recompute true. GO iff explained /
38 >= 0.80 (i.e. >= 31 days). Counting rule for "counted inflow"
(identical to inflow-days.js): a record counts iff it is not a refused
pantryAdd (added === false) and kcal > 0; a day "has inflow" iff its
counted kcal > 0.

## The named rule: SPOIL-CLOCK + RACKS-FULL

A racks-bound day fires when BOTH hold at a cook resolution:

(a) the preserved stockpile is at/over that cook's rack cap
    (rackCap = 125 x roster x (ownShelf - 2); ownShelf 15 unskilled,
    30 + 5 x skill skilled), AND
(b) an about-to-rot surplus sits in the pantry: a stack with
    spoilDay - day <= 2 that is not yet spoiled.

The timing comes from the spoil clock, read from code (not inferred
from the corpus):

- `stockPantry` (game.js) stamps every stock-door arrival with
  spoilDay = arrival day + 3 (+ granary bonus, 0 below haven tier 3).
- The cook branch's eligible window is spoilDay - day <= 2, with
  spoiled stacks (spoilDay <= day) excluded.
- So a stock arrival is NEVER eligible on its arrival day (spoilDay -
  day = 3), becomes eligible the NEXT day (2), and stays eligible one
  more day (1). Merged stacks share the clock: `stacksMatch` (food.js)
  gates merges on identical spoilDay, so a fresh arrival cannot ride
  an older stack's clock or vice versa.
- The racks-full voice fires only on racksFull AND eligible present,
  so the bound day is exactly the day the spoil window opens on a
  stockpile that is already over the cap.

Plain-words version: the cook smokes yesterday's pantry, never today's
haul. A bound day with no inflow of its own is the NORMAL case, not an
anomaly: the inflow that matters arrived yesterday (or the day before),
and today's inflow — if any arrived at all — is still too fresh to
smoke. The same full pantry that fills the racks also trips the
production throttle (pantryFreshDays > 4 redirects forage/garden/fish
duty to wood/water/stone work), which is why the bound day so often
has no forage inflow at all: the village is not out foraging because
the shelves are already full.

## Result: GO — 36/38 = 94.7% explained (bar 80%)

Neutrality: PASS (exact) — bound days 327, attributed same-day 289,
unattributed 38 — reproduces inflow-b exactly. Attribution-flag
reproduction: 0 mismatches across all 327 days (counted-inflow rule
reproduces attributionTable.attributed exactly).

Lag distribution (the 38): 1 day x32, 2 days x4, 3 days x1, 4 days x1.
Median lag 1.0.

Trigger legs on the 38 (each measured from the corpus cook lines, not
assumed):
- eligibleAny true: 38/38. Every bound day really had an
  about-to-rot surplus at a bound line.
- first bound line's racksFull recompute true: 38/38 (ctxOk 38/38).
- preservedFirst >= that line's rackCap: 38/38.
- throttleFirst true: 38/38. Every one of the 38 was a
  throttle-engaged day — the pantry was full enough to stand
  foragers down, which is the no-inflow half of the story.
- First bound line frame: 19 spoken racks-full, 19 plain (silenced by
  the racks-voice reminder gate — voice gating, not scheduling).
  First bound resolution: resIndex 1 on 29 days, resIndex 2 on 9 days
  (on those 9, the day's first cook resolution worked the racks, and
  the wall appeared at the second resolution).
- 11/38 bound days have a worked line at all: a "racks-bound day" is
  not a "nothing smoked" day — the cook often smokes a few batches
  first and then hits the cap.

PRIMARY: 36/38 explained = 94.7% >= 80% bar -> GO.
Secondary (reported, never judged as primary):
- Stock-window variant (primary legs + stock-door kcal > 0 on days
  D-2..D-1, the arrivals whose eligible window covers day D): also
  36/38. The same 2 days fail both versions.
- Base rate: 102/745 days (13.7%) across the band have zero counted
  inflow. Bound days' no-inflow share is 38/327 = 11.6% — slightly
  BELOW the background rate. Racks-bound days are not
  disproportionately no-inflow days; there is no extra timing anomaly
  left once the spoil clock is understood.
- Corroboration on the 289 attributed days: lag to the most recent
  inflow BEFORE the bound day (excluding same-day inflow) is 1 on
  256, 2 on 28, 3 on 4, 5 on 1 — 284/289 (98.3%) at lag <= 2. The
  day-after pattern schedules ALL bound days, not just the 38; the 38
  are simply the bound days where no new inflow arrived on top.
- Day-of-week null check: bound days by day mod 7 are 52/49/45/42/
  46/46/47 — flat. No weekly or phase scheduling is hiding here.
- Within-day order (cook line vs forage return, shared say-seq
  counter): only 1 comparable case exists on bound days, because
  forage almost never returns on a bound day (throttle). That single
  case had the return before the bound line. Inconclusive on its own
  — and unnecessary: the spoil clock makes same-day arrivals
  ineligible regardless of within-day order, so no ordering claim is
  needed for the rule.

Verdict (judged against the pre-registered bar, not re-scored): GO.
One named scheduling rule — SPOIL-CLOCK + RACKS-FULL — explains
94.7% of the racks-bound days' timing, with the trigger condition
measured on every day, not just the lag. The preserve-scheduling
question is closed on this band: racks-bound days fall on no-inflow
days because the preserve action is scheduled by yesterday's inflow
reaching its spoil window, on a pantry-full day when the throttle has
already stood the foragers down.

## Residual cases (quoted individually — 2/38, 5.3%)

Seed 9750, day 83 (lag 3): last inflow day 80, 367 kcal stock
"Foraged food". Eligible 2,000 kcal, throttle on, preserved 13,033 vs
cap 13,000, spoken racks-full line by Sierra (resIndex 2; her first
resolution that day worked the racks: 3 batches, ~914 kcal). Day 83
also had 2 silenced bound lines.
Seed 9750, day 84 (lag 4): same last inflow (day 80, 367 kcal).
Eligible 3,567 kcal, throttle on, preserved 13,686 vs cap 13,000,
spoken racks-full line by Sierra (resIndex 2; first resolution worked
3 batches, ~3,200 kcal). Day 84 also had 1 silenced bound line.

Residual decomposition (named, not hidden): both days are one
consecutive pair after a 4-day inflow gap (days 81–84 have zero
counted inflow; the day-80 arrival is the last inflow for both).
Under a granary-0 clock the day-80 stock arrival is eligible only on
days 81–82, so neither day is explained by it. Two candidates fit
what is observed, and the corpus cannot separate them:
(1) GRANARY-SHIFTED CLOCK: at haven tier >= 3 the granary bonus is
+3, so day-79 stock arrivals (342 kcal "Foraged food") carry spoilDay
85 and are eligible exactly on days 83–84, and day-80 arrivals carry
spoilDay 86 (eligible 84–85). This fits both days exactly — but haven
tier is not in the corpus, so tier >= 3 is unproven here.
(2) OLDER NON-STOCK PANTRY ITEMS: the eligible pile GREW from 2,000
kcal (day 83) to 3,567 kcal (day 84) with zero inflow in between,
which proves the eligible set is a rolling window over older stock,
not the last inflow: items whose spoilDay was 3+ days out on day 83
ripened into the window on day 84. Cooked items (5d shelf) or
deposit-door items with their own spoilDays could supply those
stacks. The corpus records no stack spoilDays, so the supplying
stacks cannot be named.
Either way the miss is 2 days out of 38, inside the 20% allowance,
and neither residual reopens provenance: both days still had
eligible surplus present, racks over cap, and throttle on — only
the lag leg misses, by 1–2 days, after a 4-day inflow gap.

Reading caveat (recorder semantics, affects how bound days read):
a "worked" line can carry racksFull true in its recompute, because
the recompute reads the pantry AFTER that resolution smoked — the
first resolution smokes, pushes preserved over the cap, and later
resolutions that day hit the wall. The day-set definition (substrate-
days.js) correctly excludes worked lines from marking a day bound;
the bound lines are the later racksFull/plain ones. This is why 9
of the 38 first bind at resIndex 2 rather than 1.

## Sense samples (plain words — meaning, not just counts)

- Seed 9755, day 43 (lag 1, spoken): Otto's first resolution works
  the racks (3 batches, ~1,276 kcal), his second hits the wall and
  says so: "The racks are already full (20,320 kcal kept — more than
  the haven can eat before it turns), so Otto left the fresh pile
  for tonight's dinner instead of smoking it onto the rot pile."
  The same day, Alfredo is redirected at the treeline: "the shelves
  are full, ~26 days of fresh on hand… leaves the harvest standing
  and turns to the water run instead." One day, one story: too much
  food, racks full, foragers stood down, cook honest about it.
- Seed 9757, day 68 (lag 1, spoken): Miguel works 2 batches
  (~3,160 kcal), then hits the wall at resIndex 2, then two more
  plain cook lines. The day before brought 11,412 kcal, mostly
  scholar deposits of Muscadine Grapes (10,890 kcal) plus 522 kcal
  stock — yet the bound day still lands exactly one day later. The
  village smoked yesterday's put-away food, deposits included; the
  pantry is a one-day buffer, not a warehouse.
- Seed 9750, days 83–84 (residual pair): Sierra smokes on both days
  and complains on both days, while nothing new arrives for four
  days. The village is living off the pile it already has, watching
  older food ripen into the smoke window day by day. Nothing here
  suggests hidden stock, a missing recorder door, or food appearing
  from nowhere — it suggests a pantry so full that the throttle has
  stood everyone down for days, and the racks are the bottleneck.

Sense judgment: the story coheres. A racks-bound day reads as a
village with a full pantry, a full rack, and yesterday's food going
soft: the cook smokes what fits, says plainly when the racks are
full, and the foragers are already doing wood and water runs because
the shelves cannot take more. The "no inflow" half is not a mystery
to solve but the other half of the same sentence — the day the
village stops bringing food in is the day it has to deal with the
food it already has.

## Wall numbers (corpus band, competent-nofeast, seeds 9750–9757)

National / table / wins: 0/8. Wave-4/5 unlocks: 0/8. Wave reach:
wave 3 on 4 seeds (9750, 9753, 9754, 9755), wave 2 on the rest.
Median survival: 100d (censored at the 100d horizon; 2 villages
lost early — 9751 at day 48, 9754 at day 97). Deaths 43 total; top
causes: the arena 15, starvation 7, monster 4, a wound that wouldn't
close 4, sickness 4, ambush 3, dehydration 3, old stare 1, alien 1,
lockjaw 1. Rank stayed village on all 8 seeds. Arc II/III/IV and
regional-stage reach are not recorded in this corpus (its top-level
fields carry waveReach, rank, national, table, win only) and are not
estimated here. The scale wall stands on this band; this arm closes
a food-economy timing blank, it does not move the wall numbers.

## Metric review

- The pre-registered metric held: the coverage predicate (lag in
  {1,2} + eligible present + racksFull at the bound line) cleanly
  separated the explained 36 from the residual 2, and the observed
  coverage (94.7%) sits far inside the GO bar (80%), so the verdict
  is not borderline-sensitive to the bar choice. Transparency note:
  the lag distribution itself was already known from inflowtrail
  (1x32/2x4/3x1/4x1); what this arm newly measured was the trigger
  half — eligibleAny, racksFull, rackCap, throttle — which turned
  out to be 38/38 on every leg. The verdict rests on the conjunction,
  not on the lag alone.
- Limitation, stated honestly: lag-to-last-inflow is a PROXY for the
  spoil clock, not a proof that the last inflow supplied the
  eligible stacks. The mechanism leg is code-side (spoilDay =
  arrival + 3, eligible window spoilDay - day <= 2, spoilDay-gated
  merges), and the corpus legs (eligible present, racks over cap,
  throttle on) are consistent with it on all 38 days — but the
  corpus cannot name the supplying stacks. The one place the proxy
  visibly strains is the residual pair, where the eligible pile
  grows with zero inflow: the window rolls onto older stock, and
  lag-to-last-inflow stops tracking the supplier.
- No revision proposed for THIS metric: it answered its question.
  For a future run that wants to settle the residual pair: capture,
  at each bound line, the eligible stacks' spoilDay values and the
  haven tier (granary bonus). Those two fields separate
  granary-shifted stock from older non-stock items. No fresh sweep
  was needed for this arm's verdict, and none is claimed.
- Out-of-arm observation (logged, not chased): first-bound-line
  fresh-days snapshots on bound days run 4.6 to 249.8 days (seed
  9753 day 74: 249.8 fresh days; seed 9753 day 64: 221.7). The
  throttle saturates above 4 days, so nothing in this arm turns on
  the top of that range — but a pantry holding ~250 days of fresh
  food is worth its own look. Appended to sim-findings.md, not
  investigated here.

## Reproduction check (this run)

- Analyzer `scripts/analyze-preservesched-b.js` runs read-only
  against the committed corpus (cap1 files only) and prints the
  neutrality, lag distribution, primary verdict, secondaries, wall
  numbers, and the 38-row table.
- Proof `scripts/test-preservesched-b.js` requires the analyzer and
  asserts: neutrality 327/289/38, attribution-flag reproduction
  (0 mismatches), lag distribution exactly 1x32/2x4/3x1/4x1, median
  lag 1.0, coverage arithmetic recomputed independently (36/38),
  verdict GO at the 80% bar, trigger legs 38/38 each (eligibleAny,
  racksFull, ctxOk, throttleFirst, preservedFirst >= rackCap),
  stock-window variant 36/38, residuals exactly (9750,83) and
  (9750,84) with zero stock-window kcal, corpus validity (8 cap1
  files, no truncation flags), wall numbers, and the attributed-day
  corroboration (284/289 at lag <= 2). Run green in this worktree:
  all checks PASS, exit 0.
- No game harness was run (measurement only, zero src/js) and no
  jest was run (nothing to test in js — the proof is node, not
  jest). No [needs-eyes]: this lands a measurement, not a
  player-visible change.
- Per-day table: the 38-row table below is the analyzer's output
  verbatim. "stockWin" = stock-door kcal on days D-2..D-1 (the
  arrivals whose eligible window covers day D). "last inflow" names
  the most recent counted-inflow day before D with its door split
  (stock/dep/add).

## Per-day table (seed, day, lag, last inflow, elig?, eligKcalMax, throttle, preservedFirst, rackCap, spoken, silenced, stockWin)

| seed | day | lag | last inflow (day, kcal, doors) | elig? | eligKcalMax | throttle | preservedFirst | rackCap | spoken | silenced | stockWin |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 9750 | 51 | 1 | d50, 713 (Foraged food; stock 713/dep 0/add 0) | true | 3600 | true | 14782 | 14625 | 0 | 3 | 1300 |
| 9750 | 69 | 1 | d68, 111 (Foraged food; stock 111/dep 0/add 0) | true | 3768 | true | 14639 | 14625 | 0 | 3 | 211 |
| 9750 | 73 | 1 | d72, 1519 (Winner's share (alien rations)+Foraged food; stock 919/dep 0/add 600) | true | 4511 | true | 13398 | 13000 | 0 | 3 | 1171 |
| 9750 | 75 | 1 | d74, 2558 (Winner's share (alien rations)+Foraged food; stock 158/dep 0/add 2400) | true | 2452 | true | 14390 | 13000 | 0 | 3 | 158 |
| 9750 | 76 | 2 | d74, 2558 (Winner's share (alien rations)+Foraged food; stock 158/dep 0/add 2400) | true | 6571 | true | 14390 | 13000 | 0 | 3 | 158 |
| 9750 | 83 | 3 | d80, 367 (Foraged food; stock 367/dep 0/add 0) | true | 2000 | true | 13033 | 13000 | 1 | 2 | 0 |
| 9750 | 84 | 4 | d80, 367 (Foraged food; stock 367/dep 0/add 0) | true | 3567 | true | 13686 | 13000 | 1 | 1 | 0 |
| 9750 | 86 | 1 | d85, 224 (Foraged food; stock 224/dep 0/add 0) | true | 2200 | true | 13686 | 13000 | 0 | 3 | 224 |
| 9750 | 89 | 1 | d88, 1143 (Foraged food; stock 1143/dep 0/add 0) | true | 3024 | true | 14493 | 13000 | 0 | 3 | 1460 |
| 9750 | 90 | 2 | d88, 1143 (Foraged food; stock 1143/dep 0/add 0) | true | 3424 | true | 14493 | 13000 | 0 | 3 | 1143 |
| 9750 | 92 | 1 | d91, 380 (Foraged food; stock 380/dep 0/add 0) | true | 6160 | true | 13887 | 13000 | 1 | 2 | 380 |
| 9750 | 94 | 1 | d93, 369 (Foraged food; stock 369/dep 0/add 0) | true | 2800 | true | 14961 | 13000 | 0 | 3 | 369 |
| 9750 | 95 | 2 | d93, 369 (Foraged food; stock 369/dep 0/add 0) | true | 5580 | true | 14961 | 13000 | 0 | 3 | 369 |
| 9752 | 90 | 1 | d89, 4581 (Snared meat+Staghorn Sumac; stock 381/dep 4200/add 0) | true | 28887 | true | 50921 | 47500 | 0 | 4 | 493 |
| 9753 | 64 | 1 | d63, 930 (Snared meat+Foraged food; stock 930/dep 0/add 0) | true | 6874 | true | 49219 | 14625 | 0 | 3 | 1126 |
| 9753 | 74 | 1 | d73, 961 (Foraged food+Pit meat (White-tailed Deer); stock 961/dep 0/add 0) | true | 8627 | true | 49219 | 14625 | 0 | 3 | 2645 |
| 9755 | 40 | 1 | d39, 396 (Foraged food; stock 396/dep 0/add 0) | true | 3000 | true | 21259 | 19500 | 1 | 2 | 396 |
| 9755 | 43 | 1 | d42, 259 (Foraged food; stock 259/dep 0/add 0) | true | 3000 | true | 20320 | 19500 | 1 | 0 | 4455 |
| 9755 | 49 | 1 | d48, 354 (Foraged food; stock 354/dep 0/add 0) | true | 8855 | true | 19911 | 19500 | 1 | 0 | 1011 |
| 9755 | 60 | 1 | d59, 778 (Foraged food; stock 778/dep 0/add 0) | true | 6433 | true | 21268 | 17875 | 1 | 0 | 778 |
| 9755 | 71 | 1 | d70, 1185 (Foraged food+Snared meat; stock 1185/dep 0/add 0) | true | 4000 | true | 18260 | 16250 | 0 | 1 | 1185 |
| 9755 | 85 | 1 | d84, 636 (Foraged food; stock 636/dep 0/add 0) | true | 5359 | true | 17536 | 16250 | 1 | 0 | 1288 |
| 9755 | 100 | 1 | d99, 783 (Foraged food+American Persimmon; stock 133/dep 650/add 0) | true | 5232 | true | 18177 | 16250 | 1 | 0 | 598 |
| 9756 | 47 | 1 | d46, 646 (Foraged food; stock 646/dep 0/add 0) | true | 4860 | true | 22232 | 16250 | 1 | 0 | 779 |
| 9756 | 54 | 1 | d53, 722 (Foraged food; stock 722/dep 0/add 0) | true | 4756 | true | 35988 | 16250 | 1 | 0 | 1283 |
| 9756 | 67 | 1 | d66, 420 (Foraged food+American Persimmon; stock 160/dep 260/add 0) | true | 6816 | true | 48120 | 16250 | 0 | 3 | 389 |
| 9756 | 71 | 1 | d70, 675 (Foraged food; stock 675/dep 0/add 0) | true | 6760 | true | 48120 | 16250 | 0 | 2 | 1395 |
| 9756 | 84 | 1 | d83, 593 (Foraged food; stock 593/dep 0/add 0) | true | 3901 | true | 49016 | 16250 | 1 | 1 | 959 |
| 9756 | 90 | 1 | d89, 910 (American Persimmon; stock 0/dep 910/add 0) | true | 4047 | true | 49776 | 16250 | 1 | 3 | 173 |
| 9757 | 38 | 1 | d37, 619 (Foraged food; stock 619/dep 0/add 0) | true | 7121 | true | 18211 | 17875 | 1 | 4 | 757 |
| 9757 | 46 | 1 | d45, 134 (Foraged food; stock 134/dep 0/add 0) | true | 2800 | true | 19484 | 17875 | 1 | 3 | 666 |
| 9757 | 68 | 1 | d67, 11412 (Foraged food+Muscadine Grapes; stock 522/dep 10890/add 0) | true | 13798 | true | 18870 | 17875 | 1 | 3 | 1966 |
| 9757 | 69 | 2 | d67, 11412 (Foraged food+Muscadine Grapes; stock 522/dep 10890/add 0) | true | 15244 | true | 18870 | 17875 | 0 | 5 | 522 |
| 9757 | 79 | 1 | d78, 125 (Foraged food; stock 125/dep 0/add 0) | true | 2722 | true | 18178 | 16250 | 1 | 3 | 375 |
| 9757 | 89 | 1 | d88, 604 (Foraged food; stock 604/dep 0/add 0) | true | 3390 | true | 19011 | 16250 | 1 | 3 | 953 |
| 9757 | 91 | 1 | d90, 500 (Foraged food; stock 500/dep 0/add 0) | true | 9128 | true | 19011 | 16250 | 0 | 5 | 500 |
| 9757 | 97 | 1 | d96, 347 (Foraged food; stock 347/dep 0/add 0) | true | 4056 | true | 19068 | 16250 | 0 | 5 | 781 |
| 9757 | 99 | 1 | d98, 999 (Foraged food; stock 999/dep 0/add 0) | true | 3634 | true | 19113 | 16250 | 1 | 3 | 999 |
