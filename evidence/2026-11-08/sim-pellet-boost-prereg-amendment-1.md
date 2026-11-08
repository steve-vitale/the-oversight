# Prereg amendment A1 — whole-unit pantry draws (no fractionating)

Date: 2026-11-08 (same day, before any build, after a code read of
`pantryDraw`). Amends `sim-pellet-boost-prereg.md` §Design (ledger)
and bars PB-1 / PB-2-panel (P1). Nothing else changes.

## Why (code read, not panel results)

`pantryDraw(v, want, {})` takes WHOLE units — no fractionating
(Steve 2026-10-08, game.js:30260+): the default mode computes
`units = min(item.units, ceil(need / effectiveKcal))`. A 50-kcal
want drawn from 100-kcal units takes ONE unit = 100 kcal, not 50.
The prereg as written ("pantry lighter by exactly 50 per boost",
"ledger.spent == boosts × 50 exactly") is therefore FALSE for real
pantries: the draw overshoots to whole items. The buy-out precedent
(game.js:31805) already accepts this — it records `spent =
drawn.taken` (actual), not the nominal 8000.

## Design change (replaces the exact-50 claim)

- The boost ASKS for COST (50) kcal; `pantryDraw` takes whole
  units; the LEDGER records the ACTUAL taken (≥ COST, rounded up
  to whole items); the say line names the ACTUAL spent. The cost
  the village pays is the drawn amount, honestly recorded — never
  a nominal number the pantry didn't lose.
- The have-gate stays on total pantry kcal (`pantryKcalLive(v) >=
  COST`, like the buy-out): a pantry holding 30 kcal total cannot
  boost; a pantry holding one 100-kcal item can, and pays 100.
- The nominal COST (50) still matters: with small-unit pantries
  (berries, 25–50 kcal) the draw lands near 50. The panel (P5)
  watches deaths/day + pantry pressure; if the whole-unit cost
  proves too steep, the number is tuned by amendment, not silently.

## Bar changes (metric binding — these replace the old wording)

- PB-1-unit: "...pantry lighter by exactly the DRAWN amount per
  boost; `ledger.spent` equals the sum of actual draws; a rigged
  pantry of 50-kcal units draws exactly 50 per boost; a rigged
  pantry of 100-kcal units draws 100 per boost and the line +
  ledger name 100 (overshoot honestly recorded, never hidden)."
- PB-2-panel (P1): "on EVERY seed, `ledger.spent` equals the
  total pantry kcal drawn (exact accounting, verified via
  `pantryKcalLive` before/after each fight + the draw records);
  any boost whose draw is unrecorded or mismatched is a FAIL."
- P2's have-gate bar is unchanged (0 boosts while pantry < COST).
