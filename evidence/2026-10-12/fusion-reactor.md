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

## Addendum — FUSION SINGULARITY (2026-10-12)

Steve's constraints (2026-10-12, his words): "it's supposed to be rare and only
affect a single one of the villagers" + "it's a permanent ability that can't be
swapped out" (the permanent option, keeping the 1.25× floor).

### Design calls

1. **One holder per run** — `state.fusionReactorHolder = { who, vid, day }`, set
   on install (player via `abilityOnAcquire`, villager via `npcGrantAbility`).
   Run-level (on `state`, not `scholar`): survives succession, wiped only by
   `newGame` (new run = new world). While set:
   - `maybeOfferFusionReactor` refuses silently (the day-part tick never nags).
   - The loot hook says it out loud instead: "ONE REACTOR PER WORLD. <name>
     HOLDS IT." — the pellet still grants (it burns 6×), but no offer follows.
   - `rollAlienLoot` excludes `fusion_pellet` from the tier-1 alien pool — no
     new pellets drop as installable loot. Pre-flag pellets in packs/corpses
     remain burnable; keeping one is still a choice, just not a reactor choice.
   - Villager field-track grant: the kit finder skips `fusion_reactor` while
     taken (reads as kit exhaustion); `npcGrantAbility` refuses defensively.
   - Contest gift bag and audience-trial gift exclude it while taken — offering
     a reactor that must fizzle would be a taunt, not a gift.
   - Pending-offer race (offer made pre-flag, accepted post-flag): the install
     refuses honestly, the pellet is NOT consumed, no phantom reactor.
2. **Permanent** — there is no player respec UI; the hostile removal path is
   the wave-5 STAMP (sigW5.js), which now exempts the reactor: "The reactor
   hums on, unbothered. It is inside you. It does not come out."
   `npcRevokeAbility` only ever targets `phoenix_clause` (one-shot) — verified
   by grep, no change needed.
3. **Death** — the reactor goes with the body: a new scholar starts with
   `abilities: []`, and `fusionReactorOnline` requires the held ability. The
   flag stays set — no second reactor ever rises in that run. Documented as
   the permanent cost (Steve's "can't be swapped out" extended to its logical
   end).
4. **Copy honesty** — description now names both: "One reactor per world, and
   it never comes out: not unslotted, not un-taught, not surrendered. Death is
   the only uninstall." Flavor keeps the System's voice + "no take-backsies."

### Finding: the villager track could never reach it

Probed 2026-10-12: `villagerTrackLevel` caps at 5 (thresholds [3,8,16,32,64])
but `fusion_reactor` sits 10th in the field kit — `kit.find(first unheld)` can
never select it. The original evidence's "village CAN go all-fusion" was wrong;
no villager has ever earned it. The singularity machinery (flag, refusal,
choke-point guard) is implemented and proof-tested at `npcGrantAbility` anyway,
so IF the kit position is ever fixed, the one-per-world rule already holds.
Kit reordering is a design call for Steve — not changed here.

### Proof

`scripts/test-fusion-singularity-20261012.js`: **32/32** (seed 20261012).
RED-verified: 14 failures on pristine HEAD. Regression: the original
`scripts/test-fusion-reactor.js` still **32/32**. Ontology: 86/86 validated.
