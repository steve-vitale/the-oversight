# sim-sweepcount-a — prereg: unit count in the dawn spoil sweep line

Loop A, food-economy / narration. Worker: sim-sweepcount-a. Base:
master f72e4bd16. Prereg committed BEFORE any judged sim (instrument
verification runs only: 3 unjudged runs on seeds 15376/15380 to check
the inherited instrument executed — outputs deleted before this
commit; no judged numbers were taken from them).

## Parent finding (sim-spoilname-a, 2026-11-04)
The dawn sweep line names the lost form on every actual removal
(8/8: "Overnight, unknown berries went bad — beyond saving. You
leave it for the flies.") but NEVER states how many units were lost
(x12 unnamed: 0/8 at day 10, 0/2 delayed). The spoilname run
deliberately did NOT build this — it needs its own GO threshold and
a Steve-eyes decision. This arm builds ONLY the count insertion.

## Change (one line, count insertion only)
`src/js/food.js` `sweepSpoiled()`, the `Overnight,` line: prefix the
unit count when a removed stack holds more than one unit, e.g.
"Overnight, 12 unknown berries went bad — beyond saving. You leave
it for the flies." Singular stacks (units 1 / undefined) keep their
existing wording with no count. No rewording of the form-naming,
no change to the it/them tail, no change to the pantry line, the
corpse-rot line, or any other spoil line. No gates, prices, deed
bars, or other systems touched. Commit carries [needs-eyes]
(narration change).

Canon: docs/PRESERVATION.md prescribes the preservation ladder and
"spoiled meat is discarded honestly" but no sweep wording — the
form-naming is established (sim-spoilname-a); this arm adds ONLY
the unit count. No canon doc covers the sweep line's wording, so
the exact wording is the worker's call, documented here and in
the evidence, for Steve's eyes.

## Primary metric (judge: Stage A, conditioned on removal)
Share of removal events whose Stage-A sweep line states the unit
count as "<n> <form>" adjacent to the form name (instrument field
`countNamedInSweep`, regex /12 unknown berries/).

**GO threshold: ≥ 0.80 of removal events state the count.**
Expected after: 8/8 (every removal names its count). Before
baseline (measured, not assumed): 0/8.

Conditioning (per the spoilname metric review): the denominator is
removal events, NOT seeds — bonus-delayed seeds (spoilBonusDays
+6/+2) have no removal at day 10 and are reported as a separate
"delayed, still named" row at their true spoil days, never counted
as misses.

## Horizon + why
Day-10 dawn (fixture spoilDay 10), same fixture as spoilname:
blackberry × 12 → "unknown berries" @ 10; shoots × 5 @ 15;
roots × 4 @ 38, planted at scholar day 8 via the real
`Game.addUnknownToLump` path. Day 10 is the first spoil event in
the fixture and the exact day the parent run measured 0/8.
Delayed-day follow-ups at the bonus seeds' true spoil days
(15380 @ day 16, 15383 @ day 12) confirm the count travels with
the delayed event.

## Seeds + policies
Matched before/after on the spoilname pilot band 15376–15383
(8 seeds, identical seeds both tags), Stage A (direct sweep) +
Stage B (real `endDay()` dawn path). No bot policy — fixture
instrument, same as the parent run. Fresh-seed confirm (8 seeds,
freshness-checked against ALL dated preregs plus the
forbidden-band lists) ONLY if the pilot passes GO.

## Instrument + proof test
`scripts/test-sweepcount-a.js` — inherited from the dead first
worker on this arm (died 11:19:51Z, platform transport error, no
committed work), VERIFIED by re-dispatch before adoption: ran
green on Stage A, Stage B, and the delayed-day override
(SPOILDAY=16, seed 15380) — anchorOk true, formNamed true,
countNamed false on the unmodified baseline, overnight line
byte-identical to the spoilname evidence. One seed + one stage
per node process; TAG=before|after selects the corpus file;
write-robust with read-back verification (failed write exits 2
LOUDLY). Corpus: `evidence/2026-11-05/perseed-sweepcount-a/`
(`sweepcount-a-s<seed>-stage<A|B>-<tag>.json`).

## Secondary checks (reported, not judged)
- Stage B must match Stage A on every seed (same line through
  the real dawn path; DAWN header present, player alive).
- Sense test: read the dawn transcripts — does the count read
  naturally (singular/plural, form name intact), or does it
  clank? A count that reads wrong is a NO-GO on feel even if
  the number is present.
- `node scripts/check.js --quick` green after the change.

## Metric review (for the NEXT run, never a mid-run re-score)
Metric binding (MEASUREMENT.md §14): a miss on the primary is
NO-GO, never re-scored against a friendlier metric mid-run. If
the metric proves wrong (e.g. multi-stack sweeps need a
per-stack rate rather than a per-event rate), write it here in
the evidence under "metric review" and propose the revision for
the next run.
