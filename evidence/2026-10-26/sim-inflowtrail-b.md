# sim-inflowtrail-b — LANDING (measurement only, zero src/js)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T1529Z, axis
food-economy. Lands the blocked 1438Z arm sim-inflowtrail-b as repo evidence
+ scripts. The analysis is DONE and its verdict is FIXED — this file does
NOT re-judge, re-score, or re-run the question. It lands the 1438Z result
reproducibly and records the reproduction check.

Analyzer: `scripts/analyze-inflowtrail.py` (1438Z original, adapted ONLY so
its corpus path points at the committed repo corpus
`evidence/2026-10-26/sim-inflow-b-corpus/` — logic verified identical
apart from the corpus-path lines).
Proof: `scripts/test-inflowtrail-b.py` (runs the analyzer on the committed
corpus, asserts the fixed numbers; green in this worktree).
Corpus: repo `evidence/2026-10-26/sim-inflow-b-corpus/` cap1 files only
(8 seeds 9750–9757, competent-nofeast, 100d, SEATDRIVE=0 band).
Canon: docs/CANON.md + docs/PRESERVATION.md (smoking is the preservation
step — the racks in question are smoking racks; smoked = 30d, 16 ticks).

## Pre-registration (verbatim bar, written BEFORE the 1438Z analysis)

Question: is inflow-b's "prior stock" RECENT stock (inflow in the trailing
days feeding the racks through the pantry) or OLD/STARTING stock (or an
unrecorded door)?

PRIMARY metric (binds the run, fixed before analysis):
- MEDIAN daysSinceLastInflow across unattributed days ≤ 7 → GO: the gap is
  recent stock; a trailing window explains the unattributed days.
- MEDIAN > 7 → NO-GO: the gap persists beyond a week; the stock is old,
  starting, or arriving through a door this instrument does not see.
- The median is used (not the mean) so a few ancient-stock days cannot be
  hidden by many recent ones, and vice versa.

Neutrality gates (must all pass or the analysis is void):
- Bound-day total across cap1 = 327; attributed = 289; unattributed = 38.
- Same-day attribution reproduces inflow-b's 289/327 exactly.

## Result (verbatim verdict from the 1438Z run, reproduced exactly here)

Neutrality: PASS (exact) — bound days 327, attributed same-day 289,
unattributed 38 — reproduces inflow-b exactly.

PRIMARY: GO — median daysSinceLastInflow = 1.0 (bar ≤ 7).
The 38 "prior stock" days are NOT old stock. Every one of them had inflow
within the trailing 4 days; 32/38 had inflow the very day before.
Distribution of daysSinceLastInflow: 1 day ×32, 2 days ×4, 3 days ×1,
4 days ×1. Zero days with no prior inflow at all.

Secondary (reported, never re-judged as primary):
- Trailing-3d: 37/38 days have inflow (97.4%), median 1,558 kcal.
- Trailing-7d: 38/38 (100%), median 3,300 kcal.
- Trailing-14d: 38/38 (100%), median 7,956 kcal; median trailing-14d kcal /
  pantryFirst = 0.20 (recent inflow is a fifth of the pantry, not the whole).
- Trailing-30d: 38/38 (100%), median 23,826 kcal.
- Trailing-14d door mix (all 38 days): stock 251,346 kcal, deposit 211,500
  kcal, pantryAdd 30,000 kcal — scholar deposits are a large share of
  recent stock, consistent with inflow-b's donation finding.
- Per-seed unattributed: 9750: 13, 9752: 1, 9753: 2, 9755: 7, 9756: 6,
  9757: 9 (9751/9754 had zero bound days on this band).

Verdict (judged against the pre-registered bar, not re-scored):
GO: the inflow-b gap is a same-day-window artifact. Racks are smoked from
yesterday's pantry, not from ancient stock: a trailing window of even 4 days
explains all 38 unattributed days. The "where do full racks come from when
nobody forages" question is closed on this band: from recent inflow
(forage + scholar deposits + contest winnings put away), consumed a day or
two later. No unrecorded door is needed to explain these 38 days.
The remaining open question is NOT provenance but timing: why racks-bound
days fall on no-inflow days (a preserve-scheduling question), which is a
new blank for a later run, not a re-judging of this one.

## Sense samples (plain words — meaning, not just counts)

- Seed 9750 day 51: pantry 24,032 kcal at day start, racks worked, zero
  inflow that day — but 713 kcal "Foraged food" arrived day 50; trailing-7d
  11,086 kcal. The village smoked yesterday's forage, not a mystery stockpile.
- Seed 9750 day 69: pantry 23,668 kcal; 111 kcal foraged food day 68. Even a
  small yesterday-arrival is enough to explain a racks day — the racks draw
  on the pantry as a whole, not on that day's haul.
