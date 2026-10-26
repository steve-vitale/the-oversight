# journey-scale r41 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261026T1945Z. Rotation read 3 → leg 3 SCALE;
write 3→0 on completion. Base master@6ef77e3e7 (scale-onramp 1920Z) at run start.
**No src/js change planned:** measurement only (one new DIAG recorder + driver
variant + analyzer + proof test, all under scripts/).

## Leg question (binding)
Two parts, both measurement:
1. **JOURNEY (leg play):** on the matched r37–r40 seeds, does the scale leg
   still reach regional→national and the table approach, and do villagers
   still read as people in the leg's transcripts?
2. **BLANK (follows the 1920Z round's named next question):** WHY are 24/33
   wave-4 spawns never fought (sim-wave4enc-a)? Every wave-4 spawn gets
   exactly one fate: fought (field or tb), alive at end, or vanished —
   and every vanished spawn gets a last-seen position and a
   closest-approach-to-player distance, so the dominant never-fought
   fate names a mechanism (never encountered vs fled off the board vs
   removed beside the player), not just a count.

## What would count as an interesting finding
- A never-fought fate class holding a majority of never-fought spawns
  (that class, not the count, is the finding).
- A vanished-near-player class of any size (a removal the fight
  recorders never saw would be a real hole, not a tuning note).
- A journey seed that reaches global + table approach in the leg window
  (r40's table parity was byte-identical on its base; base has moved
  since, so deltas are reported, never re-scored).
- A transcript that is senseless, fabricated, or a filler loop on
  full read (SENSE-TESTING LAW).

## Seeds, policies, horizons
- JOURNEY: seeds 85001–85004 (matched r30–r40), policy
  scripts/policies/scalecourt-nogate.js UNCHANGED, driver
  scripts/journey-scale-r41-20261026.js (r40 driver, labels/EVIDIR
  only, control mode — no picker variant), DAYCAP=180, death-aware
  stop, EVIDIR evidence/2026-10-26/journey-scale-r41 (scratch dir,
  never r40's dir).
- SPAWNFATE: seeds 73671–73678 (the wave4enc band, so the fate
  partition answers the question on the band that asked it), policy
  tableseat-nowait (LEANLINKRESCUE=1, TABLESEATNOWAIT=1) wrapped with
  the four wave4enc recorders PLUS the new spawnfate daily census,
  DAYCAP=180, death-aware stop, EVIDIR
  evidence/2026-10-26/journey-scale-r41-spawnfate. One process per
  seed (--one children); rows written incrementally.
- PILOT GATES (both batches): first seed runs before the rest; STOP
  if it crashes, if the journey pilot has pilgrimages == 0, or if the
  spawnfate pilot row lacks a census with wave-4 entries.

## Pre-registered metrics (binding, §14 — a miss is NO-GO, never re-scored)
- JOURNEY-PARITY: pilot completes with no crash, pilgrimages > 0,
  transcripts produced (vs r40 control: deltas reported as deltas).
- JOURNEY-PEOPLE: every sampled transcript sense-read; senseless
  count reported, not averaged away.
- FATE-COMPLETE: GO iff ≥6/8 spawnfate seeds fully partition (every
  wave-4 spawn seq in exactly one fate class, zero unclassified).
- FATE-DOMINANT: the largest never-fought fate class is named with
  its count and share; no dominant class = NO-GO on the mechanism
  question (the count alone is not an answer).
- FATE-HOLE: any vanished-near-player (last dist ≤ 1) spawn is a
  same-run investigation item, reported LOUD whatever the verdict.

## Metric review
(written at closeout, not before)
