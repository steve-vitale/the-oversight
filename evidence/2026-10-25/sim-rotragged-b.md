# sim-rotragged-b — DIAG: why is the preserver step ragged? (winners and losers by seed)

Run: oversight-flesh-out-loop-b-20261025T1430Z, arm sim-rotragged-b,
axis food-economy. Worktree: `~/workspace/worktrees/sim-rotragged-b`,
branch sim-rotragged-b.

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was
written BEFORE any new statistic was computed in this run. Prior runs'
numbers quoted in the background section are quoted, not recomputed;
every new table in the RESULTS section is judged ONLY against this
header. This is a DIAG question, NOT a verdict question.

## Canon read first

- `docs/CANON.md` (manifest) then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; blind penalties teach once).
  The preserver-widening commit 75fdd9258 widens
  SPECIALTIES.preserver from ghost occupations matching nothing to
  the real occupation pool — a hypothesis about preservation
  throughput, not a finding.
- No canon doc covers plentydepri's tradeoff or the rot-ratio
  instrument — both are measured properties, not designed values.

## Background (quoted from prior runs, NOT re-judged here)

- leg2decide (seeds 9266-9281, evidence/2026-10-24/sim-leg2decide-b.md):
  deciding verdict STEP CONFIRMED, median step ratio 0.404x
  (M(parent) 0.487, M(commit) 0.196). Its distribution note: 9/16
  seeds byte-identical, 5 moved down, 1 moved up slightly.
- rotdecide-govern (seeds 9310-9325,
  evidence/2026-10-24/sim-rotdecide-govern-b.md): governing verdict
  STEP (CONTESTED), governing step 0.645x (M(parent) 0.298,
  M(commit) 0.192). Its sensitivity note: 5 identical, 4 down,
  3 up, 2 degenerate.
- NEITHER verdict is re-judged here. This run asks only: the step
  is real but ragged — winners and losers by seed, not a uniform
  improvement. WHAT behavior differs on winner vs loser seeds?

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

- Pair under test, ONLY pair: preserver widening, parent -> commit
  = 1f24a4ef04a857d33138fd0845cfa83df688285c ->
  75fdd92587ad9d83bb12f05da535cdfb49255835. Same pair as
  leg2decide / rotdecide-govern. No new sweeps: existing corpora
  only (no new anchor sweeps).
- Primary corpus: evidence/2026-10-24/leg2decide-b-corpus/
  (per-seed files only; the 4 sweep-*.json summaries are NOT
  analyzer inputs). Seeds 9266-9281, 16 seeds x {pd0, pd1} x
  {parent, commit} = 64 per-seed files.
- Cross-check corpus: evidence/2026-10-24/rotdecide-govern-b-corpus/
  (per-seed files only; govern-input.json and sweep-*.json are NOT
  analyzer inputs). Seeds 9310-9325, 64 per-seed files.
- Instrument: scripts/analyze-rotragged-b.js (new, this run).
  It reads ONLY per-seed files. It recomputes every ratio from
  raw rot/days fields; it never trusts a prior run's printed
  ratio.

### (1) Per-seed classification rule (fixed here, applied identically to both corpora)

For anchor A, side S, seed s:
rot100d(A, S, s) = (rotFreshKcal + rotPreservedKcal) / daysAlive * 100.
r(A, s) = rot100d(A, pd1, s) / rot100d(A, pd0, s).
step(s) = r(commit, s) / r(parent, s) when both ratios are defined
and r(parent, s) != 0.

Because the sims are deterministic (prior runs reproduced cells
byte-identically on re-run), exact equality is meaningful: there
is no sampling noise within a seed, so NO tolerance band is used.
A 0.968 step is a genuine small move, not noise.

- degenerate: (a) rot100d pd0 = 0 on either anchor, so a ratio is
  undefined (excluded from medians, counted); OR (b) pd1 rot = 0
  on BOTH anchors, so both ratios are 0 and carry no step
  information. Per-seed step undefined; counted separately, never
  folded into identical/down/up.
- identical: both ratios defined, r(commit, s) == r(parent, s)
  exactly. Corroborated (not classified) by a cell-level check:
  whether all four cells' rot/days fields match parent->commit.
