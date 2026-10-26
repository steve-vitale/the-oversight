# sim-preservesched-resid-b — the seed 9750 days 83–84 residual pair, separated stack by stack (DIAG ONLY, no game change)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T1730Z, axis
food-economy, arm sim-preservesched-resid-b. Takes the residual pair left
open by sim-preservesched-b (1630Z): seed 9750 days 83–84 after a 4-day
inflow gap, where the 1630Z corpus lacked stack spoilDays + haven tier.
Predecessors: sim-inflow-b + sim-inflowtrail-b-land + sim-preservesched-b
(evidence/2026-10-26/sim-preservesched-b.md). The 36/38 verdict and the
SPOIL-CLOCK + RACKS-FULL rule are NOT re-judged here — they stand, and
are re-derived below only as a control.
Instrument: `scripts/preservesched-resid-capture.js` (new: per-bound-line
haven tier, granary bonus, and the per-stack spoilDays of the eligible
pile, plus a full pantry snapshot at the first cook line of each day).
Sweep: `scripts/sweep-preservesched-resid-b.js` (identical band to
sweep-inflow-b.js: seeds 9750–9757, competent-nofeast, 100d,
SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1, CAP=1; substrate-capture.js
and inflow-capture.js reused UNCHANGED). Analyzer:
`scripts/analyze-preservesched-resid-b.js`. Proof:
`scripts/test-preservesched-resid-b.js` (green in this worktree, see
"Reproduction check" below).
Canon: docs/CANON.md + docs/PRESERVATION.md (ladder: cleaned 2d <
cooked 5d < smoked 30d; smoking 16 ticks; "rot can't be smoked back
into food").

## Pre-registration (binding, MEASUREMENT.md §14 — written BEFORE the sweep ran)

Full text: evidence/2026-10-26/sim-preservesched-resid-b-prereg.md
(written before any sim ran in this arm; the sweep ran after it).

Band: identical seeds/policies to sim-preservesched-b — seeds
9750–9757, competent-nofeast (COMPETENT_FEAST=0, FEASTSCALE_R13
unset/0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1), 100d, CAP=1.
Horizon 100d (same as the original band; death-aware: villages that
die stop early).

Control (must pass before any residual judgment): re-derive the
original 36/38 verdict from the NEW corpus with identical counting
rules — neutrality 327/289/38, lag 1x32/2x4/3x1/4x1, coverage 36/38,
residuals exactly (9750,83) and (9750,84). If the control does not
reproduce, the run stops with DIAG-NO-GO on instrument grounds and no
residual judgment is made.

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
- H2 OLDER-STOCK RIPENING: haven tier < 3 on those days, AND the
  eligible stacks on days 83–84 are named older non-stock items
  whose spoilDays fall in the eligible window on those days, with
  no spoilDay-85 stock stack present. Exclusion of H1: the tier
  reading, or the absence of spoilDay-85 stock stacks.

A miss is DIAG-NO-GO with both hypotheses kept open, never re-scored;
metric doubts go under "metric review" for the next run.

## Control: PASS — the original verdict re-derives exactly

New corpus vs prior corpus, identical seeds/policies (before/after —
the instrument changed nothing about the run):

| check | prior (1630Z) | new (1730Z) |
|---|---|---|
| bound / attributed / unattributed | 327 / 289 / 38 | 327 / 289 / 38 |
| attribution-flag reproduction | 0 mismatches | 0 mismatches |
| lag distribution (38) | 1x32 / 2x4 / 3x1 / 4x1 | 1x32 / 2x4 / 3x1 / 4x1 |
| median lag | 1.0 | 1.0 |
| coverage (lag in {1,2} + eligible + racksFull) | 36/38 = 94.7% | 36/38 = 94.7% |
| residuals | (9750,83), (9750,84) | (9750,83), (9750,84) |
| deaths / wall | 43; national 0, table 0, win 0 | 43; national 0, table 0, win 0 |

Determinism leg (stronger than the control alone): the new corpus
reproduces the COMMITTED inflow-b corpus exactly on all 8 seeds —
dayTable classes, attribution flags, days alive, and rank all
identical (8/8 seeds, 0 mismatches). The resid capture is
observation-only: it did not move a single day, death, or rank.
Instrument legs: resid lines join cook lines on (cook, day,
resIndex) with 0 misses; the per-stack eligible sums match the
independent recomputeContext on all 1,536 checked lines (0
mismatches). No corpus file carries a truncation flag.

The control passes, so the residual judgment below is made.

## Verdict: DIAG-NO-GO against the pre-registered bar — but every stack is named

Judged against the header only, never re-scored: DIAG-NO-GO.
Neither pre-registered hypothesis explains BOTH days:

- H1 fails on day 83: haven tier IS 3 (confirmed on every bound
  line of both days, granary bonus +3), and granary-shifted stock
  IS real — but the day-79 arrival does NOT supply day 83's pile.
  The day-79 stock pieces (122 + 220 kcal, spoilDay 85,
  granaryDays 3) sit in the pantry on days 80–82 and are GONE by
  day 83: eaten at the night-82 meal before their window opened.
  Day 83's eligible pile is supplied by a different stack entirely
  (below). H1's per-stack evidence therefore fails on day 83,
  even though its mechanism (the granary-shifted clock) is confirmed
  real and does supply part of day 84.
- H2 fails on its stated terms: haven tier is 3, not < 3, so its
  tier condition fails outright; and day 83's supplier is not an
  older non-stock item ripening in — it is a fresh meal-surplus
  stack stored the night before (below). (Older-stock ripening IS
  present on day 84 — the day-74 Winner's share — but H2 as
  pre-registered requires it on BOTH days with tier < 3, and neither
  holds.)

Both hypotheses are kept open per the binding rule, and the
pre-registered bar is NOT re-scored. What follows is the complete
mechanism the instrument actually found — reported as findings, not
as a re-scored verdict. The next run's proposed hypothesis is under
"Metric review".

## The mechanism, in plain words (every stack named)

The pair separates into THREE named suppliers, not one. In plain
words: the village's cook is working through a pile that has three
different histories in it — last night's leftovers the village put
back itself, yesterday's haul kept fresh by the granary, and old
contest winnings finally going soft.

Day 83 — eligible pile exactly 2,000 kcal, one stack:
- "Foraged food", 200 kcal x 10 units, spoilDay 85, NO granaryDays.
  This is NOT the day-79 arrival. It is meal surplus: the code path
  is `stockSurplus` (game.js, called by the nightly meal) — when
  villagers share surplus at the meal, it goes into the pantry as
  200-kcal "Foraged food" units with spoilDay = meal-day + 3 and NO
  granary bonus. The dayPantry snapshots bracket it exactly: absent
  from the day-82 snapshot, present from the day-83 snapshot on —
  stored during day 82 (82 + 3 = 85), eligible on days 83–84
  (85 - 83 = 2, 85 - 84 = 1). It bypasses all three recorded pantry
  doors (stock / deposit / pantryAdd), which is why the 1630Z
  corpus could not see it: the inflow capture's named limitation
  (direct pantry pushes bypass the doors) is exactly what hid it.
  The day-79 granary stock it replaced (122 + 220 kcal, spoilDay 85,
  granaryDays 3) was eaten on night 82 — consistent with the meal's
  stated order (fresh-first, slabs last: the small @85 pieces go
  before the 2,000-kcal @85 slab).

Day 84 — eligible pile exactly 3,567 kcal, five stacks:
- The same meal-surplus stack: "Foraged food" 200 x 10, spoilDay 85,
  no granaryDays — still uneaten (slabs last), 2,000 kcal.
- Day-80 granary stock: "Foraged food" 178 kcal + 189 kcal, spoilDay
  86, granaryDays 3 (80 + 3 + 3 = 86; eligible from day 84, since
  86 - 84 = 2; on day 83 it was one day too fresh, 86 - 83 = 3).
  This is H1's mechanism, working, on day 84.
- Ripened contest winnings: "Winner's share (alien rations)"
  300 x 2 units, spoilDay 86, granaryDays 3, TWO such stacks
  (1,200 kcal). These are day-74 pantryAdd arrivals: contest
  winnings carry spoilDay = win-day + 9 (74 + 9 = 83), plus the
  granary bonus 3 at the pantry door = 86 — so they ripen into the
  window exactly on day 84. This is H2's mechanism, working, on
  day 84 only.

So: day 83 = meal surplus alone (the day-79 granary stock having
been eaten first); day 84 = meal surplus + granary-shifted day-80
stock + ripened day-74 winnings. The 4-day inflow gap is no gap at
all for the eligible pile: the pile is fed by the night-82 meal,
the granary clock, and a ten-day-old prize — none of which is a
counted inflow day. The lag-to-last-inflow proxy (3 and 4 days)
fails here precisely because it cannot see the fourth door or the
granary shift — which is why the 1630Z arm named these two fields
as the missing instrument, and why this arm built them.

Why the day-79 stock is not in either pile (stated, not assumed):
the dayPantry snapshots show the 122 + 220 kcal spoilDay-85
granaryDays-3 pieces present on days 80, 81, and 82, and absent on
days 83 and 84. They left the pantry between the day-82 and day-83
first-cook snapshots — i.e., at the night-82 meal. The meal order
stated in code (fresh-first, slabs last) is consistent with small
@85 pieces going before the 2,000-kcal @85 slab; the exact
meal-draw order is not independently proven by this instrument and
is not needed for the verdict.

Corroboration on the smoking itself (consistent, not load-bearing):
on day 83 Sierra's first resolution works the racks — "3 batches
preserved (~914 kcal, keeps a couple of weeks)" — and the day-83
pantry snapshot shows three newly preserved stacks totaling exactly
914 kcal kept (98 + 176 + 160x4, spoilDay 98 = 83 + 15, the
unskilled shelf). The bound lines that follow (res2 racks-full,
res3 plain, Malik plain) then face the 2,000-kcal remainder. The
bound-line eligible piles reported above are post-first-resolution
remainders; the first resolution's smoking does not change which
stacks supply the bound lines.

## Does the rule need a footnote? (quoted, not rewritten)

The standing rule, quoted from sim-preservesched-b: "the cook smokes
yesterday's pantry, never today's haul. A bound day with no inflow
of its own is the NORMAL case, not an anomaly: the inflow that
matters arrived yesterday (or the day before), and today's inflow —
if any arrived at all — is still too fresh to smoke."

This rule is NOT rewritten here — the verdict is DIAG-NO-GO, and a
miss does not earn a rewrite. Candidate footnote for the NEXT run
to judge (under "Metric review"): the eligible pile is also fed by
a fourth door the rule's lag framing cannot see — meal-surplus
shares stored the night before (spoilDay = meal-day + 3, no granary
bonus) — and by granary-shifted and long-ripening stacks whose
arrival days are far older than the lag suggests. If the next run
adopts that footnote as its hypothesis, it must pre-register it
before judging.

## Still-missing instrument field (the brief's no-separate question)

The pair's stacks DID separate completely — every stack in both
piles is named with its spoilDay and source. What is still missing
as a first-class instrument field: a stockSurplus door record in
the inflow capture (day, kcal, resulting spoilDay). This run
established the 200-stack's origin by combining dayPantry snapshots
with code reading; a door record would make the fourth door visible
in the inflow stream itself, so the next run can separate such
pairs from the inflow records alone instead of snapshot archaeology.
No other field is missing: haven tier, granary bonus, per-stack
spoilDays, and the trailing-inflow context all proved sufficient.

## Sense samples (plain words — meaning, not just counts)

- Seed 9750, day 83: Sierra smokes 3 batches in the morning
  ("keeps a couple of weeks" — rough, unskilled work), then hits
  the wall and says so honestly: "The racks are already full
  (13,033 kcal kept — more than the haven can eat before it turns),
  so Sierra left the fresh pile for tonight's dinner instead of
  smoking it onto the rot pile." The "fresh pile" she leaves
  includes the village's own meal surplus from the night before —
  the village put its leftovers back, and now its cook is deciding
  they are dinner, not smoke. Nothing here suggests hidden stock or
  food from nowhere: it is a village eating its own stores in
  order, soonest-soft first, biggest slabs last.
- Seed 9750, day 84: the same shape, bigger numbers — Sierra works
  3 batches (~3,200 kcal), then the wall at 13,686 kcal kept, then
  Malik's plain line. The pile she works through now has three
  histories in it (last night's leftovers, the granary-kept haul,
  ten-day-old contest rations), and the cook treats them as one
  pile going soft together. That is the pantry as the villagers
  experience it: not doors and clocks, but food going soft at
  different speeds.
- The throttle story holds on both days (throttle engaged, foragers
  stood down for four days running): the village is not out
  foraging because the shelves are full, and the shelves are full
  partly because the village keeps putting its own meal surplus
  back. The no-inflow gap and the full racks are the same sentence,
  again — now with the fourth door named.

Sense judgment: the story coheres, and it coheres better than the
1630Z version: the "mystery" 2,000-kcal stack is not a scheduling
anomaly but the village feeding itself its own leftovers on a
two-day clock, alongside granary-kept haul and ripening prizes.
No robotic, static, or repeated behavior is flagged in these two
days: the cook smokes, complains honestly at the wall, and the
second cook's plain line is the same day's second voice, not a
loop.

## Village assessment (what the village looked like)

Seed 9750 (the residual seed): survived the full 100d horizon,
village rank, wave 3 reached, no national/table/win. Five deaths:
monster 2, ambush 1, the arena 1, a wound that wouldn't close 1 —
a village losing people to the world and the show, not to hunger:
no starvation or dehydration deaths on this seed. The cook,
Sierra, is unskilled at preserving ("keeps a couple of weeks",
0.80x, 15-day shelf; rack cap 13,000 = 125 x 8 roster x 13, the
unskilled shelf) — the village smokes, but roughly, and loses a
fifth of what it smokes to the rough job. Haven tier 3 (the granary
stands: +3 days on fresh stores) — the granary is built and
working, which is exactly what makes the day-80 stock's clock
readable. Knowledge/capabilities missing on this seed: a skilled
preserver (the 0.80x rough job is the village's preservation
ceiling), and anything past wave 3 — the scale wall stands here
as everywhere on this band.

Band (8 seeds, competent-nofeast, 100d): 6 villages survived to
the horizon, 2 lost early (9751 at day 48, 9754 at day 97).
Median survival 100d (censored at the horizon). Deaths 43 total;
top causes: the arena 15, starvation 7, monster 4, a wound that
wouldn't close 4, sickness 4, ambush 3, dehydration 3, old stare 1,
alien 1, lockjaw 1. Wave reach: wave 3 on 4 seeds (9750, 9753, 9754,
9755), wave 2 on the rest; wave 4/5 on none. Rank stayed village on
all 8 seeds. Arc II/III/IV and regional-stage reach are not
recorded in this corpus (its top-level fields carry waveReach,
rank, national, table, win only) and are not estimated here.
Who thrived: the villages that reached wave 3 with a granary and a
working cook; who died and why: the arena and starvation dominate
the band's deaths — the show takes people, and the food economy
still starves villages that cannot keep the pantry ahead of the
throttle. The blank this run filled is a measurement blank (the
residual pair), not a village-capability blank; the village's own
blanks (skilled preserver, wave 4+) are documented, not filled.

## Reachability verdict

On this band, reachable: waves 1–3, village rank, haven tier 3,
the full preserve ladder as used by villagers (smoking at the
rough and skilled rates is exercised daily). NOT reached on this
band: waves 4–5, regional → national, the table, the win flag,
Arc II/III/IV (not recorded). The scale wall stands on this band;
this arm closes a food-economy measurement blank, it does not move
the wall numbers.

## Wall numbers (new corpus, competent-nofeast, seeds 9750–9757)

National / table / wins: 0/8. Wave-4/5 unlocks: 0/8. Wave reach:
wave 3 on 4 seeds, wave 2 on the rest. Median survival: 100d
(censored at the 100d horizon; 2 villages lost early — 9751 at day
48, 9754 at day 97). Deaths 43 total (causes above). Rank village
on all 8 seeds.

## Metric review

- The pre-registered metric did its job and the bar was honored:
  the control reproduced exactly (36/38, same residuals), the
  instrument legs are clean (0 join misses, 0 recompute mismatches
  on 1,536 lines, 8/8-seed determinism against the committed
  corpus), and the literal verdict is DIAG-NO-GO. The verdict is
  not borderline-sensitive: H1 fails on day 83's supplier
  (named stack, named door, snapshot-bracketed), H2 fails on its
  tier condition (tier 3 measured on every bound line). No
  re-scoring was done: the three-part mechanism is reported as
  findings, and the DIAG-NO-GO stands.
- Metric doubt, stated honestly: the two pre-registered hypotheses
  were framed as "one clock explains both days," but the pair
  turned out to be supplied by three mechanisms across the two
  days (meal surplus both days; granary stock + ripened prizes on
  day 84 only). A single-hypothesis bar cannot pass a
  multi-supplier pair, however completely the stacks separate.
  The metric was not wrong to demand named per-stack evidence —
  that demand is what produced the separation — but its
  one-hypothesis form guaranteed a miss once the pile proved
  mixed. Proposed revision for the NEXT run: judge separation
  per-stack (every stack in both piles named with spoilDay and
  source door, plus the meal-draw order that removed any predicted
  supplier), with the candidate hypothesis pre-registered as:
  "the residual pair = stockSurplus meal surplus (both days) +
  granary-shifted day-80 stock + ripened day-74 Winner's share
  (day 84), with day-79 granary stock eaten on night 82" — and
  with a stockSurplus door record added to the inflow capture so
  the fourth door is first-class evidence, not snapshot
  archaeology.
- No revision is applied to THIS run's verdict. The 36/38 corpus
  and the SPOIL-CLOCK + RACKS-FULL rule are untouched; the
  candidate footnote above is a proposal for the next run's
  pre-registration, not an edit to prior evidence.
- Out-of-arm observations (logged here for the coordinator to
  append to sim-findings.md; NOT chased in this run):
  - The inflow capture's three doors miss a fourth pantry door
    (stockSurplus meal surplus, game.js) that writes real pantry
    stock with its own clock (meal-day + 3, no granary bonus).
    Any future inflow accounting that does not record it will
    undercount pantry arrivals on meal-surplus days.
  - Sierra smokes at the rough unskilled rate on seed 9750
    (0.80x, "keeps a couple of weeks") while the village holds a
    tier-3 granary: the preservation skill gap, not the granary,
    is this village's smoking ceiling.

## Reproduction check (this run)

- Analyzer `scripts/analyze-preservesched-resid-b.js` runs read-only
  against the new corpus and prints the control, the residual
  stacks, the dayPantry trace, and the literal verdict.
- Proof `scripts/test-preservesched-resid-b.js` requires the
  analyzer and asserts: control neutrality 327/289/38,
  attribution-flag reproduction (0 mismatches), lag distribution
  exactly 1x32/2x4/3x1/4x1, median lag 1.0, coverage 36/38,
  residuals exactly (9750,83) and (9750,84), instrument legs
  (ctxKcalMatch 0 mismatches over 1,536 lines, resid join 0
  misses), corpus validity (8 files, no truncation flags),
  determinism vs the committed inflow-b corpus (8/8 seeds
  identical on dayTable classes, attribution flags, days alive,
  rank), residual facts (tier 3 + bonus 3 on both days; day-83
  pile exactly 200x10@85 granaryDays null; day-84 pile exactly
  Winnerx2 + 178 + 189 @86g3 + 200x10@85 null; day-79 stock
  records 122+220; day-80 stock records 178+189; day-79 stock
  present d80–d82, gone by d83; 200-stack @85 absent d82, present
  d83–d84), literal verdict DIAG-NO-GO, and wall numbers. Run
  green in this worktree: all checks PASS, exit 0.
- Sweep: 8 seeds, ~2.5 min total, no truncation, no write failures.
  No game harness changes, zero src/js changes, no jest run
  (nothing to test in js — the proof is node, not jest). No
  [needs-eyes]: this lands a measurement, not a player-visible
  change.
- Per-seed corpus: evidence/2026-10-26/
  sim-preservesched-resid-b-corpus/ (8 files, cap1 band).
