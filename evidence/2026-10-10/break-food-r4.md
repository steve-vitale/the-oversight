# Break-it: food economy, round 4 (2026-10-10, ~21:45 CDT)

Target index 1 (food economy), fourth attack today. Canon read first:
docs/CANON.md + docs/PRESERVATION.md + docs/BEAR.md. Prior runs today:
r1 (cookTransform 1.42x phantom, askSpecialist, blind-cook label), r2
(trichinosis laundering via storage round-trips + stacksMatch), r3
(fractional-unit phantom kcal in 4 take engines + 3 miser coercions,
justice payFine phantom addPantryKcal, feast label). 2026-10-09 layers
1–4 not re-litigated.

Proof: `scripts/test-break-food-20261010e.js` — 21/21 AFTER × seeds
20261010/7/99; BEFORE (git HEAD) mode fails 11/21, confirming the kill.

## KILL (broke, fixed, proven)

### W1. EXPLOIT/SOFTLOCK — kg convention split bricked the pack (the big one)
The tree's canon convention is kg **per-unit**: packWeight, canCarry,
dig-up limits, cache tools, and the pack UI all compute `kg * units`
(the lump code documents it twice: "kg is PER-UNIT everywhere"). But the
butchering block wrote **total-stack** kg at 8 sites in src/js/food.js:

- `carcassToMeat` (self): `it.kg = gross*yfrac/1000` — 2 sites
  (self + askSpecialist duplicate)
- raw fat slabs: `kg = fatKcal*fatUnits/900` — 2 sites
- butcher materials: `kg = matKg*n` — 2 sites
- `renderFat`: `it.kg = per*units/900` — 1 site
- `makePemmican`: `kg = 0.3*bars` — 1 site

Measured BEFORE: butcher one deer (net 6000 kcal, 12 portions) → meat
writes kg=6, pack counts 6×12 = 60 kg phantom, packWeight 84.4 kg vs a
20-kg carryCapacity. `canCarry()` then fails for EVERYTHING — loot,
caches, quest items. One deer bricks the pack. Eating shed 6 kg per
500-kcal bite (phantom weight vanishing); the UI's "144 kg" deer and the
kcal/kg density line were fiction.

Fix: all 8 writers go per-unit (meat kg = kcalEach/1000 ≈ 0.5,
rendered fat per/900, raw fat hiddenKcal/900, materials matKg, pemmican
0.3/bar). Butchering now correctly sheds inedible mass — the 20-kg
carcass becomes ~9.2 kg of products, and the pack gets LIGHTER, never
units× heavier.

### Stale-test fix (test-only, engine behavior is current canon)
`scripts/test-break-food-20261010c.js` E4 pinned gill-net `uses === 12`;
the engine deliberately stamps 16 since the half-applied DEPLETION change
(12 → 16). Updated to 16. Same class as r3's stale fixes.

## SIBLING SWEEP (same bug class: kg convention)
- Swept every `kg:` writer in src/js: the 8 food.js sites were the ONLY
  total-convention violators. Plants/lumps (0.1), forage (0.1),
  stockPantry pieces, stockSurplus, carcass (units=1), quest/staple items
  (game.js), storage tool defs — all per-unit already.
- Merge/split/take paths preserve per-unit kg: sortBag/stageForPrep sets
  0.1, theft merge `units += n` without kg change (correct), r3's miser
  collapse changes units+kcalEach but not kg (correct — 0.4u×500 →
  1u×200 keeps its per-unit kg), pantryAdd/homecoming copy kg through.
- stacksMatch compares kg — with per-unit everywhere, identical stacks
  merge and differing ones don't; no behavior change needed.

## HELD (attacked, resisted — with numbers)
- **pantryDraw cook:true abstraction**: grants the cooked value
  (cookTransform perfect) while the pantry surrenders the units — the
  fire transforms, the pantry hands over. Consistent with r1's canon
  (cooked = 100% meat; plants keep the raw-digestibility model). Not a
  printer: the player gets exactly what self-cooking would yield.
- **blendKcalQuality**: weighted average, bounded by the max quality
  eaten — cannot inflate banked kcal.
- **gift→steal-back trust loop**: gift grants ≤12 trust; steal-back hits
  −35 caught / −15 suspicion (theftNoticeSweep) plus crime record. Net
  negative — no farm.
- **packKcal dawn rations**: real pantryDraw at dawn (cook:false), risks
  ride along — honest, not phantom.
- **villageMeal share math**: best-fit draw, spoiled skipped, freeload
  ledger records the take — unchanged this run.

## PRE-EXISTING FAILURES (verified identical on pristine HEAD, not mine)
- test-break-food-20261009.js H1: "H1 setup. extra=1 bonus=3 — base=0".
  preservation_instinct (level 1, value 2, scale level) grants +3, the
  test pins +2. Reproduced with HEAD's food.js swapped in — unrelated to
  this run (modTarget/ability data, not food.js). Documented, not fixed:
  the intended `scale:"level"` semantics are unclear and it's outside
  this run's area.
- r3's pre-existing failures unchanged: test-break-food-r3 (1, W4b),
  test-break-food-r4 (3, W3a/b/c).

## Regressions
- New: test-break-food-20261010e.js 21/21 × seeds 20261010/7/99
- Prior: 20261010c 25/25 (after stale fix) · 20261010d 16/16 ·
  20261010b 19/19 · 20261009 115/116 (1 pre-existing, see above) ·
  20261009-food2 42/42 · food3 46/46 · food4 30/30 ·
  food-reality 91/91 · merges/pantrycap/spoilage ALL PASSED ·
  cache-spoilage 19/19 · ontology 62/62

## Files changed
- src/js/food.js — 8 kg writers converted to per-unit (butcher ×2,
  raw fat ×2, materials ×2, renderFat, pemmican)
- scripts/test-break-food-20261010e.js — new proof (21/21 ×3 seeds;
  BEFORE fails 11/21)
- scripts/test-break-food-20261010c.js — stale gill-net assertion
  12 → 16 (test-only)

## ATTACK LIST FOR THE NEXT RUN (do not re-litigate)
W1 kg convention (8 writers) · stale gill-net 16 test pin · H1
preservation_instinct +3 vs +2 (pre-existing, needs an owner).
Prior today: r1 (cookTransform meat 1.42x, askSpecialist, blind-cook
label) · r2 (trichinosis laundering ×7 contracts + stacksMatch) · r3
(fractional units ×4 engines + 3 coercions, justice fine sink, feast
label). FRESH ANGLES STILL OPEN: fire-fuel honesty on tent vs map hearths
(consumeCookFire paths); villageMeal "serves N" copy on the haven panel;
gift→steal-back→re-gift timing under the take-back penalty; corpse-loot
kg writers (corpses.js uses per-unit consumers — spot-check writers);
spoilBonusDays stacking beyond preservation_instinct.