- down: both ratios defined, r(commit, s) < r(parent, s).
  Magnitude: sharp step <= 0.50; mild 0.50 < step < 1.
  Zero-crossing down-to-zero (r(parent) > 0, r(commit) = 0):
  step 0.000, down sharp.
- up: both ratios defined, r(commit, s) > r(parent, s).
  Magnitude: mild 1 < step <= 2; sharp step > 2.
  Zero-crossing up-from-zero (r(parent) = 0, r(commit) > 0, and
  not degenerate case (b)): step undefined, reported as
  "up from zero", counted as up.

### (2) Attribution rule per moved seed (fixed here)

For a moved (down or up, non-degenerate) seed, let N = rot100d(pd1),
D = rot100d(pd0); Nc/Np and Dc/Dp are commit/parent values.
logN = ln(Nc/Np), logD = ln(Dc/Dp) when both sides are positive.
The ratio moves down when logN - logD < 0, up when > 0.

- numerator-driven: logN pushes the ratio-move way AND logD is
  zero or pushes the opposite way (the pd1 side alone drives it;
  the pd0 side resists or is still).
- denominator-driven: -logD pushes the ratio-move way AND logN is
  zero or pushes the opposite way (the pd0 side alone drives it).
- both: logN AND -logD both push the ratio-move way (both sides
  reinforce the move).
- zero-crossing: if N or D is zero on one anchor, the log is
  undefined; attribute by the direction of the zero-crossing side
  if it alone moves, else "both (zero-crossing)" if both sides
  push the move way. If the numbers genuinely do not support any
  of the above, report "ambiguous" with the raw numbers — never
  force an attribution.
- Attribution is on rot100d RATES (daysAlive-normalized), not raw
  kcal. Raw kcal moves are reported alongside for sense. Where a
  side's daysAlive changed parent->commit, that is flagged, since
  a rate can move on lifespan alone.

### (3) Behavior correlates to test (only from fields actually present)

Per-seed files contain: seed, policy, plentydepri, depositgate,
daysAlive, villageDays, rotFreshKcal, rotPreservedKcal, depriKcal,
deathCauses, national, table, win, waveReach (list of waves
reached; max = last element), medianSurvival, anchorCommit.
Correlates tested, per moved seed and per class:

- fresh-vs-preserved rot split: rotFreshKcal / total rot and
  rotPreservedKcal / total rot per cell, parent->commit.
- depriKcal per cell, parent->commit, pd0 vs pd1.
- daysAlive, national, waveReach max, deathCauses, villageDays
  parent->commit (does the class track survival/standing/wave?).
- Class summaries: for identical vs down vs up seeds, the median
  pd0 rot100d move and pd1 rot100d move, and the share of seeds
  whose fresh-rot share rose.

EXPLICITLY NOT IN THE FILES (a correlate not in the files is
reported as absent, never invented): villager dialogue or
transcripts; preservation action counts (how much was smoked,
rendered, or made into pemmican); pantry stocks; haul amounts;
per-day trajectories; per-villager behavior. Any claim about
"preservers did X" beyond the rot/depri/survival signatures
above is out of scope for this DIAG.

### DIAG-COMPLETE bar (pre-registered)

100% of primary-corpus seeds classified, every moved seed
attributed, plus a sense sample read (at least one down-mover,
one identical seed, and one up/degenerate seed if present, in
plain words). If the files cannot support a correlate, that is
a documented DIAG limit, not a hidden failure.

### Balanced panel (§15)

Panel inapplicable: measurement DIAG on existing corpora, not a
before/after lever landing; the panel driver cannot run
env-gated cross-tree anchor sweeps (documented #797 invalidity,
as in leg2decide / rotdecide-govern). The verdict question is
not re-judged at all, so there is no before/after comparison to
panel.

### DIAG scope

Zero src/js game changes. Analyzer + proof test + evidence only.

## Metric review (filled after the results, §14 — revisions apply to the NEXT run)

