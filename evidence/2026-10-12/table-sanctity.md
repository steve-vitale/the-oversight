# Table sanctity — 2026-10-12 (Steve's pick)

## The weird mechanic
Completion sim r1's closest-ever run (arm B seed 1: regional d25, national d60,
lesser seat d70, **table fired d70**) died on day 72 — 13 deaths, 12 of them
ambient combat — *during the table sequence*. The finale, the culmination of a
70-day run, was ended by background wolves. Steve: "That seems like a weird
mechanic. Let's think outside the box." → **Option A: sanctity of the table.**

## What was built (commit 96d79a07, [needs-eyes])
- **`Game.tableActive()`** (table.js): true from `tableScene()` until any
  resolve sets phase `'done'`. Derived from run state — no new persisted
  fields; old saves mid-table get sanctity automatically.
- **Three surgical ambient gates** (the only `tableActive()` consumers):
  - `villagerMonsterTick` (game.js): no wild-encounter targeting of villagers.
  - `resolvePatrol` (game.js): patrol finds nothing — falls into the honest
    uneventful-patrol branch (trust bump kept).
  - `expeditionMonster` (villager-agency.js): expeditions meet nothing.
- **The table's own stakes untouched**: trial by combat summons via
  `startCombat('finale')` (tactical engine, not the ambient routers);
  dark-branch costs, tribute/pricing never consult the flag. Direct
  `fieldFight` calls still resolve real fights — the engine is intact.
- **Diegetic beat**: the System clears the stage in tableScene, once —
  `EVERYONE. SIT. WATCH. The teeth and the weather can WAIT — nothing out
  there matters until this is done. ...Did I stutter? SIT.`
- docs/TABLE.md law 9 documents the rule.

## Deliberate boundary (not gated)
Raid crises (havenGrowth.js → resolveWildMonsterEncounter) are **crises**,
not ambient pressure — defenders, call-for-help chains, lingering threats.
Left untouched on purpose. If Steve wants crises held too, that's a separate
design call.

## Proof (scripts/test-table-sanctity-20261012.js): 26/26 × 4 seeds
RED (flag off → encounters route), green (flag on → zero ambient targeting
across tick/patrol/expedition), trial-by-combat still summons the champion
under sanctity, direct fieldFight intact, no-seat withdrawal grants no
sanctity, flag clears on win AND on lesser-frame resolve (failure →
downgrade → win), stage line fires exactly once, gate-placement audit
(exactly 3 ambient gates — a future gate on a table stake fails loudly).

## Regressions
table-core 31/31, table-feared 27/27, table-trial-fire 18/18,
table-relay 49/49, dialog-coherence 37/37, ontology 85/85 (regenerated).
