# Fusion Reactor — evidence (2026-10-12)

Steve's directive (2026-10-12): "We mention fusion pellets a few times. One ability
should be fusion reactor. If you find a fusion pellet, it can sustain you for like
forever. Basically that one person doesn't have to eat and gets to freely use the
food boost. Which tree should it fall under? Everyone choosing this path in a village
should have some serious drawback potentially."

## Tree choice: SURVIVALIST

The `survivalist` path is the metabolic/body tree — Blood Price (body eats itself for
kcal), Red Hunger, Extra Stomach, Deep Reserves, Photosynthesis, Molt. Fusion Reactor
is the ultimate body-metabolism cheat, and the System's flavor voice ("We FIXED eating!")
fits the path's unhinged-augmentation tone. It is `pool: "system"` — an alien/System
ability, NOT an earthly skill (Steve's standing law).

## The ability

**Fusion Reactor** (rare tier, system_offer):
- **Offer gate**: the System offers it only when the scholar HAS a fusion pellet
  (`maybeOfferFusionReactor`, reactive like `maybeOfferPurify` — fires on loot grant
  + day-part tick fallback, idempotent).
- **Install**: accepting consumes the pellet (`abilityOnAcquire`). No pellet → the
  ability honestly fizzles (removed, no phantom reactor).
- **Benefit**: `dailyNeed` → 0 (never eat again); `feastedMult` → always-on 1.25×
  (proper-feast level, free — the "food boost" without the food).
- **Individual cost (the ceiling)**: the reactor crowds out real feasts —
  `grantFeastBuff` refuses for reactor scholars, so 1.25× is ALL there is. Food
  remains the path to PEAK power (legendary 1.5×, Arc IV hotter). The reactor is
  a floor AND a ceiling: the engine that never hungers never feasts.

## The serious drawback: THE COLD TABLE (village-wide)

Each fusion reactor at a feast is a cold seat — they don't eat, don't laugh, don't
share. Applied AFTER the 0..2 quality clamp so rich tables can't shrug it off:
one reactor costs a legend, two kill the feast. Reactor guests get no trust/joy
from feasts (a cold memory instead). Villagers can earn it late in the field track
(capstone position), so a village CAN go all-fusion — and then its feasts are just
sitting. The food culture dies one cold seat at a time.

The tell: the System is DELIGHTED by every install. "We FIXED eating!" — the ones
who forgot food want you to forget it too.

## Pellet rarity

- `origin: alien`, `lootTier: 1`, `findable: false` (not forageable).
- Tier-1 alien loot pool is 5 items; alien drops are low-chance per Steve's loot law.
- Also burnable as fire fuel (6×) — keeping it is a choice.

## Proof

`scripts/test-fusion-reactor.js`: **32/32 ×3 seeds** (111, 222, 333).
- Ability data, offer gating, install consumption, honest fizzle
- dailyNeed=0, no starvation spiral at 0 kcal; control still needs ~2200
- Free 1.25× with no feast; status line names the reactor
- Feast buff refused for reactor; control eater reaches 1.5× (food still peaks higher)
- Cold Table: 3 reactor guests drag a legendary feast down

Regressions:
- test-feast-buff.js: 67/67
- test-feast-ritual-proof.js: 21/21
- test-feast-surge single-seed smoke: clean (full 16-seed sweep is inherently slow)
- validate-ontology.js: all 82 systems validated
- validate-data.js: pre-existing crash (same on clean main), unrelated

## Files

- `src/data/abilities.json`: +fusion_reactor (append-only splice, file style preserved)
- `src/js/game.js`: abilityOnAcquire branch, fusionReactorOnline/hasFusionPellet/
  maybeOfferFusionReactor, alienLootGrant hook, day-part fallback, hostFeast cold table,
  NPC_ABILITY_KITS field += fusion_reactor (late)
- `src/js/engine/calories.js`: dailyNeed → 0 for online reactor
- `src/js/feastBuff.js`: feastedMult floor 1.25, grantFeastBuff ceiling, feastedLine
- `scripts/test-fusion-reactor.js`: new proof