- The pre-registered rules worked as written and needed no mid-run
  repair: exact-equality identical classification fits deterministic
  sims (9/16 primary seeds exactly equal; cross-check adds the
  nuance below, not a contradiction).
- NUANCE FOUND, NOT A RULE CHANGE: ratio-identical is NOT
  cell-identical. Cross-check seeds 9318 and 9324 have identical
  ratios but moved depriKcal slightly (9318: 208,166 -> 209,172;
  9324: 97,346 -> 96,069, both <1.5%). A future pre-registration
  that claims "identical seeds" should state whether it means
  ratio-identical or cell-identical; this run reports both.
- The degenerate class correctly lumps nothing silently: the
  reason field keeps undefined-ratio (pd0 rot 0) apart from
  pd1-rot-zero-both, and they behave differently (9325's pd0 rot
  halves on commit yet stays degenerate — the ratio cannot see it).
- Class medians hide the split this DIAG exists to expose: the
  median pd1 rot move among primary down-movers is exactly 1.000x
  (two numerator collapses averaged against three denominator
  blowups). The per-seed attribution table, not any class median,
  is the necessary display for a ragged step.
- PROPOSED FOR THE NEXT RUN (diagnostic only, never a re-score
  of this DIAG): a throughput companion metric — total
  (rot + deprioritized) kcal per village-day — because the ratio
  alone REWARDS a denominator blowup: a village that rots far more
  without depri scores as an "improvement." Any future verdict
  that uses the ratio should report the throughput companion
  beside it so a hoard-and-rot blowup cannot masquerade as a win.
- Degenerate medians print NaN for 0/0 pd1 moves in the raw
  summary script; the evidence tables below report those as n/a.
  No verdict or classification depends on them.

## RESULTS (appended after the pre-registration above; judged ONLY against the header)

### Corpus completeness

- Primary (leg2decide-b-corpus, seeds 9266-9281): 64/64 per-seed
  files, 0 zero-byte, all anchor tags + filename seeds + contrast
  (leadfeast/dg1/pd side) matching. The 4 sweep-*.json summaries
  in the dir were NOT analyzer inputs.
- Cross-check (rotdecide-govern-b-corpus, seeds 9310-9325): 64/64
  per-seed files, same checks passing. govern-input.json and the
  8 sweep-*.json summaries were NOT analyzer inputs.
- Analyzer reproduces both prior runs' medians exactly from raw
  files (primary M 0.487/0.196, step 0.404; cross-check M 0.298/
  0.192, step 0.645), so the classification below sits on the same
  numbers — but no verdict is re-judged here.
- Sanity: pd0 depriKcal is 0 in all 32 primary and all 32
  cross-check pd0 cells — pd0 really is the no-depri side.

### Primary classification table — every seed (9266-9281)

r = rot100d(pd1)/rot100d(pd0). rot100d = (fresh + preserved rot) /
daysAlive * 100. "Cells ident." = all four cells' rot/depri/days/
national/wave fields equal parent->commit.

Seed | class | step | r(parent) | r(commit) | attribution | cells ident.
9266 | down sharp | 0.055 | 1.258 | 0.069 | numerator-driven | no
9267 | identical | 1.000 | 0.020 | 0.020 | n/a | yes
9268 | degenerate (pd1-zero-both) | n/a | 0.000 | 0.000 | n/a | yes
9269 | down sharp | 0.450 | 0.062 | 0.028 | numerator-driven | no
9270 | identical | 1.000 | 1.427 | 1.427 | n/a | yes
9271 | identical | 1.000 | 2.977 | 2.977 | n/a | yes
9272 | identical | 1.000 | 0.225 | 0.225 | n/a | yes
9273 | identical | 1.000 | 0.203 | 0.203 | n/a | yes
9274 | down sharp | 0.257 | 0.738 | 0.190 | denominator-driven | no
9275 | down sharp | 0.359 | 1.053 | 0.378 | denominator-driven | no
9276 | identical | 1.000 | 1.379 | 1.379 | n/a | yes
9277 | down sharp | 0.302 | 0.370 | 0.112 | denominator-driven | no
9278 | identical | 1.000 | 0.175 | 0.175 | n/a | yes
9279 | identical | 1.000 | 0.603 | 0.603 | n/a | yes
9280 | identical | 1.000 | 14.960 | 14.960 | n/a | yes
9281 | up mild | 1.064 | 0.047 | 0.050 | numerator-driven | no

