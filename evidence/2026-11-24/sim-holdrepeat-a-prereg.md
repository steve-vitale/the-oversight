# sim-holdrepeat-a — PREREG (measurement, coordinator-run)

Frozen 2026-11-24T11:33Z by the Loop A coordinator, BEFORE any repetition
census was run. Copy into evidence/2026-11-24/sim-holdrepeat-a-prereg.md
at closeout; this hidden_files copy is the freeze record.

## Arm
sim-holdrepeat-a — firmer measurement of holdspeak repetition. NO
game-code change, NO new sims. Axis scale-onramp, 0915Z round's next
blank #4 (holdspeak repetition follow-up: Eamon's hurt line 31x/79d,
Elif's 21x/47d — "firmer measurement, not a miss").

## Question
The holdspeak arm voices each held departure once per holder-day with
the real hold reason (per-(holder,day) dedup). The follow-up: does the
SAME line repeat so often for one holder that it reads as a stuck
record to a player, or is it a designed daily cadence with acceptable
variety? The holdspeak evidence names the metric to beat: max repeats
of one line per (seed, holder).

## Corpus (deliberate REUSE, not fresh)
All holdspeak AFTER-leg corpora (the hold voice exists only on the
after legs), 24 seeds:
- `evidence/2026-11-22/perseed-holdspeak-a-after/` (pilot, 8 seeds,
  bands 109409-109416)
- `evidence/2026-11-22/perseed-holdspeak-a-confirm-after/` (confirm,
  16 seeds, bands 109417-109432)
Band named in `evidence/2026-11-24/sim-holdspeak-a-prereg.md` and
`evidence/2026-11-24/sim-holdspeak-a.md`. Reuse declared; no fresh-seed
claim. holdLines rows are {day, name, text} (first name only, no vid —
the holdspeak analyzer joins by (day, first-name)).

## Instrument
`scripts/analyze-holdrepeat-a.js` (new; committed with this arm):
- Groups holdLines by (seed, name, text): count, day span, max
  consecutive-day run, distinct texts per (seed, name).
- Aggregates: distribution of max-repeats-per-(seed,holder) across the
  24 seeds; holders with max >= 10 / >= 20 / >= 30; top-10 most
  repeated lines; consecutive-run lengths.
- Selftest: fixtures for grouping/consecutive-run counting + determinism
  replay (two runs byte-identical) + reproduction of the known Eamon
  31x (109430) and Elif 21x (109419) counts as a D2 check.

## Bars (frozen)
- R1 ATTRIBUTION: 100% of holdLines rows attributed to a (seed, name,
  text) group; 0 unparsed.
- R2 INSTRUMENT: selftest all green; determinism replay byte-identical;
  Eamon 31x and Elif 21x reproduce exactly.
- R3 VERDICT (decision rule, frozen): the repetition is a DEFECT (fix
  arm recommended: day-count-varied wording) iff some (seed, holder)
  has one line >= 25x AND that holder has <= 2 distinct texts AND the
  line repeats on >= 10 consecutive days (a stuck record). Otherwise
  CADENCE (designed daily cadence, no fix — report the numbers for a
  future wording-variation arm if Steve wants it).

## Wall numbers
None new (reused corpora; the holdspeak confirm wall numbers stand:
wins 0, national 0, wave-5 8/16, median survival 130.5d).

## Metric review (to fill at evidence time, never mid-run)
- Whether the first-name join hides two holders sharing a name (the
  holdspeak analyzer's conservative min(lines, days) caveat).
- Whether max-repeats-per-(seed,holder) is the right defect metric,
  or consecutive-run length matters more for a player reading day
  after day.
