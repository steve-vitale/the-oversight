# sim-pantryspoil-a — prereg: unit count in the pantry spoil line

Loop A, food-economy / narration. Worker: sim-pantryspoil-a. Run:
fleshout-20261105T1215Z. Base: master f2238ed19 (sweepcount lever
e578c47e1 already in history). Prereg committed BEFORE any judged
sim (instrument verification runs only: unjudged runs on seeds
15376/15380 to check the instrument executes — outputs deleted
before this commit; no judged numbers were taken from them).

## Parent finding (sim-findings.md #1758, claimed this run)
The dawn sweep line now states the unit count on every removal
(sim-sweepcount-a, GO LAND, 16/16 events, 29/29 stage-runs), but
the pantry spoil line names its stack without a count — separate
channel/voice. `spoilVoiceLine(names)` in src/js/food.js (~line
2618) prints "The village threw out spoiled stores: ${names}. ..."
with mutter variants. The `names` string is built in the pantry
branch of `sweepSpoiled()` (~line 2690): `lostPantry.push(it.name
|| 'something')`, then `[...new Set(lostPantry)].join(', ')`.
This arm builds ONLY the count insertion there, mirroring the
sweepcount one-line pattern.

## Change (one line, count insertion only)
`src/js/food.js` `sweepSpoiled()`, the pantry loop: prefix the
unit count when a removed pantry stack holds more than one unit,
e.g. "The village threw out spoiled stores: 5 Foraged food,
3 Muscadine Grapes, Smoked fish. ..." Singular stacks (units 1 /
undefined) keep their existing wording with no count. No rewording
of the form-naming, no change to the `new Set` dedup, no change to
`spoilVoiceLine` itself, no change to the pack `Overnight,` line,
the corpse-rot line, or any other spoil line. VOICE ONLY: no
mechanic, no timing, no RNG draws — `spoilVoiceLine` keeps its
exact one-`_beatCast`-draw-per-call discipline (findings #263/#264
det-gate); do NOT add RNG draws or move existing ones. No gates,
prices, deed bars, or other systems touched. Commit carries
[needs-eyes] (narration change).

Known limitation, deliberately out of scope: the `new Set`
dedup operates on the count-prefixed strings, so two pantry
stacks with the SAME name AND the SAME unit count collapsing to
one entry would under-report one stack (pre-existing dedup
behaviour for names; the count insertion does not change its
kind). The fixture uses distinct names, so dedup cannot collapse
it; the identical-name+units case is documented here for a
future arm, not fixed here.

Canon: docs/PRESERVATION.md prescribes the preservation ladder
and "spoiled meat is discarded honestly" but no spoil-line
wording — the form-naming is established (sim-spoilname-a, then
sim-sweepcount-a); this arm adds ONLY the unit count to the
pantry channel. No canon doc covers the pantry line's wording,
so the exact wording is the worker's call, documented here and
in the evidence, for Steve's eyes.

## Primary metric (judge: Stage A, conditioned on removal)
Share of pantry-spoil removal events whose Stage-A pantry line
states the unit count as "<n> <form>" adjacent to EACH multi-unit
form name (instrument fields `countNamedInPantry`, regex /5
Foraged food/ and /3 Muscadine Grapes/).

**GO threshold: ≥ 0.80 of removal events state the count.**
Expected after: 8/8 (every removal names every multi-unit
count). Before baseline (measured, not assumed): 0/8.

Conditioning (per the spoilname/sweepcount metric review): the
denominator is removal events, NOT seeds — bonus-delayed seeds
(spoilBonusDays +6/+2) have no removal at day 10 and are reported
as a separate "delayed, still named" row at their true spoil
days, never counted as misses.

## Horizon + why
Day-10 dawn (fixture spoilDay 10), same fixture family as
sweepcount/spoilname: pantry stacks planted at scholar day 8
via direct pantry push (the pantry has no addUnknownToLump
path): Foraged food × 5 @ 10, Muscadine Grapes × 3 @ 10,
Smoked fish × 1 @ 10 (singular control), Dried beans × 4 @ 30
(survivor control). Day 10 is the first spoil event in the
fixture and the exact day the sibling arm measured 0/8 before /
8/8 after on the pack line. Delayed-day follow-ups at the bonus
seeds' true spoil days (15380 @ day 16, 15383 @ day 12) confirm
the count travels with the delayed event.

## Seeds + policies
Matched before/after on the sweepcount pilot band 15376–15383
(8 seeds, identical seeds both tags), Stage A (direct sweep) +
Stage B (real `endDay()` dawn path; the pantry fixture is
planted inside the sweep wrapper just before the real sweep
fires, so day-9 meals cannot eat it first). No bot policy —
fixture instrument, same as the sibling run. Fresh-seed confirm
(8 seeds, 15410–15417, after-code only, Stage A + Stage B)
ONLY if the pilot passes GO.

Freshness check (mandatory, 0915Z dmground correction):
15410–15417 checked against ALL dated preregs
(`evidence/*/sim-*-prereg.md` — 0 mentions of any of the eight
seeds) plus the forbidden-band lists (99201–99208 et al. named
in the 11-04 preregs; none of 15410–15417 appears) plus all
evidence markdown (one hit only: `pantry=15413` in
evidence/2026-10-19/windowsurvive-taxonomy.md — a pantry kcal
figure, not a seed naming). Band 15410–15417 is fresh.

## Instrument + proof test
`scripts/test-pantryspoil-a.js` — adapted from the sweepcount
instrument (`scripts/test-sweepcount-a.js`, same harness kit,
one seed + one stage per node process; TAG=before|after selects
the corpus file; write-robust with read-back verification; a
failed write exits 2 LOUDLY). Corpus:
`evidence/2026-11-05/perseed-pantryspoil-a/`
(`pantryspoil-a-s<seed>-stage<A|B>-<tag>-d<spoilday>.json` —
spoil day in the filename per the sweepcount metric review, so
a delayed-day run cannot overwrite its day-10 file).

## Secondary checks (reported, not judged)
- Stage B must match Stage A on every seed (same line through
  the real dawn path; DAWN header present, player alive).
- Singular wording intact: no "1 Smoked fish" anywhere; the
  singular stack keeps its bare name. Survivor intact: Dried
  beans still in the pantry after the sweep.
- Form-naming intact: all fixture names present in the line
  before and after (no regression on the spoilname verdict).
- Sweepcount regression guard: the pack `Overnight,` line still
  states "12 unknown berries" after the change.
- Det-gate: RNG draws during `sweepSpoiled()` identical
  before/after on every seed, and the next-3 `Math.random()`
  values after the sweep identical — no draw added or moved.
- Sense test: read the dawn transcripts — does the count read
  naturally (singular/plural, form name intact), or does it
  clank? A count that reads wrong is a NO-GO on feel even if
  the number is present.
- `node scripts/check.js --quick` green after the change
  (failures attributed against the unmodified baseline).

## Metric review (for the NEXT run, never a mid-run re-score)
Metric binding (MEASUREMENT.md §14): a miss on the primary is
NO-GO, never re-scored against a friendlier metric mid-run. If
the metric proves wrong (e.g. multi-stack pantry sweeps need a
per-stack rate rather than a per-event rate), write it here in
the evidence under "metric review" and propose the revision for
the next run.

## Wall numbers (carried, not re-measured)
Scale-onramp: CONVERGING, NOT converged. Full seat 0, wave 5 0
(convergence tracker, 1041Z sweepcount run — a narration corpus
measures no wall numbers; this arm re-measures nothing).