Counts: identical 9, down 5 (all sharp), up 1 (mild), degenerate 1.
DIAG-COMPLETE bar, primary half: 16/16 classified.

### Primary attribution table — every moved seed (6)

rot100d parent->commit; fresh share = fresh / total rot per cell;
depri = pd1 depriKcal parent->commit (pd0 depri is 0 throughout).

Seed | move | pd0 rot100d | pd1 rot100d | pd0 fresh share | pd1 fresh share | pd1 depri | what else changed
9266 | down 0.055, numerator | 5,805 -> 5,805 (flat) | 7,303 -> 400 | 1.00 -> 1.00 | 1.00 -> 0.00 | 295,711 -> 190,712 | pd1 wave 3 -> 4
9269 | down 0.450, numerator | 148,149 -> 148,149 (flat) | 9,162 -> 4,120 | 0.96 -> 0.96 | 0.64 -> 0.54 | 157,633 -> 154,756 | pd1 wave 4 -> 3
9274 | down 0.257, denominator | 22,598 -> 125,990 (5.6x) | 16,688 -> 23,949 | 0.83 -> 1.00 | 0.95 -> 0.66 | 308,485 -> 356,910 | pd1 wave 4 -> 2
9275 | down 0.359, denominator | 41,541 -> 115,793 (2.8x) | 43,743 -> 43,743 (flat) | 1.00 -> 0.94 | 0.96 -> 0.96 | 183,729 -> 183,729 (flat) | pd0 days 73 -> 100, pd0 national false -> true
9277 | down 0.302, denominator | 60,432 -> 252,977 (4.2x) | 22,361 -> 28,303 | 0.67 -> 0.89 | 0.89 -> 0.80 | 157,596 -> 344,192 (2.2x) | pd0 wave 3 -> 2
9281 | up 1.064, numerator | 483,868 -> 483,868 (flat) | 22,850 -> 24,309 | 0.97 -> 0.97 | 0.75 -> 0.75 | 112,527 -> 101,479 | pd1 days 100 -> 94

Moved-seed pattern, primary: pd0 rot rises in 3/6, flat in 3/6,
falls in 0/6. NO down-move ever involved pd0 rot falling. Class
medians: down-movers' median pd0 move 2.787x, median pd1 move
1.000x (the split averaged flat — see metric review); identical
seeds' median moves 1.000x on both sides.

### Cross-check classification + attribution (9310-9325, same rules)

Seed | class | step | attribution | the move in one line
9310 | degenerate (undefined-ratio) | n/a | n/a | pd0 rot 0 both anchors; pd1 rot 25,439 both, identical
9311 | identical | 1.000 | n/a | cells identical
9312 | degenerate (undefined-ratio) | n/a | n/a | pd0 rot 0 both anchors; village lost d42 on pd0 both
9313 | down mild | 0.825 | numerator-driven | pd0 22,878 flat; pd1 55,856 -> 46,090; pd1 days 89 -> 97
9314 | identical | 1.000 | n/a | cells identical
9315 | down mild | 0.968 | denominator-driven | pd0 14,431 -> 47,812; pd1 4,656 -> 14,928; national flips on BOTH sides (pd0 true->false, pd1 false->true); depri 165,304 -> 235,786
9316 | down sharp | 0.000 | both (zero-crossing) | pd0 600 -> 10,186; pd1 23,830 -> 0; depri halves 221,323 -> 100,028; pd0 national false -> true
9317 | down sharp | 0.044 | both | pd0 19,418 -> 206,166 (10.6x, fresh share 0.87 -> 1.00); pd1 48,902 -> 22,796; depri 71,601 -> 168,227 (2.3x); pd1 national true -> false; pd0 wave 4 -> 2
9318 | identical | 1.000 | n/a | ratios identical, cells NOT identical (pd1 depri 208,166 -> 209,172 only)
9319 | identical | 1.000 | n/a | cells identical
9320 | up sharp | 5.703 | both | pd0 26,439 -> 14,046; pd1 19,060 -> 57,754; pd0 days 100 -> 97; waves rise on both sides
9321 | degenerate (pd1-zero-both) | n/a | n/a | cells identical
9322 | up sharp | 317.025 | both | pd0 134,087 -> 16,160; pd1 1,200 -> 45,849; the sides swap which one rots
9323 | up mild | 1.846 | both | pd0 236,993 -> 185,384; pd1 238,760 -> 344,730; depri 342,790 -> 413,289
9324 | identical | 1.000 | n/a | ratios identical, cells NOT identical (pd1 depri 97,346 -> 96,069 only)
9325 | degenerate (pd1-zero-both) | n/a | n/a | pd0 rot HALVES 239,692 -> 115,767 and depri falls 154,022 -> 95,200, yet still degenerate — the ratio cannot see any of it; pd1 national true -> false