- Seed 9750 day 73: pantry 27,621 kcal; day 72 brought 600 kcal "Winner's
  share (alien rations)" plus 919 kcal foraged food. Contest winnings put
  away one day become smoked food the next — the pantry is a one-day buffer,
  not a warehouse of ancient stores.

Sense judgment: the story coheres. Every sample shows a village living
hand-to-mouth with a one-day lag: food comes in, sits in the pantry
overnight, and gets smoked the next day. Nothing in the samples suggests
hidden stock, a missing recorder door, or food appearing from nowhere.
The 24k–27k pantry figures look large only until the trailing inflow is
seen — recent inflow is about a fifth of the pantry, so the pantry is
mostly older accumulation, but the racks days themselves always follow a
fresh arrival.

## Metric review

- The pre-registered metric held: median daysSinceLastInflow cleanly
  separated "recent stock" (GO) from "old stock" (NO-GO), and the observed
  median (1.0) sat far inside the GO bar (≤ 7), so the verdict is not
  borderline-sensitive to the bar choice.
- No revision proposed for THIS metric: it answered its question. The
  remaining open question is preserve-scheduling timing — why racks-bound
  days fall on no-inflow days — which is a NEW blank for a later run,
  not a re-judging of this one and not a metric failure.
- Reproduction note: the 1438Z run's saved `inflowtrail-result.json` in
  the goal hidden_files dir is 0 bytes (an EPERM-flap write casualty from
  that run). The authoritative saved result is therefore the 1438Z
  RESULT.md prose + table, and this landing reproduces THAT exactly
  (see "Reproduction check" below) rather than diffing against the empty
  JSON. Nothing was adjusted to force a match.

## Reproduction check (this landing run, 1529Z)

- Analyzer copied to `scripts/analyze-inflowtrail.py` with ONLY the corpus
  path adapted (relative to the script: `../evidence/2026-10-26/
  sim-inflow-b-corpus/`). Logic verified identical to the 1438Z original
  apart from the corpus-path lines.
- Re-run against the committed corpus in this worktree reproduced the
  saved result EXACTLY: neutrality 327/289/38 (pass), median 1.0, GO,
  distribution 1×32/2×4/3×1/4×1, zero no-prior-inflow days, and the full
  38-row table byte-identical to the 1438Z RESULT.md table.
- Proof script `scripts/test-inflowtrail-b.py` runs the analyzer on the
  committed corpus and asserts neutrality 327/289/38 AND median
  daysSinceLastInflow = 1.0 (plus distribution, row count, trailing-7d
  coverage); it exits non-zero on any mismatch. Run green in this
  worktree. It is a .py script, not .js, by design: the analyzer is
  Python, and a .js proof would only shell out to python and assert on
  its output — an extra layer with no value.
- No game harness was run (measurement only, zero src/js) and no jest was
  run (nothing to test in js). No [needs-eyes]: this lands a measurement,
  not a player-visible change.

## Wall numbers (carried from the 1438Z run, SEATDRIVE=0 band)

National / table / wins: 0/8. Wave-4/5 unlocks: 0/8. Median survival:
100d. The scale wall stands on this band; this arm closes a food-economy
provenance blank, it does not move the wall numbers.

## Per-day table (seed, day, daysSinceLastInflow, pantryFirst, trail7kcal, trail14kcal)

9750,51,1,24032,11086,26127
9750,69,1,23668,1363,9750
9750,73,1,27621,2173,4008
9750,75,1,28769,4631,5883
9750,76,2,30369,4520,5883
9750,83,3,23050,1525,6045
9750,84,4,20703,1525,6045
9750,86,1,19360,933,5826
9750,89,1,22627,1684,3209
9750,90,2,22627,1684,3209
9750,92,1,23677,2064,3048
9750,94,1,25177,2209,2800
9750,95,2,26160,1892,2433
9752,90,1,120329,33147,73403
9753,64,1,92196,7727,11975
9753,74,1,91906,6437,10981
9755,40,1,42155,4348,9299
9755,43,1,45275,7850,12575
9755,49,1,48988,5036,13259
9755,60,1,47563,5748,11302
9755,71,1,40577,3245,8348
9755,85,1,39628,3812,8104
9755,100,1,39745,4362,9974
9756,47,1,35423,3239,10487
9756,54,1,48271,3237,6476
9756,67,1,62075,5414,7809
9756,71,1,64237,4236,9487
9756,84,1,58785,3355,6563
9756,90,1,59412,2629,5796
9757,38,1,50428,2117,4668
9757,46,1,52215,11671,13405
9757,68,1,61372,27376,56301
9757,69,2,62372,27002,56086
9757,79,1,53291,14947,29918
9757,89,1,47607,2576,17306
9757,91,1,47733,2793,5234
9757,97,1,41586,2318,4785
9757,99,1,41993,2817,5039
