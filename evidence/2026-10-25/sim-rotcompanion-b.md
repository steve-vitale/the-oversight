# sim-rotcompanion-b — the rot companion metric (measurement only)

Run: oversight-flesh-out-loop-b-20261025T1530Z, arm sim-rotcompanion-b,
axis food-economy. Worktree: `~/workspace/worktrees/sim-rotcompanion-b`,
branch sim-rotcompanion-b.

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was
written BEFORE the new analyzer computed anything on the corpora. Prior
runs' numbers quoted in the background section are quoted, not
recomputed and not re-judged. Every new table in the RESULTS section is
judged ONLY against this header. This is a METRIC-DEMONSTRATION run,
NOT a verdict run.

## Canon read first

- `docs/CANON.md` (manifest) then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; blind penalties teach once).
  Rot is what the ladder failed to save: fresh food spoils fast,
  preserved food spoils slowly, and spoiled food is discarded
  honestly ("rot can't be smoked back into food").
- No canon doc covers plentydepri's tradeoff or the rot-ratio
  instrument — both are measured properties, not designed values.

## Background (quoted from prior runs, NOT re-judged here)

- leg2decide (seeds 9266-9281,
  evidence/2026-10-24/sim-leg2decide-b.md): deciding verdict STEP
  CONFIRMED, median step ratio 0.404x (M(parent) 0.487,
  M(commit) 0.196). Distribution note: 9/16 seeds byte-identical,
  5 moved down, 1 moved up slightly.
- rotdecide-govern (seeds 9310-9325,
  evidence/2026-10-24/sim-rotdecide-govern-b.md): governing verdict
  STEP (CONTESTED), governing step 0.645x (M(parent) 0.298,
  M(commit) 0.192). Sensitivity note: 5 identical, 4 down, 3 up,
  2 degenerate.
- rotragged (evidence/2026-10-25/sim-rotragged-b.md, DIAG, not a
  verdict): the step is real but ragged. Primary down-moves split
  into 2 numerator-driven (pd1 rot genuinely fell) and 3
  denominator-driven (pd0 rot rose 2.8x-5.6x while pd1 rot rose or
  stayed flat); cross-check adds a 10.6x pd0 blowup (9317) and a
  "both" seed (9317: pd1 fell AND pd0 rose). Across all 9
  down-moves, pd0 rot rises in 6, stays flat in 3, falls in 0.
  The ratio alone REWARDS a denominator blowup: a village that
  rots far more without depri scores as an "improvement."
- NEITHER standing verdict is re-judged here. This run builds the
  companion metric the tracker asked for (1430Z next blank 3) so a
  future deciding corpus is never again judged on the ratio alone,
  and demonstrates it on the two existing corpora.

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

- Pair under test, ONLY pair: preserver widening, parent -> commit
  = 1f24a4ef04a857d33138fd0845cfa83df688285c ->
  75fdd92587ad9d83bb12f05da535cdfb49255835. Same pair as
  leg2decide / rotdecide-govern / rotragged. NO new sims, NO new
  anchor sweeps: existing corpora only.
- Primary corpus: evidence/2026-10-24/leg2decide-b-corpus/
  (per-seed files only; the 4 sweep-*.json summaries are NOT
  analyzer inputs). Seeds 9266-9281, 16 seeds x {pd0, pd1} x
  {parent, commit} = 64 per-seed files.
- Cross-check corpus: evidence/2026-10-24/rotdecide-govern-b-corpus/
  (per-seed files only; govern-input.json and the 8 sweep-*.json
  summaries are NOT analyzer inputs). Seeds 9310-9325, 64
  per-seed files.
- Instrument: scripts/analyze-rotcompanion-b.js (new, this run).
  It reads ONLY per-seed files. It recomputes every number from
  raw rot/days fields; it never trusts a prior run's printed
  ratio, step, or classification. Exit non-zero on any missing
  cell, tag mismatch, or unparseable file.
- Balanced panel (§15): inapplicable, same documented reason as
  rotragged — measurement on existing corpora, not a before/after
  lever landing; no verdict is re-judged, so there is no
  before/after comparison to panel.

### (1) Companion metric definition (fixed here)