Counts: identical 5, down 4 (2 mild, 2 sharp), up 3 (1 mild,
2 sharp), degenerate 4 (2 undefined-ratio, 2 pd1-zero-both).
Cross-check moved seeds: pd0 rises 3/7, falls 3/7, flat 1/7;
pd1 falls 3/7, rises 4/7. Cross-check class medians: down-movers'
median pd0 move 6.965x, median pd1 move 0.646x; up-movers'
median pd0 move 0.531x, median pd1 move 3.030x (the swap shape).

### The behavior answer, in plain words

The step is ragged because it is THREE different things wearing
one ratio, and the files separate them cleanly:

1. UNTOUCHED VILLAGES (identical seeds: 9 primary, 5 cross-check).
   On the primary corpus every identical seed is cell-identical:
   the preserver widening changed literally nothing — same rot,
   same discards, same lifespan, same standing, same waves. On
   the cross-check, three of five are cell-identical and two moved
   only in depriKcal by under 1.5% with rot untouched. These are
   villages where widening never bound: whatever the wider
   preserver pool changed, it never touched these villages' food
   in 100 days. There is no village trait in these files that
   predicts untouched-ness in advance — identical seeds span the
   whole range (national true and false, waves 2 through 4, pd0
   rot100d rates from 1,928 to 216,948). The most extreme
   ratio in the primary corpus (9280, 14.960x) belongs to an
   identical seed.

2. DOWN-MOVERS ARE TWO OPPOSITE STORIES (9 across both corpora).
   (a) A genuine depri-side improvement, numerator-driven: the
   depri village rots far less while the no-depri village is
   untouched (9266: pd1 rot 7,303 -> 400, and it throws away less
   too, 295,711 -> 190,712, and reaches one wave further; 9269 and
   9313 milder versions). This is the story the word "step" wants
   to tell — preservers actually keeping food.
   (b) A no-depri-side blowup, denominator-driven or both: the
   no-depri village rots far MORE on commit — 2.8x (9275), 4.2x
   (9277), 5.6x (9274), 10.6x (9317) — while the depri village
   rots the same or more. The ratio falls because the denominator
   exploded, not because the depri village improved. The extra rot
   is overwhelmingly FRESH rot (fresh share climbing to 0.87-1.00):
   unpreserved food spoiling, not preserved stores going bad. And
   on the two biggest blowups the depri village ALSO throws away
   far more (9277 depri 2.2x, 9317 depri 2.3x). Read whole, the
   commit village handles MORE food and loses more of it both
   ways — a throughput change with worse keeping, scored as an
   "improvement" only because the ratio divides by the blowup.
   Across all 9 down-moves, pd0 rot rises in 6, stays flat in 3,
   and NEVER falls. That asymmetry is the finding.

3. UP-MOVERS ARE THE MIRROR (4 across both corpora). The primary's
   single up-move is tiny (9281, 1.064x, pd1 rot up slightly, pd0
   flat, village dies 6 days early on the depri side). All three
   cross-check up-moves are "both": the no-depri village rots far
   less AND the depri village rots far more — the two sides swap
   which one rots (9322 is the extreme: pd0 134,087 -> 16,160
   while pd1 1,200 -> 45,849). So a "loser" seed is not a village
   where preservers failed; it is a village where the rot burden
   moved from the no-depri side to the depri side.

