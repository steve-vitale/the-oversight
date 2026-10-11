# Break-it: FOOD ECONOMY (target 1) — round 5 — 2026-10-11

Steve's mode: adversarial. Depth over breadth. Landed locally: `fe112822` (r4 orphan) + `99138738` (r5 worker). Both merged `--ff-only` to master; pending ship.

## Orphan landed first
Previous run's branch `break-food-r4` (commit `ef075883`, proof 21/21 x3 seeds) never landed — tree reaped before landing. Rebased onto current master, re-ran its proof (21/21 green), ff-merged as `fe112822`, branch deleted.

## Attacks and catches (all four classes, genuine hostile plays)

### W1. EXPLOIT — villager surplus → pantry (BROKE, FIXED)
- `stockSurplus` used `Math.ceil(give/200)`: a 1-kcal share deposited a whole 200-kcal unit, bias always upward. **Measured: +5,125 phantom kcal over 50 small surpluses** (real 9,475 → deposited 14,600). Energy from nothing, feeding the village's burn clock and `takeFromPantry`.
- `stockSurplus` pushed straight into `v.pantry`, bypassing the pantry cap — `pantryAdd` was the only capped door (same class as the r3 `putAwayFinished` fix). Measured: 120,000 cap → 125,000.
- **Fix:** `Math.round` (symmetric, no bias) + clamp deposit to cap room.

### W2. EXPLOIT/HONESTY — returnToVillage auto-haul (BROKE, FIXED)
- No spoilage gate: returning with today's-spoiled food pooled ROT into the pantry (`donateToPantry`'s wrapper and `putAwayFinished` both refuse it; the auto-haul didn't) — inflating `feastPlan`'s "have".
- `spoilDay: item.spoilDay || 9999` laundered spoilDay **0** (genuinely spoiled) into **immortal** stores — a falsy clock is not a missing clock. Measured: spoiled venison arrived with `spoilDay=9999`.
- No pantry-cap check.
- **Fix:** refuse spoiled (narrated, discarded on trail), `?? 9999`, whole-haul cap guard checked *before* the keep/give split (a held-back split copy can never strand units — value-sink avoided).

### W3. HONESTY — counter bite / pack bite skipped promised healing (BROKE, FIXED)
- The L3 copy promises "+5 health when eaten" (dandelion L3: "Eat regularly for +5 health"); MEDICINE promises chewing medicinal plants heals (knowledgeable: real healing; ignorant: a whisper). Only the bulk `eat()` granted them — and `eatOne` is the live path since the Eat button was removed. Measured: health 50 → 50 on all three paths.
- **Fix:** both bites now grant L3 +5 / animal deep-master +5 / medicinal +2, mirroring the bulk path's copy.

### W4. DEAD-CODE — wiring audit (TWO SMALL FIXES)
- All 35 food systems verified reachable (no dead modules — the Alien Players lesson doesn't repeat here).
- `villagerFoodPoisoning`'s guard read `v.sick[vid]` before `v.sick` was initialized (threw on a fresh village) — fixed.
- Dead variable `mult` in the specialist-cook branch — removed.

## Sibling sweep (same bug classes elsewhere)
- `returnToOldVillage` (exile amends path): same spoilage-gate + `|| 9999` bugs — **fixed**.
- `pantryAdd`: same `|| 9999` laundering (spoilDay 0 + preservation bonus → immortal) — **fixed** to `??`.
- Ceil-deposit class: `stealFrom`/intimidate use symmetric `Math.round` — held. Other pantry writers (`donate` wrapper, `putAwayFinished`, `stockPantry`, contests via `pantryAdd`, hierarchy tribute) already gated or fresh — held.

## Proof & regressions
- **New proof:** `scripts/test-break-food-20261011.js` — 12 checks. BEFORE (from git HEAD): 10 fail / 2 pass (the 2 passes are hold-guards). AFTER: **12/12 green across 3 seeds** (20261011, 7, 99).
- Regressions green: r4 kg fix 21/21, 20261010d 16/16, 20261010c 25/25, 20261010 16/16, engines, merges, spoilage, pantrycap.
- Full node harness (index.html script order, seeded Math.random before eval); no concurrent jest.

## What held (documented, not failures)
- Cook math (`cookTransform`) capped at gross everywhere — no phantom energy via pot/knife/camp_cook multipliers.
- Cache bury/dig/take paths: spoilage underground, fungibility gate, risk copies — all honest.
- `drawSpoiled` (village desperation eating) is deliberate design with real disease rolls — verified the rolls bite.
- `packKcal` dawn rations are real pantry draws; `feastPlan` menu preview draws on a copy — honest.
- `food.spoilage_days` (preservation_instinct) wired via abilities.json + relicEnhancements.json — not dead.

## Standing lessons for the log
- The `|| 9999` falsy-laundering is a recurring bug class — grep the tree for `|| 9999` periodically (caught twice this run).
- Pantry writers multiply: every new pantry entry point must route through `pantryAdd`/cap/spoilage gates, not write `v.pantry` directly (third such bug class fix).