Per-seed files actually carry (verified from a real per-seed file
before writing this header): seed, policy, plentydepri (0 = pd0,
the no-depri side; 1 = pd1, the depri side), depositgate,
daysAlive, villageDays, rotFreshKcal, rotPreservedKcal,
depriKcal, deathCauses, national, table, win, waveReach,
medianSurvival, anchorCommit.

For anchor A, side S, seed s:

- rot(A, S, s) = rotFreshKcal + rotPreservedKcal (total rotted
  kcal, fresh + preserved combined).
- abs(A, S, s) = rot(A, S, s) / daysAlive * 100 — absolute rot
  per 100 village-days. "Village-days" here means days of village
  life (daysAlive is the village's lived days on that cell), NOT
  the villageDays field: villageDays is a different quantity (the
  sum of villager-days, 448-1136 in these corpora vs daysAlive
  42-100) and is NOT the denominator. This matches the
  rotragged/govern convention exactly, so the companion's ratio
  reproduces the governing ratio by construction; the novelty is
  the absolute columns and the classification, not a new
  denominator. A rot-per-villager-day variant (villageDays
  denominator) is left as a future-run proposal in metric review,
  not smuggled in here.
- r(A, s) = abs(A, pd1, s) / abs(A, pd0, s), undefined when
  abs(A, pd0, s) = 0.
- step(s) = r(commit, s) / r(parent, s) when both ratios are
  defined and r(parent, s) != 0.

Because the sims are deterministic (prior runs reproduced cells
byte-identically on re-run), exact equality is meaningful: there
is no sampling noise within a seed, so NO tolerance band is used.
"Flat" below means EXACT equality of the abs rate. A daysAlive
change parent->commit can move the rate even when raw rot is
unchanged, so the analyzer flags any seed where daysAlive
changed on either side, and the evidence tables report raw rot
alongside the rate for every moved seed. The classification is
made on the RATE (the instrument's unit), never on raw kcal.

### (2) Companion classification rule (fixed here, applied identically to both corpora)

For one seed, let Np = abs(parent, pd1), Nc = abs(commit, pd1),
Dp = abs(parent, pd0), Dc = abs(commit, pd0).

- degenerate: (a) a ratio undefined on either anchor because
  abs pd0 = 0; OR (b) pd1 rot = 0 on BOTH anchors, so both ratios
  are 0 and carry no step information. Step undefined; counted
  separately, never folded into identical/down/up, exactly as in
  rotragged. The degenerate REASON (undefined-ratio vs
  pd1-rot-zero-both) is reported per seed.
- identical: both ratios defined and r(commit, s) ==
  r(parent, s) exactly. Reported with a cells-identical flag
  (all four cells' rot/depri/days/national/wave fields equal
  parent->commit) so ratio-identical-but-moved seeds are visible,
  per rotragged's nuance note.
- up: step > 1, including up-from-zero (r(parent) = 0,
  r(commit) > 0, not degenerate case (b)): step undefined,
  reported as "up from zero", counted as up.
- down (step < 1, including down-to-zero where r(commit) = 0):
  split three ways by the absolute moves:
  - genuine: Nc < Np AND Dc <= Dp. The depri side genuinely
    rotted less, and the no-depri side did not rise to help the
    ratio fall. This is the ONLY down class that counts as an
    improvement.
  - denominator-driven: Dc > Dp AND Nc >= Np. The no-depri
    side rotted more, and the depri side did not fall. The
    ratio fell because the denominator blew up, not because
    the depri side improved.
  - mixed: Nc < Np AND Dc > Dp. Both sides pushed the ratio
    down (the depri side fell AND the no-depri side rose).
    Mixed is reported distinctly and NEVER folded into genuine:
    folding it into genuine would credit the blowup, folding
    it into denominator-driven would hide the real pd1 fall.
    (Adaptation note, stated reason: the assigned class list
    had no mixed class, but rotragged already proved a
    both-pushes seed exists (9317), so forcing it into either
    side would mislabel a real seed. Mixed is the honest
    sixth class.)
  - A down-step with Nc >= Np and Dc <= Dp is arithmetically
    impossible (it would be an up or identical step); if the
    analyzer ever meets one it must report "ambiguous" with the
    raw numbers, never force a class. Same for any other
    uncovered combination.

### (3) Companion verdict rule for a FUTURE deciding corpus (fixed here; demonstrated, not applied as a verdict, on the old corpora)

The companion NEVER replaces scripts/govern-verdict.js. It
qualifies the governing verdict, reported alongside it:

- Corpus companion numbers (medians over ALL 16 seeds per
  column — abs is defined for every cell with daysAlive > 0, so
  degenerate seeds contribute their real abs values rather
  than being excluded; the ratio medians still exclude them,
  as govern-verdict requires): median abs pd0 parent/commit,
  median abs pd1 parent/commit, and each median's commit/parent
  ratio.
- Per-seed split: counts of genuine / denominator-driven /
  mixed among the corpus's down-moves, plus the identical /
  degenerate / up counts.
- Corpus companion verdict, given a governing STEP:
  - GENUINE: median abs pd1 falls on commit (strictly lower)
    AND genuine down-moves are at least as numerous as
    denominator-driven + mixed down-moves combined.
  - DENOMINATOR-DRIVEN: median abs pd1 does NOT fall on
    commit (rises or exactly flat) — the typical seed rotted
    no less on the depri side, so the governing STEP was
    carried by the denominator.
  - MIXED: median abs pd1 falls, but denominator-driven +
    mixed down-moves outnumber genuine down-moves — the
    median and the split disagree, so neither a clean win nor
    a clean blowup may be claimed; both numbers must be
    reported.
  - If the governing verdict is not STEP, the companion
    verdict is reported as "n/a (governing verdict not STEP)"
    with the companion numbers still printed — the companion
    qualifies a step, it does not manufacture one.
- The analyzer reproduces the governing medians and steps
  (primary 0.487/0.196 step 0.404; cross-check 0.298/0.192
  step 0.645, per rotragged's reproduction) as a CHECK that it
  sits on the same numbers — reproducing them is not
  re-judging them. The standing verdicts stand whatever the
  companion says.

### (4) Demonstration bar (pre-registered)

- 100% of seeds classified in both corpora (16/16 each).
- The companion reproduces the rotragged story: primary
  down-moves split into genuine vs denominator-driven with the
  same membership rotragged attributed (2 numerator-driven,
  3 denominator-driven), and the cross-check "both" seed lands
  in mixed, not genuine.
- The companion does NOT overturn either standing verdict: the
  evidence states both standing verdicts unchanged and shows
  the companion as a qualifier only.
- Sense sample: at least one genuine, one denominator-driven,
  and one mixed/identical seed read in plain words (do the
  "genuine" seeds look like villages that actually preserved
  more food? do the "denominator-driven" seeds look like
  villages whose plenty side rotted more?).

### Scope

Zero src/js game changes. Analyzer + proof test + evidence only.
No new sims. No push, no bump, no live verification — merged
locally, pending ship, by the coordinator.

## RESULTS (appended after the pre-registration above; judged ONLY against the header)

### Corpus completeness

- Primary (leg2decide-b-corpus, seeds 9266-9281): 64/64 per-seed
  files, 0 missing cells, 0 loader errors. The 4 sweep-*.json
  summaries were NOT analyzer inputs.
- Cross-check (rotdecide-govern-b-corpus, seeds 9310-9325): 64/64
  per-seed files, same checks passing. govern-input.json and the
  8 sweep-*.json summaries were NOT analyzer inputs.
- Demonstration bar, first half: 16/16 seeds classified in both
  corpora, 0 ambiguous in either. The analyzer reproduces both
  prior ratio medians exactly from raw files (primary M 0.487 /
  0.196, step 0.404; cross-check M 0.298 / 0.192, step 0.645) —
  so the companion sits on the same numbers. Reproduction is a
  check, NOT a re-judgment: the standing verdicts (leg2decide
  STEP CONFIRMED 0.404x; rotdecide-govern STEP (CONTESTED)
  0.645x) STAND UNCHANGED whatever the companion says. The
  companion qualifies their reading; it does not overturn them.

### Companion metric, in one sentence

For each anchor, side, and seed, absolute rot per 100 village-days
= (rotFreshKcal + rotPreservedKcal) / daysAlive * 100, reported
separately for pd0 and pd1 beside their ratio r = pd1/pd0, and a
ratio down-move counts as a genuine improvement only when the
depri side's absolute rot falls without the no-depri side's
absolute rot rising to help it.

### Primary corpus results (9266-9281)

Abs-median (over all 16 seeds per column): pd0 72,687 -> 95,572
(x1.315); pd1 18,706 -> 21,545 (x1.152). The typical seed's depri
side rotted MORE on commit, and its no-depri side rotted more
still — the ratio fell because the denominator rose faster than
the numerator, not because the numerator fell.

Per-seed companion classification (abs = rot per 100 village-days,
parent -> commit; "cells ident." = all four cells equal):

Seed | class | step | r(parent) | r(commit) | pd0 abs | pd1 abs | cells ident. | days changed
9266 | genuine | 0.055 | 1.258 | 0.069 | 5,805 -> 5,805 | 7,303 -> 400 | no | no
9267 | identical | 1.000 | 0.020 | 0.020 | 216,948 -> 216,948 | 4,414 -> 4,414 | yes | no
9268 | degenerate (pd1-zero-both) | n/a | 0.000 | 0.000 | 39,147 -> 39,147 | 0 -> 0 | yes | no
9269 | genuine | 0.450 | 0.062 | 0.028 | 148,149 -> 148,149 | 9,162 -> 4,120 | no | no
9270 | identical | 1.000 | 1.427 | 1.427 | 101,053 -> 101,053 | 144,197 -> 144,197 | yes | no
9271 | identical | 1.000 | 2.977 | 2.977 | 86,543 -> 86,543 | 257,616 -> 257,616 | yes | no
9272 | identical | 1.000 | 0.225 | 0.225 | 84,941 -> 84,941 | 19,141 -> 19,141 | yes | no
9273 | identical | 1.000 | 0.203 | 0.203 | 90,091 -> 90,091 | 18,270 -> 18,270 | yes | no
9274 | denominator-driven | 0.257 | 0.738 | 0.190 | 22,598 -> 125,990 | 16,688 -> 23,949 | no | no
9275 | denominator-driven | 0.359 | 1.053 | 0.378 | 41,541 -> 115,793 | 43,743 -> 43,743 | no | YES (pd0 73 -> 100)
9276 | identical | 1.000 | 1.379 | 1.379 | 121,400 -> 121,400 | 167,465 -> 167,465 | yes | no
9277 | denominator-driven | 0.302 | 0.370 | 0.112 | 60,432 -> 252,977 | 22,361 -> 28,303 | no | no
9278 | identical | 1.000 | 0.175 | 0.175 | 41,459 -> 41,459 | 7,272 -> 7,272 | yes | no
9279 | identical | 1.000 | 0.603 | 0.603 | 23,949 -> 23,949 | 14,449 -> 14,449 | yes | no
9280 | identical | 1.000 | 14.960 | 14.960 | 1,928 -> 1,928 | 28,838 -> 28,838 | yes | no
9281 | up (mild) | 1.064 | 0.047 | 0.050 | 483,868 -> 483,868 | 22,850 -> 24,309 | no | YES (pd1 100 -> 94)

Counts: genuine 2, denominator-driven 3, mixed 0, identical 9,
up 1, degenerate 1. Down split: genuine 2, denominator-driven 3,
mixed 0 — the SAME membership rotragged attributed (its 2
numerator-driven = this run's genuine; its 3 denominator-driven
= this run's denominator-driven). Demonstration bar, primary
half: met exactly.

Companion verdict (given governing STEP, supplied externally):
DENOMINATOR-DRIVEN. The pre-registered rule fires on the median:
median pd1 abs ROSE on commit (18,706 -> 21,545), so the typical
seed did not rot less on the depri side. This qualifies the
standing STEP CONFIRMED verdict — it does not overturn it. Read
together: the preserver step is real on the ratio, but on the
primary corpus it was carried by the denominator, with 2 genuine
seeds inside it.

### Cross-check corpus results (9310-9325)

Abs-median (over all 16 seeds per column): pd0 28,452 -> 39,139
(x1.376); pd1 21,445 -> 24,118 (x1.125). Same shape as primary:
the typical seed's depri side rotted more on commit, its
no-depri side more still.

Seed | class | step | r(parent) | r(commit) | pd0 abs | pd1 abs | cells ident. | days changed
9310 | degenerate (undefined-ratio) | n/a | n/a | n/a | 0 -> 0 | 25,439 -> 25,439 | yes | no
9311 | identical | 1.000 | 6.281 | 6.281 | 78,160 -> 78,160 | 490,939 -> 490,939 | yes | no
9312 | degenerate (undefined-ratio) | n/a | n/a | n/a | 0 -> 0 | 195,416 -> 195,416 | yes | no
9313 | genuine | 0.825 | 2.441 | 2.015 | 22,878 -> 22,878 | 55,856 -> 46,090 | no | YES (pd1 89 -> 97)
9314 | identical | 1.000 | 0.046 | 0.046 | 4,553 -> 4,553 | 211 -> 211 | yes | no
9315 | denominator-driven | 0.968 | 0.323 | 0.312 | 14,431 -> 47,812 | 4,656 -> 14,928 | no | no
9316 | mixed | 0.000 | 39.717 | 0.000 | 600 -> 10,186 | 23,830 -> 0 | no | no
9317 | mixed | 0.044 | 2.518 | 0.111 | 19,418 -> 206,166 | 48,902 -> 22,796 | no | no
9318 | identical | 1.000 | 0.085 | 0.085 | 179,380 -> 179,380 | 15,245 -> 15,245 | NO (depri wiggle only) | no
9319 | identical | 1.000 | 0.016 | 0.016 | 30,465 -> 30,465 | 500 -> 500 | yes | no
9320 | up (sharp) | 5.703 | 0.721 | 4.112 | 26,439 -> 14,046 | 19,060 -> 57,754 | no | YES (pd0 100 -> 97)
9321 | degenerate (pd1-zero-both) | n/a | 0.000 | 0.000 | 74,375 -> 74,375 | 0 -> 0 | yes | no
9322 | up (sharp) | 317.025 | 0.009 | 2.837 | 134,087 -> 16,160 | 1,200 -> 45,849 | no | no
9323 | up (mild) | 1.846 | 1.007 | 1.860 | 236,993 -> 185,384 | 238,760 -> 344,730 | no | no
9324 | identical | 1.000 | 0.274 | 0.274 | 505,650 -> 505,650 | 138,680 -> 138,680 | NO (depri wiggle only) | no
9325 | degenerate (pd1-zero-both) | n/a | 0.000 | 0.000 | 239,692 -> 115,767 | 0 -> 0 | no | no

Counts: genuine 1, denominator-driven 1, mixed 2, identical 5,
up 3, degenerate 4. Down split: genuine 1, denominator-driven 1,
mixed 2 — rotragged's cross-check down-moves were 1
numerator-driven (9313 -> genuine), 1 denominator-driven (9315),
and 2 "both" (9316 zero-crossing both, 9317 both -> mixed).
Demonstration bar, cross-check half: met exactly. The mixed
class earns its keep here: forcing 9316/9317 into either side
would have hidden half the story.

Companion verdict (given governing STEP, supplied externally):
DENOMINATOR-DRIVEN, same rule, same reason: median pd1 abs ROSE
(21,445 -> 24,118). This qualifies the standing STEP (CONTESTED)
verdict — it does not overturn it, and it does not resolve the
contest: the contest was between governing and diagnostic ratio
summaries, and the companion is a third lens, not a tie-breaker.

### Genuine vs denominator-driven split, both corpora

- Primary down-moves (5): genuine 2 (9266, 9269),
  denominator-driven 3 (9274, 9275, 9277), mixed 0.
- Cross-check down-moves (4): genuine 1 (9313),
  denominator-driven 1 (9315), mixed 2 (9316, 9317).
- Combined down-moves (9): genuine 3, denominator-driven 4,
  mixed 2. Only 1 in 3 down-moves is a clean depri-side
  improvement; the rest are denominator blowups or both-pushes.
- Corpus-level companion verdict on BOTH corpora:
  DENOMINATOR-DRIVEN (median pd1 abs rose on commit in both).
  The ratio step and the absolute story point opposite ways at
  the typical-seed level — which is exactly the failure mode
  this metric was built to catch.

### SENSE-TESTING: do the labels read true in plain words?

Read from the absolute numbers, not the class names:

- GENUINE seeds look like villages that actually preserved more.
  9266 is the cleanest case in either corpus: pd1 rot collapses
  7,303 -> 400, its fresh-rot share goes 1.00 -> 0.00 (no fresh
  food rotted at all on commit; the 400 left is preserved rot),
  discards fall 295,711 -> 190,712, and it reaches one wave
  further. That is a village keeping food, not a village gaming
  a denominator. 9269 is the milder version (pd1 9,162 -> 4,120,
  pd0 untouched, fresh share 0.64 -> 0.54). 9313 is genuine on
  both the rate (55,856 -> 46,090) and the raw rot (49,712 ->
  44,707) — the longer life on commit (89 -> 97 days) flatters
  the rate slightly but does not create the fall.
- DENOMINATOR-DRIVEN seeds look like villages whose plenty side
  rotted more — and, tellingly, whose depri side usually rotted
  more too. 9274: pd0 rot up 5.6x to 125,990 while pd1 rot also
  ROSE (16,688 -> 23,949); the ratio "improved" while both sides
  got worse, because the denominator got worse faster. 9277 is
  the same shape (pd0 4.2x, pd1 up, discards 2.2x). 9315 is the
  starkest: BOTH sides rotted ~3.3x more (pd0 14,431 -> 47,812,
  pd1 4,656 -> 14,928) and the ratio still "improved" 0.968x.
  Calling any of these an improvement would be false, and the
  companion refuses to.
- MIXED seeds are genuinely two stories at once, and the label
  says so instead of picking one. 9316: pd1 rot goes to ZERO
  (23,830 -> 0, discards halve) — a real depri-side win — while
  pd0 rot explodes 600 -> 10,186 (17x). Crediting it as fully
  genuine would bless the blowup; damning it as denominator
  driven would erase the zero. Mixed is the honest label.
  9317: pd1 halves (48,902 -> 22,796) while pd0 goes up 10.6x
  with fresh share 0.87 -> 1.00 — the plenty side drowning in
  fresh rot while the depri side improves. Again, mixed.
- The labels do NOT tell a different story than the numbers
  anywhere in either corpus: every genuine seed's pd1 absolute
  falls on both rate and raw rot, every denominator-driven
  seed's pd0 absolute rises on both, and every mixed seed
  moves both ways. The one place the rate and the raw diverge
  is flagged, not hidden: 9281's "up" is a pure lifespan
  artifact — pd1 raw rot is exactly flat (22,850 -> 22,850)
  and the rate rises only because the village dies 6 days
  earlier (100 -> 94 days). A future pre-registration should
  state whether a rate-only move on a daysChanged seed counts
  as a rot move or a lifespan move (see metric review).
- Two abs-column bonuses the ratio cannot give: 9325's pd0 rot
  HALVES (239,692 -> 115,767) while it stays degenerate — the
  ratio is blind to it, the companion columns show it. And
  9318/9324 stay ratio-identical with cells NOT identical (a
  sub-1.5% depri wiggle, rot untouched) — the companion keeps
  rotragged's distinction visible instead of re-merging it.

### Pre-registration template for the NEXT rot deciding run (copy verbatim)

> PRE-REGISTRATION — rot companion metric (adopted from
> sim-rotcompanion-b, evidence/2026-10-25/sim-rotcompanion-b.md;
> instrument: scripts/analyze-rotcompanion-b.js, or its successor
> with identical definitions).
>
> 1. METRIC DEFINITION. For anchor A, side S, seed s, from the
>    per-seed files only (never from a prior run's printed
>    numbers): rot(A,S,s) = rotFreshKcal + rotPreservedKcal;
>    abs(A,S,s) = rot(A,S,s) / daysAlive * 100 (absolute rot per
>    100 village-days; daysAlive is the village's lived days, NOT
>    the villageDays field). r(A,s) = abs(A,pd1,s) / abs(A,pd0,s),
>    undefined when abs(A,pd0,s) = 0. step(s) =
>    r(commit,s) / r(parent,s) when defined and r(parent,s) != 0.
> 2. VERDICT RULE. The companion NEVER replaces
>    scripts/govern-verdict.js. It is reported ALONGSIDE the
>    governing verdict and qualifies it: report median abs pd0
>    parent/commit, median abs pd1 parent/commit (medians over
>    ALL seeds per column — abs is defined for every cell with
>    daysAlive > 0), each median's commit/parent ratio, and the
>    per-seed down-move split (genuine / denominator-driven /
>    mixed counts). Given a governing STEP: GENUINE iff median
>    abs pd1 falls on commit AND genuine down-moves are at
>    least as numerous as denominator-driven + mixed down-moves
>    combined; DENOMINATOR-DRIVEN iff median abs pd1 does NOT
>    fall on commit (rises or exactly flat); MIXED iff median
>    abs pd1 falls but denominator-driven + mixed down-moves
>    outnumber genuine down-moves. If the governing verdict is
>    not STEP, the companion verdict is "n/a (governing verdict
>    not STEP)" with the companion numbers still printed.
> 3. CLASSIFICATION (per seed; Np/Nc = abs pd1 parent/commit,
>    Dp/Dc = abs pd0 parent/commit; deterministic files, so
>    "flat" = EXACT equality, no tolerance band):
>    degenerate = (a) a ratio undefined (pd0 abs 0 either
>    anchor) or (b) pd1 rot 0 on BOTH anchors; identical =
>    r(commit) == r(parent) exactly (report cells-identical
>    flag separately); up = step > 1, incl. up-from-zero
>    (r(parent) = 0, r(commit) > 0); down (step < 1, incl.
>    down-to-zero) = genuine iff Nc < Np AND Dc <= Dp,
>    denominator-driven iff Dc > Dp AND Nc >= Np, mixed iff
>    Nc < Np AND Dc > Dp; any other down combination =
>    "ambiguous" with raw numbers, never forced.
> 4. DEGENERATE HANDLING. Degenerate seeds are counted
>    separately, never folded into identical/down/up, and never
>    imputed. Their abs values still enter the abs medians
>    (defined) but never the ratio medians (undefined/excluded,
>    per govern-verdict). Report the degenerate reason per seed
>    (undefined-ratio vs pd1-rot-zero-both).
> 5. WHAT TO REPORT. The per-seed table (pd0 abs, pd1 abs, ratio,
>    step, class, cells-identical flag, daysChanged flag), the
>    abs medians with commit/parent ratios, the down-move split,
>    the companion verdict, and a sense sample (one genuine, one
>    denominator-driven, one mixed/identical seed in plain
>    words). Flag every daysChanged seed and print raw rot
>    beside the rate for every moved seed.
> 6. DAYS-CHANGED RULE (new in this template, from this run's
>    sense finding): a rate move on a daysChanged seed whose
>    raw rot did NOT move the same way (9281: raw flat, rate
>    up) is reported as a LIFESPAN move, not a rot move, and
>    does not count toward the genuine/denominator-driven
>    split's story — the seed keeps its computed class, but the
>    evidence must say the move is lifespan-driven.

### Metric review (filled after the results, §14 — revisions apply to the NEXT run)

- DOES THE COMPANION FIX THE RATIO'S FAILURE MODE? Yes, at both
  levels it was built for. Per seed, it splits the 9 down-moves
  into 3 genuine / 4 denominator-driven / 2 mixed instead of one
  undifferentiated "step" — the denominator blowup can no longer
  wear a genuine seed's clothes. At corpus level, it reverses
  the naive reading outright: both governing STEPs come with a
  DENOMINATOR-DRIVEN companion verdict, because the typical
  seed's depri side rotted MORE on commit (primary pd1 median
  x1.152, cross-check x1.125). A future run that reported only
  the ratio would call these wins; the companion forces the
  sentence "the step was carried by the denominator" into the
  same paragraph. That is the fix working, not the fix failing:
  the standing verdicts stand (they are ratio verdicts, and the
  ratios did step), but nobody can now read them as "villages
  rotted less" without confronting the absolutes.
- WHAT IT STILL DOES NOT CAPTURE (the next rot arm must solve
  these, not re-litigate this metric):
  - HAUL-VS-PRESERVE CAUSE IS STILL UNMEASURED IN THESE FILES.
    The companion proves WHERE rot moved (which side, how much)
    but not WHY: the per-seed files carry no preservation action
    counts (how much was smoked, rendered, made into pemmican),
    no haul amounts, no pantry stocks, no per-day trajectories.
    9274's blowup could be "villagers hauled far more fresh food
    and never preserved it" or "preservers stopped working" —
    the files cannot distinguish them, and this run does not
    pretend otherwise. The next rot arm needs a haul/preserve
    instrument in the collector, or it will keep describing
    symptoms. (Rotragged said the same; this run confirms it
    from the other side: even a perfect ratio-plus-abs display
    cannot attribute cause.)
  - RATE VS LIFESPAN. The abs rate divides by daysAlive, so a
    village that dies early shows a higher rate on identical raw
    rot (9281: raw flat, rate up — labeled "up" on a lifespan
    effect). The template's new days-changed rule (item 6)
    contains this, but a cleaner future instrument might report
    raw rot beside the rate as a co-primary, or normalize by
    villageDays (rot per villager-day) — untested here, proposed
    not adopted, because changing the denominator would break
    comparability with the governing ratio.
  - POPULATION IS NOT IN THE DENOMINATOR. daysAlive counts
    village days, not villager-days: a village that keeps 12
    villagers alive rots on a different scale than one that
    keeps 4, and the companion does not adjust for it. The
    villageDays field exists in the files and is the obvious
    candidate denominator for a per-villager-day variant —
    but it was deliberately NOT used here, to keep the
    companion's ratio identical to the governing ratio.
  - MEDIAN-OF-ABSOLUTES HIDES THE SAME RAGGEDNESS THE SPLIT
    EXPOSES. The corpus companion verdict is a median rule, so
    it can disagree with the per-seed split (here it does not
    need to: both corpora are DENOMINATOR-DRIVEN by the median
    AND denominator+mixed outnumber genuine in the split on the
    cross-check, while on the primary the split is 2 genuine vs
    3 denominator-driven — the median and the split agree that
    this is no clean win). The per-seed table, not the verdict
    word, remains the necessary display.
  - THROUGHPUT IS STILL OUT OF SCOPE. Rotragged's proposed
    throughput companion — total (rot + deprioritized) kcal per
    village-day — is a different lens (how much food the village
    handled and lost both ways) and is NOT built here. The rot
    companion answers "did the depri side rot less"; the
    throughput companion would answer "did the village handle
    food better overall." A future deciding run should carry
    both, since 9277/9317 show villages handling MORE food and
    losing more of it both ways.
- RULES THAT WORKED AS WRITTEN, NO MID-RUN REPAIR: exact-equality
  flat (deterministic files — 9/16 primary seeds exactly
  identical, no borderline calls anywhere); degenerate reason
  split (undefined-ratio vs pd1-zero-both behave differently
  and stay visible); mixed as a sixth class (without it, 9316
  and 9317 would have been mislabeled in opposite directions
  by any forced choice). The only post-hoc addition is template
  item 6 (days-changed rule), which constrains FUTURE runs'
  language — it does not reclassify any seed here (9281 keeps
  its computed "up" class, with the lifespan caveat attached).

### Proof

- scripts/test-rotcompanion-b.js: hand-computed cases for every
  class (genuine, denominator-driven, mixed, identical, both
  degenerate reasons, up, up-from-zero, down-to-zero, flat-pd1
  denominator case, abs-rate arithmetic, companion-verdict
  rule) + full corpus reproduction (64/64 files, 16/16 seeds,
  0 ambiguous, exact per-seed class membership on both corpora,
  governing medians reproduced within 0.002). Result: ALL
  ASSERTIONS PASSED (run 2026-10-25, before commit).
- scripts/analyze-rotcompanion-b.js run on both corpora (output
  summarized in the tables above; full per-seed detail printed
  by the analyzer: abs rates, raw rot, fresh shares, depri,
  days per side).
- Node harness: not needed — measurement only on existing
  corpora, zero new sims, zero game code touched. No harness
  run, so no harness claim is made.
- Standing verdicts re-judged: NONE. leg2decide STEP CONFIRMED
  0.404x and rotdecide-govern STEP (CONTESTED) 0.645x both
  stand; the companion qualifies them as DENOMINATOR-DRIVEN at
  corpus level on their own corpora.

### Scope compliance

Zero src/js game changes. New files only: scripts/analyze-rotcompanion-b.js,
scripts/test-rotcompanion-b.js, evidence/2026-10-25/sim-rotcompanion-b.md.
No new sims run. No push, no version bump, no live verification.
Merged locally, pending ship, by the coordinator.
