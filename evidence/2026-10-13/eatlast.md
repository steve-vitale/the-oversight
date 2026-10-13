# blitz-eatlast — the pantry→mouths last mile (2026-10-13)

Steve's finding: hauled and cooked meat rots uneaten — the pantry→meal→mouths
chain is broken. r12 (kitchen policy pilot, killed at pilot) measured 0% of
revealed monster meat eaten even when it reached the village.

## Canon read

- docs/CANON.md + docs/PRESERVATION.md (the ladder: cleaned 2d < cooked 5d <
  smoked 30d < rendered 90d < pemmican 120d; blind penalties teach; cooking
  never destroys honest calories) + docs/BEAR.md + docs/DISEASES.md.
- docs/DIRECTIVES.md wins over inference; FIGURE-IT-OUT-YOURSELF (2026-10-07)
  authorizes the design call below — Steve can overrule.

## Root cause (measured, not asserted)

`Game.pantryDraw` (src/js/game.js) — the single draw behind the player's
villageMeal, every villager's villagerMealDay, away-ration packing, feasts,
raids, and tributes — sorted **smallest-kcalEach first with spoilDay only as
a tiebreak**. Meat portions are ~500 kcal with a 2-day (cleaned) / 5-day
(cooked) shelf (PORTION LAW, Steve 2026-10-09); staples are 150–400 kcal with
30–365-day shelves. Villagers eat own production first, then draw only the
remainder from the pantry — the draw filled the need with long-shelf staples
and never reached the meat before its clock ran out.

Measured on pristine (seed 3): one hungry villager's 1950-kcal draw from a
mixed pantry took 1950 kcal of beans and **0 of 2000 meat kcal**. The cleaned
meat (2-day shelf) sat untouched past its clock.

Ruled out:
- **Villager food preferences** — prefs are flavor-only (seasonMeal
  likes/dislikes move social + memory); the draw never consults them.
- **The cook→meal pipeline** — pantryDraw's cook:true abstraction works
  (r12 proved it 7/7); the food was never drawn, not never cooked.
- **Scholar satiation** — Game.eat() already eats most-perishable first; a
  full scholar not eating is a full belly, not a selection bug.

The tell: the village preservation layer's DINNER-FIRST reserve (game.js,
longsim food 2026-10-11) was **built assuming the nightly meal eats
fresh-first** — the actual draw contradicted that assumption. The scholar's
eat() is also most-perishable-first. pantryDraw was the one place that
didn't eat fresh-first.

## The fix (design call — Steve can overrule)

FRESH-FIRST in pantryDraw: **spoilDay ascending primary, kcalEach ascending
secondary** (best-fit within a shelf class), **slabs ride last** — one piece
> 2000 kcal (more than a day's food, indivisible) sorts after everything
else, so Steve's 2026-10-08 anti-slab law ("never a 30000-kcal slab for a
small need") holds unchanged. Everything else in the draw is untouched:
spoiled skipped, unknown flesh (edible:false, kcalEach 0) never draws,
floor1/ceil rounding unchanged, cook:true abstraction unchanged,
knowledge-gated edibility intact.

Sense: a 3-villager × 4-day trace now eats 2-day meat → 5-day meat → beans →
rice — people eating the perishable food first, the immortal staples last.
No robotic artifacts.

## Proof: scripts/test-blitz-eatlast.js (RED-verified, seeds 3+4)

RED (pristine, exit 1): `A: a hungry villager's pantry draw must take meat
(drew 0 of 2000 meat kcal)`. GREEN (after, exit 0): 14/14 PASS.

| phase | before (pristine) | after (fixed) |
|---|---|---|
| A: villager draw takes meat | 0 / 2000 kcal | 2000 / 2000 kcal |
| B: player's villageMeal eats meat first | beans only | 2000 meat kcal |
| C: 3-day rot watch (staples sufficient) | 0 drawn, cleaned meat rotted | 2000 drawn, 0 rotted |
| D: starvation-while-pantry-full | 0 | 0 (guardrail holds) |
| E: fish/garden economy regression | ate 7800, 0 starved | ate 7800, 0 starved |
| F: slab law (30000-kcal) | rides last / eaten when only food | unchanged |
| G: knowledge gate (edible:false) | untouched | untouched |

Existing suites, no regressions: test-break-food2-20261009 (42/42),
test-forager-meal-20261010 (14/14), test-break-food-20261011 (12/12),
test-kitchen-r12 (7/7), test-meatseek-r1 (all pass). test-meat-flow.js fails
identically on pristine (pre-existing "hummice carcass" data issue, unrelated).

## Open / not this fix

- Upstream pool size (r11's structural ceiling: 57–84% of carcass kcal dies
  on unreachable nodes) — unchanged; this fix only stops the village
  wasting what arrives.
- Pack-on-succession (dead scholar's pack vanishes) — Steve's call, per r12.
- Blind cooking burns (0.4x) — technique-gating the cook is a separate lever.
