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

## Restore with raids held (2026-10-12, Steve's correction)

Steve: "hold the raids" — raid crises are held during the table too. The
original build (96d79a07) was reverted in full (5ae9a5f4) by mistake;
restored here via `git revert --no-commit 5ae9a5f4` in an isolated
worktree, then extended. Work preserved on branch `table-sanctity-hold`.

**Two new raid gates** (src/js/havenGrowth.js), same guarded pattern:
- `havenRaidTick()`: returns false before evaluating the world while
  `tableActive()` — no new raids mid-finale.
- `havenGrowthDaily()` lingering-raider gorge: raiders already at the
  treeline are re-pinned to Haven but do not gorge nightly while the
  table sits. The crisis stays open; the player may still answer the
  call for help themselves. Nothing automatic harms the village.

**In-progress-raid call (documented):** a raid underway when the table
fires is not frozen mid-crisis — the crisis chain, defenders, and
call-for-help options are legible drama, not background noise. What IS
held is the automatic part: no new raids, no nightly pantry gorging.
The 6-day crisis valve is untouched (it only clears threats, never
creates them).

**Proof** (scripts/test-table-sanctity-20261012.js extended): **34/34 ×
4 seeds** — all 26 original assertions plus: havenRaidTick returns
before touching world state under sanctity (spy-verified), no raid day
stamped, RED flag-off control evaluates the world normally, lingering
raiders do not gorge (raidPillage spy silent) and stay pinned at Haven,
RED gorge resumes with flag off. Gate audit updated: exactly 5
sanctity gates (3 ambient + 2 raid) — a future gate on a table stake
fails loudly.

**Regressions:** table-core 31/31, feared 27/27, trial-fire 18/18,
relay 49/49, dialog-coherence 37/37, ontology 85/85 (regenerated).
