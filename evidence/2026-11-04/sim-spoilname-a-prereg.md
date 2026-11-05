# sim-spoilname-a — PREREGISTRATION (Loop A, food-economy / narration)

Worker: sim-spoilname-a. Base: master c0e08a1bc. Date: 2026-11-04 (CST).
Task: per-form spoil-sweep naming. Anchor: seed 15376, berries lump
12 units @ spoilDay 10 — a dawn sweep removes that one lump form while
other forms persist, and the morning record shows fewer lump units
without naming the form.

## Lesson applied first (upkeepbreakfast, 2026-11-04)
The 2115Z arm closed a supposed "upkeep breakfast is silent" blank as a
capture artifact: the prior (bankretain) corpus captured say lines only
around daily(), never in the upkeep window where the meal actually
spoke. This run therefore distinguishes, BEFORE any fix:
- (a) game-text silence — the dawn sweep's own say lines, captured with
  a global Game.say wrap across the FULL dawn window (direct sweep call
  AND the real endDay() dawn path), and
- (b) analyzer-record silence — the morning record's headline fields
  (bankfood-diag packSnap: lumpUnits total + lumpSpoilDays list) vs its
  full record (stacks[] diff, which names every stack).
A silence in (b) alone is NOT a game-text silence and earns NO src/js
change. Only a proven silence in (a) earns a fix candidate.

## Canon read
- docs/CANON.md (manifest; "No silent actions. Every action narrates
  honestly, including failures.")
- docs/PRESERVATION.md (food ladder; "Rot can't be smoked back into
  food. Spoiled meat is discarded honestly.") — covers spoilage
  honesty, but names no per-form sweep wording; the sweep wording
  itself lives in src/js/food.js sweepSpoiled / spoilVoiceLine.
- No canon doc prescribes the lump-sweep sentence; if a fix is built
  it must stay voice-consistent with the existing sweep line
  ("Overnight, <name> went bad — beyond saving. You leave it/them
  for the flies.") and must not change any gate, price, or deed.

## Fixture (identical on every seed; staged state, not a forage run)
After loadGame + setupGame, on scholar day 8, via the real
Game.addUnknownToLump path:
- berries: blackberry × 12 → lump "unknown berries", spoilDay 10
  (day 8 + blackberry spoilageDays 2 = 10, exactly the anchor);
- shoots: first shoots-form plant with spoilageDays ≥ 5, × 5 →
  spoilDay ≥ 13 (persists past dawn day 10);
- roots: first roots-form plant with spoilageDays ≥ 5, × 4 →
  spoilDay ≥ 13 (persists past dawn day 10).
No other pack items are added. spoilBonusDays() is recorded per seed
(preservation_instinct could shift the boundary; the anchor assumes 0).

## Instruments (scripts/test-spoilname-a.js, committed with evidence)
- Stage A (direct): scholar.day := 10, call Game.sweepSpoiled(),
  capture every say line emitted during the call.
- Stage B (full dawn path): fresh load, same fixture at day 8,
  scholar.day := 9, call Game.endDay(), capture every say line from
  the "— DAY 10 DAWN —" header through the sweep; record whether the
  player/fixtures survived to the sweep (endDay chaos is reported,
  never hidden — a disturbed Stage B does not overturn Stage A).
- Morning record, both stages: bankfood-diag packSnap shape before
  and after (lumpUnits, lumpSpoilDays, stacks[]), computed in-process
  (same field definitions; no new policy file).
- Flap resilience: results are printed to stdout as they land AND
  written to the evidence corpus dir with read-back verification;
  a failed write is LOUD, never a silent drop, and never fabricated.

## Pre-registered judgments (metric binding, MEASUREMENT.md §14)
Primary metric: share of Stage-A sweeps (8 pilot seeds) whose captured
say lines contain a spoil line naming the removed lump's form name
("unknown berries").
- GO threshold for a game-text fix: naming in ≤ 2/8 → genuine
  game-text silence proven → build the minimal fix candidate (name
  the removed form at the point of counting, voice-consistent) and
  re-run the same 8 seeds before/after; the fix must name the form
  in 8/8 after.
- NO-GO for a game-text fix: naming in ≥ 6/8 → the game text speaks;
  NO src/js change. The run then reports the (b)-side finding only
  (what the headline record shows vs the full record + transcript).
- 3–5/8 → INSUFFICIENT-DATA: investigate (bonus? roster? capture?)
  before any fix; do not re-score against a friendlier metric.
Secondary (reported, never re-scored as primary): morning-record
headline names the removed form (expected: NO — lumpUnits is a
cross-form total, lumpSpoilDays a dateless list); stacks[] diff names
it (expected: YES); Stage-B dawn window names it (expected: same as
Stage A, unless endDay disturbs the fixture — reported as-is).
Sense test: quote the actual sweep line(s) verbatim in the evidence;
judge whether a player reading only the transcript knows WHICH form
was lost and HOW MUCH (units are a separate question from form, and
are reported separately, not folded into the form verdict).

## Design
- Pilot seeds (8, anchor first): 15376, 15377, 15378, 15379, 15380,
  15381, 15382, 15383. No confirm spend before the pilot is judged.
- Horizon: single dawn (day 9 → 10; direct stage at day 10).
  Death-aware: a fresh game cannot meaningfully "die" over one staged
  dawn except via endDay side effects, which are recorded per seed;
  no fixed 200d horizon is used anywhere in this run.
- Policies: none — fixture-driven; no bot policy, no lever arm, no
  game-code change unless the primary metric hits the GO threshold.
- No gate/price/deed change under any outcome.

## Metric review (to be filled at end of run; revision, if any, is
for the NEXT run only, never a mid-run re-score)
- TBD in evidence file.