WHAT DISTINGUISHES DOWN-MOVERS FROM IDENTICAL SEEDS, then, is not
a village trait but the food-handling change itself: down-movers
are exactly the seeds where the commit changed some cell's rot,
and identical seeds are the ones where it changed nothing (or
only a sub-1.5% depri wiggle). No survival, standing, or wave
signature separates the classes in advance: moved seeds flip
national and wave in BOTH directions (9275 gains national and
27 days of life on the no-depri side; 9317 loses national on the
depri side and drops two waves on the no-depri side; 9316 gains
national on the no-depri side). Death causes do not separate
them either — combat and monster deaths dominate every class.
The raggedness lives in food handling, not in survival.

### What remains unknown (DIAG limits, stated not hidden)

- WHY identical seeds are untouched. The files carry no
  preservation action counts (how much was smoked, rendered, or
  made into pemmican), no occupation roster, and no per-day
  trajectory. Whether untouched villages lacked a preserver, never
  had food worth preserving, or preserved identically under both
  occupation pools cannot be told from these aggregates.
- WHETHER the pd0 rot blowup is "more hauling" or "less
  preserving." Both would print the same signature (more fresh
  rot, same-or-more discards). Haul amounts and preservation
  counts are not in the files; the mechanism behind the most
  counterintuitive half of the step — widening the preserver pool
  coinciding with MORE unpreserved rot on the no-depri side —
  needs either a code-level follow-up or a richer instrument, and
  is flagged for the backlog rather than chased here.
- WHAT the preserved-rot remainder means on 9266's depri side:
  its 400 kcal of commit rot is ALL preserved rot (fresh share
  1.00 -> 0.00). Either the fresh rot genuinely went to zero while
  a little preserved stock spoiled, or preserved stores were eaten
  first and the remainder is accounting residue. The files cannot
  distinguish those; they bound, not resolve, the story.
- No villager dialogue, transcript, or per-villager behavior is in
  these files, so no claim is made here about villagers "acting
  like people" beyond the aggregate signatures: deaths spread
  across combat, monster, sickness, starvation, wounds, and named
  causes in both corpora, and villages diverge in rank, wave, and
  lifespan in ways that track their food story.

### SENSE-TESTING LAW — per-seed stories read in plain words

- 9266, down numerator (the clean win). The depri village on the
  parent rotted 7,303 kcal and threw away 295,711. On the commit
  it rotted 400 — nearly nothing — threw away a third less, and
  fought one wave further. The no-depri village is byte-identical
  on both anchors. If preserver widening is ever going to look
  like a success, it looks like this seed.
- 9277, down denominator (the hoard-and-rot seed). The no-depri
  village on the commit rotted 252,977 kcal — four times the
  parent — mostly fresh food, while its depri sibling threw away
  344,192, more than double. The village is drowning in food it
  cannot keep, on both sides at once, and its no-depri wave reach
  fell from 3 to 2. The ratio calls this a step down; the village
  would not call it a win.
- 9280, identical (the untouched extreme). The no-depri village
  rotted at a rate of just 1,928 per 100 days while the depri
  village rotted 28,838 —
  a 14.96x ratio, the wildest in the corpus — and the commit
  changed not one number in any of the four cells. Whatever
  preserver widening does, it does not do it here.
- 9268, degenerate (the silent seed). The depri village rotted
  nothing on either anchor while the no-depri village rotted
  39,147, and the depri village never reached national on either
  anchor. The ratio is 0/0 and says nothing; the village story is
  still legible — a depri side with no rot to measure.
- 9322, up both, cross-check (the swap). On the parent, the
  no-depri village rotted 134,087 and the depri village almost
  nothing (1,200). On the commit they traded places: no-depri
  16,160, depri 45,849. Nothing about total village competence
  obviously changed; the rot burden moved sides. That is what a
  317x "up" step looks like when you read it instead of quoting it.

### Village assessment, in plain words

The villages in these corpora look like ordinary mid-game
villages on a 100-day clock: most reach national standing, none
reach the table, none win, none get past wave 4. That is the
familiar scale wall in miniature. What preserver widening changed
is not survival or standing in aggregate but food handling, and
it changed it unevenly: a few villages kept food dramatically
better, several villages rotted dramatically more without depri,
a few swapped which side rotted, and most villages noticed
nothing at all. Nothing here reads robotic — deaths spread across
combat, monster, sickness, starvation, wounds, and named causes,
and villages diverge in rank, wave, and lifespan in ways that
track their food story. The honest summary of the step is not
"villages preserve better now" but "villages handle food
differently now, for better on some seeds and worse on others,
and usually not at all."

### Wall numbers (from these corpora only — nothing fabricated)

- Primary (64 configs): national 59/64 (92%), table 0/64, wins
  0/64. Wave max: wave 4 in 37, wave 3 in 21, wave 2 in 6; no wave 5.
  Median daysAlive 100 (the 100d horizon cap; early endings:
  parent pd0 s9269 92d, s9273 54d, s9275 73d, s9280 83d; commit
  pd0 s9269 92d, s9273 54d, s9280 83d; commit pd1 s9281 94d).
  Death causes (492 deaths): combat 299, monster 78, starvation
  23, ambush 21, sickness 19, contest 14, wounds-that-wouldn't-
  close 11, rest scattered incl. named monsters.
- Cross-check (64 configs): national 55/64 (86%), table 0/64,
  wins 0/64. Wave max: wave 4 in 31, wave 3 in 26, wave 2 in 7; no
  wave 5. Median daysAlive 100 (early endings: parent pd0 s9312
  42d, s9313 83d; parent pd1 s9312 95d, s9313 89d; commit pd0
  s9312 42d, s9313 83d, s9320 97d; commit pd1 s9312 95d, s9313
  97d). Death causes (533 deaths): combat 294, monster 96,
  sickness 40, starvation 26, ambush 20, wounds 15, contest 12,
  rest scattered incl. named monsters.
- No win flag, no table reach in either DIAG corpus — expected:
  100d measurement DIAGs on one pair with SEATDRIVE=0 (table
  unreachable by construction), not win-seeking runs. These
  numbers do not move the scale-wall totals by themselves.

### DIAG-COMPLETE check

- Primary seeds classified: 16/16 (9 identical, 5 down, 1 up,
  1 degenerate). Every moved seed attributed: 6/6 (2 numerator,
  3 denominator, 1 numerator-up).
- Cross-check classified: 16/16 (5 identical, 4 down, 3 up,
  4 degenerate). Every moved seed attributed: 7/7 (1 numerator,
  1 denominator, 5 both incl. 1 zero-crossing).
- Sense sample: 5 per-seed stories above (down-numerator,
  down-denominator, identical, degenerate, up-both). DIAG-COMPLETE.

### Proof

- node scripts/test-rotragged-b.js => 19 PASS, 0 FAIL (T1
  classification incl. both degenerate kinds and both
  zero-crossings, T2 attribution incl. all four branches, T3
  both corpora 64/64 + counts + medians reproducing leg2decide
  and rotdecide-govern exactly, T4 bad-tag refusal + sweep-file
  ignore).
- node scripts/analyze-rotragged-b.js --corpus
  evidence/2026-10-24/leg2decide-b-corpus --seeds 9266-9281 =>
  exit 0, 16 seeds, M 0.487/0.196, step 0.404.
- node scripts/analyze-rotragged-b.js --corpus
  evidence/2026-10-24/rotdecide-govern-b-corpus --seeds 9310-9325
  => exit 0, 16 seeds, M 0.298/0.192, step 0.645.
- No verdict re-judged: the STEP CONFIRMED (leg2decide) and STEP
  (CONTESTED) (rotdecide-govern) verdicts stand untouched; this
  run only explains the raggedness underneath them.

### Balanced panel (§15)

Panel inapplicable: measurement DIAG on existing corpora, not a
before/after lever landing; panel driver cannot run env-gated
cross-tree anchor sweeps (documented #797 invalidity).

